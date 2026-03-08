'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sun, 
  Calendar, 
  Clock, 
  Coffee, 
  Phone, 
  Briefcase, 
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Target,
  Flame
} from 'lucide-react'
import { CalendarEvent, Application, Contact, DeadlineReminder } from '../types'

interface SmartTodayWidgetProps {
  events: CalendarEvent[]
  applications: Application[]
  contacts: Contact[]
  onNavigate: (tab: string) => void
  onAddEvent: () => void
}

export function SmartTodayWidget({ events, applications, contacts, onNavigate, onAddEvent }: SmartTodayWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [greeting, setGreeting] = useState('')
  const [productivityScore, setProductivityScore] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    // Calculate productivity score based on today's activities
    const todayEvents = events.filter(e => {
      const eventDate = new Date(e.start_time)
      return eventDate.toDateString() === new Date().toDateString()
    })
    const score = Math.min(todayEvents.length * 20 + 40, 100)
    setProductivityScore(score)

    return () => clearInterval(timer)
  }, [events])

  const todayEvents = events
    .filter(e => {
      const eventDate = new Date(e.start_time)
      return eventDate.toDateString() === new Date().toDateString()
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  const upcomingDeadlines = applications
    .filter(a => a.deadline_date && new Date(a.deadline_date) >= new Date())
    .sort((a, b) => new Date(a.deadline_date!).getTime() - new Date(b.deadline_date!).getTime())
    .slice(0, 3)

  const pendingFollowUps = contacts
    .filter(c => {
      if (!c.last_contacted) return true
      const lastContact = new Date(c.last_contacted)
      const daysSince = (new Date().getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
      return daysSince > 7
    })
    .slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 p-6 border-b border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sun className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{greeting}</h2>
              <p className="text-slate-400">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </div>
            <div className="flex items-center gap-2 justify-end mt-1">
              <Flame className={`w-4 h-4 ${productivityScore > 70 ? 'text-orange-400' : 'text-slate-500'}`} />
              <span className={`text-sm ${productivityScore > 70 ? 'text-orange-400' : 'text-slate-500'}`}>
                Productivity: {productivityScore}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Events */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Today's Schedule
              </h3>
              <button 
                onClick={onAddEvent}
                className="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
              >
                + Add Event
              </button>
            </div>

            {todayEvents.length === 0 ? (
              <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                <Coffee className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No events scheduled today</p>
                <button 
                  onClick={onAddEvent}
                  className="mt-3 text-sm text-blue-400 hover:text-blue-300"
                >
                  Schedule something productive
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((event, index) => {
                  const eventDate = new Date(event.start_time)
                  const isPast = eventDate < new Date()
                  const isCurrent = !isPast && new Date(event.start_time).getTime() - new Date().getTime() < 3600000

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => onNavigate('calendar')}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        isCurrent 
                          ? 'bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/10' 
                          : isPast
                          ? 'bg-slate-800/20 border-slate-700/30 opacity-60'
                          : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isCurrent ? 'bg-blue-500/20' : 'bg-slate-700/50'
                      }`}>
                        {event.event_type === 'coffee' && <Coffee className={`w-5 h-5 ${isCurrent ? 'text-blue-400' : 'text-slate-400'}`} />}
                        {event.event_type === 'phone-screen' && <Phone className={`w-5 h-5 ${isCurrent ? 'text-blue-400' : 'text-slate-400'}`} />}
                        {event.event_type === 'superday' && <Briefcase className={`w-5 h-5 ${isCurrent ? 'text-blue-400' : 'text-slate-400'}`} />}
                        {!['coffee', 'phone-screen', 'superday'].includes(event.event_type) && <Calendar className={`w-5 h-5 ${isCurrent ? 'text-blue-400' : 'text-slate-400'}`} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{event.title}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full animate-pulse">
                              Now
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <span>{eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                          {event.firm && <span>• {event.firm}</span>}
                        </div>
                      </div>
                      {isPast && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Upcoming Deadlines */}
            <div>
              <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Upcoming Deadlines
              </h3>
              {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-slate-500 py-2">No upcoming deadlines</p>
              ) : (
                <div className="space-y-2">
                  {upcomingDeadlines.map(app => {
                    const daysUntil = Math.ceil((new Date(app.deadline_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    return (
                      <div 
                        key={app.id}
                        onClick={() => onNavigate('pipeline')}
                        className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-200">{app.firm}</div>
                          <div className="text-xs text-slate-500">{app.role}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          daysUntil <= 3 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {daysUntil}d
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Follow-up Reminders */}
            {pendingFollowUps.length > 0 && (
              <div>
                <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Follow-up Suggestions
                </h3>
                <div className="space-y-2">
                  {pendingFollowUps.map(contact => (
                    <div 
                      key={contact.id}
                      onClick={() => onNavigate('coverage')}
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-200">{contact.name}</div>
                        <div className="text-xs text-slate-500">{contact.firm}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="p-4 bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl border border-slate-700/50">
              <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Today's Progress
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{todayEvents.length}</div>
                  <div className="text-xs text-slate-500">Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {applications.filter(a => a.status === 'offer').length}
                  </div>
                  <div className="text-xs text-slate-500">Offers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
