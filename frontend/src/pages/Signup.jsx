import { useState } from 'react'
import { signup } from '../services/api'
import { Link } from 'react-router-dom'

export default function Signup() {
  const params = new URLSearchParams(window.location.search)
  const partnerCode = params.get('ref')

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })

  const [error, setError] = useState('')

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const res = await signup({ ...form, partnerCode })
      localStorage.setItem('token', res.token)
      window.location.href = '/'
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{  position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 480, padding: 28, borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', background: '#fff' }}>
        <h2 style={{ margin: '0 0 8px' }}>Create your account</h2>
        <p style={{ margin: '0 0 18px', color: '#666' }}>Join CentryOS to manage wallets, payments and more.</p>

        {partnerCode && <div style={{ marginBottom: 12, color: '#444' }}>Partner: <strong>{partnerCode}</strong></div>}
        {error && <div style={{ marginBottom: 12, color: '#b00020' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input name="firstName" placeholder="First name" onChange={handleChange} required style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd' }} />
            <input name="lastName" placeholder="Last name" onChange={handleChange} required style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd' }} />
          </div>

          <input name="email" type="email" placeholder="Email address" onChange={handleChange} required style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd' }} />
          <input name="password" type="password" placeholder="Create a password" onChange={handleChange} required style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd' }} />

          <button type="submit" style={{ marginTop: 6, padding: '10px 12px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Create account</button>
        </form>

        <div style={{ marginTop: 16, color: '#666', fontSize: 14 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
