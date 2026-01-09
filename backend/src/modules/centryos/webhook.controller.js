import crypto from 'crypto'
import { Transaction } from '../payments/payment.model.js'
import { User } from '../users/user.model.js'
import { Partner } from '../partners/partner.model.js'
import { Op } from 'sequelize'
import { sendTransactionNotification } from '../email/email.service.js'

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
      rawPayload: payload
    }

    // Set userId to paymentLink.externalId for both event types
    if (p.paymentLink && p.paymentLink.externalId) {
      record.userId = p.paymentLink.externalId
      console.info('[CENTRYOS_WEBHOOK] User associated via paymentLink externalId', {
        requestId,
        userId: record.userId,
        eventType
      })
    } else {
      console.warn('[CENTRYOS_WEBHOOK] No externalId found', {
        requestId,
        transactionId: record.transactionId,
        eventType
      })
    }


    let created = false
    let transactionInstance = null

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

      transactionInstance = instance
      created = wasCreated
    } else {
      transactionInstance = await Transaction.create(record)
      created = true
    }

    // Send email notification for successful transactions
    // Check status case-insensitively
    const statusLower = (record.status || '').toLowerCase()
    const isSuccessful = statusLower === 'completed' || statusLower === 'success' || statusLower === 'successful'
    
    console.info('[CENTRYOS_WEBHOOK] Checking email notification', {
      requestId,
      status: record.status,
      statusLower,
      isSuccessful,
      hasUserId: !!record.userId,
      userId: record.userId,
      hasTransaction: !!transactionInstance
    })
    
    if (isSuccessful && record.userId && transactionInstance) {
      try {
        // Get user email based on event type
        let user = null
        if (eventType === 'COLLECTION') {
          // For COLLECTION, userId is the user.id (integer as string)
          user = await User.findByPk(parseInt(record.userId))
        } else if (eventType === 'WITHDRAWAL') {
          // For WITHDRAWAL, userId is the centryos_entity_id (string)
          user = await User.findOne({ where: { centryos_entity_id: record.userId } })
        }

        console.info('[CENTRYOS_WEBHOOK] Looking up user for email notification', {
          requestId,
          userId: record.userId,
          eventType,
          userIdType: typeof record.userId
        })

        if (user && user.email) {
          console.info('[CENTRYOS_WEBHOOK] User found, preparing email', {
            requestId,
            userId: user.id,
            email: user.email,
            partnerCode: user.partner_code,
            eventType
          })

          // Extract game name and username from rawPayload or transaction data
          let gameName = null
          let gameUsername = null

          if (record.rawPayload && record.rawPayload.payload) {
            const payload = record.rawPayload.payload
            gameName = payload.gameName || payload.game_name || null
            gameUsername = payload.gameUsername || payload.game_username || null
          }

          // Prepare transaction data for email
          const transactionData = {
            eventType: record.eventType,
            amount: record.amount,
            transactionId: record.transactionId,
            method: record.method,
            status: record.status,
            gameName,
            gameUsername,
            userEmail: user.email // Include user email in transaction data
          }

          // Send email to user
          const emailsToSend = [user.email]
          
          // Check if user has a partner and send email to partner as well
          if (user.partner_code) {
            try {
              const partner = await Partner.findOne({ 
                where: { partner_code: user.partner_code } 
              })
              
              if (partner && partner.email) {
                emailsToSend.push(partner.email)
                console.info('[CENTRYOS_WEBHOOK] Partner found, will send email to partner as well', {
                  requestId,
                  partnerCode: user.partner_code,
                  partnerEmail: partner.email
                })
              } else {
                console.warn('[CENTRYOS_WEBHOOK] Partner not found or no email', {
                  requestId,
                  partnerCode: user.partner_code,
                  partnerFound: !!partner,
                  hasPartnerEmail: partner ? !!partner.email : false
                })
              }
            } catch (partnerError) {
              console.error('[CENTRYOS_WEBHOOK] Error looking up partner', {
                requestId,
                partnerCode: user.partner_code,
                error: partnerError.message
              })
            }
          }

          // Send emails to all recipients
          console.info('[CENTRYOS_WEBHOOK] Sending transaction notification emails', {
            requestId,
            emails: emailsToSend,
            transactionData
          })

          const emailPromises = emailsToSend.map(email => 
            sendTransactionNotification(email, transactionData)
          )

          await Promise.all(emailPromises)
          
          console.info('[CENTRYOS_WEBHOOK] Transaction notification emails sent successfully', {
            requestId,
            emails: emailsToSend,
            transactionId: record.transactionId,
            eventType
          })
        } else {
          console.warn('[CENTRYOS_WEBHOOK] User not found or no email for transaction notification', {
            requestId,
            userId: record.userId,
            eventType,
            userFound: !!user,
            hasEmail: user ? !!user.email : false
          })
        }
      } catch (emailError) {
        console.error('[CENTRYOS_WEBHOOK] Failed to send transaction notification email', {
          requestId,
          error: emailError.message,
          transactionId: record.transactionId
        })
        // Don't fail the webhook if email fails
      }
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
