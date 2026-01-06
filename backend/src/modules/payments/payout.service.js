import axios from 'axios'
import { getCentryOsToken } from '../centryos/token.service.js'

export async function createPayoutLink(user, amount, options = {}, gameName, gameUsername) {
  try {
    const token = await getCentryOsToken()

    const {
      currency = 'USD',
      expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      redirectTo = process.env.FRONTEND_URL ,
      acceptedPayoutOptions = ['bank', 'card', 'paypal','venmo']
    } = options

    console.log(`Creating payout link for user ${user.email} amount: $${amount}`)

    // Build request matching Walletos application-token schema
    // Build extra object; include amount only when provided
    const extra = {
      withdrawalSource: 'MERCHANT_WALLET',
      accountOptions: acceptedPayoutOptions,
      counterparty: {
        firstName: user.first_name || user.firstName || '',
        lastName: user.last_name || user.lastName || '',
        email: user.email
      }
    }

    if (amount != null) {
      extra.amount = amount
    }

    // Build request body with customData at top level
    const requestBody = {
      tokenType: 'ACCOUNT_WIDGET',
      currency,
      expiredAt,
      redirectTo,
      extra
    }

    // Add custom data at top level if provided
    if (gameName && gameUsername) {
      requestBody.customData = {
        "Game Name": gameName,
        "Game Username": gameUsername
      }
    }

    const res = await axios.post(
      `${process.env.CENTRYOS_LIQUIDITY_BASE_URL}/v1/ext/application-token`,
      requestBody,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    if (!res.data || !res.data.success) {
      console.error('Payout API returned failure:', res.data)
      throw new Error(res.data?.message || 'Payout link creation failed')
    }

    if (!res.data.data) {
      console.error('Payout API returned success but missing data object:', res.data)
      throw new Error('Payout link creation returned unexpected response shape')
    }

    // Normalize structure to match createPaymentLink
    const application = res.data.data.application || {}
    const payoutLink = {
      url: res.data.data.url || null,
      token: application.token || null,
      expiredAt: application.expiredAt || null,
      applicationId: application.id || null
    }

    if (!payoutLink.url) {
      console.error('Payout link missing url in response:', res.data)
      throw new Error('Payout link creation succeeded but no URL was returned')
    }

    return payoutLink
  } catch (error) {
    console.error('Payout link creation error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.message || error.message)
  }
}
