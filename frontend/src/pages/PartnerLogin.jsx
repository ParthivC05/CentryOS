import { useState } from 'react'
import { partnerLogin } from '../services/api'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

export default function PartnerLogin() {
  const [partnerCode, setPartnerCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const res = await partnerLogin({ partnerCode, password })
      localStorage.setItem('token', res.token)
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'Welcome to your partner dashboard!',
        timer: 2000,
        showConfirmButton: false
      })
      navigate('/partner/dashboard')
    } catch (err) {
      setError(err.message)
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.message
      })
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 420, padding: 28, borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', background: '#fff' }}>
        <h2 style={{ margin: '0 0 12px' }}>Partner Sign in to CentryOS</h2>
        <p style={{ margin: '0 0 20px', color: '#666' }}>Access your partner account to manage Payments</p>

        {error && <div style={{ marginBottom: 12, color: '#b00020' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label style={{ textAlign: 'left', fontSize: 13, color: '#333' }}>Partner Code</label>
          <input
            type="text"
            placeholder="Enter your partner code"
            value={partnerCode}
            onChange={e => setPartnerCode(e.target.value)}
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
          <div>Regular user? <Link to="/login">User login</Link></div>
        </div>
      </div>
    </div>
  )
}