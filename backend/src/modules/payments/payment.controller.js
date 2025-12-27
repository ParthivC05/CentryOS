import { User } from '../users/user.model.js'
import { createPaymentLink } from './payment.service.js'

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
