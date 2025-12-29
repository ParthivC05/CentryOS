import express from 'express'
import { centryOsWebhook } from '../modules/centryos/webhook.controller.js'

const router = express.Router()

// Use raw body parser for webhook route to allow HMAC verification
router.post('/', express.raw({ type: 'application/json' }), centryOsWebhook)

export default router
