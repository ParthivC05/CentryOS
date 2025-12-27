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
      setLoading(false)
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch users'
      })
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', marginTop: '50px' }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '10px', color: '#333' }}>Partner Dashboard</h1>
      <p style={{ marginBottom: '30px', color: '#666' }}>Manage your associated users</p>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#2563eb', color: '#fff' }}>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>ID</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>First Name</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Last Name</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} style={{ background: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{user.id}</td>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{user.first_name}</td>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{user.last_name}</td>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{user.email}</td>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {users.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          <p>No users found for your partner code.</p>
        </div>
      )}
    </div>
  )
}