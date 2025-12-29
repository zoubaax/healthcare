import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { format } from 'date-fns'
import { 
  Calendar,
  Clock,
  Mail,
  Phone,
  Filter,
  RefreshCw,
  User,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Search,
  ChevronRight
} from 'lucide-react'

export default function ActivityLogs() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchLogs()
    }, [filter])

    const fetchLogs = async () => {
        try {
            setLoading(true)

            let query = supabase
                .from('appointments')
                .select(`
          *,
          doctors:doctor_id(name, specialty),
          time_slots:time_slot_id(date, start_time, end_time)
        `)
                .order('updated_at', { ascending: false })
                .limit(50)

            if (filter === 'bookings') {
                query = query.eq('status', 'pending')
            } else if (filter === 'confirmations') {
                query = query.eq('status', 'confirmed')
            } else if (filter === 'cancellations') {
                query = query.eq('status', 'cancelled')
            }

            const { data, error } = await query

            if (error) throw error
            setLogs(data || [])
        } catch (error) {
            console.error('Error fetching logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <AlertCircle className="w-5 h-5" />
            case 'confirmed':
                return <CheckCircle className="w-5 h-5" />
            case 'cancelled':
                return <XCircle className="w-5 h-5" />
            default:
                return <Activity className="w-5 h-5" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-200'
            case 'confirmed':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200'
            case 'cancelled':
                return 'bg-rose-50 text-rose-700 border-rose-200'
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }

    const filteredLogs = logs.filter(log => 
        `${log.first_name} ${log.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.doctors?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-3 border-[#b0e7e7] border-t-transparent"></div>
                <p className="text-gray-600 font-medium">Loading activity logs...</p>
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center space-x-3 mb-2">
                    <Activity className="w-8 h-8 text-[#b0e7e7]" />
                    <h2 className="text-3xl font-bold text-gray-900">Activity Logs</h2>
                </div>
                <p className="text-gray-600">Monitor all appointment activities in real-time</p>
            </div>

            {/* Controls Section */}
            <div className="mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by patient, doctor, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b0e7e7] focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Filter & Refresh */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                            <Filter className="w-4 h-4 text-gray-500" />
                            {['all', 'bookings', 'confirmations', 'cancellations'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === f
                                            ? 'bg-white text-[#b0e7e7] shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={fetchLogs}
                            className="p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Refresh logs"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Logs</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{logs.length}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Activity className="w-6 h-6 text-[#b0e7e7]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Pending</p>
                            <p className="text-2xl font-bold text-amber-600 mt-1">
                                {logs.filter(l => l.status === 'pending').length}
                            </p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-amber-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Confirmed</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">
                                {logs.filter(l => l.status === 'confirmed').length}
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Cancelled</p>
                            <p className="text-2xl font-bold text-rose-600 mt-1">
                                {logs.filter(l => l.status === 'cancelled').length}
                            </p>
                        </div>
                        <div className="p-3 bg-rose-50 rounded-lg">
                            <XCircle className="w-6 h-6 text-rose-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                </div>

                <div className="divide-y divide-gray-100">
                    {filteredLogs.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Activity className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium mb-2">No activity logs found</p>
                            <p className="text-gray-400 text-sm">
                                {searchTerm ? 'Try a different search term' : 'No appointments match the selected filter'}
                            </p>
                        </div>
                    ) : (
                        filteredLogs.map((log) => (
                            <div
                                key={log.id}
                                className="p-6 hover:bg-gray-50 transition-all duration-200 group"
                            >
                                <div className="flex items-start space-x-4">
                                    {/* Status Icon with accent line */}
                                    <div className="relative">
                                        <div className={`p-3 rounded-lg border ${getStatusColor(log.status)}`}>
                                            {getStatusIcon(log.status)}
                                        </div>
                                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-px h-6 bg-gray-200 group-last:hidden"></div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-gray-50 rounded-lg">
                                                    <User className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {log.first_name} {log.last_name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-0.5">
                                                        Patient ID: {log.id.slice(0, 8)}...
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${getStatusColor(
                                                    log.status
                                                )} self-start sm:self-center`}
                                            >
                                                {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                                            </span>
                                        </div>
                                        
                                        <div className="mt-4 pl-11 space-y-3">
                                            {/* Doctor Info */}
                                            <div className="flex items-center space-x-3">
                                                <Stethoscope className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    <span className="font-medium">
                                                        {log.doctors?.name || 'Unknown Doctor'}
                                                    </span>
                                                    {log.doctors?.specialty && (
                                                        <span className="text-gray-400">
                                                            {' '}({log.doctors.specialty})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>

                                            {/* Appointment Details */}
                                            <div className="flex flex-wrap items-center gap-4">
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span>
                                                        {log.time_slots?.date
                                                            ? format(new Date(log.time_slots.date), 'MMM dd, yyyy')
                                                            : 'Date not set'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span>
                                                        {log.time_slots?.start_time || '--:--'} -{' '}
                                                        {log.time_slots?.end_time || '--:--'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="flex flex-wrap items-center gap-4">
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span>{log.email}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span>{log.phone_number}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Last Updated */}
                                        <div className="mt-4 pl-11 pt-4 border-t border-gray-100">
                                            <p className="text-xs text-gray-400">
                                                Last updated:{' '}
                                                <span className="font-medium">
                                                    {format(
                                                        new Date(log.updated_at),
                                                        'MMM dd, yyyy • HH:mm:ss'
                                                    )}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {filteredLogs.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Showing {filteredLogs.length} of {logs.length} logs</span>
                            <span className="flex items-center space-x-1">
                                <span className="w-2 h-2 bg-[#b0e7e7] rounded-full"></span>
                                <span>Real-time updates</span>
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}