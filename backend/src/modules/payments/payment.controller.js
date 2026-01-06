import { User } from '../users/user.model.js'
import { createPaymentLink } from './payment.service.js'
import { Transaction } from './payment.model.js'
import { Op } from 'sequelize'

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
    if (userId) where.userId = userId

    const transactions = await Transaction.findAll({
      where,
      attributes: ['id', 'transactionId', 'userId', 'method', 'amount', 'status', 'createdAt', 'eventType', 'rawPayload', 'paymentLink'],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    })

    // Populate user data and game data for each transaction
    const transactionsWithUsers = await Promise.all(
      transactions.map(async (transaction) => {
        let user = null
        if (transaction.eventType === 'COLLECTION') {
          // For COLLECTION, userId is the user.id (integer as string)
          user = await User.findByPk(parseInt(transaction.userId))
        } else if (transaction.eventType === 'WITHDRAWAL') {
          // For WITHDRAWAL, userId is the centryos_entity_id (string)
          user = await User.findOne({ where: { centryos_entity_id: transaction.userId } })
        }

        // Extract game name and game username from transaction data
        let gameName = null
        let gameUsername = null

        if (transaction.eventType === 'COLLECTION') {
          // For COLLECTION events, game data is in rawPayload.payload.metadata
          const metadata = transaction.rawPayload?.payload?.metadata
          if (metadata) {
            gameName = metadata['Game Name'] || null
            gameUsername = metadata['Game Username'] || null
          }
        } else if (transaction.eventType === 'WITHDRAWAL') {
          // For WITHDRAWAL events, game data is in paymentLink.customData
          const customData = transaction.paymentLink?.customData
          if (customData) {
            gameName = customData['Game Name'] || null
            gameUsername = customData['Game Username'] || null
          }
        }

        return {
          ...transaction.toJSON(),
          user: user ? { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name } : null,
          gameName,
          gameUsername
        }
      })
    )

    const count = await Transaction.count({ where })

    res.status(200).json({
      success: true,
      data: transactionsWithUsers,
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

    // Get the user to access their centryos_entity_id
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Build where clause: COLLECTION transactions where userId = user.id (integer)
    // WITHDRAWAL transactions where userId = user.centryos_entity_id (string)
    const where = {
      [Op.or]: [
        { eventType: 'COLLECTION', userId: user.id.toString() },
        { eventType: 'WITHDRAWAL', userId: user.centryos_entity_id }
      ]
    }

    if (eventType) where.eventType = eventType
    if (status) where.status = status

    const transactions = await Transaction.findAll({
      where,
      attributes: ['id', 'transactionId', 'userId', 'method', 'amount', 'status', 'createdAt', 'eventType', 'rawPayload', 'paymentLink'],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    })

    // Extract game name and game username from transaction data
    const transactionsWithGameData = transactions.map(transaction => {
      const transactionData = transaction.toJSON()
      let gameName = null
      let gameUsername = null

      if (transactionData.eventType === 'COLLECTION') {
        // For COLLECTION events, game data is in rawPayload.payload.metadata
        const metadata = transactionData.rawPayload?.payload?.metadata
        if (metadata) {
          gameName = metadata['Game Name'] || null
          gameUsername = metadata['Game Username'] || null
        }
      } else if (transactionData.eventType === 'WITHDRAWAL') {
        // For WITHDRAWAL events, game data is in paymentLink.customData
        const customData = transactionData.paymentLink?.customData
        if (customData) {
          gameName = customData['Game Name'] || null
          gameUsername = customData['Game Username'] || null
        }
      }

      return {
        ...transactionData,
        gameName,
        gameUsername
      }
    })

    const count = await Transaction.count({ where })

    res.status(200).json({
      success: true,
      data: transactionsWithGameData,
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
