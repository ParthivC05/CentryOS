import { useState, useEffect } from 'react'
import { getUsersByPartner, getPartnerTransactions } from '../services/api'
import Swal from 'sweetalert2'

export default function PartnerDashboard() {
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('users')
  const [transactionTab, setTransactionTab] = useState('buy')
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [transactionLimit] = useState(20)

  useEffect(() => {
    fetchData()
  }, [currentPage, transactionTab, currentTransactionPage])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (currentPage === 'users') {
        const res = await getUsersByPartner()
        setUsers(res.users || [])
      } else if (currentPage === 'transactions') {
        const params = {
          eventType: transactionTab === 'buy' ? 'COLLECTION' : 'WITHDRAWAL',
          limit: transactionLimit,
          offset: (currentTransactionPage - 1) * transactionLimit
        }
        const res = await getPartnerTransactions(params)
        setTransactions(res.data || [])
        setTotalTransactions(res.total || 0)
      }
    } catch (error) {
      Swal.fire('Error', `Failed to fetch ${currentPage}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionTabChange = (tab) => {
    setTransactionTab(tab)
    setCurrentTransactionPage(1) // Reset to first page when switching tabs
  }

  const handlePageChange = (page) => {
    setCurrentTransactionPage(page)
  }

  const totalPages = Math.ceil(totalTransactions / transactionLimit)

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin h-12 w-12 border-4 border-purple-400 border-b-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="h-dvh overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">

      {/* Background blobs (no scroll) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 h-full grid grid-rows-[auto_1fr] px-4 md:px-6">

        {/* Header */}
        <header className="max-w-7xl mx-auto w-full py-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white">Partner Dashboard</h1>
              <p className="text-gray-300">
                Manage your associated users and track their activity
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold w-fit"
            >
              Logout
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-white/20">
            <button
              onClick={() => setCurrentPage('users')}
              className={`px-6 py-3 rounded-t-lg font-semibold transition ${
                currentPage === 'users'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setCurrentPage('transactions')}
              className={`px-6 py-3 rounded-t-lg font-semibold transition ${
                currentPage === 'transactions'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Transactions
            </button>
          </div>
        </header>

        {/* Table Area */}
        <main className="max-w-7xl mx-auto w-full pb-6">
          <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 overflow-hidden flex flex-col">

            {/* Transaction Tabs */}
            {currentPage === 'transactions' && (
              <div className="flex gap-2 px-6 py-4 border-b border-white/20">
                <button
                  onClick={() => handleTransactionTabChange('buy')}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    transactionTab === 'buy'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Buy Transactions
                </button>
                <button
                  onClick={() => handleTransactionTabChange('redeem')}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    transactionTab === 'redeem'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Redeem Transactions
                </button>
              </div>
            )}

            {/* Scrollable Table */}
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white z-10">
                  <tr>
                    {currentPage === 'users' && ['ID', 'First Name', 'Last Name', 'Email', 'Created At'].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                    {currentPage === 'transactions' && ['ID', 'Transaction ID', 'User ID', 'User Email', 'Payment Method', 'Amount', 'Status', 'Game Name', 'Game Username', 'Date'].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {currentPage === 'users' && users.length > 0 &&
                    users.map((u, i) => (
                      <tr
                        key={u.id}
                        className={`border-t border-white/10 ${
                          i % 2 === 0 ? 'bg-white/5' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{u.id}</td>
                        <td className="px-4 py-3 text-white font-medium">{u.first_name}</td>
                        <td className="px-4 py-3 text-gray-300">{u.last_name}</td>
                        <td className="px-4 py-3 text-gray-400 truncate max-w-[220px]">
                          {u.email}
                        </td>
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  {currentPage === 'transactions' && transactions.map((t, i) => (
                    <tr
                      key={t.id}
                      className={`border-t border-white/10 ${i % 2 === 0 ? "bg-white/5" : ""}`}
                    >
                      <td className="px-4 py-3 text-gray-300">{t.id}</td>
                      <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                        {t.transactionId}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{t.userId}</td>
                      <td className="px-4 py-3 text-gray-400 truncate max-w-[220px]">
                        {t.user?.email}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{t.method}</td>
                      <td className="px-4 py-3 text-gray-300">${t.amount}</td>
                      <td className="px-4 py-3 text-gray-300">{t.status}</td>
                      <td className="px-4 py-3 text-gray-400 truncate max-w-[150px]">
                        {t.gameName || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 truncate max-w-[150px]">
                        {t.gameUsername || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            {/* Empty states */}
            {currentPage === 'users' && users.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                No users found for your partner code
              </div>
            )}
            {currentPage === 'transactions' && transactionTab === 'buy' && transactions.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                No buy transactions found for your users
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
