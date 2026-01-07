import { verifyOTP } from '../../../../frontend/src/services/api.js'
import { sendEmail, sendOTP, sendNotification } from './email.service.js'

// In-memory OTP storage (use Redis in production)
const otpStore = new Map()

export const sendCustomEmail = async (req, res) => {
  try {
    const { to, subject, text, html } = req.body

    if (!to || !subject || !text) {
      return res.status(400).json({ message: 'Missing required fields: to, subject, text' })
    }

    const result = await sendEmail(to, subject, text, html)
    res.status(200).json({ message: 'Email sent successfully', ...result })
  } catch (error) {
    res.status(500).json({ message: 'Failed to send email', error: error.message })
  }
}

export const sendOTPController = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Missing required field: email' })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP with expiration (10 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    })

    const result = await sendOTP(email, otp)
    res.status(200).json({ message: 'OTP sent successfully', ...result })
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP', error: error.message })
  }
}

export const sendNotificationController = async (req, res) => {
  try {
    const { email, subject, message } = req.body

    if (!email || !subject || !message) {
      return res.status(400).json({ message: 'Missing required fields: email, subject, message' })
    }

    const result = await sendNotification(email, subject, message)
    res.status(200).json({ message: 'Notification sent successfully', ...result })
  } catch (error) {
    res.status(500).json({ message: 'Failed to send notification', error: error.message })
  }
}

export const verifyOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' })
    }

    const isValid = await verifyOTP(email, otp)
    if (isValid) {
      res.status(200).json({ message: 'OTP verified successfully' })
    } else {
      res.status(400).json({ message: 'Invalid OTP' })
    }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    res.status(500).json({ message: 'Failed to verify OTP' })
  }
}
