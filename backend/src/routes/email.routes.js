import express from 'express'
import { sendCustomEmail, sendOTPController, sendNotificationController, verifyOTPController } from '../modules/email/email.controller.js'

const router = express.Router()

// Send custom email
router.post('/send', sendCustomEmail)

// Send OTP
router.post('/otp', sendOTPController)

// Verify OTP
router.post('/verify-otp', verifyOTPController)

// Send notification
router.post('/notification', sendNotificationController)

export default router
