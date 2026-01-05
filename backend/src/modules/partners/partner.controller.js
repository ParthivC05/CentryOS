import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Partner } from './partner.model.js'
import { User } from '../users/user.model.js'
import { Transaction } from '../payments/payment.model.js'

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

  if (!partnerCode) {
    return res.status(400).json({ message: 'Partner code not found in token' })
  }

  try {
    const users = await User.findAll({
      where: { partner_code: partnerCode },
      attributes: ['id', 'first_name', 'last_name', 'email', 'createdAt', 'updatedAt']
    })
    res.json({
      success: true,
      users
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
  const { eventType } = req.query

  if (!partnerCode) {
    return res.status(400).json({ message: 'Partner code not found in token' })
  }

  try {
    // First get all users for this partner
    const users = await User.findAll({
      where: { partner_code: partnerCode },
      attributes: ['id']
    })

    const userIds = users.map(user => user.id)

    // Then get transactions for these users
    const transactions = await Transaction.findAll({
      where: {
        userId: userIds,
        ...(eventType && { eventType })
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['email']
      }],
      order: [['createdAt', 'DESC']]
    })

    res.json({
      success: true,
      data: transactions
    })
  } catch (error) {
    console.error('Get partner transactions error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    })
  }
}
