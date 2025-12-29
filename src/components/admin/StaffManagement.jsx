import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Mail,
  Lock,
  UserCog,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  AlertCircle,
  Key,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react'

export default function StaffManagement() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'staff',
    is_active: true,
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setStaff(data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStaff = async () => {
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })
      if (signUpError) throw signUpError
      if (signUpData.user) {
        const { error: insertError } = await supabase.from('staff').insert({
          user_id: signUpData.user.id,
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active,
        })
        if (insertError) throw insertError
        setShowModal(false)
        resetForm()
        fetchStaff()
      }
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const handleUpdateStaff = async () => {
    try {
      const { error } = await supabase
        .from('staff')
        .update({
          role: formData.role,
          is_active: formData.is_active,
        })
        .eq('id', editingStaff.id)
      if (error) throw error
      setShowModal(false)
      resetForm()
      fetchStaff()
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const handleToggleActive = async (staffMember) => {
    try {
      await supabase
        .from('staff')
        .update({ is_active: !staffMember.is_active })
        .eq('id', staffMember.id)
      fetchStaff()
    } catch (error) {
      console.error(error)
      alert('Failed to update status')
    }
  }

  const handleDeleteStaff = async (staffMember) => {
    if (!window.confirm(`Are you sure you want to delete ${staffMember.email}? This action cannot be undone.`)) return
    try {
      const { error } = await supabase.from('staff').delete().eq('id', staffMember.id)
      if (error) throw error
      fetchStaff()
    } catch (error) {
      console.error(error)
      alert('Failed to delete staff member')
    }
  }

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember)
    setFormData({
      email: staffMember.email || '',
      password: '',
      role: staffMember.role,
      is_active: staffMember.is_active,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      role: 'staff',
      is_active: true,
    })
    setEditingStaff(null)
    setShowPassword(false)
  }

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || member.role === filterRole
    return matchesSearch && matchesRole
  })

  const activeStaffCount = staff.filter(m => m.is_active).length
  const adminCount = staff.filter(m => m.role === 'admin').length

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-[#b0e7e7] border-t-[#1a5858] animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading staff members...</p>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] rounded-xl">
            <Users className="w-6 h-6 text-[#1a5858]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
            <p className="text-gray-600">Manage user accounts and permissions for your healthcare platform</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Staff</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{staff.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Accounts</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{activeStaffCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Administrators</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{adminCount}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
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
                placeholder="Search by email or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
              <Filter className="w-4 h-4 text-gray-500" />
              {['all', 'staff', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterRole === role
                    ? 'bg-white text-[#1a5858] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={fetchStaff}
              className="p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
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
              <span>Add Staff</span>
            </button>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Staff Members ({filteredStaff.length})</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredStaff.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-2">No staff members found</p>
              <p className="text-gray-400 text-sm">
                {searchTerm ? 'Try a different search term' : 'Add your first staff member to get started'}
              </p>
            </div>
          ) : (
            filteredStaff.map((member) => (
              <div key={member.id} className="p-6 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] flex items-center justify-center">
                        <span className="text-lg font-semibold text-[#1a5858]">
                          {member.email?.[0].toUpperCase()}
                        </span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${member.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-3">
                        <p className="font-semibold text-gray-900">{member.email}</p>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${member.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                          {member.role === 'admin' ? 'Administrator' : 'Staff'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {new Date(member.created_at).toLocaleDateString()}</span>
                        </span>
                        <span className={`flex items-center space-x-1 ${member.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {member.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          <span>{member.is_active ? 'Active' : 'Inactive'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(member)}
                      className={`p-2 rounded-lg transition-colors ${member.is_active
                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      title={member.is_active ? 'Deactivate account' : 'Activate account'}
                    >
                      {member.is_active ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => handleEdit(member)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit account"
                    >
                      <Edit className="w-5 h-5" />
                    </button>

                    <div className="relative group">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                        <button
                          onClick={() => handleDeleteStaff(member)}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Account</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fadeIn">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#b0e7e7]/20 rounded-lg">
                    {editingStaff ? <UserCog className="w-5 h-5 text-[#1a5858]" /> : <UserPlus className="w-5 h-5 text-[#1a5858]" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {editingStaff ? 'Update Staff Account' : 'Add New Staff'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {editingStaff ? 'Modify account permissions' : 'Create a new staff account'}
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
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {!editingStaff && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>Email Address</span>
                      </div>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] focus:border-transparent outline-none transition-all"
                      placeholder="staff@healthcare.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Key className="w-4 h-4" />
                        <span>Temporary Password</span>
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] focus:border-transparent outline-none pr-12 transition-all"
                        placeholder="Enter secure password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Minimum 8 characters with letters and numbers
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Account Role</span>
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'staff' })}
                    className={`p-4 border rounded-xl transition-all ${formData.role === 'staff'
                      ? 'border-[#b0e7e7] bg-[#b0e7e7]/10 ring-2 ring-[#b0e7e7]/20'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Users className="w-6 h-6 text-gray-600" />
                      <span className="font-medium text-gray-900">Staff</span>
                      <p className="text-xs text-gray-500 text-center">Basic access to patient management</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                    className={`p-4 border rounded-xl transition-all ${formData.role === 'admin'
                      ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Shield className="w-6 h-6 text-purple-600" />
                      <span className="font-medium text-gray-900">Admin</span>
                      <p className="text-xs text-gray-500 text-center">Full system access & management</p>
                    </div>
                  </button>
                </div>
              </div>

              {editingStaff && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Account Status</p>
                    <p className="text-sm text-gray-500">Enable or disable account access</p>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              )}

              {editingStaff && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Note</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Changing email or password requires the user to update their settings.
                        Only role and status can be modified here.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex space-x-3">
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
                onClick={editingStaff ? handleUpdateStaff : handleCreateStaff}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#b0e7e7] to-[#8adcdc] text-[#1a5858] font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                {editingStaff ? 'Update Account' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}