import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function StaffManagement() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
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
      // Note: Direct join with auth.users is not possible from client
      // Email will need to be fetched separately or stored in staff table
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Fetch emails separately if needed
      // For now, we'll just use the staff data
      setStaff(data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
      alert('Error fetching staff: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStaff = async () => {
    try {
      // Simple method: Use signUp API (works with anon key)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (signUpError) {
        // Check if user already exists
        if (signUpError.message.includes('already registered')) {
          // User exists, try to link to staff table
          const { data: existingUser } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          })

          if (existingUser?.user) {
            // Link existing user to staff
            const { error: linkError } = await supabase.from('staff').insert({
              user_id: existingUser.user.id,
              email: formData.email,
              role: formData.role,
              is_active: formData.is_active,
            }).select().single()

            if (linkError && !linkError.message.includes('duplicate')) {
              throw linkError
            }

            alert('Staff account created successfully!')
            setShowModal(false)
            setFormData({ email: '', password: '', role: 'staff', is_active: true })
            fetchStaff()
            return
          }
        }
        throw signUpError
      }

      // User created successfully, link to staff table
      if (signUpData.user) {
        const { error: insertError } = await supabase.from('staff').insert({
          user_id: signUpData.user.id,
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active,
        })

        if (insertError) {
          // If insert fails (e.g., duplicate), check if already exists
          if (insertError.message.includes('duplicate') || insertError.code === '23505') {
            alert('Staff account already exists for this email.')
          } else {
            throw insertError
          }
        } else {
          alert('Staff account created successfully!')
        }

        setShowModal(false)
        setFormData({ email: '', password: '', role: 'staff', is_active: true })
        fetchStaff()
      }
    } catch (error) {
      console.error('Error creating staff:', error)
      alert('Error creating staff: ' + error.message)
    }
  }

  const handleUpdateStaff = async () => {
    try {
      // Simple direct update
      const { error } = await supabase
        .from('staff')
        .update({
          role: formData.role,
          is_active: formData.is_active,
        })
        .eq('id', editingStaff.id)

      if (error) throw error

      // Password update note
      if (formData.password) {
        alert(
          'Staff updated successfully!\n\n' +
          'Note: To update password, go to Supabase Dashboard → Authentication → Users\n' +
          'Find user: ' + formData.email + ' and reset password there.'
        )
      } else {
        alert('Staff account updated successfully')
      }

      setShowModal(false)
      setEditingStaff(null)
      setFormData({ email: '', password: '', role: 'staff', is_active: true })
      fetchStaff()
    } catch (error) {
      console.error('Error updating staff:', error)
      alert('Error updating staff: ' + error.message)
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

  const handleToggleActive = async (staffMember) => {
    try {
      const { error } = await supabase
        .from('staff')
        .update({ is_active: !staffMember.is_active })
        .eq('id', staffMember.id)

      if (error) throw error
      fetchStaff()
    } catch (error) {
      console.error('Error toggling staff status:', error)
      alert('Error updating staff status: ' + error.message)
    }
  }

  const handleDeleteStaff = async (staffMember) => {
    // Prevent deleting yourself
    const { data: { user } } = await supabase.auth.getUser()
    if (user && staffMember.user_id === user.id) {
      alert('You cannot delete your own account')
      return
    }

    const confirmed = confirm(
      `Are you sure you want to permanently delete staff account "${staffMember.email}"?\n\n` +
      `This action cannot be undone. The user will no longer be able to access the system.`
    )

    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffMember.id)

      if (error) throw error

      alert('Staff account deleted successfully')
      fetchStaff()
    } catch (error) {
      console.error('Error deleting staff:', error)
      alert('Error deleting staff: ' + error.message)
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
        <button
          onClick={() => {
            setEditingStaff(null)
            setFormData({ email: '', password: '', role: 'staff', is_active: true })
            setShowModal(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Staff Account
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staff.map((staffMember) => (
              <tr key={staffMember.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {staffMember.email || `User ID: ${staffMember.user_id?.substring(0, 8)}...`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {staffMember.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {staffMember.is_active ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(staffMember.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleEdit(staffMember)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(staffMember)}
                      className={`${
                        staffMember.is_active
                          ? 'text-yellow-600 hover:text-yellow-900'
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {staffMember.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(staffMember)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingStaff ? 'Edit Staff Account' : 'Create Staff Account'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!!editingStaff}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password {editingStaff && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingStaff(null)
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={editingStaff ? handleUpdateStaff : handleCreateStaff}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingStaff ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

