import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import {
  Users,
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  UserPlus,
  BarChart3,
  FileText,
  Shield,
  Activity,
  Eye,
  CalendarDays,
  Star,
  ChevronRight,
  RefreshCw
} from 'lucide-react'

export default function SystemOverview() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalAppointments: 0,
    totalStaff: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0,
    todayAppointments: 0,
    weeklyAppointments: 0,
    availableSlots: 0,
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [topDoctors, setTopDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    fetchAllData()
  }, [refreshCount])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchStats(),
        fetchRecentBookings(),
        fetchTopDoctors()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Parallel fetching for better performance
      const [
        doctorsResult,
        appointmentsResult,
        staffResult,
        pendingResult,
        confirmedResult,
        cancelledResult,
        todayResult,
        weeklyResult,
        slotsResult
      ] = await Promise.all([
        supabase.from('doctors').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }),
        supabase.from('staff').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
        supabase.from('appointments')
          .select('*, time_slots!inner(date)', { count: 'exact', head: true })
          .eq('time_slots.date', format(new Date(), 'yyyy-MM-dd')),
        supabase.from('appointments')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfDay(subDays(new Date(), 7)).toISOString()),
        supabase.from('time_slots')
          .select('*', { count: 'exact', head: true })
          .eq('is_available', true)
          .gte('date', format(new Date(), 'yyyy-MM-dd'))
      ])

      setStats({
        totalDoctors: doctorsResult.count || 0,
        totalAppointments: appointmentsResult.count || 0,
        totalStaff: staffResult.count || 0,
        pendingAppointments: pendingResult.count || 0,
        confirmedAppointments: confirmedResult.count || 0,
        cancelledAppointments: cancelledResult.count || 0,
        todayAppointments: todayResult.count || 0,
        weeklyAppointments: weeklyResult.count || 0,
        availableSlots: slotsResult.count || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRecentBookings = async () => {
    try {
      const { data } = await supabase
        .from('appointments')
        .select(`
          *,
          doctors:doctor_id(name, specialty),
          time_slots:time_slot_id(date, start_time)
        `)
        .order('created_at', { ascending: false })
        .limit(6)

      setRecentBookings(data || [])
    } catch (error) {
      console.error('Error fetching recent bookings:', error)
    }
  }

  const fetchTopDoctors = async () => {
    try {
      const { data } = await supabase
        .from('appointments')
        .select('doctor_id, doctors:doctor_id(name, specialty)')
        .eq('status', 'confirmed')

      if (data) {
        const doctorCounts = {}
        data.forEach((appointment) => {
          const doctorId = appointment.doctor_id
          if (!doctorCounts[doctorId]) {
            doctorCounts[doctorId] = {
              id: doctorId,
              name: appointment.doctors?.name || 'Unknown',
              specialty: appointment.doctors?.specialty || '',
              count: 0,
            }
          }
          doctorCounts[doctorId].count++
        })

        const sortedDoctors = Object.values(doctorCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        setTopDoctors(sortedDoctors)
      }
    } catch (error) {
      console.error('Error fetching top doctors:', error)
    }
  }

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1)
  }

  const confirmationRate = stats.totalAppointments > 0
    ? Math.round((stats.confirmedAppointments / stats.totalAppointments) * 100)
    : 0

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-[#b0e7e7] border-t-[#1a5858] animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading system overview...</p>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
          <p className="text-gray-600">Monitor your healthcare platform performance</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Doctors */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-[#b0e7e7] transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Doctors</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalDoctors}</p>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Active</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <Stethoscope className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Staff */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-[#b0e7e7] transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Staff</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStaff}</p>
              <div className="flex items-center space-x-1 mt-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-purple-600 font-medium">Administrators</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Available Slots */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-[#b0e7e7] transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Available Slots</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.availableSlots}</p>
              <div className="flex items-center space-x-1 mt-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">Upcoming</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
              <CalendarDays className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-[#b0e7e7] transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Today's Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.todayAppointments}</p>
              <div className="flex items-center space-x-1 mt-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-amber-600 font-medium">Today</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
              <Activity className="w-8 h-8 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Appointment Status */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Appointment Analytics</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <span className="text-gray-600">Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-gray-600">Confirmed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-gray-600">Cancelled</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Progress Bars */}
            <div className="space-y-4">
              {[
                { label: 'Confirmed', value: stats.confirmedAppointments, color: 'bg-emerald-500', icon: CheckCircle },
                { label: 'Pending', value: stats.pendingAppointments, color: 'bg-amber-400', icon: AlertCircle },
                { label: 'Cancelled', value: stats.cancelledAppointments, color: 'bg-rose-500', icon: XCircle },
              ].map((item, index) => {
                const Icon = item.icon
                const percentage = stats.totalAppointments > 0
                  ? Math.round((item.value / stats.totalAppointments) * 100)
                  : 0

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 ${item.color.replace('bg-', 'bg-').replace('500', '50')} rounded-lg`}>
                          <Icon className={`w-4 h-4 ${item.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.value} appointments</p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
                  </div>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Confirmation Rate</p>
                    <p className="text-2xl font-bold text-emerald-600">{confirmationRate}%</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Doctors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Doctors</h3>
            <Star className="w-5 h-5 text-amber-500" />
          </div>

          {topDoctors.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Stethoscope className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-2">No appointment data</p>
              <p className="text-gray-400 text-sm">Start booking appointments to see rankings</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topDoctors.map((doctor, index) => (
                <div
                  key={doctor.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                          'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{doctor.name}</p>
                    <p className="text-sm text-gray-500 truncate">{doctor.specialty || 'General Practice'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{doctor.count}</p>
                    <p className="text-xs text-gray-500">bookings</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
            <button className="text-sm text-[#1a5858] font-medium hover:text-[#0d3d3d] transition-colors">
              View all
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {recentBookings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-2">No recent bookings</p>
              <p className="text-gray-400 text-sm">New bookings will appear here</p>
            </div>
          ) : (
            recentBookings.map((booking) => (
              <div key={booking.id} className="px-6 py-4 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${booking.status === 'confirmed' ? 'bg-emerald-50' :
                        booking.status === 'pending' ? 'bg-amber-50' : 'bg-rose-50'
                      }`}>
                      {booking.status === 'confirmed' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : booking.status === 'pending' ? (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900">
                          {booking.first_name} {booking.last_name}
                        </p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                            booking.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                          }`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{booking.email}</p>
                      <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Stethoscope className="w-3 h-3" />
                          <span>{booking.doctors?.name || 'Unknown Doctor'}</span>
                        </span>
                        {booking.time_slots?.date && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(booking.time_slots.date), 'MMM dd, yyyy')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {format(new Date(booking.created_at), 'MMM dd, HH:mm')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Booked</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {recentBookings.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Showing {recentBookings.length} recent bookings</span>
              <button className="flex items-center space-x-2 text-[#1a5858] font-medium hover:text-[#0d3d3d] transition-colors">
                <span>View all bookings</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-gradient-to-r from-[#b0e7e7] to-[#8adcdc] p-5 rounded-xl text-[#1a5858]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Weekly Appointments</p>
              <p className="text-2xl font-bold mt-1">{stats.weeklyAppointments}</p>
              <p className="text-xs opacity-80 mt-1">Last 7 days</p>
            </div>
            <BarChart3 className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAppointments}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active System</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">100%</p>
              <p className="text-xs text-gray-500 mt-1">Uptime</p>
            </div>
            <Eye className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  )
}