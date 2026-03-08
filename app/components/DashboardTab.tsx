'use client'

import { motion } from 'framer-motion'
import { 
  Users, 
  Briefcase, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Award,
  Clock,
  ArrowUpRight,
  Coffee,
  Phone,
  Building2,
  Target,
  Zap,
  Sparkles,
  Plus
} from 'lucide-react'
import { DashboardStats, RecentActivity, Contact, Application, CalendarEvent } from '../types'

interface DashboardTabProps {
  stats: DashboardStats
  recentActivity: RecentActivity[]
  contacts: Contact[]
  applications: Application[]
  events: CalendarEvent[]
  onNavigate: (tab: string) => void
  onAddContact: () => void
  onAddApplication: () => void
  onAddEvent: () => void
  onAddNote: () => void
}

export function DashboardTab({ 
  stats, 
  recentActivity, 
  contacts, 
  applications, 
  events, 
  onNavigate,
  onAddContact,
  onAddApplication,
  onAddEvent,
  onAddNote
}: DashboardTabProps) {
  const upcomingEvents = events
    .filter(e => new Date(e.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5)

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 5)

  const activePipelineCount = applications.filter(a => 
    !['rejected', 'withdrawn', 'accepted'].includes(a.status)
  ).length

  const todaysEvents = events.filter(e => {
    const eventDate = new Date(e.start_time)
    const today = new Date()
    return eventDate.toDateString() === today.toDateString()
  })

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-blue-500/20 p-6"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
              </h2>
              <p className="text-slate-300">
                {todaysEvents.length > 0 
                  ? `You have ${todaysEvents.length} event${todaysEvents.length > 1 ? 's' : ''} today`
                  : 'Ready to crush your recruiting goals?'
                }
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 backdrop-blur rounded-lg border border-slate-700/50">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-300">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Contacts"
          value={stats.totalContacts}
          trend={+12}
          color="blue"
          onClick={() => onNavigate('coverage')}
        />
        <StatCard
          icon={Briefcase}
          label="Applications"
          value={stats.totalApplications}
          subValue={`${activePipelineCount} active`}
          color="indigo"
          onClick={() => onNavigate('pipeline')}
        />
        <StatCard
          icon={Award}
          label="Offers"
          value={stats.offersReceived}
          color="emerald"
          onClick={() => onNavigate('pipeline')}
        />
        <StatCard
          icon={Calendar}
          label="This Week"
          value={stats.interviewsThisWeek}
          labelSuffix="interviews"
          color="purple"
          onClick={() => onNavigate('calendar')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Pipeline Overview */}
        <div className="col-span-12 lg:col-span-7">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Pipeline Overview
              </h3>
              <button 
                onClick={() => onNavigate('pipeline')}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                View All <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            
            {applications.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No applications yet. Start building your pipeline!</p>
                <button 
                  onClick={onAddApplication}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Add Application
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app, index) => (
                  <motion.div 
                    key={app.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group border border-transparent hover:border-slate-700"
                    onClick={() => onNavigate('pipeline')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-200 group-hover:text-white transition-colors">{app.firm}</div>
                        <div className="text-sm text-slate-400">{app.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={app.status} />
                      <div className="text-xs text-slate-500 mt-1">
                        {app.applied_date ? new Date(app.applied_date).toLocaleDateString() : 'Recently'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 mt-6"
          >
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionButton
                icon={Users}
                label="Add Contact"
                color="blue"
                onClick={onAddContact}
              />
              <QuickActionButton
                icon={Briefcase}
                label="Add Application"
                color="indigo"
                onClick={onAddApplication}
              />
              <QuickActionButton
                icon={Calendar}
                label="Schedule Event"
                color="purple"
                onClick={onAddEvent}
              />
              <QuickActionButton
                icon={FileText}
                label="New Note"
                color="emerald"
                onClick={onAddNote}
              />
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Upcoming Events */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Upcoming Events
              </h3>
              <button 
                onClick={() => onNavigate('calendar')}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                View All <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No upcoming events</p>
                <button 
                  onClick={onAddEvent}
                  className="mt-3 px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors"
                >
                  Schedule Event
                </button>
              </div>
            ) : (
              <div className="space-y-3">
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
                      className={`flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer border ${
                        isToday ? 'bg-blue-500/10 border-blue-500/20' : 'bg-slate-800/30 hover:bg-slate-800/50 border-transparent hover:border-slate-700'
                      }`}
                      onClick={() => onNavigate('calendar')}
                    >
                      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                        event.event_type === 'coffee' ? 'bg-amber-500/10' :
                        event.event_type === 'superday' ? 'bg-purple-500/10' :
                        'bg-blue-500/10'
                      }`}>
                        <span className="text-xs font-bold text-slate-400">
                          {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold text-white">
                          {eventDate.getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-200 truncate">{event.title}</div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          {event.event_type === 'coffee' && <Coffee className="w-3 h-3" />}
                          {event.event_type === 'phone-screen' && <Phone className="w-3 h-3" />}
                          <span className="capitalize">{event.event_type?.replace('-', ' ')}</span>
                          <span>•</span>
                          <span>{eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                        </div>
                        {event.firm && (
                          <div className="text-xs text-slate-500 mt-1">{event.firm}</div>
                        )}
                      </div>
                      {isToday && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                          Today
                        </span>
                      )}
                      {isTomorrow && (
                        <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full">
                          Tomorrow
                        </span>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Conversion Rate */}
          {applications.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-card p-6"
            >
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-pink-400" />
                Conversion Metrics
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Application → Offer</span>
                    <span className="text-white font-medium">{stats.conversionRate}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.conversionRate}%` }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 bg-slate-800/30 rounded-xl">
                    <div className="text-2xl font-bold text-white">{stats.offersReceived}</div>
                    <div className="text-xs text-slate-400">Offers</div>
                  </div>
                  <div className="text-center p-3 bg-slate-800/30 rounded-xl">
                    <div className="text-2xl font-bold text-white">
                      {applications.filter(a => a.status === 'rejected').length}
                    </div>
                    <div className="text-xs text-slate-400">Rejections</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* AI Suggestions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 border-purple-500/20"
          >
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Smart Suggestions
            </h3>
            <div className="space-y-2">
              <SuggestionItem 
                text="Schedule follow-ups with 3 contacts from last week"
                action="View"
                onClick={() => onNavigate('coverage')}
              />
              <SuggestionItem 
                text="You have a Superday tomorrow - review prep materials"
                action="Prep"
                onClick={() => onNavigate('prep')}
              />
              {applications.filter(a => a.status === 'applied').length > 0 && (
                <SuggestionItem 
                  text={`${applications.filter(a => a.status === 'applied').length} applications need status updates`}
                  action="Update"
                  onClick={() => onNavigate('pipeline')}
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  trend,
  labelSuffix,
  color,
  onClick 
}: { 
  icon: React.ElementType
  label: string
  value: number
  subValue?: string
  trend?: number
  labelSuffix?: string
  color: string
  onClick: () => void
}) {
  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400', border: 'border-blue-500/20' },
    indigo: { bg: 'bg-indigo-500/10', icon: 'text-indigo-400', border: 'border-indigo-500/20' },
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'border-purple-500/20' },
  }

  const colors = colorClasses[color]

  return (
    <motion.button 
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`glass-card p-4 text-left transition-all ${colors.border} hover:shadow-lg hover:shadow-${color}-500/10`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        {trend !== undefined && (
          <span className="text-xs font-medium text-emerald-400 flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" />
            +{trend}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-slate-400 flex items-center gap-1">
          {label}
          {labelSuffix && <span className="text-slate-500">{labelSuffix}</span>}
        </div>
        {subValue && (
          <div className="text-xs text-slate-500 mt-1">{subValue}</div>
        )}
      </div>
    </motion.button>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'applied': 'bg-slate-500/20 text-slate-300',
    'phone-screen': 'bg-blue-500/20 text-blue-300',
    'first-round': 'bg-yellow-500/20 text-yellow-300',
    'second-round': 'bg-orange-500/20 text-orange-300',
    'superday': 'bg-purple-500/20 text-purple-300',
    'offer': 'bg-emerald-500/20 text-emerald-300',
    'rejected': 'bg-red-500/20 text-red-300',
    'withdrawn': 'bg-gray-500/20 text-gray-300',
    'accepted': 'bg-green-500/20 text-green-300',
  }

  const labels: Record<string, string> = {
    'applied': 'Applied',
    'phone-screen': 'Phone',
    'first-round': '1st Round',
    'second-round': '2nd Round',
    'superday': 'Superday',
    'offer': 'Offer',
    'rejected': 'Rejected',
    'withdrawn': 'Withdrawn',
    'accepted': 'Accepted',
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors['applied']}`}>
      {labels[status] || status}
    </span>
  )
}

function QuickActionButton({ 
  icon: Icon, 
  label, 
  color,
  onClick 
}: { 
  icon: React.ElementType
  label: string
  color: string
  onClick: () => void
}) {
  const colorClasses: Record<string, { bg: string; hover: string; icon: string }> = {
    blue: { bg: 'bg-blue-500/10', hover: 'hover:bg-blue-500/20', icon: 'text-blue-400' },
    indigo: { bg: 'bg-indigo-500/10', hover: 'hover:bg-indigo-500/20', icon: 'text-indigo-400' },
    emerald: { bg: 'bg-emerald-500/10', hover: 'hover:bg-emerald-500/20', icon: 'text-emerald-400' },
    purple: { bg: 'bg-purple-500/10', hover: 'hover:bg-purple-500/20', icon: 'text-purple-400' },
  }

  const colors = colorClasses[color]

  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl ${colors.bg} ${colors.hover} transition-colors text-left group`}
    >
      <Icon className={`w-5 h-5 ${colors.icon}`} />
      <span className="text-sm font-medium text-slate-200 group-hover:text-white">{label}</span>
      <Plus className="w-4 h-4 text-slate-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  )
}

function SuggestionItem({ text, action, onClick }: { text: string; action: string; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl group hover:bg-slate-800/50 transition-colors">
      <span className="text-sm text-slate-300">{text}</span>
      <button 
        onClick={onClick}
        className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
      >
        {action}
      </button>
    </div>
  )
}
