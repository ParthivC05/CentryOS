import express from 'express'
import authRoutes from './auth.routes.js'
import paymentRoutes from './payment.routes.js'
import webhookRoutes from './webhook.routes.js'
import partnerRoutes from './partner.routes.js'
import emailRoutes from './email.routes.js'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/payments', paymentRoutes)
router.use('/webhooks/centryos', webhookRoutes)
router.use('/partners', partnerRoutes)
router.use('/email', emailRoutes)

export default router
