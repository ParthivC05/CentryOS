import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../users/user.model.js'
import { Partner } from '../partners/partner.model.js'
import { Transaction } from '../payments/payment.model.js'
import { createCentryOsUserAndWallet } from '../centryos/user.service.js'

export async function signup(req, res) {
  const { firstName, lastName, email, password, partnerCode } = req.body

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  const existing = await User.findOne({ where: { email } })
  if (existing) {
    return res.status(400).json({ message: 'User already exists' })
  }

  try {
    // Hash password
    const password_hash = await bcrypt.hash(password, 10)

    // Create temporary user object for CentryOS integration
    const tempUser = {
      first_name: firstName,
      last_name: lastName,
      email,
      id: null // Will be set after DB creation
    }

    // Step 1: Create CentryOS user account and wallet BEFORE saving to DB
    console.log('Starting CentryOS integration...')
    
    // We need to create a temporary ID for the CentryOS identifier
    // Using email hash or timestamp-based identifier
    const tempId = Math.random().toString(36).substring(2, 15)
    tempUser.id = tempId

    const { entityId, walletId } = await createCentryOsUserAndWallet(tempUser)

    // Step 2: Only if CentryOS integration succeeds, create user in database
    console.log('CentryOS integration successful, creating user in database...')
    
    const user = await User.create({
      first_name: firstName,
      last_name: lastName,
      email,
      password_hash,
      partner_code: partnerCode || null,
      centryos_entity_id: entityId,
      centryos_wallet_id: walletId
    })

    console.log(`User created successfully with ID ${user.id}`)

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.SESSION_TIMEOUT  }
    )

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        centryosEntityId: user.centryos_entity_id,
        centryosWalletId: user.centryos_wallet_id,
        partnerCode: user.partner_code
      }
    })
  } catch (error) {
    console.error('Signup error:', error.message)
    
    return res.status(500).json({
      success: false,
      message: 'Signup failed: ' + (error.message || 'Internal server error'),
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

export async function login(req, res) {
  const { email, password, partnerCode } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing credentials' })
  }

  const user = await User.findOne({ where: { email } })
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  // 🔐 Partner isolation
  if (partnerCode && user.partner_code !== partnerCode) {
    return res.status(401).json({ message: 'Invalid partner code' })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.SESSION_TIMEOUT  }
  )

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      partnerCode: user.partner_code
    }
  })
}

export async function adminLogin(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing credentials' })
  }

  const user = await User.findOne({ where: { email, role: 'ADMIN' } })
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.SESSION_TIMEOUT  }
  )

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  })
}

export async function getAllPartners(req, res) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin only.' })
  }

  try {
    const { limit = 20, offset = 0 } = req.query
    const partners = await Partner.findAll({
      attributes: ['id', 'partner_code', 'name', 'email', 'createdAt', 'updatedAt'],
      limit: Number(limit),
      offset: Number(offset),
      order: [['createdAt', 'DESC']]
    })
    const total = await Partner.count()
    res.json({
      success: true,
      partners,
      total,
      limit: Number(limit),
      offset: Number(offset)
    })
  } catch (error) {
    console.error('Get all partners error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partners'
    })
  }
}

export async function getAllUsers(req, res) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin only.' })
  }

  try {
    const { limit = 20, offset = 0 } = req.query
    const users = await User.findAll({
      attributes: ['id', 'first_name', 'last_name', 'email', 'partner_code', 'createdAt', 'updatedAt'],
      include: [{
        model: Partner,
        as: 'partner',
        attributes: ['name', 'partner_code'],
        required: false
      }],
      limit: Number(limit),
      offset: Number(offset),
      order: [['createdAt', 'DESC']]
    })
    const total = await User.count()
    res.json({
      success: true,
      users,
      total,
      limit: Number(limit),
      offset: Number(offset)
    })
  } catch (error) {
    console.error('Get all users error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    })
  }
}

export async function getAllTransactions(req, res) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin only.' })
  }

  try {
    const { eventType, limit = 20, offset = 0 } = req.query
    const whereClause = eventType ? { eventType } : {}

    const transactions = await Transaction.findAll({
      where: whereClause,
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

    const count = await Transaction.count({ where: whereClause })

    res.json({
      success: true,
      data: transactionsWithUsers,
      total: count,
      limit: Number(limit),
      offset: Number(offset)
    })
  } catch (error) {
    console.error('Get all transactions error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    })
  }
}
