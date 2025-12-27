import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Partner } from './partner.model.js'

export async function addPartner(req, res) {
  const { partnerCode, name, email, password } = req.body

  if (!partnerCode || !name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields: partnerCode, name, email, password' })
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
      partner: {
        id: partner.id,
        partnerCode: partner.partner_code,
        name: partner.name,
        email: partner.email,
        createdAt: partner.createdAt,
        updatedAt: partner.updatedAt
      }
    })
  } catch (error) {
    console.error('Add partner error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Failed to create partner: ' + (error.message || 'Internal server error')
    })
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