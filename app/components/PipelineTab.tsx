'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Briefcase,
  Plus,
  Building2,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  MoreHorizontal,
  Filter,
  ChevronRight,
  FileText,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Application, ApplicationStatus, CalendarEvent, Note, STATUS_COLORS, STATUS_LABELS } from '../types'

interface PipelineTabProps {
  applications: Application[]
  onAdd: () => void
  onSelect: (app: Application) => void
  events: CalendarEvent[]
  notes: Note[]
}

const STAGE_ORDER: ApplicationStatus[] = ['applied', 'phone-screen', 'first-round', 'second-round', 'superday', 'offer', 'rejected', 'withdrawn', 'accepted']

const STAGE_CONFIG: Record<ApplicationStatus, { label: string; color: string; icon: string }> = {
  applied: { label: 'Applied', color: 'slate', icon: '📤' },
  'phone-screen': { label: 'Phone', color: 'blue', icon: '📞' },
  'first-round': { label: '1st Round', color: 'yellow', icon: '1️⃣' },
  'second-round': { label: '2nd Round', color: 'orange', icon: '2️⃣' },
  superday: { label: 'Superday', color: 'purple', icon: '💼' },
  offer: { label: 'Offer', color: 'emerald', icon: '🎉' },
  rejected: { label: 'Rejected', color: 'red', icon: '❌' },
  withdrawn: { label: 'Withdrawn', color: 'gray', icon: '🚪' },
  accepted: { label: 'Accepted', color: 'green', icon: '✅' },
}

export function PipelineTab({ applications, onAdd, onSelect, events, notes }: PipelineTabProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('active')
  const [expandedStage, setExpandedStage] = useState<ApplicationStatus | null>(null)

  const filteredApps = applications.filter(app => {
    if (filter === 'active') return !['rejected', 'withdrawn', 'accepted'].includes(app.status)
    if (filter === 'closed') return ['rejected', 'withdrawn', 'accepted'].includes(app.status)
    return true
  })

  const getAppEvents = (app: Application) => events.filter(e => e.firm === app.firm)
  const getAppNotes = (app: Application) => notes.filter(n => n.application_id === app.id)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Application Pipeline</h2>
          <p className="text-sm text-slate-400 mt-1">
            {applications.filter(a => !['rejected', 'withdrawn', 'accepted'].includes(a.status)).length} active applications
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            {(['active', 'all', 'closed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === f ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </motion.button>
        </div>
      </div>

      {/* Pipeline Board */}
      {filteredApps.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center"
        >
          <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No applications yet</h3>
          <p className="text-slate-400 mb-6">Start tracking your job applications</p>
          <button 
            onClick={onAdd}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            Add Your First Application
          </button>
        </motion.div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-8 px-8">
          {STAGE_ORDER.filter(stage => filter === 'all' || (filter === 'active' ? !['rejected', 'withdrawn', 'accepted'].includes(stage) : ['rejected', 'withdrawn', 'accepted'].includes(stage))).map((stage) => {
            const stageApps = filteredApps.filter(app => app.status === stage)
            const config = STAGE_CONFIG[stage]
            
            return (
              <motion.div 
                key={stage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-shrink-0 w-80"
              >
                <div className="glass-card">
                  {/* Stage Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{config.icon}</span>
                      <h3 className="font-semibold text-white">{config.label}</h3>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_COLORS[stage].bg} ${STATUS_COLORS[stage].text}`}>
                      {stageApps.length}
                    </span>
                  </div>

                  {/* Applications */}
                  <div className="p-3 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {stageApps.map((app, index) => {
                      const appEvents = getAppEvents(app)
                      const appNotes = getAppNotes(app)
                      const nextEvent = appEvents.find(e => new Date(e.start_time) > new Date())
                      
                      return (
                        <motion.div
                          key={app.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => onSelect(app)}
                          className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-blue-500/30 hover:bg-slate-800 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-slate-400" />
                            </div>
                            {app.compensation && (
                              <div className="flex items-center gap-1 text-xs text-emerald-400">
                                <DollarSign className="w-3 h-3" />
                                <span>{app.compensation}</span>
                              </div>
                            )}
                          </div>
                          
                          <h4 className="font-medium text-slate-200 group-hover:text-white transition-colors">{app.firm}</h4>
                          <p className="text-sm text-slate-400 mb-3">{app.role}</p>
                          
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            {app.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{app.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Progress indicators */}
                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-700/50">
                            {appNotes.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-slate-400">
                                <FileText className="w-3.5 h-3.5" />
                                <span>{appNotes.length}</span>
                              </div>
                            )}
                            {appEvents.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{appEvents.length}</span>
                              </div>
                            )}
                            {nextEvent && (
                              <div className="ml-auto flex items-center gap-1 text-xs text-blue-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{new Date(nextEvent.start_time).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          {/* Deadline warning */}
                          {app.deadline_date && new Date(app.deadline_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                            <div className="flex items-center gap-1.5 mt-3 text-xs text-amber-400">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Due {new Date(app.deadline_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                    
                    {stageApps.length === 0 && (
                      <div className="text-center py-8 text-slate-600">
                        <p className="text-sm">No applications</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Pipeline Summary */}
      {applications.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mt-6"
        >
          <h3 className="font-semibold text-white mb-4">Pipeline Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-2">
            {STAGE_ORDER.map(stage => {
              const count = applications.filter(a => a.status === stage).length
              return (
                <div key={stage} className="text-center p-3 bg-slate-800/30 rounded-xl">
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className="text-xs text-slate-400">{STAGE_CONFIG[stage].label}</div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
