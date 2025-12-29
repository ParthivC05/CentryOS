import axios from 'axios'
import crypto from 'crypto'
import fs from 'fs'

async function main() {
  const args = process.argv.slice(2)
  const url = args[0] || process.env.WEBHOOK_URL || 'http://localhost:5000/webhooks/centryos'
  const secret = args[1] || process.env.CENTRYOS_WEBHOOK_SECRET || 'test_secret'
  const payloadPath = args[2]

  let payload
  if (payloadPath) {
    payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'))
  } else {
    payload = {
      eventType: 'payment.updated',
      status: 'completed',
      payload: {
        entry: 'sample-entry',
        amount: 1000,
        method: 'card',
        summary: 'Test payment',
        currency: 'USD',
        entityId: 'entity_123',
        walletId: 'wallet_456',
        timestamp: String(Date.now()),
        entityType: 'user',
        description: 'Test description',
        transactionId: 'tx_' + Math.random().toString(36).slice(2)
      }
    }
  }

  const rawBody = Buffer.from(JSON.stringify(payload))
  const signature = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')

  try {
    console.log('Sending webhook to', url)
    console.log('Signature:', signature)
    const res = await axios.post(url, rawBody, {
      headers: {
        'Content-Type': 'application/json',
        'signature': signature
      },
      timeout: 10000
    })

    console.log('Response status:', res.status)
    console.log('Response data:', res.data)
  } catch (err) {
    if (err.response) {
      console.error('Error response status:', err.response.status)
      console.error('Error response data:', err.response.data)
    } else {
      console.error('Request error:', err.message)
    }
    process.exit(1)
  }
}

main()
