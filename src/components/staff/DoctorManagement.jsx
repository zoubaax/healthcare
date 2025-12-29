import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import TimeSlotManagement from './TimeSlotManagement'

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    description: '',
    profile_image: null,
  })
  const [uploading, setUploading] = useState(false)
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState(null)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDoctors(data || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
      alert('Error fetching doctors: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file) => {
    if (!file) return null

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `doctor-profiles/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('doctor-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('doctor-images').getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const handleCreateDoctor = async () => {
    try {
      let imageUrl = formData.profile_image

      if (formData.profile_image instanceof File) {
        imageUrl = await handleImageUpload(formData.profile_image)
      }

      const { error } = await supabase.from('doctors').insert({
        name: formData.name,
        specialty: formData.specialty,
        description: formData.description,
        profile_image_url: imageUrl,
      })

      if (error) throw error

      alert('Doctor created successfully')
      setShowModal(false)
      setFormData({ name: '', specialty: '', description: '', profile_image: null })
      fetchDoctors()
    } catch (error) {
      console.error('Error creating doctor:', error)
      alert('Error creating doctor: ' + error.message)
    }
  }

  const handleUpdateDoctor = async () => {
    try {
      let imageUrl = editingDoctor.profile_image_url

      if (formData.profile_image instanceof File) {
        imageUrl = await handleImageUpload(formData.profile_image)
      }

      const { error } = await supabase
        .from('doctors')
        .update({
          name: formData.name,
          specialty: formData.specialty,
          description: formData.description,
          profile_image_url: imageUrl,
        })
        .eq('id', editingDoctor.id)

      if (error) throw error

      alert('Doctor updated successfully')
      setShowModal(false)
      setEditingDoctor(null)
      setFormData({ name: '', specialty: '', description: '', profile_image: null })
      fetchDoctors()
    } catch (error) {
      console.error('Error updating doctor:', error)
      alert('Error updating doctor: ' + error.message)
    }
  }

  const handleDeleteDoctor = async (doctorId) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return

    try {
      const { error } = await supabase.from('doctors').delete().eq('id', doctorId)

      if (error) throw error

      alert('Doctor deleted successfully')
      fetchDoctors()
    } catch (error) {
      console.error('Error deleting doctor:', error)
      alert('Error deleting doctor: ' + error.message)
    }
  }

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor)
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      description: doctor.description || '',
      profile_image: null,
    })
    setShowModal(true)
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Doctor Management</h2>
        <button
          onClick={() => {
            setEditingDoctor(null)
            setFormData({ name: '', specialty: '', description: '', profile_image: null })
            setShowModal(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Doctor
        </button>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-lg shadow overflow-hidden">
            {doctor.profile_image_url && (
              <img
                src={doctor.profile_image_url}
                alt={doctor.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{doctor.name}</h3>
              <p className="text-sm text-blue-600 font-medium mb-2">
                {doctor.specialty}
              </p>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {doctor.description}
              </p>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(doctor)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDoctor(doctor.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <button
                  onClick={() => {
                    setSelectedDoctorId(doctor.id)
                    setShowTimeSlotModal(true)
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Manage Time Slots
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingDoctor ? 'Edit Doctor' : 'Add Doctor'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Specialty
                </label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) =>
                    setFormData({ ...formData, specialty: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile_image: e.target.files[0],
                    })
                  }
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {editingDoctor?.profile_image_url && (
                  <img
                    src={editingDoctor.profile_image_url}
                    alt="Current"
                    className="mt-2 h-32 w-32 object-cover rounded"
                  />
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingDoctor(null)
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={editingDoctor ? handleUpdateDoctor : handleCreateDoctor}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading
                  ? 'Uploading...'
                  : editingDoctor
                  ? 'Update'
                  : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Slot Management Modal */}
      {showTimeSlotModal && (
        <TimeSlotManagement
          doctorId={selectedDoctorId}
          onClose={() => {
            setShowTimeSlotModal(false)
            setSelectedDoctorId(null)
          }}
        />
      )}
    </div>
  )
}

