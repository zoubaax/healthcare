import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { format } from 'date-fns'
import {
  Calendar,
  Clock,
  Plus,
  X,
  CheckCircle,
  XCircle,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CalendarDays,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react'

export default function TimeSlotManagement({ doctorId: initialDoctorId, onClose, doctorName: initialDoctorName }) {
  const [doctors, setDoctors] = useState([])
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId || '')
  const [selectedDoctorName, setSelectedDoctorName] = useState(initialDoctorName || '')
  const [timeSlots, setTimeSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    is_available: true,
  })
  const [filter, setFilter] = useState('all') // all, available, booked
  const [searchDate, setSearchDate] = useState('')

  const isModal = Boolean(onClose)

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    if (selectedDoctorId) {
      fetchTimeSlots()
      const doc = doctors.find(d => d.id === selectedDoctorId)
      if (doc) setSelectedDoctorName(doc.name)
    } else {
      setTimeSlots([])
    }
  }, [selectedDoctorId, doctors])

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase.from('doctors').select('id, name').order('name')
      if (error) throw error
      setDoctors(data || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
    }
  }

  const fetchTimeSlots = async () => {
    if (!selectedDoctorId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('doctor_id', selectedDoctorId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error
      setTimeSlots(data || [])
    } catch (error) {
      console.error('Error fetching time slots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTimeSlot = async () => {
    if (!formData.date || !formData.start_time || !formData.end_time) {
      alert('Please fill in all fields')
      return
    }

    if (formData.start_time >= formData.end_time) {
      alert('End time must be after start time')
      return
    }

    if (!selectedDoctorId) {
      alert('Please select a doctor first')
      return
    }

    try {
      const { error } = await supabase.from('time_slots').insert({
        doctor_id: selectedDoctorId,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        is_available: formData.is_available,
      })
      if (error) throw error

      // Reset form
      setFormData({
        date: '',
        start_time: '',
        end_time: '',
        is_available: true
      })

      fetchTimeSlots()
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const handleDeleteTimeSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this time slot? This action cannot be undone.')) return

    try {
      const { error } = await supabase.from('time_slots').delete().eq('id', slotId)
      if (error) throw error
      fetchTimeSlots()
    } catch (error) {
      console.error('Error deleting slot:', error)
      alert('Failed to delete time slot')
    }
  }

  const handleToggleAvailable = async (slot) => {
    try {
      const { error } = await supabase
        .from('time_slots')
        .update({ is_available: !slot.is_available })
        .eq('id', slot.id)
      if (error) throw error
      fetchTimeSlots()
    } catch (error) {
      console.error('Error toggling availability:', error)
      alert('Failed to update availability')
    }
  }

  const filteredSlots = timeSlots.filter(slot => {
    const matchesFilter = filter === 'all' ||
      (filter === 'available' && slot.is_available) ||
      (filter === 'booked' && !slot.is_available)

    const matchesSearch = !searchDate ||
      format(new Date(slot.date), 'yyyy-MM-dd') === searchDate

    return matchesFilter && matchesSearch
  })

  const availableSlots = timeSlots.filter(s => s.is_available).length
  const bookedSlots = timeSlots.filter(s => !s.is_available).length

  const handleClose = () => {
    if (onClose) onClose()
  }

  const content = (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl w-full ${isModal ? 'max-w-6xl shadow-2xl relative' : 'shadow-sm border border-gray-100 dark:border-gray-700'} overflow-hidden flex flex-col max-h-[90vh] transition-all`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] dark:from-[#2d9e9e] dark:to-[#1a5858] rounded-xl shadow-sm">
              <Calendar className="w-6 h-6 text-[#1a5858] dark:text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Time Slot Management</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {selectedDoctorName ? `Scheduling availability for ${selectedDoctorName}` : 'Select a doctor to manage their schedule'}
              </p>
            </div>
          </div>
          {isModal && (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gradient-to-r from-[#b0e7e7]/20 to-[#8adcdc]/20 dark:from-[#2d9e9e]/20 dark:to-[#1a5858]/20 rounded-xl border border-[#b0e7e7]/30 dark:border-[#2d9e9e]/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#1a5858] dark:text-[#8adcdc] font-medium">Total Slots</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{timeSlots.length}</p>
              </div>
              <Calendar className="w-5 h-5 text-[#1a5858] dark:text-[#8adcdc]" />
            </div>
          </div>
          <div className="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Available</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{availableSlots}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
          <div className="p-3 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Booked</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{bookedSlots}</p>
              </div>
              <XCircle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
          </div>
          <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Upcoming</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {timeSlots.filter(s => new Date(s.date) >= new Date()).length}
                </p>
              </div>
              <CalendarDays className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* Selection Area (visible in tab mode) */}
          {!initialDoctorId && (
            <div className="bg-white dark:bg-gray-800 border border-[#b0e7e7]/30 dark:border-[#2d9e9e]/30 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#94a3a3] dark:text-[#8adcdc] uppercase tracking-wider mb-2">Select Doctor</label>
                  <div className="relative">
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-[#f8fafa] dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#b0e7e7] dark:focus:ring-[#2d9e9e] appearance-none cursor-pointer font-medium text-gray-700 dark:text-white font-bold transition-colors"
                    >
                      <option value="">-- Choose a doctor --</option>
                      {doctors.map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronRight className="w-5 h-5 rotate-90" />
                    </div>
                  </div>
                </div>
                <div className="hidden md:block w-px h-12 bg-gray-100 dark:bg-gray-700 mx-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic">
                    Pick a doctor from the list to view and manage their consultation hours.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Add Slot Form */}
          <div className={`bg-gradient-to-r from-[#f0f9f9] to-white dark:from-gray-800 dark:to-gray-800/50 border border-[#b0e7e7] dark:border-[#2d9e9e]/50 rounded-2xl p-6 shadow-sm ${!selectedDoctorId ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center space-x-2 mb-4">
              <Plus className="w-5 h-5 text-[#1a5858] dark:text-[#8adcdc]" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Add New Time Slot</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Date</span>
                  </span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] dark:focus:ring-[#2d9e9e] focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Start Time</span>
                  </span>
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] dark:focus:ring-[#2d9e9e] focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>End Time</span>
                  </span>
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] dark:focus:ring-[#2d9e9e] focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span className="flex items-center space-x-1">
                    <ToggleRight className="w-4 h-4" />
                    <span>Status</span>
                  </span>
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFormData({ ...formData, is_available: true })}
                    className={`flex-1 px-4 py-2.5 rounded-lg border transition-all ${formData.is_available
                      ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-bold'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 font-medium'
                      }`}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, is_available: false })}
                    className={`flex-1 px-4 py-2.5 rounded-lg border transition-all ${!formData.is_available
                      ? 'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 font-bold'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 font-medium'
                      }`}
                  >
                    Booked
                  </button>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleAddTimeSlot}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#b0e7e7] to-[#8adcdc] dark:from-[#2d9e9e] dark:to-[#1a5858] text-[#1a5858] dark:text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Slot</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    placeholder="Search by date..."
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] dark:focus:ring-[#2d9e9e] focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
                  <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  {['all', 'available', 'booked'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === f
                        ? 'bg-white dark:bg-gray-600 text-[#1a5858] dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                <button
                  onClick={fetchTimeSlots}
                  className="p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-100 dark:border-gray-600"
                  title="Refresh slots"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Time Slots Grid */}
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <h4 className="font-bold text-gray-900 dark:text-white">
                Time Slots ({filteredSlots.length})
              </h4>
              <div className="text-xs font-bold text-[#b0e7e7] dark:text-[#8adcdc] bg-[#b0e7e7]/10 dark:bg-[#2d9e9e]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                {searchDate ? `Filtered: ${searchDate}` : 'All Schedules'}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30 dark:bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 rounded-full border-4 border-[#b0e7e7] border-t-[#1a5858] dark:border-[#2d9e9e] dark:border-t-[#8adcdc] animate-spin"></div>
                <p className="text-gray-600 dark:text-gray-400 font-bold mt-4">Syncing schedules...</p>
              </div>
            ) : filteredSlots.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/30 dark:bg-gray-800/30">
                <div className="w-16 h-16 mx-auto bg-white dark:bg-gray-700 rounded-2xl shadow-sm flex items-center justify-center mb-4 border border-gray-100 dark:border-gray-600">
                  <Calendar className="w-8 h-8 text-[#b0e7e7] dark:text-[#2d9e9e]" />
                </div>
                <p className="text-gray-900 dark:text-white font-bold mb-2 text-lg">No time slots found</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                  {searchDate ? 'No sessions scheduled for this specific date.' : 'This doctor has no sessions scheduled yet. Start by adding one above.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSlots.map((slot) => {
                  const isPastSlot = new Date(slot.date) < new Date()
                  const slotDate = new Date(slot.date)

                  return (
                    <div
                      key={slot.id}
                      className={`p-5 bg-white dark:bg-gray-800 border-2 rounded-2xl transition-all duration-300 hover:shadow-xl group ${isPastSlot
                        ? 'border-gray-100 dark:border-gray-700 opacity-60 grayscale'
                        : slot.is_available
                          ? 'border-emerald-50 dark:border-emerald-900/30 hover:border-emerald-200 dark:hover:border-emerald-800 bg-emerald-50/10 dark:bg-emerald-900/10'
                          : 'border-amber-50 dark:border-amber-900/30 hover:border-amber-200 dark:hover:border-amber-800 bg-amber-50/10 dark:bg-amber-900/10'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${slot.is_available ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`}></div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {format(slotDate, 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-600 w-fit">
                            <Clock className="w-3.5 h-3.5 text-[#3ebdbd] dark:text-[#8adcdc]" />
                            <span className="font-bold">{slot.start_time}</span>
                            <ChevronRight className="w-3 h-3 text-gray-300" />
                            <span className="font-bold">{slot.end_time}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleToggleAvailable(slot)}
                            className={`p-2.5 rounded-xl transition-all ${slot.is_available
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 shadow-sm'
                              : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/60 shadow-sm'
                              }`}
                            title={slot.is_available ? 'Mark as booked' : 'Mark as available'}
                            disabled={isPastSlot}
                          >
                            {slot.is_available ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                          </button>

                          <button
                            onClick={() => handleDeleteTimeSlot(slot.id)}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                            title="Delete slot"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-tighter ${slot.is_available
                          ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 shadow-sm'
                          : 'bg-white dark:bg-gray-700 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800 shadow-sm'
                          }`}>
                          {slot.is_available ? 'Open for Patient' : 'Reserved Session'}
                        </span>

                        {isPastSlot && (
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">Archived</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-600 shadow-sm">
          <span className="text-[#3ebdbd] dark:text-[#8adcdc] font-bold">{availableSlots}</span> available • <span className="text-amber-600 dark:text-amber-400 font-bold">{bookedSlots}</span> booked
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {isModal && (
            <button
              onClick={handleClose}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all hover:border-gray-300 dark:hover:border-gray-500 active:scale-95 shadow-sm"
            >
              Cancel
            </button>
          )}
          <button
            onClick={fetchTimeSlots}
            disabled={!selectedDoctorId || loading}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-[#b0e7e7] to-[#8adcdc] dark:from-[#2d9e9e] dark:to-[#1a5858] text-[#1a5858] dark:text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Schedule</span>
          </button>
        </div>
      </div>
    </div>
  )

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
        {content}
      </div>
    )
  }

  return content
}