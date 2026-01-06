import { User } from '../users/user.model.js'
import { createPayoutLink } from './payout.service.js'

export async function createPayout(req, res) {
  try {
    const { amount, gameName, gameUsername } = req.body
    const user = await User.findByPk(req.user.userId)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Require amount for payout and validate minimum
    const rawAmount = req.body.amount
    if (rawAmount == null) {
      return res.status(400).json({ success: false, message: 'Amount is required for payout' })
    }

    const amt = Number(rawAmount)
    if (Number.isNaN(amt) || !isFinite(amt)) {
      return res.status(400).json({ success: false, message: 'Amount must be a valid number' })
    }

    if (amt < 10) {
      return res.status(400).json({ success: false, message: 'Minimum withdrawal amount is $10' })
    }

    const payoutLink = await createPayoutLink(user, amt, {}, gameName, gameUsername)

    return res.status(201).json({
      success: true,
      message: 'Payout link created successfully',
      paymentLink: payoutLink
    })
  } catch (error) {
    // Log full error (include response body if available)
    console.error('Payout error:', {
      message: error.message,
      responseData: error.response?.data || null
    })

    return res.status(500).json({ success: false, message: error.message })
  }
}
