import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { format } from 'date-fns'

export default function TimeSlotManagement({ doctorId, onClose }) {
  const [timeSlots, setTimeSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    is_available: true,
  })

  useEffect(() => {
    if (doctorId) {
      fetchTimeSlots()
    }
  }, [doctorId])

  const fetchTimeSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error
      setTimeSlots(data || [])
    } catch (error) {
      console.error('Error fetching time slots:', error)
      alert('Error fetching time slots: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTimeSlot = async () => {
    try {
      const { error } = await supabase.from('time_slots').insert({
        doctor_id: doctorId,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        is_available: formData.is_available,
      })

      if (error) throw error

      alert('Time slot added successfully')
      setFormData({ date: '', start_time: '', end_time: '', is_available: true })
      fetchTimeSlots()
    } catch (error) {
      console.error('Error adding time slot:', error)
      alert('Error adding time slot: ' + error.message)
    }
  }

  const handleDeleteTimeSlot = async (slotId) => {
    if (!confirm('Are you sure you want to delete this time slot?')) return

    try {
      const { error } = await supabase
        .from('time_slots')
        .delete()
        .eq('id', slotId)

      if (error) throw error

      alert('Time slot deleted successfully')
      fetchTimeSlots()
    } catch (error) {
      console.error('Error deleting time slot:', error)
      alert('Error deleting time slot: ' + error.message)
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
      console.error('Error updating time slot:', error)
      alert('Error updating time slot: ' + error.message)
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Manage Time Slots</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Add Time Slot Form */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Add New Time Slot</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddTimeSlot}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Slot
              </button>
            </div>
          </div>
        </div>

        {/* Time Slots List */}
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.map((slot) => (
                <tr key={slot.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(slot.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {slot.start_time} - {slot.end_time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {slot.is_available ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Unavailable
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleToggleAvailable(slot)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      {slot.is_available ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                    <button
                      onClick={() => handleDeleteTimeSlot(slot.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {timeSlots.length === 0 && (
            <p className="text-center text-gray-500 py-8">No time slots added yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

