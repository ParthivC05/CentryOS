import { useState, useEffect } from "react";
import { getAllPartners, createUser, getAllUsers, getAllTransactions } from "../services/api";
import Swal from "sweetalert2";

export default function AdminDashboard() {
  const [partners, setPartners] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('partners');
  const [transactionTab, setTransactionTab] = useState('buy');
  const [transactionPage, setTransactionPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [partnerPage, setPartnerPage] = useState(1);
  const [totalPartners, setTotalPartners] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 10;
  const [formData, setFormData] = useState({
    partnerCode: "",
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, transactionTab, transactionPage, partnerPage, userPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (currentPage === 'partners') {
        const offset = (partnerPage - 1) * limit;
        const res = await getAllPartners({ limit, offset });
        setPartners(res.partners || []);
        setTotalPartners(res.total || 0);
      } else if (currentPage === 'users') {
        const offset = (userPage - 1) * limit;
        const res = await getAllUsers({ limit, offset });
        setUsers(res.users || []);
        setTotalUsers(res.total || 0);
      } else if (currentPage === 'transactions') {
        const offset = (transactionPage - 1) * limit;
        const params = transactionTab === 'buy' ? { eventType: 'COLLECTION', limit, offset } : { eventType: 'WITHDRAWAL', limit, offset };
        const res = await getAllTransactions(params);
        setTransactions(res.data || []);
        setTotalTransactions(res.total || 0);
      }
    } catch (error) {
      Swal.fire("Error", `Failed to fetch ${currentPage}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await getAllPartners();
      setPartners(res.partners || []);
    } catch {
      Swal.fire("Error", "Failed to fetch partners", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser({ ...formData, role: "PARTNER" });
      Swal.fire("Success", "Partner created successfully", "success");
      setModalOpen(false);
      setFormData({ partnerCode: "", name: "", email: "", password: "" });
      fetchPartners();
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to create partner", "error");
    }
  };

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900">
        <div className="animate-spin h-12 w-12 border-4 border-orange-400 border-b-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-hidden bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 relative">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 h-full grid grid-rows-[auto_1fr] px-4 md:px-6">

    <header className="max-w-7xl mx-auto w-full py-6 flex flex-col gap-4">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
      <p className="text-blue-300">Manage all partners in the system</p>
    </div>

    {/* Actions */}
    <div className="flex gap-3 flex-wrap">
      {currentPage === 'partners' && (
        <button
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
        >
          + Add Partner
        </button>
      )}

      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-slate-900 px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
      >
        Logout
      </button>
    </div>
  </div>

  {/* Navigation Tabs */}
  <div className="flex gap-2 border-b border-white/20">
    <button
      onClick={() => setCurrentPage('partners')}
      className={`px-6 py-3 rounded-t-lg font-semibold transition ${
        currentPage === 'partners'
          ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
          : 'text-slate-900 hover:text-slate-900 hover:bg-white/10'
      }`}
    >
      Partners
    </button>
    <button
      onClick={() => setCurrentPage('users')}
      className={`px-6 py-3 rounded-t-lg font-semibold transition ${
        currentPage === 'users'
          ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
          : 'text-slate-900 hover:text-slate-900 hover:bg-white/10'
      }`}
    >
      Users
    </button>
    <button
      onClick={() => setCurrentPage('transactions')}
      className={`px-6 py-3 rounded-t-lg font-semibold transition ${
        currentPage === 'transactions'
          ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
          : 'text-slate-900 hover:text-slate-900 hover:bg-white/10'
      }`}
    >
      Transactions
    </button>
  </div>
</header>


        {/* Table Container */}
        <main className="max-w-7xl mx-auto w-full pb-6">
          <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 overflow-hidden flex flex-col">

            {/* Transaction Tabs */}
            {currentPage === 'transactions' && (
              <div className="flex gap-2 px-6 py-4 border-b border-white/20">
                <button
                  onClick={() => {
                    setTransactionTab('buy');
                    setTransactionPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    transactionTab === 'buy'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white'
                      : 'text-slate-900 hover:text-slate-900 hover:bg-white/10'
                  }`}
                >
                  Buy Transactions
                </button>
                <button
                  onClick={() => {
                    setTransactionTab('redeem');
                    setTransactionPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    transactionTab === 'redeem'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-700 text-white'
                      : 'text-slate-900 hover:text-slate-900 hover:bg-white/10'
                  }`}
                >
                  Redeem Transactions
                </button>
              </div>
            )}

            {/* Table Scroll */}
            <div className="overflow-auto flex-1">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white z-10">
                  <tr>
                    {currentPage === 'partners' && ["ID", "Partner Code", "Name", "Email", "Created At"].map(h => (
                      <th key={h} className="px-4 py-3 text-left whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                    {currentPage === 'users' && ["ID", "First Name", "Last Name", "Email", "Partner Name", "Partner Code", "Created At"].map(h => (
                      <th key={h} className="px-4 py-3 text-left whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                    {currentPage === 'transactions' && ["ID", "Transaction ID", "User ID", "User Email", "Game Name", "Game Username", "Payment Method", "Amount", "Status", "Date"].map(h => (
                      <th key={h} className="px-4 py-3 text-left whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentPage === 'partners' && partners.map((p, i) => (
                    <tr
                      key={p.id}
                      className={`border-t border-white/10 ${i % 2 === 0 ? "bg-white/5" : ""}`}
                    >
                      <td className="px-4 py-3 text-blue-300">{p.id}</td>
                      <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                        {p.partner_code}
                      </td>
                      <td className="px-4 py-3 text-blue-300 truncate max-w-[160px]">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-slate-400 truncate max-w-[220px]">
                        {p.email}
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {currentPage === 'users' && users.map((u, i) => (
                    <tr
                      key={u.id}
                      className={`border-t border-white/10 ${i % 2 === 0 ? "bg-white/5" : ""}`}
                    >
                      <td className="px-4 py-3 text-blue-300">{u.id}</td>
                      <td className="px-4 py-3 text-blue-300 truncate max-w-[160px]">
                        {u.first_name}
                      </td>
                      <td className="px-4 py-3 text-blue-300 truncate max-w-[160px]">
                        {u.last_name}
                      </td>
                      <td className="px-4 py-3 text-slate-400 truncate max-w-[220px]">
                        {u.email}
                      </td>
                      <td className="px-4 py-3 text-blue-300 truncate max-w-[160px]">
                        {u.partner ? u.partner.name : '-'}
                      </td>
                      <td className="px-4 py-3 text-blue-300 truncate max-w-[160px]">
                        {u.partner ? u.partner.partner_code : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {currentPage === 'transactions' && transactionTab === 'buy' && transactions.map((t, i) => (
                    <tr
                      key={t.id}
                      className={`border-t border-white/10 ${i % 2 === 0 ? "bg-white/5" : ""}`}
                    >
                      <td className="px-4 py-3 text-blue-300">{t.id}</td>
                      <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                        {t.transactionId}
                      </td>
                      <td className="px-4 py-3 text-blue-300">{t.userId}</td>
                      <td className="px-4 py-3 text-slate-400 truncate max-w-[220px]">
                        {t.user?.email}
                      </td>
                      <td className="px-4 py-3 text-blue-300 truncate max-w-[160px]">
                        {t.gameName || '-'}
                      </td>
                      <td className="px-4 py-3 text-blue-300 truncate max-w-[160px]">
                        {t.gameUsername || '-'}
                      </td>
                      <td className="px-4 py-3 text-blue-300">{t.method}</td>
                      <td className="px-4 py-3 text-blue-300">${t.amount}</td>
                      <td className="px-4 py-3 text-blue-300">{t.status}</td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {currentPage === 'transactions' && transactionTab === 'redeem' && transactions.map((t, i) => (
                    <tr
                      key={t.id}
                      className={`border-t border-white/10 ${i % 2 === 0 ? "bg-white/5" : ""}`}
                    >
                      <td className="px-4 py-3 text-blue-300">{t.id}</td>
                      <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                        {t.transactionId}
                      </td>
                      <td className="px-4 py-3 text-blue-300">{t.userId}</td>
                      <td className="px-4 py-3 text-slate-400 truncate max-w-[220px]">
                        {t.user?.email}
                      </td>
                      <td className="px-4 py-3 text-blue-300 truncate max-w-[160px]">
                        {t.gameName || '-'}
                      </td>
                      <td className="px-4 py-3 text-blue-300 truncate max-w-[160px]">
                        {t.gameUsername || '-'}
                      </td>
                      <td className="px-4 py-3 text-blue-300">{t.method}</td>
                      <td className="px-4 py-3 text-blue-300">${t.amount}</td>
                      <td className="px-4 py-3 text-blue-300">{t.status}</td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {currentPage === 'partners' && partners.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                No partners found
              </div>
            )}
            {currentPage === 'users' && users.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                No users found
              </div>
            )}
            {currentPage === 'transactions' && transactionTab === 'buy' && transactions.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                No buy transactions found
              </div>
            )}
            {currentPage === 'transactions' && transactionTab === 'redeem' && transactions.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                No redeem transactions found
              </div>
            )}

            {/* Pagination */}
            {currentPage === 'partners' && totalPartners > limit && (
              <div className="flex justify-center items-center gap-4 px-6 py-4 border-t border-white/20">
                <button
                  onClick={() => setPartnerPage(Math.max(1, partnerPage - 1))}
                  disabled={partnerPage === 1}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold"
                >
                  Previous
                </button>
                <span className="text-white">
                  Page {partnerPage} of {Math.ceil(totalPartners / limit)}
                </span>
                <button
                  onClick={() => setPartnerPage(Math.min(Math.ceil(totalPartners / limit), partnerPage + 1))}
                  disabled={partnerPage === Math.ceil(totalPartners / limit)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold"
                >
                  Next
                </button>
              </div>
            )}
            {currentPage === 'users' && totalUsers > limit && (
              <div className="flex justify-center items-center gap-4 px-6 py-4 border-t border-white/20">
                <button
                  onClick={() => setUserPage(Math.max(1, userPage - 1))}
                  disabled={userPage === 1}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold"
                >
                  Previous
                </button>
                <span className="text-white">
                  Page {userPage} of {Math.ceil(totalUsers / limit)}
                </span>
                <button
                  onClick={() => setUserPage(Math.min(Math.ceil(totalUsers / limit), userPage + 1))}
                  disabled={userPage === Math.ceil(totalUsers / limit)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold"
                >
                  Next
                </button>
              </div>
            )}
            {currentPage === 'transactions' && totalTransactions > limit && (
              <div className="flex justify-center items-center gap-4 px-6 py-4 border-t border-white/20">
                <button
                  onClick={() => setTransactionPage(Math.max(1, transactionPage - 1))}
                  disabled={transactionPage === 1}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold"
                >
                  Previous
                </button>
                <span className="text-white">
                  Page {transactionPage} of {Math.ceil(totalTransactions / limit)}
                </span>
                <button
                  onClick={() => setTransactionPage(Math.min(Math.ceil(totalTransactions / limit), transactionPage + 1))}
                  disabled={transactionPage === Math.ceil(totalTransactions / limit)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in slide-in-from-bottom-4">

            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-6">
              Add Partner
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="partnerCode"
                placeholder="Partner Code"
                value={formData.partnerCode}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />

              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Create
                </button>

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-black font-semibold py-3 rounded-lg transition "
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
