const API_BASE = import.meta.env.VITE_API_BASE_URL

const api = {
  async post(endpoint, payload) {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Request failed')
    }

    return res.json()
  },

  async get(endpoint) {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Request failed')
    }

    return res.json()
  }
}

export async function signup(payload) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Signup failed')
  }

  return res.json()
}

export async function login(payload) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Login failed')
  }

  return res.json()
}

export async function partnerLogin(payload) {
  const res = await fetch(`${API_BASE}/partners/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Partner login failed')
  }

  return res.json()
}

export async function adminLogin(payload) {
  const res = await fetch(`${API_BASE}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Admin login failed')
  }

  return res.json()
}

export async function createUser(payload) {
  const res = await api.post('/partners/add', payload)

  if (!res.success) {
    throw new Error(res.message || 'Create user failed')
  }

  return res
}

export async function getAllPartners() {
  return await api.get('/auth/admin/partners')
}

export async function getUsersByPartner() {
  return await api.get('/partners/users')
}

export default api
