import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { format } from 'date-fns'
import emailjs from '@emailjs/browser'
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  RefreshCw,
  FileText,
  ChevronRight,
  MoreVertical,
  Send,
  CalendarDays,
  UserCircle,
  Ban,
  Eye,
  Download,
  Printer
} from 'lucide-react'

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('appointments')
        .select(`
          *,
          doctors:doctor_id(name, specialty),
          time_slots:time_slot_id(date, start_time, end_time)
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId)

      if (error) throw error

      if (newStatus === 'confirmed') {
        const appointment = appointments.find((a) => a.id === appointmentId)
        if (appointment?.time_slot_id) {
          await supabase
            .from('time_slots')
            .update({ is_available: false })
            .eq('id', appointment.time_slot_id)
        }

        if (appointment) {
          try {
            await emailjs.send(
              import.meta.env.VITE_EMAILJS_SERVICE_ID,
              import.meta.env.VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID,
              {
                to_email: appointment.email,
                patient_name: `${appointment.first_name} ${appointment.last_name}`,
                doctor_name: appointment.doctors?.name || 'N/A',
                doctor_specialty: appointment.doctors?.specialty || '',
                appointment_date: appointment.time_slots?.date
                  ? format(new Date(appointment.time_slots.date), 'MMMM dd, yyyy')
                  : 'N/A',
                appointment_time: `${appointment.time_slots?.start_time || ''} - ${appointment.time_slots?.end_time || ''}`,
              },
              import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            )
          } catch (e) { console.error('Email failed', e) }
        }
      }

      fetchAppointments()
    } catch (error) {
      console.error('Error updating appointment:', error)
      alert('Error updating appointment: ' + error.message)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) return
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)

      if (error) throw error

      const appointment = appointments.find((a) => a.id === appointmentId)
      if (appointment?.time_slot_id) {
        await supabase
          .from('time_slots')
          .update({ is_available: true })
          .eq('id', appointment.time_slot_id)
      }

      fetchAppointments()
    } catch (error) {
      console.error('Error cancelling:', error)
      alert('Failed to cancel appointment')
    }
  }

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
  }

  const filteredAppointments = appointments.filter(appointment => 
    `${appointment.first_name} ${appointment.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.doctors?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingCount = appointments.filter(a => a.status === 'pending').length
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-[#b0e7e7] border-t-[#1a5858] animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading appointments...</p>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] rounded-xl">
            <Calendar className="w-6 h-6 text-[#1a5858]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Appointment Management</h2>
            <p className="text-gray-600">Manage and track patient session requests</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{pendingCount}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Confirmed</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{confirmedCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Cancelled</p>
              <p className="text-3xl font-bold text-rose-600 mt-1">{cancelledCount}</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg">
              <XCircle className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient, doctor, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
              <Filter className="w-4 h-4 text-gray-500" />
              {['all', 'pending', 'confirmed', 'cancelled'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === f
                      ? 'bg-white text-[#1a5858] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            
            <button
              onClick={fetchAppointments}
              className="p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh appointments"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#b0e7e7] to-[#8adcdc] text-[#1a5858] font-semibold rounded-lg hover:opacity-90 transition-opacity">
              <Printer className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAppointments.length === 0 ? (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-2">No appointments found</p>
              <p className="text-gray-400 text-sm">
                {searchTerm ? 'Try a different search term' : 'No appointments match the selected filter'}
              </p>
            </div>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
              <div className="p-6">
                {/* Appointment Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] flex items-center justify-center">
                        <span className="text-lg font-semibold text-[#1a5858]">
                          {appointment.first_name[0]}{appointment.last_name[0]}
                        </span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${appointment.status === 'confirmed' ? 'bg-emerald-500' :
                          appointment.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment.first_name} {appointment.last_name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="px-2 py-0.5 bg-gray-100 rounded-full">
                          <span className="text-xs text-gray-600 font-medium">
                            {appointment.education_level}
                          </span>
                        </div>
                        <div className={`px-2 py-0.5 text-xs font-semibold rounded-full ${appointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                            appointment.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                          }`}>
                          {appointment.status}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleViewDetails(appointment)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2 flex-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{appointment.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 flex-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{appointment.phone_number}</span>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Stethoscope className="w-4 h-4 text-gray-500" />
                      <p className="text-sm font-medium text-gray-700">Doctor</p>
                    </div>
                    <p className="font-semibold text-gray-900 truncate">
                      {appointment.doctors?.name || 'Not assigned'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {appointment.doctors?.specialty}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CalendarDays className="w-4 h-4 text-gray-500" />
                      <p className="text-sm font-medium text-gray-700">Schedule</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {appointment.time_slots?.date ? format(new Date(appointment.time_slots.date), 'MMM dd, yyyy') : 'Not scheduled'}
                    </p>
                    <div className="flex items-center space-x-1 mt-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        {appointment.time_slots?.start_time} - {appointment.time_slots?.end_time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <FileText className="w-3 h-3" />
                      <span>Booked: {format(new Date(appointment.created_at), 'MMM dd, HH:mm')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm</span>
                      </button>
                    )}
                    {appointment.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-white text-rose-600 border border-rose-200 font-semibold rounded-lg hover:bg-rose-50 transition-colors text-sm"
                      >
                        <Ban className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {filteredAppointments.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredAppointments.length} of {appointments.length} appointments
            </div>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <button
                onClick={fetchAppointments}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button className="flex items-center space-x-2 text-sm text-[#1a5858] font-medium">
                <Download className="w-4 h-4" />
                <span>Export All</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Appointment Details</h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] flex items-center justify-center">
                  <span className="text-xl font-semibold text-[#1a5858]">
                    {selectedAppointment.first_name[0]}{selectedAppointment.last_name[0]}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {selectedAppointment.first_name} {selectedAppointment.last_name}
                  </h4>
                  <p className="text-gray-600">{selectedAppointment.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className={`px-3 py-1 text-xs font-semibold rounded-full ${selectedAppointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        selectedAppointment.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                      }`}>
                      {selectedAppointment.status}
                    </div>
                    <div className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {selectedAppointment.education_level}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium mb-2">Contact</p>
                  <p className="font-medium text-gray-900">{selectedAppointment.phone_number}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium mb-2">Booked On</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(selectedAppointment.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-2">Doctor Information</p>
                  <p className="font-semibold text-gray-900">{selectedAppointment.doctors?.name || 'Not assigned'}</p>
                  <p className="text-gray-600">{selectedAppointment.doctors?.specialty}</p>
                </div>
                
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-emerald-600 font-medium mb-2">Appointment Time</p>
                  <p className="font-semibold text-gray-900">
                    {selectedAppointment.time_slots?.date ? format(new Date(selectedAppointment.time_slots.date), 'MMMM dd, yyyy') : 'Not scheduled'}
                  </p>
                  <p className="text-gray-600">
                    {selectedAppointment.time_slots?.start_time} - {selectedAppointment.time_slots?.end_time}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {selectedAppointment.status === 'pending' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedAppointment.id, 'confirmed')
                    setSelectedAppointment(null)
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Confirm Appointment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}