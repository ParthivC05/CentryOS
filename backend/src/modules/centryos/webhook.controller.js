import crypto from 'crypto'
import { Transaction } from '../payments/payment.model.js'
import { User } from '../users/user.model.js'
import { Op } from 'sequelize'

export async function centryOsWebhook(req, res) {
  const requestId = crypto.randomUUID()

  try {
  
    console.info('[CENTRYOS_WEBHOOK] Incoming request', {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      contentType: req.get('content-type'),
      signaturePresent: Boolean(req.get('signature')),
      userAgent: req.get('user-agent')
    })

    const rawBody = req.rawBody
    if (!rawBody) {
      console.error('[CENTRYOS_WEBHOOK] Raw body missing', { requestId })
      return res.status(400).json({ success: false, message: 'Raw body missing' })
    }

    const signature = req.get('signature')
    const secret = process.env.CENTRYOS_WEBHOOK_SECRET

    if (!secret) {
      console.error('[CENTRYOS_WEBHOOK] Secret not configured', { requestId })
      return res.status(500).json({ success: false, message: 'Webhook secret not configured' })
    }


    const expectedSignature = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex')

    const isValidSignature =
      signature &&
      crypto.timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      )

    if (!isValidSignature) {
      console.warn('[CENTRYOS_WEBHOOK] Invalid signature', {
        requestId,
        received: signature
      })
      return res.status(401).json({ success: false, message: 'Invalid signature' })
    }

    console.info('[CENTRYOS_WEBHOOK] Signature verified', { requestId })


    const payload = JSON.parse(rawBody.toString())
    const { eventType, status } = payload
    const p = payload.payload || {}

    if (!['COLLECTION', 'WITHDRAWAL'].includes(eventType)) {
      console.info('[CENTRYOS_WEBHOOK] Unsupported event ignored', {
        requestId,
        eventType
      })
      return res.status(200).json({ success: true, ignored: true })
    }

    console.info('[CENTRYOS_WEBHOOK] Event received', {
      requestId,
      eventType,
      status,
      transactionId: p.transactionId
    })


    const record = {
      eventType,
      status,
      entry: p.entry,
      amount: p.amount ? Number(p.amount) : null,
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
      metadata: p.metadata || null,
      rawPayload: payload
    }


    let user = null

    // First try to find user by metadata.userId (from payment link creation)
    if (p.metadata && p.metadata.userId) {
      user = await User.findByPk(p.metadata.userId)
      if (user) {
        record.userId = user.id
        console.info('[CENTRYOS_WEBHOOK] User associated via metadata', {
          requestId,
          userId: user.id,
          email: user.email
        })
      }
    }

    // Fallback to entityId/walletId lookup if metadata didn't work
    if (!user) {
      user = await User.findOne({
        where: {
          [Op.or]: [
            { centryos_entity_id: record.entityId },
            { centryos_wallet_id: record.walletId }
          ]
        }
      })

      if (user) {
        record.userId = user.id
        console.info('[CENTRYOS_WEBHOOK] User associated via entity/wallet', {
          requestId,
          userId: user.id,
          email: user.email
        })
      } else {
        console.warn('[CENTRYOS_WEBHOOK] No user association found', {
          requestId,
          entityId: record.entityId,
          walletId: record.walletId,
          metadataUserId: p.metadata?.userId
        })
      }
    }


    let created = false

    if (record.transactionId) {
      const [instance, wasCreated] = await Transaction.findOrCreate({
        where: { transactionId: record.transactionId },
        defaults: record
      })

      if (!wasCreated) {
        await instance.update({
          status: record.status,
          summary: record.summary,
          description: record.description,
          rawPayload: record.rawPayload
        })
      }

      created = wasCreated
    } else {
      await Transaction.create(record)
      created = true
    }


    console.info('[CENTRYOS_WEBHOOK] Processed successfully', {
      requestId,
      eventType,
      transactionId: record.transactionId,
      userId: record.userId,
      created
    })

    return res.status(200).json({ success: true, created })
  } catch (error) {
    console.error('[CENTRYOS_WEBHOOK] Processing failed', {
      requestId,
      message: error.message,
      stack: error.stack
    })

    return res.status(500).json({ success: false, message: 'Webhook processing error' })
  }
}
