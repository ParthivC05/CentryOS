import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Partner } from './partner.model.js'
import { User } from '../users/user.model.js'
import { Transaction } from '../payments/payment.model.js'
import { Op } from 'sequelize'
import { sendPartnerWelcomeEmail } from '../email/email.service.js'

export async function addPartner(req, res) {
  const { partnerCode, name, email, password, role = 'PARTNER' } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields: email, password' })
  }

  if (role === 'PARTNER') {
    if (!partnerCode || !name) {
      return res.status(400).json({ message: 'Missing required fields: partnerCode, name for PARTNER role' })
    }

    const existing = await Partner.findOne({ where: { partner_code: partnerCode } })
    if (existing) {
      return res.status(400).json({ message: 'Partner code already exists' })
    }

    try {
      const password_hash = await bcrypt.hash(password, 10)

      const partner = await Partner.create({
        partner_code: partnerCode,
        name,
        email,
        password_hash
      })

      // Send welcome email to partner
      try {
        await sendPartnerWelcomeEmail(email, partnerCode, password)
        console.log(`Welcome email sent to partner: ${email}`)
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError.message)
        // Don't fail the partner creation if email fails, just log the error
      }

      res.status(201).json({
        success: true,
        message: 'Partner created successfully',
        user: {
          id: partner.id,
          partnerCode: partner.partner_code,
          name: partner.name,
          email: partner.email,
          role: 'PARTNER',
          createdAt: partner.createdAt,
          updatedAt: partner.updatedAt
        }
      })
    } catch (error) {
      console.error('Create partner error:', error.message)
      return res.status(500).json({
        success: false,
        message: 'Failed to create partner: ' + (error.message || 'Internal server error')
      })
    }
  } else if (role === 'ADMIN') {
    if (!name) {
      return res.status(400).json({ message: 'Missing required fields: name for ADMIN role' })
    }

    const existing = await User.findOne({ where: { email } })
    if (existing) {
      return res.status(400).json({ message: 'User already exists' })
    }

    try {
      const password_hash = await bcrypt.hash(password, 10)

      // Split name into first and last name
      const nameParts = name.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      const user = await User.create({
        first_name: firstName,
        last_name: lastName,
        email,
        password_hash,
        role: 'ADMIN'
      })

      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      })
    } catch (error) {
      console.error('Create admin error:', error.message)
      return res.status(500).json({
        success: false,
        message: 'Failed to create admin: ' + (error.message || 'Internal server error')
      })
    }
  } else {
    return res.status(400).json({ message: 'Invalid role. Must be PARTNER or ADMIN' })
  }
}

export async function partnerLogin(req, res) {
  const { partnerCode, password } = req.body

  if (!partnerCode || !password) {
    return res.status(400).json({ message: 'Missing partner code or password' })
  }

  const partner = await Partner.findOne({ where: { partner_code: partnerCode } })
  if (!partner) {
    return res.status(401).json({ message: 'Invalid partner code' })
  }

  const valid = await bcrypt.compare(password, partner.password_hash)
  if (!valid) {
    return res.status(401).json({ message: 'Invalid password' })
  }

  const token = jwt.sign(
    { partnerId: partner.id, partnerCode: partner.partner_code },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({
    token,
    partner: {
      id: partner.id,
      partnerCode: partner.partner_code,
      name: partner.name,
      email: partner.email
    }
  })
}

export async function getUsersByPartnerCode(req, res) {
  const partnerCode = req.user.partnerCode
  const { limit = 20, offset = 0 } = req.query

  if (!partnerCode) {
    return res.status(400).json({ message: 'Partner code not found in token' })
  }

  try {
    const { count, rows: users } = await User.findAndCountAll({
      where: { partner_code: partnerCode },
      attributes: ['id', 'first_name', 'last_name', 'email', 'createdAt', 'updatedAt'],
      limit: Number(limit),
      offset: Number(offset),
      order: [['createdAt', 'DESC']]
    })
    res.json({
      success: true,
      users,
      total: count
    })
  } catch (error) {
    console.error('Get users by partner code error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    })
  }
}

export async function getPartnerTransactions(req, res) {
  const partnerCode = req.user.partnerCode
  const { eventType, limit = 20, offset = 0 } = req.query

  if (!partnerCode) {
    return res.status(400).json({ message: 'Partner code not found in token' })
  }

  try {
    // First get all users for this partner
    const users = await User.findAll({
      where: { partner_code: partnerCode },
      attributes: ['id', 'centryos_entity_id']
    })

    const userIds = users.map(user => user.id.toString())
    const entityIds = users.map(user => user.centryos_entity_id)

    // Build where clause for transactions
    const where = {
      [Op.or]: [
        { eventType: 'COLLECTION', userId: userIds },
        { eventType: 'WITHDRAWAL', userId: entityIds }
      ]
    }

    if (eventType) where.eventType = eventType

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
          userId: transaction.eventType === 'WITHDRAWAL' && user ? user.id : transaction.userId,
          user: user ? { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name } : null,
          gameName,
          gameUsername
        }
      })
    )

    const count = await Transaction.count({ where })

    res.json({
      success: true,
      data: transactionsWithUsers,
      total: count,
      limit: Number(limit),
      offset: Number(offset)
    })
  } catch (error) {
    console.error('Get partner transactions error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    })
  }
}
