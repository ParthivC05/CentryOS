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
      setLoading(false);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch partners",
      });
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser({
        ...formData,
        role: "PARTNER",
      });
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Partner created successfully!",
      });
      setModalOpen(false);
      setFormData({
        partnerCode: "",
        name: "",
        email: "",
        password: "",
      });
      fetchPartners(); // Refresh the list
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to create partner",
      });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center", marginTop: "50px" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", width: "100%", margin: "0 auto" }}>
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <h1 style={{ margin: 0, color: "#333" }}>Admin Dashboard</h1>

          <button
            onClick={() => setModalOpen(true)}
            style={{
              padding: "10px 20px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Add Partner
          </button>
        </div>
      </div>

      <p style={{ marginBottom: "30px", color: "#666" }}>
        Manage all partners in the system
      </p>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ background: "#2563eb", color: "#fff" }}>
              <th
                style={{
                  padding: "15px",
                  textAlign: "left",
                  fontWeight: "600",
                }}
              >
                ID
              </th>
              <th
                style={{
                  padding: "15px",
                  textAlign: "left",
                  fontWeight: "600",
                }}
              >
                Partner Code
              </th>
              <th
                style={{
                  padding: "15px",
                  textAlign: "left",
                  fontWeight: "600",
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: "15px",
                  textAlign: "left",
                  fontWeight: "600",
                }}
              >
                Email
              </th>
              <th
                style={{
                  padding: "15px",
                  textAlign: "left",
                  fontWeight: "600",
                }}
              >
                Created At
              </th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner, index) => (
              <tr
                key={partner.id}
                style={{ background: index % 2 === 0 ? "#f9f9f9" : "#fff" }}
              >
                <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
                  {partner.id}
                </td>
                <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
                  {partner.partner_code}
                </td>
                <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
                  {partner.name}
                </td>
                <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
                  {partner.email}
                </td>
                <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
                  {new Date(partner.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {partners.length === 0 && (
        <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
          <p>No partners found in the system.</p>
        </div>
      )}

      {modalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "8px",
              width: "400px",
              maxWidth: "90%",
            }}
          >
            <h2 style={{ marginBottom: "20px", color: "#333" }}>
              Add New Partner
            </h2>
            <form
              onSubmit={handleSubmit}
              style={{ display: "grid", gap: "15px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "600",
                  }}
                >
                  Partner Code
                </label>
                <input
                  type="text"
                  name="partnerCode"
                  value={formData.partnerCode}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "600",
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "600",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "600",
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Create Partner
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#6b7280",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
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
