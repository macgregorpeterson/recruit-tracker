'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertCircle, 
  Clock, 
  Calendar, 
  Briefcase, 
  DollarSign,
  Mail,
  Phone,
  CheckCircle2,
  X,
  Bell,
  Filter,
  SortAsc
} from 'lucide-react'
import { Application, CalendarEvent, DeadlineReminder } from '../types'

interface DeadlineRemindersProps {
  applications: Application[]
  events: CalendarEvent[]
  onUpdateApplication: (id: string, updates: Partial<Application>) => Promise<void>
}

type ReminderType = 'application' | 'offer_deadline' | 'follow_up' | 'interview_prep'
type SortBy = 'date' | 'urgency' | 'type'

interface Reminder {
  id: string
  type: ReminderType
  title: string
  entityId: string
  dueDate: Date
  firm?: string
  description?: string
  isUrgent: boolean
  isCompleted: boolean
}

export function DeadlineReminders({ applications, events, onUpdateApplication }: DeadlineRemindersProps) {
  const [filter, setFilter] = useState<ReminderType | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortBy>('urgency')
  const [completedReminders, setCompletedReminders] = useState<Set<string>>(new Set())
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(new Set())

  const reminders = useMemo(() => {
    const list: Reminder[] = []

    // Application deadlines
    applications.forEach(app => {
      if (app.deadline_date && !app.applied_date) {
        const daysUntil = Math.ceil((new Date(app.deadline_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        list.push({
          id: `app-${app.id}`,
          type: 'application',
          title: `Apply to ${app.firm}`,
          entityId: app.id,
          dueDate: new Date(app.deadline_date),
          firm: app.firm,
          description: app.role,
          isUrgent: daysUntil <= 3,
          isCompleted: false
        })
      }

      // Offer deadlines
      if (app.offer_deadline && app.status === 'offer') {
        const daysUntil = Math.ceil((new Date(app.offer_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        list.push({
          id: `offer-${app.id}`,
          type: 'offer_deadline',
          title: `Decision deadline: ${app.firm}`,
          entityId: app.id,
          dueDate: new Date(app.offer_deadline),
          firm: app.firm,
          description: `Compensation: ${app.compensation || 'TBD'}`,
          isUrgent: daysUntil <= 5,
          isCompleted: false
        })
      }
    })

    // Upcoming interview reminders (24h before)
    events.forEach(event => {
      const eventDate = new Date(event.start_time)
      const hoursUntil = (eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60)
      
      if (hoursUntil > 0 && hoursUntil <= 48 && ['phone-screen', 'first-round', 'superday'].includes(event.event_type)) {
        list.push({
          id: `prep-${event.id}`,
          type: 'interview_prep',
          title: `Prep for ${event.title}`,
          entityId: event.id,
          dueDate: new Date(eventDate.getTime() - 24 * 60 * 60 * 1000), // Due 24h before
          firm: event.firm,
          description: `${event.event_type} scheduled`,
          isUrgent: hoursUntil <= 12,
          isCompleted: false
        })
      }
    })

    return list.filter(r => !dismissedReminders.has(r.id))
  }, [applications, events, dismissedReminders])

  const filteredReminders = useMemo(() => {
    let filtered = filter === 'all' ? reminders : reminders.filter(r => r.type === filter)
    
    return filtered.sort((a, b) => {
      if (sortBy === 'urgency') {
        if (a.isUrgent && !b.isUrgent) return -1
        if (!a.isUrgent && b.isUrgent) return 1
        return a.dueDate.getTime() - b.dueDate.getTime()
      }
      if (sortBy === 'date') {
        return a.dueDate.getTime() - b.dueDate.getTime()
      }
      return a.type.localeCompare(b.type)
    })
  }, [reminders, filter, sortBy])

  const handleComplete = (reminderId: string) => {
    setCompletedReminders(prev => new Set([...prev, reminderId]))
    setTimeout(() => {
      setDismissedReminders(prev => new Set([...prev, reminderId]))
    }, 1000)
  }

  const handleDismiss = (reminderId: string) => {
    setDismissedReminders(prev => new Set([...prev, reminderId]))
  }

  const getTypeIcon = (type: ReminderType) => {
    switch (type) {
      case 'application': return <Briefcase className="w-4 h-4" />
      case 'offer_deadline': return <DollarSign className="w-4 h-4" />
      case 'follow_up': return <Mail className="w-4 h-4" />
      case 'interview_prep': return <Phone className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: ReminderType) => {
    switch (type) {
      case 'application': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'offer_deadline': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'follow_up': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'interview_prep': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
  }

  const getTypeLabel = (type: ReminderType) => {
    switch (type) {
      case 'application': return 'Application'
      case 'offer_deadline': return 'Offer Decision'
      case 'follow_up': return 'Follow-up'
      case 'interview_prep': return 'Interview Prep'
    }
  }

  const formatTimeRemaining = (date: Date) => {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    const hours = Math.ceil(diff / (1000 * 60 * 60))

    if (days > 1) return `${days} days left`
    if (hours > 1) return `${hours} hours left`
    return 'Due soon'
  }

  if (reminders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 text-center"
      >
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">All Caught Up!</h3>
        <p className="text-slate-400 text-sm">No pending deadlines or reminders</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Deadline Reminders</h3>
              <p className="text-sm text-slate-400">{filteredReminders.length} pending reminders</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Urgent: {filteredReminders.filter(r => r.isUrgent).length}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          {(['all', 'application', 'offer_deadline', 'interview_prep'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === type
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-transparent'
              }`}
            >
              {type === 'all' ? 'All' : getTypeLabel(type)}
            </button>
          ))}
          <div className="h-4 w-px bg-slate-700 mx-2" />
          <SortAsc className="w-4 h-4 text-slate-500" />
          {(['urgency', 'date', 'type'] as const).map(sort => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === sort
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {sort.charAt(0).toUpperCase() + sort.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Reminders List */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        <AnimatePresence>
          {filteredReminders.map((reminder, index) => {
            const isCompleted = completedReminders.has(reminder.id)
            
            return (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isCompleted ? 0.5 : 1, x: 0, scale: isCompleted ? 0.98 : 1 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative p-4 rounded-xl border transition-all ${
                  reminder.isUrgent
                    ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                    : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600'
                }`}
              >
                {reminder.isUrgent && (
                  <div className="absolute -top-1 -right-1">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Complete checkbox */}
                  <button
                    onClick={() => handleComplete(reminder.id)}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-600 hover:border-emerald-500'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </button>

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeColor(reminder.type)}`}>
                    {getTypeIcon(reminder.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-200">{reminder.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getTypeColor(reminder.type)}`}>
                        {getTypeLabel(reminder.type)}
                      </span>
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-slate-500 mb-1">{reminder.description}</p>
                    )}
                    <div className="flex items-center gap-3">
                      <span className={`text-xs flex items-center gap-1 ${
                        reminder.isUrgent ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {formatTimeRemaining(reminder.dueDate)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {reminder.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Dismiss button */}
                  <button
                    onClick={() => handleDismiss(reminder.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Footer stats */}
      <div className="p-4 bg-slate-800/30 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            {filteredReminders.filter(r => r.isUrgent).length} urgent reminders
          </span>
          <button 
            onClick={() => setDismissedReminders(new Set())}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Show dismissed
          </button>
        </div>
      </div>
    </motion.div>
  )
}
