'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  MapPin,
  Video,
  Phone,
  Users,
  Briefcase,
  Sparkles,
  Zap,
  Filter,
  Search,
  MoreHorizontal,
  Check,
  XCircle
} from 'lucide-react'
import { Application, Contact, CalendarEvent } from '../types'

interface InterviewSchedulerProps {
  applications: Application[]
  contacts: Contact[]
  existingEvents: CalendarEvent[]
  onScheduleEvent?: (event: Partial<CalendarEvent>) => void
}

interface TimeSlot {
  time: string
  available: boolean
  conflicts: string[]
  score: number // Optimization score
}

interface DaySchedule {
  date: Date
  slots: TimeSlot[]
}

const WORKING_HOURS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']

export function InterviewScheduler({ 
  applications, 
  contacts, 
  existingEvents,
  onScheduleEvent 
}: InterviewSchedulerProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<string>('')
  const [interviewType, setInterviewType] = useState<CalendarEvent['event_type']>('first-round')
  const [interviewFormat, setInterviewFormat] = useState<'in-person' | 'video' | 'phone'>('video')
  const [duration, setDuration] = useState(60)
  const [participants, setParticipants] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [activeTab, setActiveTab] = useState<'suggest' | 'manual'>('suggest')
  const [optimizationMode, setOptimizationMode] = useState<'balanced' | 'energy' | 'focus'>('balanced')

  // Get applications that need scheduling
  const pendingApplications = useMemo(() => 
    applications.filter(a => 
      ['phone-screen', 'first-round', 'second-round', 'superday'].includes(a.status) &&
      !existingEvents.some(e => e.firm === a.firm && e.event_type === a.status)
    ),
    [applications, existingEvents]
  )

  // Generate calendar view
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []
    
    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }, [currentDate])

  // Calculate schedule conflicts and suggestions
  const getTimeSlotsForDate = (date: Date): TimeSlot[] => {
    const dateStr = date.toISOString().split('T')[0]
    const dayEvents = existingEvents.filter(e => 
      e.start_time.startsWith(dateStr)
    )

    return WORKING_HOURS.map(time => {
      const conflicts: string[] = []
      let score = 100

      // Check for conflicts
      const [hourStr, minuteStr] = time.split(':')
      const hour = parseInt(hourStr) + (time.includes('PM') && parseInt(hourStr) !== 12 ? 12 : 0) - (time.includes('AM') && parseInt(hourStr) === 12 ? 12 : 0)
      const slotTime = new Date(date)
      slotTime.setHours(hour, parseInt(minuteStr || '0'), 0, 0)

      dayEvents.forEach(event => {
        const eventStart = new Date(event.start_time)
        const eventEnd = new Date(event.end_time)
        
        if (slotTime >= eventStart && slotTime < eventEnd) {
          conflicts.push(event.title)
        }
      })

      // Calculate optimization score
      if (conflicts.length > 0) {
        score = 0
      } else {
        // Prefer morning slots for energy mode
        if (optimizationMode === 'energy' && hour < 12) {
          score += 20
        }
        // Prefer afternoon for focus mode (after lunch)
        if (optimizationMode === 'focus' && hour >= 14 && hour <= 16) {
          score += 20
        }
        // Avoid lunch hour
        if (hour === 12) {
          score -= 10
        }
        // Slight preference for 10am and 2pm (peak focus times)
        if (hour === 10 || hour === 14) {
          score += 10
        }
      }

      return {
        time,
        available: conflicts.length === 0,
        conflicts,
        score
      }
    })
  }

  const selectedDaySlots = useMemo(() => 
    selectedDate ? getTimeSlotsForDate(selectedDate) : [],
    [selectedDate, existingEvents, optimizationMode]
  )

  const bestSlots = useMemo(() => 
    selectedDaySlots
      .filter(s => s.available)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3),
    [selectedDaySlots]
  )

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
    setSelectedDate(null)
    setSelectedSlot(null)
  }

  const handleSchedule = () => {
    if (!selectedDate || !selectedSlot || !selectedApplication) return

    const app = applications.find(a => a.id === selectedApplication)
    if (!app) return

    const [hourStr, minuteStr] = selectedSlot.split(':')
    const hour = parseInt(hourStr) + (selectedSlot.includes('PM') && parseInt(hourStr) !== 12 ? 12 : 0) - (selectedSlot.includes('AM') && parseInt(hourStr) === 12 ? 12 : 0)
    
    const startTime = new Date(selectedDate)
    startTime.setHours(hour, parseInt(minuteStr || '0'), 0, 0)
    
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + duration)

    const event: Partial<CalendarEvent> = {
      title: `${app.firm} - ${interviewType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      description: notes,
      firm: app.firm,
      event_type: interviewType,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      contact_ids: participants,
      status: 'scheduled'
    }

    onScheduleEvent?.(event)
    setShowScheduleModal(false)
    resetForm()
  }

  const resetForm = () => {
    setSelectedApplication('')
    setSelectedSlot(null)
    setParticipants([])
    setNotes('')
    setInterviewType('first-round')
    setInterviewFormat('video')
    setDuration(60)
  }

  const getEventCountForDate = (date: Date | null) => {
    if (!date) return 0
    const dateStr = date.toISOString().split('T')[0]
    return existingEvents.filter(e => e.start_time.startsWith(dateStr)).length
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-amber-400" />
            Smart Interview Scheduler
          </h2>
          <p className="text-slate-400 mt-1">AI-powered scheduling with conflict detection</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg">
            <span className="text-sm text-slate-400">Optimize for:</span>
            {(['balanced', 'energy', 'focus'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setOptimizationMode(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                  optimizationMode === mode
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Schedule Interview
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{pendingApplications.length}</div>
              <div className="text-xs text-slate-500">Pending Interviews</div>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {existingEvents.filter(e => ['phone-screen', 'first-round', 'second-round', 'superday'].includes(e.event_type)).length}
              </div>
              <div className="text-xs text-slate-500">Scheduled</div>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {existingEvents.filter(e => new Date(e.start_time) > new Date()).length}
              </div>
              <div className="text-xs text-slate-500">Upcoming</div>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {Math.round(existingEvents.filter(e => new Date(e.start_time).getHours() >= 9 && new Date(e.start_time).getHours() <= 11).length / Math.max(existingEvents.length, 1) * 100)}%
              </div>
              <div className="text-xs text-slate-500">Morning Slots</div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar and Time Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }

              const isSelected = selectedDate?.toDateString() === date.toDateString()
              const isToday = date.toDateString() === new Date().toDateString()
              const eventCount = getEventCountForDate(date)
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => !isPast && setSelectedDate(date)}
                  disabled={isPast}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                      : isToday
                      ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                      : isPast
                      ? 'text-slate-700 cursor-not-allowed'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-medium">{date.getDate()}</span>
                  {eventCount > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: Math.min(eventCount, 3) }).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-amber-400" />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/50" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/50" />
              <span>Selected</span>
            </div>
          </div>
        </div>

        {/* Time Slots */}
        <div className="lg:col-span-2 glass-card p-6">
          {selectedDate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">
                  Available Times for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <span className="text-sm text-slate-400">
                  {selectedDaySlots.filter(s => s.available).length} slots available
                </span>
              </div>

              {/* Best Suggestions */}
              {bestSlots.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">Top Recommendations</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bestSlots.map((slot, index) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedSlot === slot.time
                            ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        #{index + 1} {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All Slots */}
              <div className="grid grid-cols-3 gap-3">
                {selectedDaySlots.map(slot => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && setSelectedSlot(slot.time)}
                    disabled={!slot.available}
                    className={`p-3 rounded-xl text-left transition-all ${
                      !slot.available
                        ? 'bg-red-500/5 border border-red-500/20 opacity-50 cursor-not-allowed'
                        : selectedSlot === slot.time
                        ? 'bg-amber-500/20 border border-amber-500/50 text-white'
                        : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{slot.time}</span>
                      {!slot.available && <XCircle className="w-4 h-4 text-red-400" />}
                    </div>
                    {!slot.available && slot.conflicts.length > 0 && (
                      <div className="text-xs text-red-400/70 mt-1 truncate">
                        {slot.conflicts[0]}
                      </div>
                    )}
                    {slot.available && slot.score >= 110 && (
                      <div className="text-xs text-emerald-400 mt-1">Optimal</div>
                    )}
                  </button>
                ))}
              </div>

              {selectedSlot && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end pt-4 border-t border-slate-800"
                >
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Schedule at {selectedSlot}
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <Calendar className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">Select a date to view available times</p>
              <p className="text-sm mt-2">We'll suggest optimal interview slots based on your calendar</p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowScheduleModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Schedule Interview</h3>
                    <p className="text-sm text-slate-400">
                      {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      {selectedSlot && ` at ${selectedSlot}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Application Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Select Application</label>
                  <select
                    value={selectedApplication}
                    onChange={(e) => setSelectedApplication(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    <option value="">Choose an application...</option>
                    {pendingApplications.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.firm} - {app.role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Interview Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Interview Type</label>
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value as CalendarEvent['event_type'])}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="phone-screen">Phone Screen</option>
                      <option value="first-round">First Round</option>
                      <option value="superday">Superday</option>
                      <option value="coffee">Coffee Chat</option>
                      <option value="info-session">Info Session</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={180}>3 hours (Superday)</option>
                    </select>
                  </div>
                </div>

                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Format</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['video', 'phone', 'in-person'] as const).map(format => {
                      const icons = { video: Video, phone: Phone, 'in-person': MapPin }
                      const Icon = icons[format]
                      return (
                        <button
                          key={format}
                          onClick={() => setInterviewFormat(format)}
                          className={`p-4 rounded-xl border text-center transition-all ${
                            interviewFormat === format
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          <Icon className="w-5 h-5 mx-auto mb-2" />
                          <span className="text-sm font-medium capitalize">{format.replace('-', ' ')}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Interviewers (Optional)</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedApplication && contacts
                      .filter(c => c.firm === applications.find(a => a.id === selectedApplication)?.firm)
                      .map(contact => (
                        <label
                          key={contact.id}
                          className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={participants.includes(contact.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setParticipants([...participants, contact.id])
                              } else {
                                setParticipants(participants.filter(id => id !== contact.id))
                              }
                            }}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500/50"
                          />
                          <div>
                            <div className="text-sm text-white">{contact.name}</div>
                            <div className="text-xs text-slate-400">{contact.title}</div>
                          </div>
                        </label>
                      ))}
                    {selectedApplication && contacts.filter(c => c.firm === applications.find(a => a.id === selectedApplication)?.firm).length === 0 && (
                      <p className="text-sm text-slate-500 italic">No contacts at this firm yet</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Location, preparation notes, etc."
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSchedule}
                    disabled={!selectedApplication || !selectedDate}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Schedule Interview
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default InterviewScheduler
