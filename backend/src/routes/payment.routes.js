import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import { createPayIn, getTransactions, getTransactionStatus, getUserTransactions } from '../modules/payments/payment.controller.js'
import { createPayout } from '../modules/payments/payout.controller.js'

const router = express.Router()

router.post('/payin', authMiddleware, createPayIn)
router.post('/payout', authMiddleware, createPayout)
router.get('/transactions', getTransactions)
router.get('/transactions/:transactionId', getTransactionStatus)
router.get('/my-transactions', authMiddleware, getUserTransactions)

export default router
