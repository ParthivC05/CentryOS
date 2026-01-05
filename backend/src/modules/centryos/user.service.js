import axios from 'axios'
import { getCentryOsToken } from './token.service.js'

export async function createCentryOsUserAndWallet(user) {
  try {
    const token = await getCentryOsToken()


    console.log(`Creating CentryOS account for user ${user.id}...`)

    const userRes = await axios.post(
      `${process.env.CENTRYOS_ACCOUNTS_BASE_URL}/v1/ext/account/create-user`,
      {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        identifier: user.id,
        type: 'USER'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    const entityId = userRes?.data?.account?.id
    if (!entityId) {
      throw new Error('Failed to create CentryOS user: account ID missing')
    }

    console.log('CentryOS user created:', entityId)

    console.log('Creating spend wallet (first call)...')

    const createWalletRes = await axios.post(
      `${process.env.CENTRYOS_LIQUIDITY_BASE_URL}/v1/ext/wallet/create`,
      {
        entityId,
        walletType: 'SPEND'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    if (!createWalletRes?.data?.success) {
      throw new Error(
        createWalletRes?.data?.message || 'Wallet creation failed (first call)'
      )
    }

    console.log('Wallet created successfully (first call)')

    console.log('Fetching wallet details (second call)...')

    const fetchWalletRes = await axios.post(
      `${process.env.CENTRYOS_LIQUIDITY_BASE_URL}/v1/ext/wallet/create`,
      {
        entityId,
        walletType: 'SPEND'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    if (!fetchWalletRes?.data?.success || !Array.isArray(fetchWalletRes.data.wallets)) {
      throw new Error('Failed to fetch wallets (second call)')
    }

    const usdWallet = fetchWalletRes.data.wallets.find(
      wallet => wallet.currency === 'USD'
    )

    if (!usdWallet?.id) {
      throw new Error('USD wallet not found')
    }

    console.log('USD Wallet ID:', usdWallet.id)

    return {
      entityId,
      walletId: usdWallet.id
    }
  } catch (error) {
    console.error('CentryOS integration error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    })

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'CentryOS integration failed'
    )
  }
}
