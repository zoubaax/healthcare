import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { format, isAfter, parseISO } from 'date-fns'

export default function BookAppointment() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    education_level: '',
    email: '',
    phone_number: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDoctor()
    fetchAvailableSlots()
  }, [doctorId])

  const fetchDoctor = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', doctorId)
        .single()

      if (error) throw error
      setDoctor(data)
    } catch (error) {
      console.error('Error fetching doctor:', error)
      alert('Error loading doctor information')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('is_available', true)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error

      // Filter out past dates
      const now = new Date()
      const futureSlots = (data || []).filter((slot) => {
        const slotDate = parseISO(slot.date)
        return isAfter(slotDate, now) || format(slotDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
      })

      setAvailableSlots(futureSlots)
    } catch (error) {
      console.error('Error fetching time slots:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedDate) {
      alert('Please select a date')
      return
    }

    if (!selectedSlot) {
      alert('Please select a time slot on that day')
      return
    }

    setSubmitting(true)

    try {
      // Create appointment (public users can insert, RLS allows this)
      const { error: appointmentError } = await supabase.from('appointments').insert({
        doctor_id: doctorId,
        time_slot_id: selectedSlot.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        education_level: formData.education_level,
        email: formData.email,
        phone_number: formData.phone_number,
        status: 'pending',
      })

      if (appointmentError) throw appointmentError

      // Marking the time slot as unavailable is handled in the database
      // via a trigger (see setup SQL). Public users do not need update
      // permissions on time_slots.

      alert('Appointment booked successfully! You will receive a confirmation email shortly.')
      navigate('/')
    } catch (error) {
      console.error('Error booking appointment:', error)
      alert('Error booking appointment: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!doctor) {
    return null
  }

  // Compute unique dates that have available slots (YYYY-MM-DD)
  const uniqueDates = Array.from(
    new Set(availableSlots.map((slot) => slot.date)),
  ).sort()

  // Slots filtered by selected date
  const slotsForSelectedDate = selectedDate
    ? availableSlots.filter((slot) => slot.date === selectedDate)
    : []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Doctor Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start space-x-4">
            {doctor.profile_image_url && (
              <img
                src={doctor.profile_image_url}
                alt={doctor.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{doctor.name}</h2>
              <p className="text-blue-600 font-medium mt-1">{doctor.specialty}</p>
              <p className="text-gray-600 mt-2">{doctor.description}</p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Book Your Session</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Selection (Calendar) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date *
              </label>
              {uniqueDates.length === 0 ? (
                <p className="text-gray-500">No available dates at the moment</p>
              ) : (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setSelectedSlot(null)
                  }}
                  min={uniqueDates[0]}
                  max={uniqueDates[uniqueDates.length - 1]}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Time *
              </label>
              {!selectedDate ? (
                <p className="text-gray-500">Please choose a date first</p>
              ) : slotsForSelectedDate.length === 0 ? (
                <p className="text-gray-500">
                  No available time slots on this day. Please choose another date.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {slotsForSelectedDate.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 border-2 rounded-lg text-left transition-colors ${
                        selectedSlot?.id === slot.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {slot.start_time} - {slot.end_time}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education Level *
              </label>
              <select
                required
                value={formData.education_level}
                onChange={(e) =>
                  setFormData({ ...formData, education_level: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select education level</option>
                <option value="High School">High School</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="Doctorate">Doctorate</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

