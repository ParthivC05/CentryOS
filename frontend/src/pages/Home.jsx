import { useState } from 'react'
import api from '../services/api'

export default function Home() {
  const token = localStorage.getItem('token')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [amount, setAmount] = useState('0')
  const [modalType, setModalType] = useState('buy')

  if (!token) {
    window.location.href = '/login'
    return null
  }

  const handleBuyClick = () => {
    setModalType('buy')
    setShowModal(true)
    setError(null)
    setSuccessMsg(null)
    setAmount('0')
  }

  const handleCreatePaymentLink = async () => {
    const amt = parseFloat(amount)

    if (isNaN(amt)) {
      setError('Please enter a valid amount')
      return
    }

    // Validation: buy > 0, redeem >= 10
    if (modalType === 'buy') {
      if (amt <= 0) {
        setError('Please enter an amount greater than 0')
        return
      }
    } else {
      if (amt < 10) {
        setError('Minimum withdrawal amount is $10')
        return
      }
    }

    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      let response

      if (modalType === 'buy') {
        response = await api.post('/payments/payin', {
          amount: amt,
          currency: 'USD',
          name: `Payment - $${amt.toFixed(2)}`
        })
      } else {
        response = await api.post('/payments/payout', {
          amount: amt,
          currency: 'USD',
          name: `Redeem - $${amt.toFixed(2)}`
        })
      }

      if (response.success && response.paymentLink) {
        window.open(response.paymentLink.url, '_blank')
        setSuccessMsg('Link opened in new tab')
        setShowModal(false)
        setAmount('0')
      } else {
        setError('Failed to create payment link')
      }
    } catch (err) {
      setError(err.message || 'Failed to create payment link')
      console.error('Payment error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setError(null)
    setAmount('0')
  }

  const handleRedeemClick = () => {
    // Open redeem modal to collect withdrawal amount
    setModalType('redeem')
    setShowModal(true)
    setError(null)
    setSuccessMsg(null)
    setAmount('0')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Welcome to CentryOS</h1>
      
      <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={handleBuyClick}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          Buy Credits
        </button>

        <button 
          onClick={handleRedeemClick}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Redeem
        </button>

        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          {/* Modal Content */}
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h2 style={{ marginTop: 0 }}>{modalType === 'buy' ? 'Enter Amount' : 'Enter Redeem Amount'}</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Amount (USD)
              </label>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
              <p style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '5px'
              }}>
                Enter the amount you want to pay
              </p>
            </div>

            {error && (
              <div style={{
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#ffcdd2',
                color: '#c62828',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleCreatePaymentLink}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Creating Link...' : 'Continue to Payment'}
              </button>
              <button 
                onClick={handleCloseModal}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {successMsg && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#c8e6c9',
          color: '#2e7d32',
          borderRadius: '4px'
        }}>
          {successMsg}
        </div>
      )}
    </div>
  )
}
