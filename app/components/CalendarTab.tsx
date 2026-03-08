'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Building2,
  Coffee,
  Phone,
  Briefcase,
  RotateCcw,
  MoreHorizontal,
  MapPin,
  FileText
} from 'lucide-react'
import { CalendarEvent, Contact, Application, EventType, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '../types'

interface CalendarTabProps {
  events: CalendarEvent[]
  onAdd: () => void
  onSelect: (event: CalendarEvent) => void
  contacts: Contact[]
  applications: Application[]
}

export function CalendarTab({ events, onAdd, onSelect, contacts, applications }: CalendarTabProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()
  
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => {
      const eventDate = new Date(e.start_time).toISOString().split('T')[0]
      return eventDate === dateStr
    })
  }

  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => new Date(e.start_time) > new Date())
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 10)
  }, [events])

  const navigateMonth = (direction: number) => {
    setSelectedDate(new Date(year, month + direction, 1))
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Calendar</h2>
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
            <button onClick={() => navigateMonth(-1)} className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-white min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button onClick={() => navigateMonth(1)} className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={goToToday}
            className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </motion.button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Calendar Grid */}
        <div className="col-span-12 lg:col-span-8">
          <div className="glass-card p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-slate-500 py-2 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-28" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1
                const dayEvents = getEventsForDay(dayNum)
                const today = isToday(dayNum)
                
                return (
                  <motion.div 
                    key={dayNum}
                    whileHover={{ scale: 1.02 }}
                    className={`h-28 border rounded-xl p-2 cursor-pointer transition-all ${
                      today 
                        ? 'bg-blue-500/10 border-blue-500/30' 
                        : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50'
                    }`}
                    onClick={onAdd}
                  >
                    <div className={`text-sm font-medium mb-1 ${today ? 'text-blue-400' : 'text-slate-400'}`}>
                      {dayNum}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div 
                          key={event.id}
                          onClick={(e) => { e.stopPropagation(); onSelect(event) }}
                          className={`text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer ${
                            EVENT_TYPE_COLORS[event.event_type]?.bg ?? 'bg-slate-700'
                          } ${EVENT_TYPE_COLORS[event.event_type]?.text ?? 'text-slate-300'}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-slate-500 pl-1">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Upcoming Events */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Upcoming Events
            </h3>
            
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {upcomingEvents.map((event, index) => {
                  const eventDate = new Date(event.start_time)
                  const isToday = new Date().toDateString() === eventDate.toDateString()
                  const isTomorrow = new Date(Date.now() + 86400000).toDateString() === eventDate.toDateString()
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onSelect(event)}
                      className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                        EVENT_TYPE_COLORS[event.event_type]?.bg ?? 'bg-slate-700'
                      }`}>
                        <span className="text-[10px] font-bold text-slate-400">
                          {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold text-white">
                          {eventDate.getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-200 text-sm group-hover:text-white transition-colors truncate">
                          {event.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="capitalize">{EVENT_TYPE_LABELS[event.event_type] || event.event_type}</span>
                          <span>•</span>
                          <span>{eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                        </div>
                        {event.firm && (
                          <div className="text-xs text-slate-500 mt-1">{event.firm}</div>
                        )}
                      </div>
                      {(isToday || isTomorrow) && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          isToday ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {isToday ? 'Today' : 'Tomorrow'}
                        </span>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4">This Month</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-slate-800/30 rounded-xl">
                <div className="text-2xl font-bold text-white">
                  {events.filter(e => new Date(e.start_time).getMonth() === month).length}
                </div>
                <div className="text-xs text-slate-400">Events</div>
              </div>
              <div className="text-center p-3 bg-slate-800/30 rounded-xl">
                <div className="text-2xl font-bold text-white">
                  {events.filter(e => new Date(e.start_time) > new Date() && new Date(e.start_time).getMonth() === month).length}
                </div>
                <div className="text-xs text-slate-400">Upcoming</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
