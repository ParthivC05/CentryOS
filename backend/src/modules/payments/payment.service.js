import axios from 'axios'
import { getCentryOsToken } from '../centryos/token.service.js'

export async function createPaymentLink(user, paymentDetails = {}) {
  try {
    const token = await getCentryOsToken()

    // Default payment details
    const {
      amount = 0,
      currency = 'USD',
      name = null,
      expiredAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes 
      customUrlPath = null,
      isOpenLink = false,
      amountLocked = true,
      customerPays = false,
      acceptedPaymentOptions = ['card', 'google_pay', 'apple_pay']
    } = paymentDetails

    // Generate unique custom URL path if not provided
    const urlPath = customUrlPath || `pay-${user.id}-${Date.now()}`
    const paymentName = name || `Payment - $${amount.toFixed(2)}`

    console.log(`Creating payment link for user ${user.email} with amount: $${amount}`)

    const res = await axios.post(
      `${process.env.CENTRYOS_LIQUIDITY_BASE_URL}/v1/ext/collections/payment-link`,
      {
        currency,
        amount,
        name: paymentName,
        expiredAt,
        redirectTo: process.env.FRONTEND_URL,
        amountLocked,
        customerPays,
        customUrlPath: urlPath,
        isOpenLink,
        acceptedPaymentOptions,
        externalId: String(user.id),
        "customFields": ["Game Name", "Game Username"],
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    if (!res.data.success) {
      throw new Error(`Payment link creation failed: ${res.data.message || 'Unknown error'}`)
    }

    const paymentLink = {
      url: res.data.data.url,
      token: res.data.data.application.token,
      expiredAt: res.data.data.application.expiredAt,
      applicationId: res.data.data.application.id
    }

    console.log(`Payment link created successfully for ${user.email}`)

    return paymentLink
  } catch (error) {
    console.error('Payment link creation error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    })
    throw new Error(`Failed to create payment link: ${error.response?.data?.message || error.message}`)
  }
}
