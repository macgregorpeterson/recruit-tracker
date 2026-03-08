'use client'

import { useState } from 'react'
import { motion, Reorder, AnimatePresence } from 'framer-motion'
import { 
  Briefcase,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  ExternalLink,
  ChevronRight,
  Trash2,
  Edit3,
  CheckCircle2,
  X,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react'
import { ApplicationStatus, STATUS_COLORS, STATUS_LABELS, STATUS_ORDER } from '../types'

interface PipelineKanbanProps {
  applications: any[]
  contacts: any[]
  onUpdateStatus: (appId: string, newStatus: ApplicationStatus) => void
  onDelete: (appId: string) => void
}

const COLUMN_CONFIG: Record<ApplicationStatus, { color: string; icon: React.ElementType }> = {
  'applied': { color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: Briefcase },
  'phone-screen': { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Briefcase },
  'first-round': { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: Briefcase },
  'second-round': { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', icon: Briefcase },
  'superday': { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: Briefcase },
  'offer': { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle2 },
  'rejected': { color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: X },
  'withdrawn': { color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', icon: X },
  'accepted': { color: 'bg-green-500/20 text-green-300 border-green-500/30', icon: CheckCircle2 },
}

export function PipelineKanban({ applications, contacts, onUpdateStatus, onDelete }: PipelineKanbanProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'firm' | 'priority'>('date')
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  // Filter and sort applications
  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.firm?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    }
    if (sortBy === 'firm') {
      return (a.firm || '').localeCompare(b.firm || '')
    }
    return 0
  })

  // Group by status
  const columns = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = filteredApps.filter(app => app.status === status)
    return acc
  }, {} as Record<ApplicationStatus, any[]>)

  // Calculate stats
  const stats = {
    total: applications.length,
    active: applications.filter(a => !['rejected', 'withdrawn', 'accepted'].includes(a.status)).length,
    offers: applications.filter(a => a.status === 'offer').length,
    interviews: applications.filter(a => ['phone-screen', 'first-round', 'second-round', 'superday'].includes(a.status)).length,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            Pipeline
          </h2>
          <p className="text-slate-400 mt-1">
            {stats.active} active applications • {stats.offers} offers • {stats.interviews} in interview process
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'kanban'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              List
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          value={stats.total} 
          label="Total Applied" 
          icon={Briefcase} 
          color="indigo"
          trend={stats.total > 0 ? `+${stats.total} this season` : undefined}
        />
        <StatCard 
          value={stats.active} 
          label="Active Pipeline" 
          icon={TrendingUp} 
          color="blue"
          trend={Math.round((stats.active / Math.max(stats.total, 1)) * 100) + '% response rate'}
        />
        <StatCard 
          value={stats.interviews} 
          label="Interviews" 
          icon={Zap} 
          color="amber"
        />
        <StatCard 
          value={stats.offers} 
          label="Offers" 
          icon={CheckCircle2} 
          color="emerald"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search firms, roles, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="all">All Statuses</option>
            {STATUS_ORDER.map(status => (
              <option key={status} value={status}>{STATUS_LABELS[status]}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="date">Sort by Date</option>
            <option value="firm">Sort by Firm</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>
      </div>

      {/* Board View */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
          {STATUS_ORDER.filter(status => filterStatus === 'all' || status === filterStatus).map((status) => {
            const apps = columns[status] || []
            const config = COLUMN_CONFIG[status]
            const Icon = config.icon

            return (
              <div key={status} className="flex-shrink-0 w-80">
                <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
                  {/* Column Header */}
                  <div className="p-4 border-b border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="font-semibold text-slate-200">{STATUS_LABELS[status]}</h3>
                      </div>
                      <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full font-medium">
                        {apps.length}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          status === 'offer' ? 'bg-emerald-500' :
                          status === 'rejected' ? 'bg-red-500' :
                          status === 'applied' ? 'bg-slate-500' :
                          status === 'phone-screen' ? 'bg-blue-500' :
                          status === 'first-round' ? 'bg-yellow-500' :
                          status === 'second-round' ? 'bg-orange-500' :
                          status === 'superday' ? 'bg-purple-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${Math.max((apps.length / Math.max(filteredApps.length, 1)) * 100, 5)}%` }}
                      />
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="p-3 space-y-3 min-h-[200px]">
                    <AnimatePresence>
                      {apps.map((app, index) => (
                        <motion.div
                          key={app.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setSelectedApp(app)}
                          className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-slate-400" />
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded transition-all">
                              <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </button>
                          </div>
                          
                          <h4 className="font-semibold text-slate-200 mb-1 group-hover:text-white transition-colors">
                            {app.firm}
                          </h4>
                          <p className="text-sm text-slate-400 mb-3">{app.role}</p>
                          
                          {app.location && (
                            <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                              <MapPin className="w-3 h-3" />
                              {app.location}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                            <span className="text-xs text-slate-500">
                              {app.applied_date 
                                ? new Date(app.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : 'Recently'
                              }
                            </span>
                            {app.compensation && (
                              <span className="text-xs text-emerald-400 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {app.compensation}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {apps.length === 0 && (
                      <div className="text-center py-8 text-slate-600">
                        <p className="text-sm">No applications</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Firm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Applied</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Location</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <AnimatePresence>
                {filteredApps.map((app) => (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedApp(app)}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="font-medium text-slate-200">{app.firm}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{app.role}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[app.status] || STATUS_COLORS['applied']}`}>
                        {STATUS_LABELS[app.status] || app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {app.applied_date ? new Date(app.applied_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{app.location || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-500 hover:text-slate-300">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredApps.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">No applications found</p>
              <p className="text-sm text-slate-600 mt-1">Try adjusting your filters or add a new application</p>
            </div>
          )}
        </div>
      )}

      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setSelectedApp(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-strong rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedApp.firm}</h2>
                      <p className="text-slate-400">{selectedApp.role}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[selectedApp.status]}`}>
                          {STATUS_LABELS[selectedApp.status]}
                        </span>
                        {selectedApp.location && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {selectedApp.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Status Update */}
                <div>
                  <h3 className="font-semibold text-white mb-3">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_ORDER.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          onUpdateStatus(selectedApp.id, status)
                          setSelectedApp({ ...selectedApp, status })
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedApp.status === status
                            ? STATUS_COLORS[status]
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {STATUS_LABELS[status]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="font-semibold text-white mb-3">Application Timeline</h3>
                  <div className="space-y-3">
                    <TimelineItem 
                      icon={CheckCircle2} 
                      title="Application Submitted" 
                      date={selectedApp.applied_date}
                      completed
                    />
                    <TimelineItem 
                      icon={Zap} 
                      title="Phone Screen" 
                      date={selectedApp.phone_screen_date}
                      completed={['phone-screen', 'first-round', 'second-round', 'superday', 'offer', 'rejected'].includes(selectedApp.status)}
                      active={selectedApp.status === 'phone-screen'}
                    />
                    <TimelineItem 
                      icon={Target} 
                      title="First Round" 
                      date={selectedApp.first_round_date}
                      completed={['first-round', 'second-round', 'superday', 'offer', 'rejected'].includes(selectedApp.status)}
                      active={selectedApp.status === 'first-round'}
                    />
                    <TimelineItem 
                      icon={Target} 
                      title="Second Round" 
                      date={selectedApp.second_round_date}
                      completed={['second-round', 'superday', 'offer', 'rejected'].includes(selectedApp.status)}
                      active={selectedApp.status === 'second-round'}
                    />
                    <TimelineItem 
                      icon={Briefcase} 
                      title="Superday" 
                      date={selectedApp.superday_date}
                      completed={['superday', 'offer', 'rejected'].includes(selectedApp.status)}
                      active={selectedApp.status === 'superday'}
                    />
                    <TimelineItem 
                      icon={Trophy} 
                      title={selectedApp.status === 'rejected' ? 'Rejected' : 'Offer'} 
                      date={selectedApp.offer_date}
                      completed={['offer', 'rejected'].includes(selectedApp.status)}
                      active={selectedApp.status === 'offer'}
                      isNegative={selectedApp.status === 'rejected'}
                    />
                  </div>
                </div>

                {/* Compensation */}
                {selectedApp.compensation && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      Compensation
                    </h3>
                    <p className="text-emerald-400 font-medium">{selectedApp.compensation}</p>
                  </div>
                )}

                {/* Notes */}
                {selectedApp.notes && (
                  <div>
                    <h3 className="font-semibold text-white mb-2">Notes</h3>
                    <p className="text-slate-300 text-sm bg-slate-800/50 p-4 rounded-lg">{selectedApp.notes}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-700/50 flex justify-between">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this application?')) {
                      onDelete(selectedApp.id)
                      setSelectedApp(null)
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCard({ value, label, icon: Icon, color, trend }: { 
  value: number; 
  label: string; 
  icon: any; 
  color: string;
  trend?: string;
}) {
  const colorClasses: Record<string, { bg: string; icon: string }> = {
    indigo: { bg: 'bg-indigo-500/10', icon: 'text-indigo-400' },
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400' },
    amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400' },
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400' },
  }

  const colors = colorClasses[color]

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
      </div>
      <div className="text-sm text-slate-400">{label}</div>
      {trend && (
        <div className="text-xs text-slate-500 mt-1">{trend}</div>
      )}
    </div>
  )
}

function TimelineItem({ 
  icon: Icon, 
  title, 
  date, 
  completed, 
  active,
  isNegative 
}: { 
  icon: any; 
  title: string; 
  date?: string;
  completed?: boolean;
  active?: boolean;
  isNegative?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        completed
          ? isNegative 
            ? 'bg-red-500/20 text-red-400'
            : 'bg-emerald-500/20 text-emerald-400'
          : active
            ? 'bg-blue-500/20 text-blue-400 animate-pulse'
            : 'bg-slate-800 text-slate-500'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${
          completed || active ? 'text-white' : 'text-slate-500'
        }`}>
          {title}
        </p>
        {date && (
          <p className="text-xs text-slate-500">
            {new Date(date).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  )
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
