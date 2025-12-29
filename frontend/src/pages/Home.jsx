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

  const handleRedeemClick = () => {
    setModalType('redeem')
    setShowModal(true)
    setError(null)
    setSuccessMsg(null)
    setAmount('0')
  }

  const handleCreatePaymentLink = async () => {
    const amt = parseFloat(amount)

    if (isNaN(amt)) return setError('Please enter a valid amount')
    if (modalType === 'buy' && amt <= 0) return setError('Amount must be greater than 0')
    if (modalType === 'redeem' && amt < 10) return setError('Minimum withdrawal is $10')

    try {
      setLoading(true)
      setError(null)

      const response = await api.post(
        modalType === 'buy' ? '/payments/payin' : '/payments/payout',
        { amount: amt, currency: 'USD' }
      )

      if (response?.paymentLink?.url) {
        window.open(response.paymentLink.url, '_blank')
        setSuccessMsg('Link opened in new tab')
        setShowModal(false)
      } else {
        setError('Failed to create payment link')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <div className="h-dvh bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">

      {/* Background blobs (cannot cause scroll) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      {/* Page layout */}
      <div className="relative z-10 h-full grid grid-rows-[auto_1fr_auto] px-6">

        {/* Header */}
        <header className="max-w-4xl mx-auto w-full py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">Welcome to CentryOS</h1>
            <p className="text-gray-300">Manage your wallet and payment operations</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg text-white font-semibold"
          >
            Logout
          </button>
        </header>

        {/* Main content */}
        <main className="max-w-4xl mx-auto w-full flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

            {/* Buy */}
            <ActionCard
              title="Buy Credits"
              desc="Purchase credits to use in your account"
              gradient="from-green-600 to-emerald-700"
              onClick={handleBuyClick}
              loading={loading}
            />

            {/* Withdraw */}
            <ActionCard
              title="Withdraw"
              desc="Redeem credits to your account (Min: $10)"
              gradient="from-blue-600 to-cyan-700"
              onClick={handleRedeemClick}
              loading={loading}
            />

            {/* About */}
            <div className="rounded-2xl p-8 text-white shadow-xl bg-gradient-to-br from-indigo-600 to-purple-700">
              <Icon />
              <h2 className="text-2xl font-bold mb-2">About CentryOS</h2>
              <p className="text-indigo-100 text-sm">
                Secure wallet and payment management platform
              </p>
            </div>

          </div>
        </main>

        {/* Footer space / success */}
        <footer className="max-w-4xl mx-auto w-full py-4">
          {successMsg && (
            <div className="bg-green-500/20 border-l-4 border-green-500 p-4 rounded-lg text-green-200">
              {successMsg}
            </div>
          )}
        </footer>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {modalType === 'buy' ? 'Buy Credits' : 'Withdraw Funds'}
            </h2>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 mb-3"
              placeholder="Amount (USD)"
            />

            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={handleCreatePaymentLink}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
              >
                Continue
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 py-3 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Helpers ---------- */

function Icon() {
  return (
    <div className="w-12 h-12 mb-4 bg-white/30 border border-white/40 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="2" d="M12 8v4m0 4h.01" />
      </svg>
    </div>
  )
}

function ActionCard({ title, desc, gradient, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`rounded-2xl p-8 text-white shadow-xl bg-gradient-to-br ${gradient} hover:scale-105 transition`}
    >
      <Icon />
      <h2 className="text-2xl font-bold mb-2 text-left">{title}</h2>
      <p className="text-sm opacity-90 text-left">{desc}</p>
    </button>
  )
}
