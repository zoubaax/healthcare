import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  format,
  isAfter,
  parseISO,
  startOfToday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  eachDayOfInterval,
  isToday,
  addMonths,
  subMonths
} from 'date-fns'
import emailjs from '@emailjs/browser'
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Home,
  Stethoscope,
  BookOpen,
  Shield,
  Users,
  Loader2,
  ArrowRight,
  Award,
  Sparkles,
  Moon
} from 'lucide-react'

export default function BookAppointment() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [timeSlots, setTimeSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [verifyingSlot, setVerifyingSlot] = useState(false)
  const [availabilityMessage, setAvailabilityMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    education_level: '',
    email: '',
    phone_number: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1)

  // Memoized fetch functions for performance
  const fetchDoctor = useCallback(async () => {
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
      navigate('/', { replace: true })
    }
  }, [doctorId, navigate])

  const fetchTimeSlots = useCallback(async () => {
    try {
      const today = startOfToday().toISOString()
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('doctor_id', doctorId)
        .gte('date', today.split('T')[0])
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error

      const now = new Date()
      const futureSlots = (data || []).filter((slot) => {
        const slotDateTime = new Date(`${slot.date}T${slot.start_time}`)
        return isAfter(slotDateTime, now)
      })

      setTimeSlots(futureSlots)
    } catch (error) {
      console.error('Error fetching time slots:', error)
    }
  }, [doctorId])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchDoctor(), fetchTimeSlots()])
      setLoading(false)
    }
    loadData()
  }, [fetchDoctor, fetchTimeSlots])

  const handleSlotSelection = async (slot) => {
    if (!slot.is_available) {
      setAvailabilityMessage({ type: 'error', text: 'This time slot is already booked. Please select another one.' })
      return
    }

    setVerifyingSlot(true)
    setAvailabilityMessage({ type: 'verifying', text: 'Checking availability...' })

    try {
      // Double check if it's still available in DB
      const { data, error } = await supabase
        .from('time_slots')
        .select('is_available')
        .eq('id', slot.id)
        .single()

      if (error) throw error

      if (data.is_available) {
        setSelectedSlot(slot)
        setAvailabilityMessage({ type: 'success', text: 'This time slot is available!' })
      } else {
        // Update local state if it was booked in the meantime
        setTimeSlots(prev => prev.map(s => s.id === slot.id ? { ...s, is_available: false } : s))
        setSelectedSlot(null)
        setAvailabilityMessage({ type: 'error', text: 'Sorry, this slot was just booked. Please choose another.' })
      }
    } catch (error) {
      console.error('Error verifying slot:', error)
      setAvailabilityMessage({ type: 'error', text: 'Error verifying availability. Please try again.' })
    } finally {
      setVerifyingSlot(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Final availability check before booking
      const { data: slotCheck, error: slotError } = await supabase
        .from('time_slots')
        .select('is_available')
        .eq('id', selectedSlot.id)
        .single()

      if (slotError) throw slotError
      if (!slotCheck.is_available) {
        setStep(1)
        setSelectedSlot(null)
        setAvailabilityMessage({ type: 'error', text: 'This slot was just booked by another user. Please choose another.' })
        setSubmitting(false)
        return
      }

      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
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

      // Update slot availability
      await supabase
        .from('time_slots')
        .update({ is_available: false })
        .eq('id', selectedSlot.id)

      // Send email notification
      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            patient_name: `${formData.first_name} ${formData.last_name}`,
            patient_email: formData.email,
            patient_phone: formData.phone_number,
            education_level: formData.education_level,
            doctor_name: doctor.name,
            doctor_specialty: doctor.specialty,
            appointment_date: format(new Date(selectedSlot.date), 'MMMM dd, yyyy'),
            appointment_time: `${selectedSlot.start_time} - ${selectedSlot.end_time}`,
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        )
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError)
      }

      setStep(3)
    } catch (error) {
      console.error('Error booking appointment:', error)
      alert('Error booking appointment: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-16 h-16 rounded-full border-4 border-[#b0e7e7] border-t-[#1a5858] animate-spin"></div>
        <p className="text-gray-600 font-medium mt-4">Loading appointment details...</p>
      </div>
    )
  }

  if (!doctor) return null

  const uniqueDates = Array.from(new Set(timeSlots.map((slot) => slot.date))).sort()
  const slotsForSelectedDate = selectedDate
    ? timeSlots.filter((slot) => slot.date === selectedDate)
    : []

  // Calendar logic
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const calendarStartDate = startOfWeek(monthStart)
  const calendarEndDate = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStartDate, end: calendarEndDate })

  const getDayStatus = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const daySlots = timeSlots.filter(s => s.date === dateStr)
    const isPast = !isAfter(date, startOfToday()) && !isToday(date)

    if (isPast) return 'past'
    if (daySlots.length === 0) return 'none'
    return daySlots.some(s => s.is_available) ? 'available' : 'full'
  }

  const groupSlotsByPeriod = (slots) => {
    const periods = {
      morning: { label: 'Morning', icon: Sparkles, slots: [] },
      afternoon: { label: 'Afternoon', icon: Clock, slots: [] },
      evening: { label: 'Evening', icon: Moon, slots: [] }
    }

    slots.forEach(slot => {
      const hour = parseInt(slot.start_time.split(':')[0])
      if (hour < 12) periods.morning.slots.push(slot)
      else if (hour < 17) periods.afternoon.slots.push(slot)
      else periods.evening.slots.push(slot)
    })

    return Object.entries(periods).filter(([_, data]) => data.slots.length > 0)
  }

  // Success Screen
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fadeIn">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-[#1a5858]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-8">
            Your appointment request has been submitted successfully.
            You will receive a confirmation email shortly.
          </p>

          <div className="bg-gradient-to-r from-[#b0e7e7]/20 to-[#8adcdc]/20 rounded-xl p-6 mb-8 border border-[#b0e7e7]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Stethoscope className="w-6 h-6 text-[#1a5858]" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{doctor.name}</p>
                <p className="text-sm text-gray-600">{doctor.specialty}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(selectedSlot.date), 'EEEE, MMMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{selectedSlot.start_time} - {selectedSlot.end_time}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span>Session with {doctor.name}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full px-6 py-3 bg-gradient-to-r from-[#b0e7e7] to-[#8adcdc] text-[#1a5858] font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Return to Homepage
            </Link>
            <Link
              to="/"
              className="block w-full px-6 py-3 bg-white text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              Book Another Appointment
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Home className="w-6 h-6 text-[#1a5858]" />
              </div>
              <span className="font-bold text-xl text-gray-900">HealthCare Pro</span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Doctors</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((stepNum, index) => (
              <div key={stepNum} className="flex items-center">
                <div className={`flex flex-col items-center ${step >= stepNum ? 'text-[#1a5858]' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 ${step >= stepNum
                    ? 'bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] border-[#b0e7e7] text-[#1a5858]'
                    : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                    {step > stepNum ? <CheckCircle className="w-5 h-5" /> : stepNum}
                  </div>
                  <span className="text-xs font-medium mt-2">
                    {stepNum === 1 ? 'Select Time' : stepNum === 2 ? 'Your Details' : 'Confirm'}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-16 h-1 mx-2 ${step > stepNum ? 'bg-gradient-to-r from-[#b0e7e7] to-[#8adcdc]' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Doctor Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24 border border-gray-100">
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                {doctor.profile_image_url ? (
                  <img
                    src={doctor.profile_image_url}
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] flex items-center justify-center">
                      <Stethoscope className="w-12 h-12 text-[#1a5858]" />
                    </div>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-emerald-600 border border-emerald-100">
                    Available
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{doctor.name}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <div className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                    {doctor.specialty}
                  </div>
                  <Award className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {doctor.description || 'Licensed mental health professional dedicated to providing compassionate care and evidence-based therapy.'}
                </p>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Shield className="w-4 h-4" />
                    <span>Secure & confidential booking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100">
              {step === 1 && (
                <div className="animate-fadeIn">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#b0e7e7]/20 to-[#8adcdc]/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#1a5858]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Select Date & Time</h3>
                      <p className="text-sm text-gray-600">Choose a convenient slot for your session</p>
                    </div>
                  </div>

                  {timeSlots.length === 0 ? (
                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200 text-center mb-8 animate-fadeIn">
                      <Calendar className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                      <p className="font-medium text-amber-900">No Scheduled Sessions</p>
                      <p className="text-sm text-amber-700 mt-1">
                        This doctor hasn't scheduled any sessions yet.
                      </p>
                      <Link
                        to="/"
                        className="inline-block mt-4 px-4 py-2 bg-white text-amber-700 font-medium rounded-lg border border-amber-300 hover:bg-amber-50 transition-colors text-sm"
                      >
                        View Other Doctors
                      </Link>
                    </div>
                  ) : (
                    <div className="mb-8 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-bold text-gray-900">
                          {format(currentMonth, 'MMMM yyyy')}
                        </h4>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="p-2 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-2 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="text-center text-xs font-bold text-gray-400 py-2 uppercase tracking-wider">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((date, idx) => {
                          const status = getDayStatus(date)
                          const isCurrentMonth = isSameMonth(date, monthStart)
                          const isSelected = selectedDate === format(date, 'yyyy-MM-dd')
                          const isTodayDate = isToday(date)

                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={status === 'past' || status === 'none'}
                              onClick={() => {
                                setSelectedDate(format(date, 'yyyy-MM-dd'))
                                setSelectedSlot(null)
                                setAvailabilityMessage({ type: '', text: '' })
                              }}
                              className={`
                                relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all border
                                ${!isCurrentMonth ? 'opacity-30' : 'opacity-100'}
                                ${status === 'past' || status === 'none'
                                  ? 'bg-gray-50 border-transparent cursor-not-allowed text-gray-300'
                                  : isSelected
                                    ? 'bg-[#1a5858] border-[#1a5858] text-white shadow-md scale-105 z-10'
                                    : 'bg-white border-gray-100 hover:border-[#b0e7e7] hover:bg-gray-50 text-gray-700'
                                }
                              `}
                            >
                              {isTodayDate && (
                                <span className={`absolute top-1.5 text-[8px] font-black uppercase tracking-tighter ${isSelected ? 'text-white' : 'text-[#1a5858]'}`}>
                                  Today
                                </span>
                              )}
                              <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                {format(date, 'd')}
                              </span>

                              {/* Availability Dot */}
                              {status !== 'past' && status !== 'none' && (
                                <div className={`mt-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#b0e7e7]' :
                                  status === 'available' ? 'bg-emerald-500' : 'bg-red-400'
                                  }`} />
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {/* Legend */}
                      <div className="mt-6 pt-6 border-t border-gray-50 flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-xs text-gray-500 font-medium">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                          <span className="text-xs text-gray-500 font-medium">Fully Booked</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                          <span className="text-xs text-gray-500 font-medium">No Sessions</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Time Selection */}
                  {selectedDate && (
                    <div className="mb-8 animate-fadeIn">
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Choose Time Slot</span>
                        </span>
                      </label>

                      {slotsForSelectedDate.length === 0 ? (
                        <div className="bg-gray-50/50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
                          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">No available time slots on this date</p>
                          <p className="text-sm text-gray-400 mt-1">Please select another date from the calendar</p>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {/* Availability Message */}
                          {availabilityMessage.text && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 animate-fadeIn ${availabilityMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' :
                                availabilityMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                  'bg-[#b0e7e7]/10 text-[#1a5858] border border-[#b0e7e7]/20'
                              }`}>
                              {availabilityMessage.type === 'verifying' ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : availabilityMessage.type === 'error' ? (
                                <AlertCircle className="w-5 h-5" />
                              ) : (
                                <CheckCircle className="w-5 h-5" />
                              )}
                              <p className="text-sm font-medium">{availabilityMessage.text}</p>
                            </div>
                          )}

                          {groupSlotsByPeriod(slotsForSelectedDate).map(([key, period]) => (
                            <div key={key} className="relative pl-8">
                              {/* Timeline Line */}
                              <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-100" />

                              <div className="flex items-center gap-3 mb-4">
                                <div className="absolute left-0 w-6 h-6 rounded-full bg-white border-2 border-[#b0e7e7] flex items-center justify-center z-10">
                                  <period.icon className="w-3 h-3 text-[#1a5858]" />
                                </div>
                                <h5 className="text-sm font-bold text-gray-900 uppercase tracking-widest">{period.label}</h5>
                                <span className="text-xs text-gray-400 font-medium">{period.slots.length} slots</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {period.slots.map((slot) => {
                                  const isSelected = selectedSlot?.id === slot.id
                                  const isAvailable = slot.is_available

                                  return (
                                    <button
                                      key={slot.id}
                                      type="button"
                                      onClick={() => handleSlotSelection(slot)}
                                      disabled={verifyingSlot}
                                      className={`p-4 rounded-2xl border-2 transition-all text-left group relative overflow-hidden ${isSelected
                                          ? 'border-[#1a5858] bg-[#1a5858] text-white shadow-lg scale-[1.02]'
                                          : !isAvailable
                                            ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60 grayscale'
                                            : 'bg-white border-gray-100 hover:border-[#b0e7e7] hover:shadow-md'
                                        }`}
                                    >
                                      {isSelected && (
                                        <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-bl-full flex items-start justify-end p-2">
                                          <CheckCircle className="w-4 h-4 text-white" />
                                        </div>
                                      )}

                                      <div className={`text-base font-bold mb-1 ${isSelected ? 'text-white' : !isAvailable ? 'text-gray-400' : 'text-gray-900'
                                        }`}>
                                        {slot.start_time}
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        {!isAvailable ? (
                                          <span className="text-[10px] uppercase font-black text-gray-400 tracking-tighter">Already Booked</span>
                                        ) : (
                                          <span className={`text-[10px] uppercase font-black tracking-tighter ${isSelected ? 'text-white/80' : 'text-[#3ebdbd]'
                                            }`}>
                                            Finish by {slot.end_time}
                                          </span>
                                        )}
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => selectedSlot && setStep(2)}
                    disabled={!selectedSlot || verifyingSlot}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#b0e7e7] to-[#8adcdc] text-[#1a5858] font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Continue to Details</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit} className="animate-fadeIn">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#b0e7e7]/20 to-[#8adcdc]/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-[#1a5858]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Your Information</h3>
                      <p className="text-sm text-gray-600">Fill in your details to complete booking</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] focus:border-transparent outline-none transition-all"
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] focus:border-transparent outline-none transition-all"
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          <span>Education Level *</span>
                        </span>
                      </label>
                      <select
                        required
                        value={formData.education_level}
                        onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] focus:border-transparent outline-none transition-all"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>Email Address *</span>
                        </span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] focus:border-transparent outline-none transition-all"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>Phone Number *</span>
                        </span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] focus:border-transparent outline-none transition-all"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-gradient-to-r from-[#b0e7e7]/10 to-[#8adcdc]/10 rounded-xl p-5 border border-[#b0e7e7]">
                      <p className="font-medium text-gray-900 mb-3">Booking Summary</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium text-gray-900">
                            {format(new Date(selectedSlot.date), 'EEEE, MMMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium text-gray-900">
                            {selectedSlot.start_time} - {selectedSlot.end_time}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Doctor:</span>
                          <span className="font-medium text-gray-900">{doctor.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#b0e7e7] to-[#8adcdc] text-[#1a5858] font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Confirm Booking</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}