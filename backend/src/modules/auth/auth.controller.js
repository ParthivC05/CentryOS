import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../users/user.model.js'
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
      { expiresIn: '7d' }
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
    { expiresIn: '7d' }
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
