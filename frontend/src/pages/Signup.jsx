import { useState } from 'react'
import { signup } from '../services/api'
import { Link } from 'react-router-dom'

export default function Signup() {
  const params = new URLSearchParams(window.location.search)
  const partnerCode = params.get('ref')

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await signup({ ...form, partnerCode })
      localStorage.setItem('token', res.token)
      window.location.href = '/'
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-green-600 via-emerald-500 to-teal-700 p-4 min-h-screen">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Header with gradient */}
          <div className="h-2 bg-gradient-to-r from-green-600 to-emerald-600"></div>
          
          <div className="p-8 sm:p-10">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Create Account</h2>
            <p className="text-center text-gray-600 mb-8">Join Treasure pay and manage your payments</p>

            {partnerCode && (
              <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-800">Referred by Partner:</span> {partnerCode}
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-800">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      name="firstName"
                      placeholder="John"
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      name="lastName"
                      placeholder="Doe"
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Account
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="text-center text-gray-600 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-green-600 hover:text-green-700 transition">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-white text-sm mt-6 opacity-90">
          By creating an account, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  )
}
