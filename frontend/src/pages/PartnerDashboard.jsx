import { useEffect, useState } from "react"
import Swal from "sweetalert2"
import {
  getUsersByPartner,
  getPartnerTransactions
} from "../services/api"

export default function PartnerDashboard() {
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState("users")
  const [transactionTab, setTransactionTab] = useState("buy")

  const [currentUserPage, setCurrentUserPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)

  const [currentTransactionPage, setCurrentTransactionPage] =
    useState(1)
  const [totalTransactions, setTotalTransactions] =
    useState(0)

  const USER_LIMIT = 10
  const TRANSACTION_LIMIT = 10

  useEffect(() => {
    fetchData()
  }, [
    currentPage,
    transactionTab,
    currentUserPage,
    currentTransactionPage
  ])

  async function fetchData() {
    setLoading(true)
    try {
      if (currentPage === "users") {
        const res = await getUsersByPartner({
          limit: USER_LIMIT,
          offset: (currentUserPage - 1) * USER_LIMIT
        })

        setUsers(res.users || [])
        setTotalUsers(res.total || 0)
      }

      if (currentPage === "transactions") {
        const res = await getPartnerTransactions({
          eventType:
            transactionTab === "buy"
              ? "COLLECTION"
              : "WITHDRAWAL",
          limit: TRANSACTION_LIMIT,
          offset:
            (currentTransactionPage - 1) *
            TRANSACTION_LIMIT
        })

        setTransactions(res.data || [])
        setTotalTransactions(res.total || 0)
      }
    } catch {
      Swal.fire("Error", "Failed to fetch data", "error")
    } finally {
      setLoading(false)
    }
  }

  const totalUserPages = Math.max(
    1,
    Math.ceil(totalUsers / USER_LIMIT)
  )
  const totalTransactionPages = Math.max(
    1,
    Math.ceil(totalTransactions / TRANSACTION_LIMIT)
  )

  function logout() {
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-400 border-b-transparent" />
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 px-4 md:px-6">

        {/* HEADER */}
        <header className="max-w-7xl mx-auto py-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Partner Dashboard
              </h1>
              <p className="text-gray-300 text-sm md:text-base">
                Manage your associated users and track activity
              </p>
            </div>

            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold w-full md:w-auto"
            >
              Logout
            </button>
          </div>

          {/* MAIN TABS */}
          <div className="flex flex-wrap gap-2 border-b border-white/20">
            {["users", "transactions"].map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setCurrentPage(tab)
                  setCurrentUserPage(1)
                  setCurrentTransactionPage(1)
                }}
                className={`px-4 py-2 rounded-t-lg font-semibold transition ${
                  currentPage === tab
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {/* CONTENT */}
        <main className="max-w-7xl mx-auto pb-6">
          <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 overflow-hidden flex flex-col">

            {/* TRANSACTION SUB TABS */}
            {currentPage === "transactions" && (
              <div className="flex flex-col sm:flex-row gap-2 p-4 border-b border-white/20">
                {["buy", "redeem"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      setTransactionTab(tab)
                      setCurrentTransactionPage(1)
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      transactionTab === tab
                        ? tab === "buy"
                          ? "bg-gradient-to-r from-green-600 to-emerald-700 text-white"
                          : "bg-gradient-to-r from-blue-600 to-cyan-700 text-white"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {tab === "buy"
                      ? "Buy Transactions"
                      : "Redeem Transactions"}
                  </button>
                ))}
              </div>
            )}

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <tr>
                    {currentPage === "users" &&
                      ["ID", "First Name", "Last Name", "Email", "Created At"].map(
                        h => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left whitespace-nowrap"
                          >
                            {h}
                          </th>
                        )
                      )}

                    {currentPage === "transactions" &&
                      [
                        "ID",
                        "Transaction ID",
                        "User ID",
                        "User Email",
                        "Method",
                        "Amount",
                        "Status",
                        "Game",
                        "Username",
                        "Date"
                      ].map(h => (
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
                  {currentPage === "users" &&
                    users.map((u, i) => (
                      <tr
                        key={u.id}
                        className={`border-t border-white/10 ${
                          i % 2 === 0 ? "bg-white/5" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-300">
                          {u.id}
                        </td>
                        <td className="px-4 py-3 text-white font-medium">
                          {u.first_name}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {u.last_name}
                        </td>
                        <td className="px-4 py-3 text-gray-400 truncate max-w-[220px]">
                          {u.email}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(
                            u.createdAt
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}

                  {currentPage === "transactions" &&
                    transactions.map((t, i) => (
                      <tr
                        key={t.id}
                        className={`border-t border-white/10 ${
                          i % 2 === 0 ? "bg-white/5" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-300">
                          {t.id}
                        </td>
                        <td className="px-4 py-3 text-white">
                          {t.transactionId}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {t.userId}
                        </td>
                        <td className="px-4 py-3 text-gray-400 truncate max-w-[220px]">
                          {t.user?.email}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {t.method}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          ${t.amount}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {t.status}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {t.gameName || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {t.gameUsername || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(
                            t.createdAt
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex flex-wrap justify-center items-center gap-2 px-4 py-4 border-t border-white/20">
              {currentPage === "users" && (
                <>
                  <button
                    onClick={() =>
                      setCurrentUserPage(p =>
                        Math.max(1, p - 1)
                      )
                    }
                    disabled={currentUserPage === 1}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-gray-300 text-sm">
                    Page {currentUserPage} of {totalUserPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentUserPage(p =>
                        Math.min(totalUserPages, p + 1)
                      )
                    }
                    disabled={
                      currentUserPage === totalUserPages
                    }
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </>
              )}

              {currentPage === "transactions" && (
                <>
                  <button
                    onClick={() =>
                      setCurrentTransactionPage(p =>
                        Math.max(1, p - 1)
                      )
                    }
                    disabled={currentTransactionPage === 1}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-gray-300 text-sm">
                    Page {currentTransactionPage} of{" "}
                    {totalTransactionPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentTransactionPage(p =>
                        Math.min(
                          totalTransactionPages,
                          p + 1
                        )
                      )
                    }
                    disabled={
                      currentTransactionPage ===
                      totalTransactionPages
                    }
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
