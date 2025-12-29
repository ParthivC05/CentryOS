import crypto from 'crypto'
import { Transaction } from '../payments/payment.model.js'
import { User } from '../users/user.model.js'
import { Op } from 'sequelize'

export async function centryOsWebhook(req, res) {
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body))

    const signature = (req.get('signature') || req.headers['signature'] || '').toString()
    const secret = process.env.CENTRYOS_WEBHOOK_SECRET || ''

    // Log incoming webhook (avoid logging secrets)
    try {
      console.info('CentryOS webhook received', {
        method: req.method,
        path: req.originalUrl || req.url,
        signature: signature || null,
        rawBodyLength: rawBody.length,
        rawBodyPreview: rawBody.toString().slice(0, 512)
      })
    } catch (e) {
      console.debug('Failed to serialize incoming webhook for logging', e)
    }

    const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')

    if (!signature || signature !== expected) {
      console.warn('Invalid webhook signature', { receivedSignature: signature })
      return res.status(401).json({ success: false, message: 'Invalid signature' })
    }

    const payload = JSON.parse(rawBody.toString())
    const { eventType, status } = payload
    const p = payload.payload || {}

    const record = {
      eventType,
      status,
      entry: p.entry,
      amount: p.amount,
      method: p.method,
      summary: p.summary,
      currency: p.currency,
      entityId: p.entityId,
      walletId: p.walletId,
      timestamp: p.timestamp ? new Date(Number(p.timestamp)) : null,
      entityType: p.entityType,
      description: p.description,
      transactionId: p.transactionId,
      paymentLink: p.paymentLink || null,
      feeCharged: p.feeCharged || null,
      rawPayload: payload
    }

    // Try to associate with a user if we can find one
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { centryos_entity_id: record.entityId },
          { centryos_wallet_id: record.walletId }
        ]
      }
    })

    if (user) record.userId = user.id

    // Upsert by transactionId if present
    let created
    if (record.transactionId) {
      const [instance, wasCreated] = await Transaction.findOrCreate({
        where: { transactionId: record.transactionId },
        defaults: record
      })
      created = wasCreated
    } else {
      await Transaction.create(record)
      created = true
    }

    console.log('CentryOS webhook processed', { eventType, transactionId: record.transactionId, userId: record.userId })

    const responseBody = { success: true, created }
    console.info('CentryOS webhook response', responseBody)
    return res.status(200).json(responseBody)
  } catch (err) {
    console.error('Webhook processing error:', err)
    try {
      console.error('Raw webhook body on error:', req.body)
    } catch (e) {
      /* ignore */
    }
    return res.status(500).json({ success: false, message: 'Webhook processing error' })
  }
}
