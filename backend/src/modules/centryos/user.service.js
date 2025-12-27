import axios from 'axios'
import { getCentryOsToken } from './token.service.js'

export async function createCentryOsUserAndWallet(user) {
  try {
    const token = await getCentryOsToken()

    // Step 1: Create CentryOS user account
    console.log(`Creating CentryOS account for user ${user.id}...`)
    const userRes = await axios.post(
      `${process.env.CENTRYOS_ACCOUNTS_BASE_URL}/v1/ext/account/create-user`,
      {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        identifier: `user_${user.id}`,
        type: 'USER'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    if (!userRes.data.account || !userRes.data.account.id) {
      throw new Error('Failed to create CentryOS user: No account ID returned')
    }

    const entityId = userRes.data.account.id
    console.log(`CentryOS account created: ${entityId}`)

    // Step 2: Create wallet
    console.log(`Creating wallet for entity ${entityId}...`)
    const walletRes = await axios.post(
      `${process.env.CENTRYOS_LIQUIDITY_BASE_URL}/v1/ext/wallet/create`,
      {
        entityId,
        walletType: 'SPEND'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    // Validate wallet creation was successful
    if (!walletRes.data.success) {
      throw new Error(`Wallet creation failed: ${walletRes.data.message || 'Unknown error'}`)
    }

    // Extract wallet ID from response
    let walletId = null
    
    if (walletRes.data.wallets && Array.isArray(walletRes.data.wallets) && walletRes.data.wallets.length > 0) {
      // Pick USD wallet if available
      const usdWallet = walletRes.data.wallets.find(w => w.currency === 'USD')
      
      if (usdWallet) {
        walletId = usdWallet.id
        console.log('Using USD wallet ID:', walletId)
      } else {
        // Fallback to first wallet
        walletId = walletRes.data.wallets[0].id
        console.log('Using default wallet ID:', walletId)
      }
    } else {
      // Wallet created successfully but wallet details not in response
      // Use entityId as wallet reference (wallet is linked to entity)
      walletId = entityId
      console.log('Wallet created (using entityId as reference):', walletId)
    }

    console.log(`Wallet created successfully: ${walletId}`)

    return {
      entityId,
      walletId
    }
  } catch (error) {
    console.error('CentryOS integration error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        data: error.config.data
      } : null
    })
    throw new Error(`CentryOS integration failed: ${error.response?.data?.message || error.message}`)
  }
}
