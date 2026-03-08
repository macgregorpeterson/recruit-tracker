'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Application, CalendarEvent } from '../types'
import { AlertCircle, Clock, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react'

interface DeadlineRemindersProps {
  applications: Application[]
  events: CalendarEvent[]
  onViewApplication: (app: Application) => void
  onViewEvent: (event: CalendarEvent) => void
}

interface Reminder {
  id: string
  type: 'offer_deadline' | 'application_deadline' | 'interview' | 'follow_up'
  title: string
  entity: Application | CalendarEvent
  date: Date
  daysUntil: number
  urgency: 'critical' | 'urgent' | 'soon' | 'upcoming'
}

export function DeadlineReminders({ applications, events, onViewApplication, onViewEvent }: DeadlineRemindersProps) {
  const reminders = useMemo(() => {
    const now = new Date()
    const reminders: Reminder[] = []

    // Check offer deadlines
    applications.forEach(app => {
      if (app.offer_deadline) {
        const deadline = new Date(app.offer_deadline)
        const daysUntil = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntil >= -1 && daysUntil <= 14) {
          reminders.push({
            id: `offer-${app.id}`,
            type: 'offer_deadline',
            title: `Offer deadline: ${app.firm}`,
            entity: app,
            date: deadline,
            daysUntil,
            urgency: daysUntil <= 2 ? 'critical' : daysUntil <= 5 ? 'urgent' : 'soon'
          })
        }
      }
    })

    // Check upcoming interviews (next 3 days)
    events.forEach(event => {
      const eventDate = new Date(event.start_time)
      const daysUntil = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntil >= 0 && daysUntil <= 3 && ['phone-screen', 'first-round', 'second-round', 'superday'].includes(event.event_type)) {
        reminders.push({
          id: `interview-${event.id}`,
          type: 'interview',
          title: `${event.event_type === 'superday' ? 'Superday' : 'Interview'}: ${event.firm || event.title}`,
          entity: event,
          date: eventDate,
          daysUntil,
          urgency: daysUntil === 0 ? 'critical' : daysUntil === 1 ? 'urgent' : 'soon'
        })
      }
    })

    // Sort by urgency and date
    const urgencyOrder = { critical: 0, urgent: 1, soon: 2, upcoming: 3 }
    return reminders.sort((a, b) => {
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      }
      return a.daysUntil - b.daysUntil
    }).slice(0, 5)
  }, [applications, events])

  if (reminders.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">No urgent deadlines</h3>
            <p className="text-sm text-slate-400">You're all caught up!</p>
          </div>
        </div>
      </div>
    )
  }

  const getUrgencyStyles = (urgency: Reminder['urgency']) => {
    switch (urgency) {
      case 'critical':
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          badge: 'bg-red-500/20 text-red-400 border-red-500/30',
          dot: 'bg-red-500 animate-pulse'
        }
      case 'urgent':
        return {
          border: 'border-amber-500/30',
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-500'
        }
      case 'soon':
        return {
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/10',
          text: 'text-blue-400',
          badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          dot: 'bg-blue-500'
        }
      default:
        return {
          border: 'border-slate-500/30',
          bg: 'bg-slate-500/10',
          text: 'text-slate-400',
          badge: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
          dot: 'bg-slate-500'
        }
    }
  }

  const formatTimeLeft = (daysUntil: number) => {
    if (daysUntil === 0) return 'Today'
    if (daysUntil === 1) return 'Tomorrow'
    if (daysUntil < 0) return 'Overdue'
    return `${daysUntil} days`
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Upcoming Deadlines</h3>
            <p className="text-sm text-slate-400">{reminders.length} items need attention</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {reminders.map((reminder, index) => {
          const styles = getUrgencyStyles(reminder.urgency)
          const isApplication = reminder.type === 'offer_deadline'
          
          return (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => isApplication 
                ? onViewApplication(reminder.entity as Application)
                : onViewEvent(reminder.entity as CalendarEvent)
              }
              className={`group flex items-center gap-3 p-3 ${styles.bg} rounded-xl border ${styles.border} cursor-pointer hover:brightness-110 transition-all`}
            >
              <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {reminder.type === 'interview' ? (
                    <Calendar className={`w-4 h-4 ${styles.text}`} />
                  ) : (
                    <Clock className={`w-4 h-4 ${styles.text}`} />
                  )}
                  <span className="font-medium text-slate-200 truncate">{reminder.title}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${styles.badge}`}>
                    {formatTimeLeft(reminder.daysUntil)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {reminder.date.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
