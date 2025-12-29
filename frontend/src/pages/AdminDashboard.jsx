import { useState, useEffect } from "react";
import { getAllPartners, createUser } from "../services/api";
import Swal from "sweetalert2";

export default function AdminDashboard() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    partnerCode: "",
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchPartners();
  }, []);

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

    <header className="max-w-7xl mx-auto w-full py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>
    <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
    <p className="text-gray-300">Manage all partners in the system</p>
  </div>

  {/* Actions */}
  <div className="flex gap-3 flex-wrap">
    <button
      onClick={() => setModalOpen(true)}
      className="bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
    >
      + Add Partner
    </button>

    <button
      onClick={handleLogout}
      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
    >
      Logout
    </button>
  </div>
</header>


        {/* Table Container */}
        <main className="max-w-7xl mx-auto w-full pb-6">
          <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 overflow-hidden flex flex-col">

            {/* Table Scroll */}
            <div className="overflow-auto flex-1">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white z-10">
                  <tr>
                    {["ID", "Partner Code", "Name", "Email", "Created At"].map(h => (
                      <th key={h} className="px-4 py-3 text-left whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p, i) => (
                    <tr
                      key={p.id}
                      className={`border-t border-white/10 ${i % 2 === 0 ? "bg-white/5" : ""
                        }`}
                    >
                      <td className="px-4 py-3 text-gray-300">{p.id}</td>
                      <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                        {p.partner_code}
                      </td>
                      <td className="px-4 py-3 text-gray-300 truncate max-w-[160px]">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-gray-400 truncate max-w-[220px]">
                        {p.email}
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {partners.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                No partners found
              </div>
            )}
          </div>
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in slide-in-from-bottom-4">

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
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />

              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
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
