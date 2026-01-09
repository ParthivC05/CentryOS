import { useState, useEffect } from "react";
import { getAllPartners, createUser, getAllUsers, getAllTransactions } from "../services/api";
import Swal from "sweetalert2";

export default function AdminDashboard() {
  const [partners, setPartners] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creatingPartner, setCreatingPartner] = useState(false);
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
  const [emailError, setEmailError] = useState("");

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
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'email') {
      const error = validateEmail(value);
      setEmailError(error);
    }
  };

const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email before submission
    const emailValidationError = validateEmail(formData.email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }
    
    setCreatingPartner(true);
    try {
      await createUser({ ...formData, role: "PARTNER" });
      Swal.fire({
        title: "Success",
        html: `Partner created successfully!<br><br>A welcome email with login credentials has been sent to <strong>${formData.email}</strong>.`,
        icon: "success",
        confirmButtonText: "OK"
      });
      setModalOpen(false);
      setFormData({ partnerCode: "", name: "", email: "", password: "" });
      setEmailError("");
      fetchPartners();
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to create partner", "error");
    } finally {
      setCreatingPartner(false);
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

      <div className="relative z-10 h-full grid grid-rows-[auto_1fr] px-4 md:px-6 overflow-hidden">

    <header className="max-w-7xl mx-auto w-full py-4 sm:py-6 flex flex-col gap-3 sm:gap-4">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
    <div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Admin Dashboard</h1>
      <p className="text-blue-300 text-sm sm:text-base">Manage all partners in the system</p>
    </div>

    {/* Actions */}
    <div className="flex gap-2 sm:gap-3 flex-wrap">
      {currentPage === 'partners' && (
        <button
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold flex items-center gap-2 text-sm sm:text-base"
        >
          + Add Partner
        </button>
      )}

      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-slate-900 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold flex items-center gap-2 text-sm sm:text-base"
      >
        Logout
      </button>
    </div>
  </div>

  {/* Navigation Tabs */}
  <div className="flex gap-2 border-b border-white/20 overflow-x-auto">
    <button
      onClick={() => setCurrentPage('partners')}
      className={`px-4 sm:px-6 py-2 sm:py-3 rounded-t-lg font-semibold transition whitespace-nowrap text-sm sm:text-base ${
        currentPage === 'partners'
          ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
          : 'text-slate-900 hover:text-slate-900 hover:bg-white/10'
      }`}
    >
      Partners
    </button>
    <button
      onClick={() => setCurrentPage('users')}
      className={`px-4 sm:px-6 py-2 sm:py-3 rounded-t-lg font-semibold transition whitespace-nowrap text-sm sm:text-base ${
        currentPage === 'users'
          ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
          : 'text-slate-900 hover:text-slate-900 hover:bg-white/10'
      }`}
    >
      Users
    </button>
    <button
      onClick={() => setCurrentPage('transactions')}
      className={`px-4 sm:px-6 py-2 sm:py-3 rounded-t-lg font-semibold transition whitespace-nowrap text-sm sm:text-base ${
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
        <main className="max-w-7xl mx-auto w-full pb-6 overflow-hidden flex flex-col min-h-0">
          <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 overflow-hidden flex flex-col h-full min-h-0">

            {/* Transaction Tabs */}
            {currentPage === 'transactions' && (
              <div className="flex gap-2 px-3 sm:px-6 py-3 sm:py-4 border-b border-white/20 overflow-x-auto">
                <button
                  onClick={() => {
                    setTransactionTab('buy');
                    setTransactionPage(1);
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap text-xs sm:text-sm ${
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
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap text-xs sm:text-sm ${
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
            <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
              <div className="inline-block min-w-full align-middle">
                <table className={`w-full text-sm ${currentPage === 'partners' ? 'min-w-[600px] sm:min-w-[800px]' : currentPage === 'users' ? 'min-w-[800px] sm:min-w-[1000px]' : 'min-w-[900px] sm:min-w-[1200px]'}`}>
                <thead className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white z-10 shadow-lg">
                  <tr>
                    {currentPage === 'partners' && ["ID", "Partner Code", "Name", "Email", "Created At"].map(h => (
                      <th key={h} className="px-3 sm:px-4 py-2 sm:py-3 text-left whitespace-nowrap text-xs sm:text-sm">
                        {h}
                      </th>
                    ))}
                    {currentPage === 'users' && ["ID", "First Name", "Last Name", "Email", "Partner Name", "Partner Code", "Created At"].map(h => (
                      <th key={h} className="px-3 sm:px-4 py-2 sm:py-3 text-left whitespace-nowrap text-xs sm:text-sm">
                        {h}
                      </th>
                    ))}
                    {currentPage === 'transactions' && ["ID", "Transaction ID", "User ID", "User Email", "Game Name", "Game Username", "Payment Method", "Amount", "Status", "Date"].map(h => (
                      <th key={h} className="px-3 sm:px-4 py-2 sm:py-3 text-left whitespace-nowrap text-xs sm:text-sm">
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
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 text-xs sm:text-sm">{p.id}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-white font-medium whitespace-nowrap text-xs sm:text-sm">
                        {p.partner_code}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 truncate max-w-[120px] sm:max-w-[160px] text-xs sm:text-sm">
                        {p.name}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-slate-400 truncate max-w-[150px] sm:max-w-[220px] text-xs sm:text-sm">
                        {p.email}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-slate-400 whitespace-nowrap text-xs sm:text-sm">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {currentPage === 'users' && users.map((u, i) => (
                    <tr
                      key={u.id}
                      className={`border-t border-white/10 ${i % 2 === 0 ? "bg-white/5" : ""}`}
                    >
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 text-xs sm:text-sm">{u.id}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 truncate max-w-[100px] sm:max-w-[160px] text-xs sm:text-sm">
                        {u.first_name}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 truncate max-w-[100px] sm:max-w-[160px] text-xs sm:text-sm">
                        {u.last_name}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-slate-400 truncate max-w-[150px] sm:max-w-[220px] text-xs sm:text-sm">
                        {u.email}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 truncate max-w-[100px] sm:max-w-[160px] text-xs sm:text-sm">
                        {u.partner ? u.partner.name : '-'}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 truncate max-w-[100px] sm:max-w-[160px] text-xs sm:text-sm">
                        {u.partner ? u.partner.partner_code : '-'}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-slate-400 whitespace-nowrap text-xs sm:text-sm">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {currentPage === 'transactions' && transactionTab === 'buy' && transactions.map((t, i) => (
                    <tr
                      key={t.id}
                      className={`border-t border-white/10 ${i % 2 === 0 ? "bg-white/5" : ""}`}
                    >
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 text-xs sm:text-sm">{t.id}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-white font-medium whitespace-nowrap text-xs sm:text-sm">
                        {t.transactionId}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 text-xs sm:text-sm">{t.userId}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-slate-400 truncate max-w-[150px] sm:max-w-[220px] text-xs sm:text-sm">
                        {t.user?.email}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 truncate max-w-[100px] sm:max-w-[160px] text-xs sm:text-sm">
                        {t.gameName || '-'}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 truncate max-w-[100px] sm:max-w-[160px] text-xs sm:text-sm">
                        {t.gameUsername || '-'}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 text-xs sm:text-sm">{t.method}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 text-xs sm:text-sm">${t.amount}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 text-xs sm:text-sm">{t.status}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-slate-400 whitespace-nowrap text-xs sm:text-sm">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {currentPage === 'transactions' && transactionTab === 'redeem' && transactions.map((t, i) => (
                    <tr
                      key={t.id}
                      className={`border-t border-white/10 ${i % 2 === 0 ? "bg-white/5" : ""}`}
                    >
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 text-xs sm:text-sm">{t.id}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-white font-medium whitespace-nowrap text-xs sm:text-sm">
                        {t.transactionId}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 text-xs sm:text-sm">{t.userId}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-slate-400 truncate max-w-[150px] sm:max-w-[220px] text-xs sm:text-sm">
                        {t.user?.email}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 truncate max-w-[100px] sm:max-w-[160px] text-xs sm:text-sm">
                        {t.gameName || '-'}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 truncate max-w-[100px] sm:max-w-[160px] text-xs sm:text-sm">
                        {t.gameUsername || '-'}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 text-xs sm:text-sm">{t.method}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 text-xs sm:text-sm">${t.amount}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-300 text-xs sm:text-sm">{t.status}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-slate-400 whitespace-nowrap text-xs sm:text-sm">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            {currentPage === 'partners' && partners.length === 0 && !loading && (
              <div className="py-12 text-center text-gray-400">
                No partners found
              </div>
            )}
            {currentPage === 'users' && users.length === 0 && !loading && (
              <div className="py-12 text-center text-gray-400">
                No users found
              </div>
            )}
            {currentPage === 'transactions' && transactionTab === 'buy' && transactions.length === 0 && !loading && (
              <div className="py-12 text-center text-gray-400">
                No buy transactions found
              </div>
            )}
            {currentPage === 'transactions' && transactionTab === 'redeem' && transactions.length === 0 && !loading && (
              <div className="py-12 text-center text-gray-400">
                No redeem transactions found
              </div>
            )}

            {/* Pagination */}
            <div className="flex flex-wrap justify-center items-center gap-2 px-4 py-4 border-t border-white/20">
              {currentPage === 'partners' && (
                <>
                  <button
                    onClick={() => setPartnerPage(Math.max(1, partnerPage - 1))}
                    disabled={partnerPage === 1}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <span className="text-gray-300 text-sm">
                    Page {partnerPage} of {Math.max(1, Math.ceil(totalPartners / limit))}
                  </span>
                  <button
                    onClick={() => setPartnerPage(Math.min(Math.ceil(totalPartners / limit), partnerPage + 1))}
                    disabled={partnerPage >= Math.ceil(totalPartners / limit)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </>
              )}
              {currentPage === 'users' && (
                <>
                  <button
                    onClick={() => setUserPage(Math.max(1, userPage - 1))}
                    disabled={userPage === 1}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <span className="text-gray-300 text-sm">
                    Page {userPage} of {Math.max(1, Math.ceil(totalUsers / limit))}
                  </span>
                  <button
                    onClick={() => setUserPage(Math.min(Math.ceil(totalUsers / limit), userPage + 1))}
                    disabled={userPage >= Math.ceil(totalUsers / limit)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </>
              )}
              {currentPage === 'transactions' && (
                <>
                  <button
                    onClick={() => setTransactionPage(Math.max(1, transactionPage - 1))}
                    disabled={transactionPage === 1}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <span className="text-gray-300 text-sm">
                    Page {transactionPage} of {Math.max(1, Math.ceil(totalTransactions / limit))}
                  </span>
                  <button
                    onClick={() => setTransactionPage(Math.min(Math.ceil(totalTransactions / limit), transactionPage + 1))}
                    disabled={transactionPage >= Math.ceil(totalTransactions / limit)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in slide-in-from-bottom-4">

            {/* Close Button */}
            <button
              onClick={() => {
                setModalOpen(false);
                setEmailError("");
              }}
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
                disabled={creatingPartner}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={creatingPartner}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={creatingPartner}
                  className={`w-full px-4 py-3 border rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    emailError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-600 focus:ring-orange-500'
                  }`}
                />
                {emailError && (
                  <p className="text-red-400 text-sm mt-1">{emailError}</p>
                )}
              </div>

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={creatingPartner}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={creatingPartner}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {creatingPartner ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEmailError("");
                  }}
                  disabled={creatingPartner}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition"
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
