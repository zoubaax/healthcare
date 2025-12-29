import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import ThemeToggle from '../../components/ThemeToggle'
import StaffManagement from '../../components/admin/StaffManagement'
import SystemOverview from '../../components/admin/SystemOverview'
import ActivityLogs from '../../components/admin/ActivityLogs'
import {
  LayoutDashboard,
  Activity,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  Building,
  UserCircle,
  ShieldCheck
} from 'lucide-react'
import logo_white from '../../assets/logo-white.png'
import logo_dark from '../../assets/logo-dark.png'
import { useTheme } from '../../contexts/ThemeContext'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { isDark } = useTheme()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notifications] = useState([
    { id: 1, text: 'System backup completed successfully', time: '2 hours ago', read: true },
    { id: 2, text: 'Database optimization scheduled', time: '4 hours ago', read: true },
    { id: 3, text: 'Security audit passed', time: '1 day ago', read: true },
  ])

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, color: 'text-blue-500' },
    { id: 'logs', label: 'Activity Logs', icon: <Activity className="w-5 h-5" />, color: 'text-emerald-500' },
    { id: 'staff', label: 'Staff Management', icon: <ShieldCheck className="w-5 h-5" />, color: 'text-purple-500' },
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300">
      {/* Sidebar - Modern Clean Style */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#0f172a] border-r border-gray-200 dark:border-gray-800 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Link to="/" className="w-10 h-10 flex items-center justify-center hover:opacity-90 transition-opacity">
                {/* Show different icon based on theme */}
                {isDark ? (
                  <img
                    src={logo_dark}
                    alt="HealthCare Pro Logo"
                    className="w-10 h-10 object-contain"
                  />
                ) : (
                  <img
                    src={logo_white}
                    alt="HealthCare Pro Logo"
                    className="w-10 h-10 object-contain"
                  />
                )}
              </Link>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">HealthCare Pro</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Admin Control Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 overflow-y-auto">
            <p className="px-6 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
              Administration
            </p>
            <div className="space-y-1 px-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${activeTab === item.id ? 'bg-blue-100 dark:bg-blue-800/30' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'}`}>
                    {item.icon}
                  </div>
                  <span className="flex-1 text-left">{item.label}</span>
                  {activeTab === item.id && <ChevronRight className="w-4 h-4 text-blue-500" />}
                </button>
              ))}
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all duration-200 group"
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
                  Welcome back! Here's what's happening today.
                </p>
              </div>
            </div>

            {/* Header Actions - User info moved here */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />
              {/* Notifications */}
              <div className="relative group">
                <button
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                {/* Notifications Dropdown */}
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">System Notifications</h3>
                    <p className="text-sm text-gray-500">All systems are operational</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Bell className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{notification.text}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Settings */}
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5 text-gray-600 hover:text-gray-900" />
              </button>

              {/* User Profile - Now in header */}
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
                      {user?.name || user?.email?.split('@')[0] || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </button>
                {/* User Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-10">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user?.email || 'admin@healthcare.com'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-gray-500">System Admin</span>
                    </div>
                  </div>
                  <div className="py-1">
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
        </header>

        {/* Page Content */}
        <div className="p-6 animate-fadeIn">
          {activeTab === 'overview' && <SystemOverview />}
          {activeTab === 'logs' && <ActivityLogs />}
          {activeTab === 'staff' && <StaffManagement />}
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] mt-8 transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>HealthCare Pro Admin Panel v2.0</span>
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