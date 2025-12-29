import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import ThemeToggle from '../../components/ThemeToggle'
import DoctorManagement from '../../components/staff/DoctorManagement'
import TimeSlotManagement from '../../components/staff/TimeSlotManagement'
import AppointmentManagement from '../../components/staff/AppointmentManagement'
import {
  Stethoscope,
  Calendar,
  FileText,
  Home,
  LogOut,
  Menu,
  X,
  Bell,
  RefreshCw,
  Users,
  ChevronRight,
  Shield,
  Building,
  UserCircle,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react'

export default function StaffDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('doctors')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stats, setStats] = useState({
    pendingCount: 0,
    todayCount: 0,
    totalDoctors: 0,
    confirmedToday: 0,
  })

  useEffect(() => {
    fetchQuickStats()
  }, [])

  const fetchQuickStats = async () => {
    try {
      const [pendingResult, doctorsResult, todayResult] = await Promise.all([
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('doctors')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'confirmed')
      ])

      setStats({
        pendingCount: pendingResult.count || 0,
        totalDoctors: doctorsResult.count || 0,
        confirmedToday: todayResult.count || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const menuItems = [
    {
      id: 'doctors',
      label: 'Doctors',
      icon: <Stethoscope className="w-5 h-5" />,
      color: 'text-blue-500',
      badge: stats.totalDoctors,
      description: 'Manage medical staff'
    },
    {
      id: 'timeslots',
      label: 'Time Slots',
      icon: <Calendar className="w-5 h-5" />,
      color: 'text-emerald-500',
      description: 'Schedule availability'
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-purple-500',
      badge: stats.pendingCount,
      badgeColor: 'bg-amber-500',
      description: 'Manage patient bookings'
    },
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#1a5858] to-[#0d3d3d] transform transition-all duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] flex items-center justify-center shadow-lg">
                <Building className="w-6 h-6 text-[#1a5858]" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg tracking-tight">HealthCare Pro</h1>
                <p className="text-xs text-white/60 font-medium">Staff Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 overflow-y-auto">
            <p className="px-6 text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
              Management
            </p>
            <div className="space-y-1 px-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                    ? 'bg-white/10 text-white shadow-lg shadow-black/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <div className={`p-2 rounded-lg ${activeTab === item.id ? 'bg-white/20' : 'bg-white/10'}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.label}</span>
                      {item.badge > 0 && (
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${item.badgeColor || 'bg-[#b0e7e7]'} text-white`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50 mt-0.5">{item.description}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${activeTab === item.id ? 'rotate-90' : ''}`} />
                </button>
              ))}
            </div>
          </nav>

          {/* Bottom Actions - Cleaned up */}
          <div className="p-4 border-t border-white/10 space-y-3">
            {/* Public Site Button */}
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-gradient-to-r from-[#b0e7e7] to-[#8adcdc] text-[#1a5858] rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Home className="w-4 h-4" />
              <span>View Public Site</span>
            </button>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white dark:bg-[#1e293b] border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {menuItems.find((m) => m.id === activeTab)?.label || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your healthcare services efficiently
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />
              {/* Pending Badge */}
              {stats.pendingCount > 0 && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-600 text-sm font-medium">
                    {stats.pendingCount} pending appointments
                  </span>
                </div>
              )}

              {/* Notifications */}
              <div className="relative group">
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  {stats.pendingCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
                  )}
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={fetchQuickStats}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh data"
                aria-label="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-600 hover:text-gray-900" />
              </button>

              {/* User Profile */}
              <div className="relative group">
                <button className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] flex items-center justify-center shadow-sm">
                      <UserCircle className="w-5 h-5 text-[#1a5858]" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || user?.email?.split('@')[0] || 'Staff Member'}
                    </p>
                    <p className="text-xs text-gray-500">Staff Access</p>
                  </div>
                </button>
                {/* User Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-10">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user?.email || 'staff@healthcare.com'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-gray-500">Staff Member</span>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => navigate('/')}
                      className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Home className="w-4 h-4" />
                      <span>Public Site</span>
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:border-[#b0e7e7] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Pending Appointments</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingCount}</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:border-[#b0e7e7] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Confirmed Today</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.confirmedToday}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <Clock className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:border-[#b0e7e7] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Doctors</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalDoctors}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 animate-fadeIn">
          {activeTab === 'doctors' && <DoctorManagement />}
          {activeTab === 'timeslots' && <TimeSlotManagement />}
          {activeTab === 'appointments' && <AppointmentManagement />}
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] mt-8 transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span>HealthCare Pro Staff Panel v2.0</span>
            </div>
            <div className="mt-2 md:mt-0">
              <span>© {new Date().getFullYear()} All rights reserved</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}