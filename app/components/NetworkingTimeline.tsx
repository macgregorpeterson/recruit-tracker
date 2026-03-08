'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  GitCommit,
  Users,
  Briefcase,
  Calendar,
  FileText,
  Coffee,
  Phone,
  Mail,
  Zap,
  TrendingUp,
  Target,
  Clock,
  ChevronRight,
  ChevronLeft,
  Filter,
  Activity,
  BarChart3
} from 'lucide-react'

interface NetworkingTimelineProps {
  contacts: any[]
  applications: any[]
  events: any[]
  notes: any[]
  onActivityClick: (type: string, id: string) => void
}

interface TimelineActivity {
  id: string
  type: 'contact' | 'application' | 'event' | 'note'
  subtype: string
  title: string
  firm?: string
  date: Date
  description?: string
}

export function NetworkingTimeline({ contacts, applications, events, notes, onActivityClick }: NetworkingTimelineProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [filterType, setFilterType] = useState<'all' | 'contacts' | 'applications' | 'events' | 'notes'>('all')
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)

  // Aggregate all activities
  const activities = useMemo(() => {
    const allActivities: TimelineActivity[] = []

    contacts.forEach(c => {
      allActivities.push({
        id: c.id,
        type: 'contact',
        subtype: 'added',
        title: `Added ${c.name}`,
        firm: c.firm,
        date: new Date(c.created_at || Date.now()),
        description: c.title
      })
    })

    applications.forEach(a => {
      allActivities.push({
        id: a.id,
        type: 'application',
        subtype: a.status,
        title: `Applied to ${a.firm}`,
        firm: a.firm,
        date: new Date(a.created_at || Date.now()),
        description: a.role
      })
    })

    events.forEach(e => {
      allActivities.push({
        id: e.id,
        type: 'event',
        subtype: e.event_type,
        title: e.title,
        firm: e.firm,
        date: new Date(e.start_time),
        description: e.event_type?.replace('-', ' ')
      })
    })

    notes.forEach(n => {
      allActivities.push({
        id: n.id,
        type: 'note',
        subtype: 'created',
        title: n.title,
        firm: n.firm || undefined,
        date: new Date(n.created_at || Date.now()),
        description: n.content?.substring(0, 50) + '...'
      })
    })

    return allActivities.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [contacts, applications, events, notes])

  // Calculate activity grid data
  const activityGrid = useMemo(() => {
    const grid: Record<string, { count: number; intensity: number; activities: TimelineActivity[] }> = {}
    const filteredActivities = filterType === 'all' 
      ? activities 
      : activities.filter(a => a.type === filterType.slice(0, -1)) // Remove 's'

    filteredActivities.forEach(activity => {
      const dateKey = activity.date.toISOString().split('T')[0]
      if (!grid[dateKey]) {
        grid[dateKey] = { count: 0, intensity: 0, activities: [] }
      }
      grid[dateKey].count += 1
      grid[dateKey].activities.push(activity)
    })

    // Calculate intensity (0-4)
    const counts = Object.values(grid).map(g => g.count)
    const maxCount = Math.max(...counts, 1)
    
    Object.keys(grid).forEach(key => {
      grid[key].intensity = Math.min(Math.ceil((grid[key].count / maxCount) * 4), 4)
    })

    return grid
  }, [activities, filterType])

  // Generate calendar weeks
  const calendarWeeks = useMemo(() => {
    const weeks: Date[][] = []
    const startOfYear = new Date(selectedYear, 0, 1)
    const dayOfWeek = startOfYear.getDay()
    const firstSunday = new Date(startOfYear)
    firstSunday.setDate(startOfYear.getDate() - dayOfWeek)

    for (let week = 0; week < 53; week++) {
      const weekDays: Date[] = []
      for (let day = 0; day < 7; day++) {
        const date = new Date(firstSunday)
        date.setDate(firstSunday.getDate() + (week * 7) + day)
        weekDays.push(date)
      }
      weeks.push(weekDays)
    }
    return weeks
  }, [selectedYear])

  // Calculate streaks
  const streaks = useMemo(() => {
    const sortedDates = Object.keys(activityGrid).sort()
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    // Check current streak
    let checkDate = new Date()
    while (activityGrid[checkDate.toISOString().split('T')[0]]) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    }

    // Calculate longest streak
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1
      } else {
        const prevDate = new Date(sortedDates[i - 1])
        const currDate = new Date(sortedDates[i])
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    return { currentStreak, longestStreak }
  }, [activityGrid])

  // Monthly stats
  const monthlyStats = useMemo(() => {
    const stats: Record<string, { contacts: number; applications: number; events: number; notes: number }> = {}
    
    activities.forEach(activity => {
      const monthKey = activity.date.toISOString().slice(0, 7)
      if (!stats[monthKey]) {
        stats[monthKey] = { contacts: 0, applications: 0, events: 0, notes: 0 }
      }
      stats[monthKey][activity.type === 'contact' ? 'contacts' : 
                     activity.type === 'application' ? 'applications' : 
                     activity.type === 'event' ? 'events' : 'notes']++
    })

    return Object.entries(stats)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6)
  }, [activities])

  const getIntensityColor = (intensity: number) => {
    const colors = [
      'bg-slate-800',
      'bg-emerald-900/40',
      'bg-emerald-800/60',
      'bg-emerald-700/80',
      'bg-emerald-500'
    ]
    return colors[intensity] || colors[0]
  }

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitCommit className="w-6 h-6 text-emerald-400" />
            Networking Timeline
          </h2>
          <p className="text-slate-400 mt-1">
            Visualize your recruiting journey. {activities.length} activities tracked.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="all">All Activities</option>
            <option value="contacts">Contacts</option>
            <option value="applications">Applications</option>
            <option value="events">Events</option>
            <option value="notes">Notes</option>
          </select>

          {/* Year Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedYear(y => y - 1)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-lg font-semibold text-white min-w-[80px] text-center">{selectedYear}</span>
            <button
              onClick={() => setSelectedYear(y => y + 1)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              disabled={selectedYear >= new Date().getFullYear()}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Streak Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{streaks.currentStreak}</div>
              <div className="text-sm text-slate-400">Day Streak</div>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{streaks.longestStreak}</div>
              <div className="text-sm text-slate-400">Best Streak</div>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{activities.filter(a => a.date > new Date(Date.now() - 7*24*60*60*1000)).length}</div>
              <div className="text-sm text-slate-400">This Week</div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Grid */}
      <div className="glass-card p-6 overflow-x-auto">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-white">Activity Heatmap</h3>
        </div>
        
        <div className="min-w-[800px]">
          {/* Month labels */}
          <div className="flex ml-8 mb-2">
            {monthLabels.map((month, i) => (
              <div key={month} className="flex-1 text-xs text-slate-500 text-center" style={{ marginLeft: i === 0 ? 0 : 0 }}>
                {month}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <div key={day} className="h-3 text-[10px] text-slate-500 flex items-center">
                  {i % 2 === 1 ? day.slice(0, 1) : ''}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-1">
              {calendarWeeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((date, dayIndex) => {
                    const dateKey = date.toISOString().split('T')[0]
                    const dayData = activityGrid[dateKey]
                    const isCurrentYear = date.getFullYear() === selectedYear
                    const isHovered = hoveredDay === dateKey

                    return (
                      <motion.div
                        key={dayIndex}
                        className={`
                          w-3 h-3 rounded-sm cursor-pointer transition-all
                          ${!isCurrentYear ? 'opacity-20' : ''}
                          ${getIntensityColor(dayData?.intensity || 0)}
                          ${isHovered ? 'ring-2 ring-white/50' : ''}
                        `}
                        whileHover={{ scale: 1.3 }}
                        onMouseEnter={() => setHoveredDay(dateKey)}
                        onMouseLeave={() => setHoveredDay(null)}
                        onClick={() => dayData && dayData.activities[0] && onActivityClick(dayData.activities[0].type, dayData.activities[0].id)}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className={`w-3 h-3 rounded-sm ${getIntensityColor(i)}`} />
            ))}
            <span>More</span>
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredDay && activityGrid[hoveredDay] && (
          <div className="mt-4 p-3 bg-slate-800/80 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-300 mb-2">
              {new Date(hoveredDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <div className="space-y-1">
              {activityGrid[hoveredDay].activities.slice(0, 5).map((activity, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <ActivityIcon type={activity.type} subtype={activity.subtype} />
                  <span className="text-slate-200">{activity.title}</span>
                </div>
              ))}
              {activityGrid[hoveredDay].activities.length > 5 && (
                <div className="text-xs text-slate-500">
                  +{activityGrid[hoveredDay].activities.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Stats */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Monthly Activity
        </h3>
        <div className="space-y-4">
          {monthlyStats.map(([month, stats]) => {
            const total = stats.contacts + stats.applications + stats.events + stats.notes
            return (
              <div key={month} className="flex items-center gap-4">
                <div className="w-16 text-sm text-slate-400">
                  {new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                </div>
                <div className="flex-1 h-8 bg-slate-800 rounded-full overflow-hidden flex">
                  {stats.contacts > 0 && (
                    <div 
                      className="h-full bg-blue-500/80 flex items-center justify-center text-xs text-white"
                      style={{ width: `${(stats.contacts / total) * 100}%` }}
                      title={`${stats.contacts} contacts`}
                    >
                      {stats.contacts > 2 && stats.contacts}
                    </div>
                  )}
                  {stats.applications > 0 && (
                    <div 
                      className="h-full bg-indigo-500/80 flex items-center justify-center text-xs text-white"
                      style={{ width: `${(stats.applications / total) * 100}%` }}
                      title={`${stats.applications} applications`}
                    >
                      {stats.applications > 2 && stats.applications}
                    </div>
                  )}
                  {stats.events > 0 && (
                    <div 
                      className="h-full bg-purple-500/80 flex items-center justify-center text-xs text-white"
                      style={{ width: `${(stats.events / total) * 100}%` }}
                      title={`${stats.events} events`}
                    >
                      {stats.events > 2 && stats.events}
                    </div>
                  )}
                  {stats.notes > 0 && (
                    <div 
                      className="h-full bg-emerald-500/80 flex items-center justify-center text-xs text-white"
                      style={{ width: `${(stats.notes / total) * 100}%` }}
                      title={`${stats.notes} notes`}
                    >
                      {stats.notes > 2 && stats.notes}
                    </div>
                  )}
                </div>
                <div className="w-8 text-right text-sm font-medium text-white">{total}</div>
              </div>
            )
          })}
          {monthlyStats.length === 0 && (
            <p className="text-center text-slate-500 py-4">No activity yet. Start building your network!</p>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-700/50 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500/80" />
            <span className="text-slate-400">Contacts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-indigo-500/80" />
            <span className="text-slate-400">Applications</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500/80" />
            <span className="text-slate-400">Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500/80" />
            <span className="text-slate-400">Notes</span>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          Recent Activity
        </h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {activities.slice(0, 20).map((activity, index) => (
            <motion.div
              key={`${activity.id}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer group"
              onClick={() => onActivityClick(activity.type, activity.id)}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                <ActivityIcon type={activity.type} subtype={activity.subtype} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-200 group-hover:text-white transition-colors truncate">
                  {activity.title}
                </div>
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <span className="capitalize">{activity.subtype.replace('-', ' ')}</span>
                  {activity.firm && (
                    <>
                      <span>•</span>
                      <span>{activity.firm}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-xs text-slate-500 shrink-0">
                {formatRelativeDate(activity.date)}
              </div>
            </motion.div>
          ))}
          {activities.length === 0 && (
            <p className="text-center text-slate-500 py-8">No activity yet. Start recruiting!</p>
          )}
        </div>
      </div>
    </div>
  )
}

function ActivityIcon({ type, subtype }: { type: string; subtype: string }) {
  const iconClass = "w-5 h-5"
  
  switch (type) {
    case 'contact':
      return <Users className={`${iconClass} text-blue-400`} />
    case 'application':
      return <Briefcase className={`${iconClass} text-indigo-400`} />
    case 'event':
      if (subtype === 'coffee') return <Coffee className={`${iconClass} text-amber-400`} />
      if (subtype?.includes('phone')) return <Phone className={`${iconClass} text-blue-400`} />
      return <Calendar className={`${iconClass} text-purple-400`} />
    case 'note':
      return <FileText className={`${iconClass} text-emerald-400`} />
    default:
      return <Activity className={`${iconClass} text-slate-400`} />
  }
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
