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
  const subject = 'Your Treasure Pay Verification Code'
  
  const text = `
Your Treasure Pay Verification Code

Your OTP code is: ${otp}

This code will expire in 5 minutes.

If you didn't request this code, please ignore this email.

Thank you,
Treasure Pay Team
  `.trim()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .otp-box {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 2px dashed #10b981;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .otp-code {
      font-size: 42px;
      font-weight: bold;
      color: #059669;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
      margin: 20px 0;
      padding: 15px;
      background: white;
      border-radius: 8px;
      display: inline-block;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .info-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .info-box p {
      margin: 5px 0;
      color: #92400e;
      font-size: 14px;
    }
    .warning {
      background: #fee2e2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .warning p {
      margin: 5px 0;
      color: #991b1b;
      font-size: 14px;
    }
    .footer {
      background: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
    }
    .timer {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Verification Code</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; color: #333;">Hello,</p>
      <p style="font-size: 16px; color: #333;">You've requested a verification code for your Treasure Pay account.</p>
      
      <div class="otp-box">
        <p style="margin: 0 0 15px 0; color: #059669; font-weight: bold; font-size: 14px; text-transform: uppercase;">Your Verification Code</p>
        <div class="otp-code">${otp}</div>
        <div class="timer">⏱️ Expires in 5 minutes</div>
      </div>

      <div class="info-box">
        <p><strong>⚠️ Important:</strong></p>
        <p>• This code will expire in 5 minutes</p>
        <p>• Do not share this code with anyone</p>
        <p>• Treasure Pay will never ask for your verification code</p>
      </div>

      <div class="warning">
        <p><strong>🔒 Security Notice:</strong></p>
        <p>If you didn't request this verification code, please ignore this email. Your account remains secure.</p>
      </div>

      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        This is an automated email. Please do not reply to this message.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0;"><strong>Treasure Pay</strong></p>
      <p style="margin: 5px 0 0 0;">Thank you for using our service</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  return await sendEmail(email, subject, text, html)
}

export const sendNotification = async (email, subject, message) => {
  const text = message
  const html = `<p>${message.replace(/\n/g, '<br>')}</p>`

  return await sendEmail(email, subject, text, html)
}

export const sendPartnerWelcomeEmail = async (email, partnerCode, password) => {
  const userSignupLink = `https://payment.orionstarsweeps.com/signup/?ref=${partnerCode}`
  const partnerLoginLink = `https://payment.orionstarsweeps.com/partner/login`
  
  const subject = 'Welcome to Treasure Pay - Partner Account Created'
  
  const text = `
Welcome to Treasure Pay!

Your partner account has been successfully created. Here are your account details:

Email: ${email}
Partner Code: ${partnerCode}
Password: ${password}

Important Links:
- User Signup Link: ${userSignupLink}
- Partner Login Link: ${partnerLoginLink}

Please keep these credentials secure and do not share them with anyone.

Thank you!
Treasure Pay Team
  `.trim()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .credentials {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #667eea;
    }
    .credential-item {
      margin: 10px 0;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 5px;
    }
    .credential-label {
      font-weight: bold;
      color: #667eea;
      display: inline-block;
      min-width: 120px;
    }
    .links {
      margin: 20px 0;
    }
    .link-item {
      margin: 15px 0;
      padding: 15px;
      background: white;
      border-radius: 8px;
      border: 2px solid #e0e0e0;
    }
    .link-item a {
      color: #667eea;
      text-decoration: none;
      font-weight: bold;
      word-break: break-all;
    }
    .link-item a:hover {
      text-decoration: underline;
    }
    .link-label {
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
      display: block;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .warning {
      background: #fff3cd;
      border: 1px solid #ffc107;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      color: #856404;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome to Treasure Pay!</h1>
  </div>
  <div class="content">
    <p>Your partner account has been successfully created. Here are your account details:</p>
    
    <div class="credentials">
      <h3 style="margin-top: 0; color: #667eea;">Account Credentials</h3>
      <div class="credential-item">
        <span class="credential-label">Email:</span>
        <span>${email}</span>
      </div>
      <div class="credential-item">
        <span class="credential-label">Partner Code:</span>
        <span>${partnerCode}</span>
      </div>
      <div class="credential-item">
        <span class="credential-label">Password:</span>
        <span>${password}</span>
      </div>
    </div>

    <div class="links">
      <h3 style="color: #667eea;">Important Links</h3>
      <div class="link-item">
        <span class="link-label">User Signup Link:</span>
        <a href="${userSignupLink}" target="_blank">${userSignupLink}</a>
      </div>
      <div class="link-item">
        <span class="link-label">Partner Login Link:</span>
        <a href="${partnerLoginLink}" target="_blank">${partnerLoginLink}</a>
      </div>
    </div>

    <div class="warning">
      <strong>⚠️ Security Notice:</strong> Please keep these credentials secure and do not share them with anyone.
    </div>
  </div>
  <div class="footer">
    <p>Thank you for joining Treasure Pay!</p>
    <p>Treasure Pay Team</p>
  </div>
</body>
</html>
  `.trim()

  return await sendEmail(email, subject, text, html)
}

export const sendTransactionNotification = async (email, transaction) => {
  const { eventType, amount, transactionId, method, status, gameName, gameUsername, userEmail } = transaction
  const isBuy = eventType === 'COLLECTION'
  const transactionType = isBuy ? 'Purchase' : 'Redeem'
  const transactionTypeLower = isBuy ? 'purchase' : 'redeem'
  const icon = isBuy ? '🛒' : '💸'
  const color = isBuy ? '#10b981' : '#3b82f6'
  const bgColor = isBuy ? '#f0fdf4' : '#eff6ff'
  const borderColor = isBuy ? '#10b981' : '#3b82f6'
  
  const subject = `Transaction ${status === 'completed' ? 'Completed' : 'Successful'} - ${transactionType} of $${amount}`
  
  const text = `
${transactionType} Transaction ${status === 'completed' ? 'Completed' : 'Successful'}

Transaction ID: ${transactionId}
User Email: ${userEmail || 'N/A'}
Amount: $${amount}
Payment Method: ${method || 'N/A'}
${gameName ? `Game: ${gameName}` : ''}
${gameUsername ? `Game Username: ${gameUsername}` : ''}

Your ${transactionTypeLower} transaction has been ${status === 'completed' ? 'completed' : 'processed'} successfully.

Thank you for using Treasure Pay!
  `.trim()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, ${color} 0%, ${isBuy ? '#059669' : '#2563eb'} 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .content {
      padding: 40px 30px;
    }
    .success-badge {
      background: ${bgColor};
      border: 2px solid ${borderColor};
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 30px 0;
    }
    .success-badge h2 {
      margin: 0 0 10px 0;
      color: ${color};
      font-size: 24px;
    }
    .amount {
      font-size: 36px;
      font-weight: bold;
      color: ${color};
      margin: 15px 0;
    }
    .transaction-details {
      background: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: bold;
      color: #6b7280;
      font-size: 14px;
    }
    .detail-value {
      color: #111827;
      font-size: 14px;
      text-align: right;
      word-break: break-word;
    }
    .transaction-id {
      font-family: 'Courier New', monospace;
      background: #f3f4f6;
      padding: 8px 12px;
      border-radius: 5px;
      font-size: 12px;
    }
    .footer {
      background: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
    }
    .info-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      font-size: 14px;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">${icon}</div>
      <h1>Transaction ${status === 'completed' ? 'Completed' : 'Successful'}!</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; color: #333;">Hello,</p>
      <p style="font-size: 16px; color: #333;">Your ${transactionTypeLower} transaction has been ${status === 'completed' ? 'completed' : 'processed'} successfully.</p>
      
      <div class="success-badge">
        <h2>${transactionType} Successful</h2>
        <div class="amount">$${amount}</div>
        <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">Transaction ${status === 'completed' ? 'completed' : 'processed'} successfully</p>
      </div>

      <div class="transaction-details">
        <div class="detail-row">
          <span class="detail-label">Transaction ID:</span>
          <span class="detail-value">
            <span class="transaction-id">${transactionId}</span>
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">User Email:</span>
          <span class="detail-value">${userEmail || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Transaction Type:</span>
          <span class="detail-value">${transactionType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount:</span>
          <span class="detail-value" style="font-weight: bold; color: ${color}; font-size: 16px;">$${amount}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Method:</span>
          <span class="detail-value">${method || 'N/A'}</span>
        </div>
        ${gameName ? `
        <div class="detail-row">
          <span class="detail-label">Game:</span>
          <span class="detail-value">${gameName}</span>
        </div>
        ` : ''}
        ${gameUsername ? `
        <div class="detail-row">
          <span class="detail-label">Game Username:</span>
          <span class="detail-value">${gameUsername}</span>
        </div>
        ` : ''}
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value" style="color: ${color}; font-weight: bold;">${status === 'completed' ? 'Completed' : 'Successful'}</span>
        </div>
      </div>

      <div class="info-box">
        <p style="margin: 0;"><strong>ℹ️ Note:</strong> This is an automated confirmation email. If you have any questions or concerns, please contact our support team.</p>
      </div>

      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        Thank you for using Treasure Pay!
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0;"><strong>Treasure Pay</strong></p>
      <p style="margin: 5px 0 0 0;">Secure Payment Processing</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  return await sendEmail(email, subject, text, html)
}
