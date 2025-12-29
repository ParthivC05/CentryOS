import { User } from '../users/user.model.js'
import { createPaymentLink } from './payment.service.js'
import { Transaction } from './payment.model.js'

export async function createPayIn(req, res) {
  try {
    const user = await User.findByPk(req.user.userId)
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Get payment details from request body
    const paymentDetails = {
      amount: req.body.amount || 100,
      currency: req.body.currency || 'USD',
      name: req.body.name || null,
      expiredAt: req.body.expiredAt || null,
      customUrlPath: req.body.customUrlPath || null
    }

    const paymentLink = await createPaymentLink(user, paymentDetails)

    res.status(201).json({
      success: true,
      message: 'Payment link created successfully',
      paymentLink
    })
  } catch (error) {
    console.error('PayIn error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to create payment link',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

export async function getTransactions(req, res) {
  try {
    const { eventType, status, userId, limit = 20, offset = 0 } = req.query
    const where = {}

    if (eventType) where.eventType = eventType
    if (status) where.status = status
    if (userId) where.userId = Number(userId)

    const transactions = await Transaction.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    })

    const count = await Transaction.count({ where })

    res.status(200).json({
      success: true,
      data: transactions,
      total: count,
      limit: Number(limit),
      offset: Number(offset)
    })
  } catch (error) {
    console.error('Get transactions error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

export async function getTransactionStatus(req, res) {
  try {
    const { transactionId } = req.params

    const transaction = await Transaction.findOne({
      where: { transactionId }
    })

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' })
    }

    res.status(200).json({
      success: true,
      data: transaction
    })
  } catch (error) {
    console.error('Get transaction status error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

export async function getUserTransactions(req, res) {
  try {
    const userId = req.user.userId
    const { eventType, status, limit = 20, offset = 0 } = req.query
    const where = { userId }

    if (eventType) where.eventType = eventType
    if (status) where.status = status

    const transactions = await Transaction.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    })

    const count = await Transaction.count({ where })

    res.status(200).json({
      success: true,
      data: transactions,
      total: count,
      limit: Number(limit),
      offset: Number(offset)
    })
  } catch (error) {
    console.error('Get user transactions error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
