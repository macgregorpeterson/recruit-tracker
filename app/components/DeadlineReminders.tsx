'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  X,
  Plus,
  Briefcase,
  Mail
} from 'lucide-react'

interface DeadlineRemindersProps {
  applications: any[]
  events: any[]
}

interface Reminder {
  id: string
  type: 'application' | 'offer_deadline' | 'follow_up' | 'interview'
  title: string
  entity: string
  dueDate: Date
  daysUntil: number
  isUrgent: boolean
}

export function DeadlineReminders({ applications, events }: DeadlineRemindersProps) {
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)

  // Generate smart reminders from applications and events
  const reminders = useMemo(() => {
    const reminderList: Reminder[] = []

    // Application deadline reminders
    applications.forEach((app: any) => {
      if (app.deadline_date && !['rejected', 'withdrawn', 'accepted'].includes(app.status)) {
        const deadline = new Date(app.deadline_date)
        const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        
        if (daysUntil <= 7 && daysUntil >= -1) {
          reminderList.push({
            id: `app-${app.id}`,
            type: 'application',
            title: daysUntil < 0 ? 'Application deadline passed' : 'Application deadline approaching',
            entity: `${app.firm} - ${app.role}`,
            dueDate: deadline,
            daysUntil,
            isUrgent: daysUntil <= 2
          })
        }
      }

      // Offer deadline reminders
      if (app.offer_deadline && app.status === 'offer') {
        const deadline = new Date(app.offer_deadline)
        const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        
        if (daysUntil <= 14) {
          reminderList.push({
            id: `offer-${app.id}`,
            type: 'offer_deadline',
            title: 'Offer decision deadline',
            entity: app.firm,
            dueDate: deadline,
            daysUntil,
            isUrgent: daysUntil <= 3
          })
        }
      }
    })

    // Upcoming interview reminders
    events.forEach((event: any) => {
      const eventDate = new Date(event.start_time)
      const daysUntil = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      
      if (daysUntil >= 0 && daysUntil <= 3) {
        reminderList.push({
          id: `event-${event.id}`,
          type: 'interview',
          title: `Interview: ${event.event_type}`,
          entity: event.title,
          dueDate: eventDate,
          daysUntil,
          isUrgent: daysUntil === 0
        })
      }
    })

    // Follow-up reminders for applied status
    applications
      .filter((app: any) => app.status === 'applied' && app.applied_date)
      .forEach((app: any) => {
        const appliedDate = new Date(app.applied_date)
        const daysSince = Math.floor((Date.now() - appliedDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysSince >= 7 && daysSince <= 14) {
          reminderList.push({
            id: `followup-${app.id}`,
            type: 'follow_up',
            title: 'Follow up on application',
            entity: app.firm,
            dueDate: new Date(),
            daysUntil: 0,
            isUrgent: daysSince >= 10
          })
        }
      })

    return reminderList.sort((a, b) => a.daysUntil - b.daysUntil)
  }, [applications, events])

  const visibleReminders = reminders.filter(r => !dismissedReminders.has(r.id))
  const urgentCount = visibleReminders.filter(r => r.isUrgent).length

  const handleDismiss = (id: string) => {
    setDismissedReminders(prev => new Set([...prev, id]))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'application': return Briefcase
      case 'offer_deadline': return CheckCircle2
      case 'interview': return Calendar
      case 'follow_up': return Mail
      default: return Bell
    }
  }

  const getColor = (type: string, isUrgent: boolean) => {
    if (isUrgent) return { bg: 'bg-red-500/10', icon: 'text-red-400', border: 'border-red-500/30' }
    switch (type) {
      case 'application': return { bg: 'bg-blue-500/10', icon: 'text-blue-400', border: 'border-blue-500/30' }
      case 'offer_deadline': return { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/30' }
      case 'interview': return { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'border-purple-500/30' }
      case 'follow_up': return { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'border-amber-500/30' }
      default: return { bg: 'bg-slate-500/10', icon: 'text-slate-400', border: 'border-slate-500/30' }
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-400" />
            Reminders & Deadlines
            {urgentCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-sm rounded-full">
                {urgentCount} urgent
              </span>
            )}
          </h2>
          <p className="text-slate-400 mt-1">Never miss an important deadline</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg text-sm font-medium hover:from-amber-500 hover:to-orange-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Reminder
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          icon={Briefcase}
          label="App Deadlines"
          count={reminders.filter(r => r.type === 'application').length}
          color="blue"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Offer Deadlines"
          count={reminders.filter(r => r.type === 'offer_deadline').length}
          color="emerald"
        />
        <SummaryCard
          icon={Calendar}
          label="Interviews"
          count={reminders.filter(r => r.type === 'interview').length}
          color="purple"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Urgent"
          count={urgentCount}
          color="red"
        />
      </div>

      {/* Reminders List */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-400" />
          Upcoming Deadlines
        </h3>
        
        {visibleReminders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="text-lg font-medium text-white mb-2">All caught up!</h4>
            <p className="text-slate-400">No upcoming deadlines for the next 2 weeks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleReminders.map((reminder, index) => {
              const Icon = getIcon(reminder.type)
              const colors = getColor(reminder.type, reminder.isUrgent)
              
              return (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${colors.border} ${colors.bg}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg}`}>
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">{reminder.title}</h4>
                      {reminder.isUrgent && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">{reminder.entity}</p>
                  </div>

                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      reminder.daysUntil < 0 ? 'text-red-400' :
                      reminder.daysUntil === 0 ? 'text-amber-400' :
                      reminder.daysUntil <= 2 ? 'text-orange-400' :
                      'text-slate-300'
                    }`}>
                      {reminder.daysUntil < 0 
                        ? `${Math.abs(reminder.daysUntil)} days overdue`
                        : reminder.daysUntil === 0 
                        ? 'Today'
                        : reminder.daysUntil === 1
                        ? 'Tomorrow'
                        : `${reminder.daysUntil} days left`
                      }
                    </div>
                    <div className="text-xs text-slate-500">
                      {reminder.dueDate.toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDismiss(reminder.id)}
                    className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tips */}
      {visibleReminders.some(r => r.isUrgent) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 bg-red-500/5 border-red-500/20"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-white">Action Required</h4>
              <p className="text-sm text-slate-400 mt-1">
                You have urgent deadlines approaching. Prioritize these to stay on track with your recruiting process.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Reminder Modal (simplified) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Add Custom Reminder</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200"
                  placeholder="e.g., Send thank you email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Due Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-medium"
                >
                  Add Reminder
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ 
  icon: Icon, 
  label, 
  count, 
  color 
}: { 
  icon: React.ElementType
  label: string
  count: number
  color: string
}) {
  const colors: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400' },
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400' },
    red: { bg: 'bg-red-500/10', icon: 'text-red-400' },
  }

  const c = colors[color]

  return (
    <div className="glass-card p-4">
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div className="text-2xl font-bold text-white">{count}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  )
}
