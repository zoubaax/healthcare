import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function SystemOverview() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalAppointments: 0,
    totalStaff: 0,
    activeAppointments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch doctors count
      const { count: doctorsCount } = await supabase
        .from('doctors')
        .select('*', { count: 'exact', head: true })

      // Fetch appointments count
      const { count: appointmentsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })

      // Fetch staff count
      const { count: staffCount } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true })

      // Fetch active appointments (confirmed)
      const { count: activeCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed')

      setStats({
        totalDoctors: doctorsCount || 0,
        totalAppointments: appointmentsCount || 0,
        totalStaff: staffCount || 0,
        activeAppointments: activeCount || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Doctors</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalDoctors}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">
            Total Appointments
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalAppointments}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Staff</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalStaff}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">
            Active Appointments
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {stats.activeAppointments}
          </div>
        </div>
      </div>
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This is a read-only view. Admin does not manage
          doctors or appointments.
        </p>
      </div>
    </div>
  )
}

