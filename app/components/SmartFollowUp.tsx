'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Contact, CalendarEvent } from '../types'
import { User, Clock, ArrowRight, Calendar, Lightbulb, Zap } from 'lucide-react'

interface SmartFollowUpProps {
  contacts: Contact[]
  events: CalendarEvent[]
  onScheduleFollowUp: (contact: Contact) => void
  onViewContact: (contact: Contact) => void
}

interface FollowUpSuggestion {
  contact: Contact
  lastEvent: CalendarEvent | null
  daysSince: number
  priority: 'high' | 'medium' | 'low'
  reason: string
}

export function SmartFollowUp({ contacts, events, onScheduleFollowUp, onViewContact }: SmartFollowUpProps) {
  // Calculate follow-up suggestions
  const suggestions = useMemo(() => {
    const now = new Date()
    const suggestions: FollowUpSuggestion[] = []

    contacts.forEach(contact => {
      // Get all events for this contact
      const contactEvents = events
        .filter(e => e.contact_ids?.includes(contact.id))
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())

      const lastEvent = contactEvents[0] || null
      const daysSince = lastEvent 
        ? Math.floor((now.getTime() - new Date(lastEvent.start_time).getTime()) / (1000 * 60 * 60 * 24))
        : 999

      let priority: 'high' | 'medium' | 'low' = 'low'
      let reason = ''

      if (!lastEvent) {
        priority = 'medium'
        reason = 'No interactions recorded yet'
      } else if (daysSince > 21) {
        priority = 'high'
        reason = `Last contact ${daysSince} days ago`
      } else if (daysSince > 14) {
        priority = 'medium'
        reason = `Last contact ${daysSince} days ago`
      }

      // Only include if priority is high/medium or no prior contact
      if (priority !== 'low' || !lastEvent) {
        suggestions.push({ contact, lastEvent, daysSince, priority, reason })
      }
    })

    // Sort by priority and days since
    return suggestions.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1
      if (b.priority === 'high' && a.priority !== 'high') return 1
      return b.daysSince - a.daysSince
    }).slice(0, 5)
  }, [contacts, events])

  if (suggestions.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Follow-ups</h3>
            <p className="text-sm text-slate-400">You're all caught up!</p>
          </div>
        </div>
        <p className="text-sm text-slate-500">
          All your contacts have been reached out to recently. Great job staying connected!
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Smart Follow-ups</h3>
            <p className="text-sm text-slate-400">{suggestions.length} contacts need attention</p>
          </div>
        </div>
        <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full font-medium border border-amber-500/20">
          AI Powered
        </span>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.contact.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all"
          >
            <div className={`w-2 h-2 rounded-full ${
              suggestion.priority === 'high' ? 'bg-red-400 animate-pulse' : 'bg-amber-400'
            }`} />
            
            <div 
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => onViewContact(suggestion.contact)}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-slate-200 truncate">{suggestion.contact.name}</span>
                <span className="text-slate-500 text-sm">•</span>
                <span className="text-slate-400 text-sm truncate">{suggestion.contact.firm}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {suggestion.lastEvent ? (
                  <>
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span className="text-xs text-slate-500">{suggestion.reason}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-500">Last: {suggestion.lastEvent.title}</span>
                  </>
                ) : (
                  <span className="text-xs text-amber-400">{suggestion.reason}</span>
                )}
              </div>
            </div>

            <button
              onClick={() => onScheduleFollowUp(suggestion.contact)}
              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium transition-all"
            >
              <Calendar className="w-3 h-3" />
              Schedule
              <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
        <Zap className="w-3 h-3" />
        Based on your last interaction dates and typical recruiting timelines
      </p>
    </div>
  )
}
