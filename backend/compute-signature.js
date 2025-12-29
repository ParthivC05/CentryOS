import crypto from 'crypto'

// Exact body that the server received (369 bytes)
const PAYLOAD = '{"eventType":"WITHDRAWAL","status":"SUCCESS","payload":{"entry":"DEBIT","amount":41.99,"method":"DEBIT_CARD","summary":"Payment sent","currency":"USD","entityId":"ent-123","walletId":"wallet-123","timestamp":1766131682806,"entityType":"USER","description":"Payment sent","transactionId":"test-tx-123","paymentLink":{"id":"link-1","token":"token-1"},"feeCharged":"1.4"}}'

const SECRET = 'afebea6fc11fff13260c77699844f7ecd5bf8e2be8cffaad4a92b53e4c3bacb264645d2c9c8b8d2b98c8c1286463aadb'

const signature = crypto.createHmac('sha512', SECRET).update(PAYLOAD).digest('hex')

console.log('Correct Signature:', signature)
console.log('Payload length:', PAYLOAD.length)
console.log('Payload:', PAYLOAD)
