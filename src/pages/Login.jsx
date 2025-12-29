import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Building,
  Heart,
  Users,
  CheckCircle,
  ArrowRight,
  Home,
  Key,
  UserCircle,
  AlertCircle,
  Clock,
  Calendar,
  Stethoscope
} from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, userRole, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && userRole) {
      if (userRole === 'admin') {
        navigate('/admin')
      } else if (userRole === 'staff') {
        navigate('/staff')
      } else {
        setError('Invalid role. Please contact administrator.')
      }
    }
  }, [user, userRole, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) throw error
    } catch (err) {
      setError(err.message || 'Failed to sign in')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-white">
      {/* Desktop: Left Side - Brand & Information (Hidden on mobile) */}
      <div className="hidden lg:block w-1/2 bg-gradient-to-br from-[#1a5858] to-[#0d3d3d] p-8">
        <div className="h-full flex flex-col justify-between">
          {/* Top Logo */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-[#1a5858]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">HealthCare Pro</h1>
                  <p className="text-xs text-white/60">Professional Healthcare Platform</p>
                </div>
              </div>
              <ThemeToggle />
            </div>

            {/* Welcome Message */}
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-white mb-3">
                Welcome Back to Healthcare Pro
              </h2>
              <p className="text-white/80 text-sm">
                Sign in to access the staff and admin portal for managing appointments,
                doctors, and patient sessions efficiently.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-xs font-medium text-white">Team Management</span>
                </div>
                <p className="text-xs text-white/60">Manage doctors and staff roles</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-white" />
                  <span className="text-xs font-medium text-white">Appointments</span>
                </div>
                <p className="text-xs text-white/60">Schedule and track sessions</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Stethoscope className="w-4 h-4 text-white" />
                  <span className="text-xs font-medium text-white">Doctor Profiles</span>
                </div>
                <p className="text-xs text-white/60">Manage medical team info</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-white" />
                  <span className="text-xs font-medium text-white">Time Slots</span>
                </div>
                <p className="text-xs text-white/60">Manage availability schedule</p>
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-2 text-white/70 text-xs">
              <Shield className="w-4 h-4" />
              <span>Enterprise-grade security & encrypted data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile & Desktop: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-sm lg:max-w-md">
          {/* Mobile Logo (Hidden on desktop) */}
          <div className="lg:hidden flex flex-col items-center mb-6 relative">
            <div className="absolute top-0 right-0">
              <ThemeToggle />
            </div>
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] flex items-center justify-center shadow-lg mb-3">
              <Heart className="w-8 h-8 text-[#1a5858]" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">HealthCare Pro</h1>
            <p className="text-gray-600 text-sm">Staff & Admin Portal</p>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Key className="w-5 h-5 text-[#1a5858]" />
              </div>
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-gray-900">Sign In</h2>
                <p className="text-sm text-gray-600">Enter your credentials to continue</p>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-red-700">
                    <p className="font-medium">Sign in failed</p>
                    <p className="mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] focus:border-transparent outline-none transition-all text-sm"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] focus:border-transparent outline-none transition-all text-sm"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#b0e7e7] to-[#8adcdc] text-[#1a5858] font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#1a5858]/30 border-t-[#1a5858] rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Role Info (Hidden on mobile) */}
            <div className="hidden lg:block bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-xs font-medium text-gray-900">Role-Based Access</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Different dashboards for Admin and Staff roles
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="pt-4 border-t border-gray-200">
              <Link
                to="/"
                className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                <Home className="w-4 h-4" />
                <span>Back to Public Website</span>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact your system administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}