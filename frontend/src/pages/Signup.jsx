import { useState, useEffect } from 'react'
import { signup, sendOTP, verifyOTP } from '../services/api'
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
  const [emailError, setEmailError] = useState('')

  // Email verification states
  const [emailVerified, setEmailVerified] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [canResend, setCanResend] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const validateEmail = email => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!email) {
      return 'Email is required'
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address'
    }
    return ''
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })

    if (name === 'email') {
      const error = validateEmail(value)
      setEmailError(error)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!emailVerified) {
      setError('Please verify your email before signing up.')
      return
    }
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

  const handleVerifyEmail = async () => {
    setOtpError('')
    setOtp('')
    setShowOTPModal(true)
    setOtpLoading(true)
    try {
      await sendOTP({ email: form.email })
      setResendTimer(30) // 30 seconds
      setCanResend(false)
    } catch (error) {
      setOtpError(error.message || 'Failed to send OTP')
      setShowOTPModal(false)
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP')
      return
    }
    setOtpLoading(true)
    setOtpError('')
    try {
      await verifyOTP({ email: form.email, otp })
      setEmailVerified(true)
      setShowOTPModal(false)
      setOtp('')
    } catch (error) {
      setOtpError(error.message || 'Invalid OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setOtpError('')
    setOtpLoading(true)
    setIsResending(true)
    try {
      await sendOTP({ email: form.email })
      setResendTimer(30)
      setCanResend(false)
    } catch (error) {
      setOtpError(error.message || 'Failed to resend OTP')
    } finally {
      setOtpLoading(false)
      setIsResending(false)
    }
  }

  const handleCloseModal = () => {
    setShowOTPModal(false)
    setOtp('')
    setOtpError('')
    setResendTimer(0)
    setCanResend(false)
  }

  // Timer effect for resend button
  useEffect(() => {
    let interval
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  return (
    <div className="w-full h-screen overflow-x-hidden overflow-y-auto flex items-center justify-center bg-gradient-to-br from-green-600 via-emerald-500 to-teal-700 px-3 box-border">
      {/* Animated background elements */}
      <div className="fixed top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-white opacity-10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-white opacity-10 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 my-auto">
        {/* Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Header with gradient */}
          <div className="h-2 bg-gradient-to-r from-green-600 to-emerald-600"></div>
          
          <div className="p-3 sm:p-6 md:p-8">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-1">Create Account</h2>
            <p className="text-center text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">Join Orionstarsweeps Pay and manage your payments</p>

            {partnerCode && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-700">
                  <span className="font-semibold text-gray-800">Referred by Partner:</span> {partnerCode}
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-xs sm:text-sm text-red-800">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">First Name</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-3 sm:top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      name="firstName"
                      placeholder="John"
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Last Name</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-3 sm:top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      name="lastName"
                      placeholder="Doe"
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Email Address</label>
                <div className="relative">
                  <svg className="absolute left-3 top-3 sm:top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    onChange={handleChange}
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    required
                    disabled={loading}
                    className={`w-full pl-10 pr-20 sm:pr-16 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed transition ${
                      emailError
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-green-500'
                    }`}
                  />
                  {emailVerified ? (
                    <svg className="absolute right-3 top-3 sm:top-3.5 w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    form.email && !emailError && (
                      <span
                        onClick={handleVerifyEmail}
                        disabled={loading || !form.email || emailVerified}
                        className={`absolute right-3 top-0 text-xs sm:text-sm font-semibold cursor-pointer transition flex items-center h-full ${
                          emailVerified
                            ? 'text-green-600 cursor-not-allowed'
                            : otpLoading
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-blue-600 hover:text-blue-700'
                        }`}
                      >
                        {otpLoading ? 'Sending...' : 'Verify'}
                      </span>
                    )
                  )}
                </div>
                {emailError && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{emailError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Password</label>
                <div className="relative">
                  <svg className="absolute left-3 top-3 sm:top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 sm:py-3.5 rounded-lg transition duration-200 flex items-center justify-center gap-2 mt-3 sm:mt-4 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">Creating account...</span>
                    <span className="sm:hidden">Creating...</span>
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

            <div className="mt-6 sm:mt-8 border-t border-gray-200 pt-4 sm:pt-6">
              <p className="text-center text-gray-600 text-xs sm:text-sm">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-green-600 hover:text-green-700 transition">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* OTP Modal */}
        {showOTPModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Verify Your Email</h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  We've sent a 6-digit OTP to <strong className="break-all">{form.email}</strong>
                </p>
                {resendTimer > 0 && (
                  <p className="text-gray-500 text-xs sm:text-sm mt-2">
                    Resend OTP in {Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, '0')}
                  </p>
                )}
              </div>

              {otpError && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <span className="text-xs sm:text-sm text-red-800">{otpError}</span>
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full text-center text-xl sm:text-2xl font-mono tracking-widest py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    disabled={otpLoading}
                  />
                </div>

                <button
                  onClick={handleVerifyOTP}
                  disabled={otpLoading || otp.length !== 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {otpLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={handleResendOTP}
                    disabled={!canResend || otpLoading}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 font-semibold py-2.5 sm:py-2 rounded-lg transition duration-200 text-xs sm:text-sm"
                  >
                    {otpLoading && isResending ? 'Resending...' : 'Resend OTP'}
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 sm:py-2 rounded-lg transition duration-200 text-xs sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer text */}
        <p className="text-center text-white text-xs sm:text-sm mt-2 sm:mt-3 opacity-90 px-2">
          By creating an account, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  )
}
