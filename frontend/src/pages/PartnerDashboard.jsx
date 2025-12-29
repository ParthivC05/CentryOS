import { useState, useEffect } from 'react'
import { getUsersByPartner } from '../services/api'
import Swal from 'sweetalert2'

export default function PartnerDashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await getUsersByPartner()
      setUsers(res.users || [])
    } catch {
      Swal.fire('Error', 'Failed to fetch users', 'error')
    } finally {
      setLoading(false)
    }
  }

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
        <header className="max-w-7xl mx-auto w-full py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
        </header>

        {/* Table Area */}
        <main className="max-w-7xl mx-auto w-full pb-6">
          <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 overflow-hidden flex flex-col">

            {/* Scrollable Table */}
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white z-10">
                  <tr>
                    {['ID', 'First Name', 'Last Name', 'Email', 'Created At'].map(h => (
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
  {users.length > 0 &&
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
</tbody>

              </table>
            </div>

            {/* Empty state */}
            {users.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                No users found for your partner code
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
