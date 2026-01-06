import { useState } from 'react'
import api from '../services/api'
import Swal from 'sweetalert2'

export default function Home() {
  const token = localStorage.getItem('token')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [amount, setAmount] = useState('0')
  const [modalType, setModalType] = useState('buy')
  const [showTransactionsModal, setShowTransactionsModal] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [transactionsError, setTransactionsError] = useState(null)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('buy')
  const limit = 10

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
    // Swal.fire({
    //   title: 'Coming Soon',
    //   text: 'This feature will come soon',
    //   icon: 'info',
    //   confirmButtonText: 'OK'
    // })
  }

  const fetchTransactions = async (page = 1, eventType = null) => {
    setTransactionsError(null)
    setTransactionsLoading(true)

    try {
      const offset = (page - 1) * limit
      let url = `/payments/my-transactions?limit=${limit}&offset=${offset}`
      if (eventType) url += `&eventType=${eventType}`
      const response = await api.get(url)
      if (response.success) {
        setTransactions(response.data)
        setTotalTransactions(response.total)
        setCurrentPage(page)
      } else {
        setTransactionsError('Failed to fetch transactions')
      }
    } catch (err) {
      setTransactionsError(err.message || 'Failed to fetch transactions')
    } finally {
      setTransactionsLoading(false)
    }
  }

  const handleTransactionsClick = async () => {
    setShowTransactionsModal(true)
    setActiveTab('buy')
    await fetchTransactions(1, 'COLLECTION')
  }

  const handlePageChange = async (page) => {
    const eventType = activeTab === 'buy' ? 'COLLECTION' : 'WITHDRAWAL'
    await fetchTransactions(page, eventType)
  }

  const handleTabChange = async (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
    const eventType = tab === 'all' ? null : tab === 'buy' ? 'COLLECTION' : 'WITHDRAWAL'
    await fetchTransactions(1, eventType)
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
            <h1 className="text-4xl font-bold text-white">Welcome to Treasure pay</h1>
            <p className="text-gray-300">Manage your wallet and payment operations</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-600 to-rose-600 
           hover:from-red-700 hover:to-rose-700
           text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </header>

        {/* Main content */}
        <main className="max-w-4xl mx-auto w-full flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

            {/* Buy */}
            <ActionCard
              title="Buy Sweeps Credits"
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

            {/* Transactions */}
            <ActionCard
              title="Transactions"
              desc="View your buy transaction history"
              gradient="from-purple-600 to-pink-700"
              onClick={handleTransactionsClick}
              loading={transactionsLoading}
            />

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
          <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md relative">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-white mb-4">
              {modalType === 'buy' ? 'Buy Sweeps Credits' : 'Withdraw Funds'}
            </h2>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-600 rounded-lg px-4 py-3 mb-3 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Amount (USD)"
            />

            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={handleCreatePaymentLink}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Link...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-black py-3 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Modal */}
      {showTransactionsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-6xl max-h-[80vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={() => setShowTransactionsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Transactions</h2>
              <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg">
                <button
                  onClick={() => handleTabChange('buy')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                    activeTab === 'buy' ? 'bg-orange-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => handleTabChange('withdraw')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                    activeTab === 'withdraw' ? 'bg-orange-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Withdraw
                </button>
              </div>
            </div>

            {transactionsLoading && <p className="text-center text-white">Loading transactions...</p>}

            {transactionsError && <p className="text-red-600 text-center">{transactionsError}</p>}

            {!transactionsLoading && !transactionsError && transactions.length === 0 && (
              <p className="text-center text-gray-400">No transactions found</p>
            )}

            {!transactionsLoading && !transactionsError && transactions.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-600">
                  <thead>
                    <tr className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                      <th className="border border-gray-600 px-4 py-2 text-left">Transaction ID</th>
                      <th className="border border-gray-600 px-4 py-2 text-left">User ID</th>
                      <th className="border border-gray-600 px-4 py-2 text-left">Payment Method</th>
                      <th className="border border-gray-600 px-4 py-2 text-left">Date</th>
                      <th className="border border-gray-600 px-4 py-2 text-left">Receiving Amount</th>
                      <th className="border border-gray-600 px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-t border-gray-600 hover:bg-gray-700">
                        <td className="border border-gray-600 px-4 py-2 text-gray-300">{transaction.transactionId}</td>
                        <td className="border border-gray-600 px-4 py-2 text-gray-300">{transaction.userId}</td>
                        <td className="border border-gray-600 px-4 py-2 text-gray-300">{transaction.method}</td>
                        <td className="border border-gray-600 px-4 py-2 text-gray-300">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                        <td className="border border-gray-600 px-4 py-2 text-gray-300">${transaction.amount}</td>
                        <td className="border border-gray-600 px-4 py-2 text-gray-300">{transaction.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalTransactions > limit && (
              <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition"
                >
                  Previous
                </button>
                <span className="text-white">
                  Page {currentPage} of {Math.ceil(totalTransactions / limit)}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(totalTransactions / limit)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition"
                >
                  Next
                </button>
              </div>
            )}
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
  const getIcon = () => {
    if (title === "Buy Sweeps Credits") {
      return (
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    } else if (title === "Withdraw") {
      return (
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
        </svg>
      )
    } else if (title === "Transactions") {
      return (
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
    return <Icon />
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`rounded-2xl p-8 text-white shadow-xl bg-gradient-to-br ${gradient} hover:scale-105 transition`}
    >
      {getIcon()}
      <h2 className="text-2xl font-bold mb-2 text-left">{title}</h2>
      <p className="text-sm opacity-90 text-left">{desc}</p>
    </button>
  )
}
