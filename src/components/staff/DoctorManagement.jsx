import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import TimeSlotManagement from './TimeSlotManagement'
import {
  Stethoscope,
  UserPlus,
  Edit,
  Trash2,
  Calendar,
  Image as ImageIcon,
  Upload,
  X,
  CheckCircle,
  UserCircle,
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  Eye,
  Clock,
  Award,
  Mail,
  Phone,
  Globe
} from 'lucide-react'

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    description: '',
    email: '',
    phone: '',
    profile_image: null,
  })
  const [uploading, setUploading] = useState(false)
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState(null)
  const [selectedDoctorName, setSelectedDoctorName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialty, setFilterSpecialty] = useState('all')

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('doctors')
        .select('*, appointments:appointments(count)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDoctors(data || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
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
      const { data: { publicUrl } } = supabase.storage.from('doctor-images').getPublicUrl(filePath)
      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const handleCreateDoctor = async () => {
    if (!formData.name || !formData.specialty) {
      alert('Please fill in required fields')
      return
    }

    try {
      let imageUrl = formData.profile_image
      if (formData.profile_image instanceof File) {
        imageUrl = await handleImageUpload(formData.profile_image)
      }
      const { error } = await supabase.from('doctors').insert({
        name: formData.name,
        specialty: formData.specialty,
        description: formData.description,
        email: formData.email,
        phone: formData.phone,
        profile_image_url: imageUrl,
      })
      if (error) throw error
      setShowModal(false)
      resetForm()
      fetchDoctors()
    } catch (error) {
      alert('Error creating doctor: ' + error.message)
    }
  }

  const handleUpdateDoctor = async () => {
    if (!formData.name || !formData.specialty) {
      alert('Please fill in required fields')
      return
    }

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
          email: formData.email,
          phone: formData.phone,
          profile_image_url: imageUrl,
        })
        .eq('id', editingDoctor.id)
      if (error) throw error
      setShowModal(false)
      resetForm()
      fetchDoctors()
    } catch (error) {
      alert('Error updating doctor: ' + error.message)
    }
  }

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) return
    try {
      const { error } = await supabase.from('doctors').delete().eq('id', doctorId)
      if (error) throw error
      fetchDoctors()
    } catch (error) {
      alert('Error deleting doctor: ' + error.message)
    }
  }

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor)
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      description: doctor.description || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      profile_image: null,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      specialty: '',
      description: '',
      email: '',
      phone: '',
      profile_image: null,
    })
    setEditingDoctor(null)
  }

  const specialties = [...new Set(doctors.map(d => d.specialty).filter(Boolean))]

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterSpecialty === 'all' || doctor.specialty === filterSpecialty

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-[#b0e7e7] border-t-[#1a5858] animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading doctors...</p>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] rounded-xl">
            <Stethoscope className="w-6 h-6 text-[#1a5858]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Doctor Management</h2>
            <p className="text-gray-600">Manage the medical team and their public information</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Doctors</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{doctors.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Specialties</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{specialties.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {doctors.reduce((sum, doctor) => sum + (doctor.appointments?.[0]?.count || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Profiles</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{doctors.length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
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
                placeholder="Search by name, specialty, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
              <Filter className="w-4 h-4 text-gray-500" />
              <button
                onClick={() => setFilterSpecialty('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterSpecialty === 'all'
                  ? 'bg-white text-[#1a5858] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                All
              </button>
              {specialties.slice(0, 3).map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => setFilterSpecialty(specialty)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterSpecialty === specialty
                    ? 'bg-white text-[#1a5858] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {specialty}
                </button>
              ))}
            </div>

            <button
              onClick={fetchDoctors}
              className="p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh doctors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#b0e7e7] to-[#8adcdc] text-[#1a5858] font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              <UserPlus className="w-5 h-5" />
              <span>Add Doctor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Stethoscope className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-2">No doctors found</p>
              <p className="text-gray-400 text-sm">
                {searchTerm ? 'Try a different search term' : 'Add your first doctor to get started'}
              </p>
            </div>
          </div>
        ) : (
          filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
              {/* Doctor Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                {doctor.profile_image_url ? (
                  <img
                    src={doctor.profile_image_url}
                    alt={doctor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] flex items-center justify-center">
                      <UserCircle className="w-12 h-12 text-[#1a5858]" />
                    </div>
                  </div>
                )}

                {/* Actions Overlay */}
                <div className="absolute top-3 right-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleEdit(doctor)}
                    className="p-2 bg-white/90 backdrop-blur-sm text-blue-600 rounded-lg hover:bg-white transition-colors shadow-sm"
                    title="Edit doctor"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDoctor(doctor.id)}
                    className="p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-lg hover:bg-white transition-colors shadow-sm"
                    title="Delete doctor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="relative group">
                    <button className="p-2 bg-white/90 backdrop-blur-sm text-gray-600 rounded-lg hover:bg-white transition-colors shadow-sm">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        {doctor.specialty}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{doctor.appointments?.[0]?.count || 0}</p>
                    <p className="text-xs text-gray-500">appointments</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {doctor.description || 'Professional healthcare provider dedicated to patient wellness.'}
                </p>

                {/* Contact Info */}
                {(doctor.email || doctor.phone) && (
                  <div className="space-y-2 mb-4">
                    {doctor.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{doctor.email}</span>
                      </div>
                    )}
                    {doctor.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{doctor.phone}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedDoctorId(doctor.id)
                      setSelectedDoctorName(doctor.name)
                      setShowTimeSlotModal(true)
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#b0e7e7] to-[#8adcdc] text-[#1a5858] font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Manage Availability</span>
                  </button>

                  <button
                    onClick={() => handleEdit(doctor)}
                    className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Quick edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#b0e7e7]/20 rounded-lg">
                  {editingDoctor ? <Edit className="w-5 h-5 text-[#1a5858]" /> : <UserPlus className="w-5 h-5 text-[#1a5858]" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {editingDoctor ? 'Update Doctor Profile' : 'Add New Doctor'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {editingDoctor ? 'Modify doctor information' : 'Create a new doctor profile'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center space-x-2">
                      <UserCircle className="w-4 h-4" />
                      <span>Full Name *</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] focus:border-transparent outline-none transition-all"
                    placeholder="Dr. John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center space-x-2">
                      <Award className="w-4 h-4" />
                      <span>Specialty *</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] focus:border-transparent outline-none transition-all"
                    placeholder="Clinical Psychologist"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] focus:border-transparent outline-none transition-all"
                      placeholder="doctor@healthcare.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>Phone</span>
                      </span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] focus:border-transparent outline-none transition-all"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Tell us about the doctor's experience, qualifications, and approach..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>Profile Image</span>
                    </span>
                  </label>
                  <div className="mt-2">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                        {(editingDoctor?.profile_image_url && !formData.profile_image) ? (
                          <img
                            src={editingDoctor.profile_image_url}
                            alt="Current"
                            className="w-full h-full object-cover"
                          />
                        ) : formData.profile_image instanceof File ? (
                          <div className="text-center p-2">
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                            <span className="text-xs text-gray-500 truncate block">
                              {formData.profile_image.name}
                            </span>
                          </div>
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block">
                          <span className="sr-only">Choose profile image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFormData({ ...formData, profile_image: e.target.files[0] })}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#b0e7e7] file:text-[#1a5858] hover:file:bg-[#8adcdc] cursor-pointer"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Recommended: Square image, 500x500px, max 2MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingDoctor ? handleUpdateDoctor : handleCreateDoctor}
                disabled={uploading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#b0e7e7] to-[#8adcdc] text-[#1a5858] font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {uploading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </span>
                ) : editingDoctor ? (
                  'Update Profile'
                ) : (
                  'Add Doctor'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Slot Management Modal */}
      {showTimeSlotModal && (
        <TimeSlotManagement
          doctorId={selectedDoctorId}
          doctorName={selectedDoctorName}
          onClose={() => {
            setShowTimeSlotModal(false)
            setSelectedDoctorId(null)
            setSelectedDoctorName('')
          }}
        />
      )}
    </div>
  )
}