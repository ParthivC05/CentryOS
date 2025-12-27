import express from 'express'
import { centryOsWebhook } from '../modules/centryos/webhook.controller.js'

const router = express.Router()
router.post('/', centryOsWebhook)

export default router
