import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import { createPayIn } from '../modules/payments/payment.controller.js'
import { createPayout } from '../modules/payments/payout.controller.js'

const router = express.Router()

router.post('/payin', authMiddleware, createPayIn)
router.post('/payout', authMiddleware, createPayout)

export default router
