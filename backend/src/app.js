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
  origin: function (origin, callback) {
    // allow server-to-server, Postman, curl
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use('/api', routes)

export default app
