'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  X, 
  Clock, 
  Calendar, 
  Briefcase, 
  CheckCircle2,
  AlertTriangle,
  Mail,
  User,
  ChevronRight,
  Trash2,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react'
import { CalendarEvent, Application, Contact } from '../types'

export interface Notification {
  id: string
  type: 'deadline' | 'event' | 'follow_up' | 'milestone' | 'system'
  title: string
  message: string
  entityId?: string
  entityType?: 'application' | 'event' | 'contact'
  timestamp: string
  read: boolean
  dismissed: boolean
  priority: 'high' | 'medium' | 'low'
  action?: {
    label: string
    tab: string
  }
}

interface NotificationCenterProps {
  applications: Application[]
  events: CalendarEvent[]
  contacts: Contact[]
  onNavigate: (tab: string) => void
  onSelectEntity?: (type: string, id: string) => void
}

export function NotificationCenter({ 
  applications, 
  events, 
  contacts,
  onNavigate,
  onSelectEntity 
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'deadline' | 'event'>('all')

  // Generate notifications from data
  useEffect(() => {
    const newNotifications: Notification[] = []
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

    // Application deadlines
    applications.forEach(app => {
      if (app.deadline_date && !app.applied_date) {
        const deadline = new Date(app.deadline_date)
        const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntil <= 3 && daysUntil >= 0) {
          newNotifications.push({
            id: `deadline-${app.id}`,
            type: 'deadline',
            title: 'Application Deadline Approaching',
            message: `${app.firm} - ${app.role} deadline is in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
            entityId: app.id,
            entityType: 'application',
            timestamp: now.toISOString(),
            read: false,
            dismissed: false,
            priority: daysUntil <= 1 ? 'high' : 'medium',
            action: { label: 'View Application', tab: 'pipeline' }
          })
        }
      }
    })

    // Upcoming events (today and tomorrow)
    events.forEach(event => {
      const eventDate = new Date(event.start_time)
      if (eventDate >= now && eventDate <= tomorrow) {
        const hoursUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60))
        
        newNotifications.push({
          id: `event-${event.id}`,
          type: 'event',
          title: hoursUntil <= 2 ? 'Event Starting Soon' : 'Upcoming Event',
          message: `${event.title} ${hoursUntil <= 2 ? 'starts in ' + hoursUntil + ' hour' + (hoursUntil !== 1 ? 's' : '') : 'is today at ' + eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
          entityId: event.id,
          entityType: 'event',
          timestamp: now.toISOString(),
          read: false,
          dismissed: false,
          priority: hoursUntil <= 2 ? 'high' : 'medium',
          action: { label: 'View Calendar', tab: 'calendar' }
        })
      }
    })

    // Follow-up reminders
    contacts.forEach(contact => {
      if (!contact.last_contacted) {
        newNotifications.push({
          id: `followup-${contact.id}`,
          type: 'follow_up',
          title: 'New Contact - Follow Up Suggested',
          message: `You haven't contacted ${contact.name} from ${contact.firm} yet`,
          entityId: contact.id,
          entityType: 'contact',
          timestamp: now.toISOString(),
          read: false,
          dismissed: false,
          priority: 'low',
          action: { label: 'View Contact', tab: 'coverage' }
        })
      } else {
        const lastContact = new Date(contact.last_contacted)
        const daysSince = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysSince >= 14) {
          newNotifications.push({
            id: `followup-${contact.id}-${daysSince}`,
            type: 'follow_up',
            title: 'Follow-up Reminder',
            message: `It's been ${daysSince} days since you last contacted ${contact.name}`,
            entityId: contact.id,
            entityType: 'contact',
            timestamp: now.toISOString(),
            read: false,
            dismissed: false,
            priority: daysSince >= 21 ? 'medium' : 'low',
            action: { label: 'View Contact', tab: 'coverage' }
          })
        }
      }
    })

    // Milestone notifications
    const offerCount = applications.filter(a => a.status === 'offer').length
    if (offerCount > 0 && offerCount % 5 === 0) {
      newNotifications.push({
        id: `milestone-offers-${offerCount}`,
        type: 'milestone',
        title: 'Milestone Reached! 🎉',
        message: `You've received ${offerCount} offers! Keep up the great work.`,
        timestamp: now.toISOString(),
        read: false,
        dismissed: false,
        priority: 'medium',
        action: { label: 'View Pipeline', tab: 'pipeline' }
      })
    }

    // Update notifications while preserving read status
    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id))
      const trulyNew = newNotifications.filter(n => !existingIds.has(n.id))
      return [...prev, ...trulyNew].sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })
    })
  }, [applications, events, contacts])

  const unreadCount = notifications.filter(n => !n.read && !n.dismissed).length
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.read && !n.dismissed).length

  const filteredNotifications = notifications.filter(n => {
    if (n.dismissed) return false
    if (activeFilter === 'unread') return !n.read
    if (activeFilter === 'deadline') return n.type === 'deadline'
    if (activeFilter === 'event') return n.type === 'event'
    return true
  })

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, dismissed: true } : n
    ))
  }

  const clearAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, dismissed: true })))
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    if (notification.action) {
      onNavigate(notification.action.tab)
      if (notification.entityId && notification.entityType && onSelectEntity) {
        onSelectEntity(notification.entityType, notification.entityId)
      }
    }
    setIsOpen(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline': return AlertTriangle
      case 'event': return Calendar
      case 'follow_up': return User
      case 'milestone': return CheckCircle2
      default: return Bell
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20'
    }
  }

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center ${
            highPriorityCount > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-500 text-white'
          }`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 z-50 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Notifications</h3>
                    <p className="text-xs text-slate-400">
                      {unreadCount} unread{highPriorityCount > 0 && ` • ${highPriorityCount} urgent`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title={soundEnabled ? 'Mute notifications' : 'Enable sounds'}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
                {(['all', 'unread', 'deadline', 'event'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      activeFilter === filter
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    {filter === 'unread' && unreadCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-[10px]">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Actions */}
              {filteredNotifications.length > 0 && (
                <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Mark all read
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear all
                  </button>
                </div>
              )}

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
                      <Bell className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-medium">No notifications</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {activeFilter === 'all' 
                        ? "You're all caught up!" 
                        : `No ${activeFilter} notifications`}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/50">
                    {filteredNotifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type)
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 hover:bg-slate-800/30 transition-colors cursor-pointer group ${
                            !notification.read ? 'bg-slate-800/20' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getPriorityColor(notification.priority)}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`font-medium text-sm ${!notification.read ? 'text-white' : 'text-slate-300'}`}>
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                                )}
                              </div>
                              <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-slate-500">
                                  {new Date(notification.timestamp).toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                                {notification.action && (
                                  <span className="text-xs text-blue-400 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {notification.action.label}
                                    <ChevronRight className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                dismissNotification(notification.id)
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/95 backdrop-blur">
                <button
                  onClick={() => onNavigate('reminders')}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Manage Reminder Settings
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default NotificationCenter
