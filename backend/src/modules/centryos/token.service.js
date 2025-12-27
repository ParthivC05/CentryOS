import axios from 'axios'

let cachedToken = null
let expiry = 0

export async function getCentryOsToken() {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < expiry) {
    console.log('Using cached CentryOS token')
    return cachedToken
  }

  try {
    console.log('Generating new CentryOS token...')
    
    const res = await axios.post(
      `${process.env.CENTRYOS_ACCOUNTS_BASE_URL}/v1/ext/jwt/generate-token`,
      {},
      {
        auth: {
          username: process.env.CENTRYOS_CLIENT_ID,
          password: process.env.CENTRYOS_CLIENT_SECRET
        }
      }
    )

    if (!res.data.data || !res.data.data.token) {
      throw new Error('Invalid token response from CentryOS')
    }

    cachedToken = res.data.data.token
    // Cache for 55 minutes (token expires in 60 minutes)
    expiry = Date.now() + 55 * 60 * 1000

    console.log('CentryOS token generated successfully')
    return cachedToken
  } catch (error) {
    console.error('Failed to get CentryOS token:', error.response?.data || error.message)
    throw new Error(`CentryOS token generation failed: ${error.response?.data?.message || error.message}`)
  }
}
