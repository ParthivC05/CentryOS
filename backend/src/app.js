import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'

const app = express()

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://payment.orionstarsweeps.com',
  'https://payment-api.orionstarsweeps.com'
]

app.use(cors({
  origin(origin, callback) {
    // Allow server-to-server, webhooks, curl, Postman
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'signature'
  ]
}))

// ✅ Capture raw body safely for webhooks
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf
    }
  })
)

app.use('/api', routes)

export default app
