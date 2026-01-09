import nodemailer from 'nodemailer'

// In-memory OTP storage (use Redis in production)
const otpStore = new Map()

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to,
      subject,
      text,
      ...(html && { html })
    }

    const info = await transporter.sendMail(mailOptions)
    return { messageId: info.messageId }
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }
}

export const sendOTP = async (email, otp) => {
  const subject = 'Your OTP Code'
  const text = `Your OTP code is: ${otp}. It will expire in 10 minutes.`
  const html = `<p>Your OTP code is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>`

  return await sendEmail(email, subject, text, html)
}

export const sendNotification = async (email, subject, message) => {
  const text = message
  const html = `<p>${message.replace(/\n/g, '<br>')}</p>`

  return await sendEmail(email, subject, text, html)
}
