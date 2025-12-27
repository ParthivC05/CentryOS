import { useState } from 'react'
import { login } from '../services/api'
import { Link } from 'react-router-dom'

export default function Login() {
  const params = new URLSearchParams(window.location.search)
  const partnerCode = params.get('ref')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const res = await login({ email, password, partnerCode })
      localStorage.setItem('token', res.token)
      window.location.href = '/'
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 420, padding: 28, borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', background: '#fff' }}>
        <h2 style={{ margin: '0 0 12px' }}>Sign in to CentryOS</h2>
        <p style={{ margin: '0 0 20px', color: '#666' }}>Access your account to buy credits and manage wallets.</p>

        {partnerCode && <div style={{ marginBottom: 12, color: '#444' }}>Partner: <strong>{partnerCode}</strong></div>}
        {error && <div style={{ marginBottom: 12, color: '#b00020' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label style={{ textAlign: 'left', fontSize: 13, color: '#333' }}>Email</label>
          <input
            type="email"
            placeholder="Enter you email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15 }}
          />

          <label style={{ textAlign: 'left', fontSize: 13, color: '#333' }}>Password</label>
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15 }}
          />

          <button type="submit" style={{ marginTop: 8, padding: '10px 12px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Sign in</button>
        </form>

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: 14 }}>
          <div>New here? <Link to="/signup">Create account</Link></div>
        </div>
      </div>
    </div>
  )
}
