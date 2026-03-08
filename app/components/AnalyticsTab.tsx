'use client'

import { motion } from 'framer-motion'
import { 
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Award,
  Briefcase,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Zap
} from 'lucide-react'
import { DashboardStats, Application, CalendarEvent, ApplicationStatus, STATUS_LABELS } from '../types'

interface AnalyticsTabProps {
  stats: DashboardStats
  applications: Application[]
  events: CalendarEvent[]
}

export function AnalyticsTab({ stats, applications, events }: AnalyticsTabProps) {
  const stageData = Object.entries(stats.stageDistribution)
    .sort(([a], [b]) => {
      const order: ApplicationStatus[] = ['applied', 'phone-screen', 'first-round', 'second-round', 'superday', 'offer', 'rejected', 'withdrawn', 'accepted']
      return order.indexOf(a as ApplicationStatus) - order.indexOf(b as ApplicationStatus)
    })

  const recentEvents = events
    .filter(e => new Date(e.start_time) < new Date())
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())

  const interviewsCompleted = events.filter(e => 
    ['phone-screen', 'first-round', 'superday'].includes(e.event_type) && 
    new Date(e.start_time) < new Date()
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
          <p className="text-sm text-slate-400 mt-1">Track your recruiting performance</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Applications"
          value={stats.totalApplications}
          color="blue"
        />
        <StatCard
          icon={Award}
          label="Offers"
          value={stats.offersReceived}
          color="emerald"
        />
        <StatCard
          icon={CheckCircle2}
          label="Conversion"
          value={`${stats.conversionRate}%`}
          color="purple"
        />
        <StatCard
          icon={Calendar}
          label="Interviews"
          value={interviewsCompleted}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Pipeline Distribution */}
        <div className="col-span-12 lg:col-span-6">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Pipeline Distribution
            </h3>
            
            {stageData.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No data yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stageData.map(([stage, count], index) => {
                  const percentage = (count / stats.totalApplications) * 100
                  const colors: Record<string, string> = {
                    applied: 'bg-slate-500',
                    'phone-screen': 'bg-blue-500',
                    'first-round': 'bg-yellow-500',
                    'second-round': 'bg-orange-500',
                    superday: 'bg-purple-500',
                    offer: 'bg-emerald-500',
                    rejected: 'bg-red-500',
                    withdrawn: 'bg-gray-500',
                    accepted: 'bg-green-500',
                  }
                  
                  return (
                    <motion.div
                      key={stage}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{STATUS_LABELS[stage as ApplicationStatus]}</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className={`h-full ${colors[stage] || 'bg-slate-500'} rounded-full`}
                        />
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{percentage.toFixed(1)}%</div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="col-span-12 lg:col-span-6">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Conversion Funnel
            </h3>
            
            {applications.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No data yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { stage: 'Applied', count: applications.filter(a => ['applied', 'phone-screen', 'first-round', 'second-round', 'superday', 'offer', 'rejected', 'accepted'].includes(a.status)).length, color: 'bg-slate-500' },
                  { stage: 'Phone Screen', count: applications.filter(a => ['phone-screen', 'first-round', 'second-round', 'superday', 'offer', 'accepted'].includes(a.status)).length, color: 'bg-blue-500' },
                  { stage: 'First Round', count: applications.filter(a => ['first-round', 'second-round', 'superday', 'offer', 'accepted'].includes(a.status)).length, color: 'bg-yellow-500' },
                  { stage: 'Superday', count: applications.filter(a => ['superday', 'offer', 'accepted'].includes(a.status)).length, color: 'bg-purple-500' },
                  { stage: 'Offer', count: applications.filter(a => ['offer', 'accepted'].includes(a.status)).length, color: 'bg-emerald-500' },
                ].map((item, index) => {
                  const prevCount = index === 0 ? item.count : [
                    applications.filter(a => ['applied', 'phone-screen', 'first-round', 'second-round', 'superday', 'offer', 'rejected', 'accepted'].includes(a.status)).length,
                    applications.filter(a => ['phone-screen', 'first-round', 'second-round', 'superday', 'offer', 'accepted'].includes(a.status)).length,
                    applications.filter(a => ['first-round', 'second-round', 'superday', 'offer', 'accepted'].includes(a.status)).length,
                    applications.filter(a => ['superday', 'offer', 'accepted'].includes(a.status)).length,
                    applications.filter(a => ['offer', 'accepted'].includes(a.status)).length,
                  ][index - 1]
                  const conversion = index === 0 ? 100 : prevCount > 0 ? (item.count / prevCount) * 100 : 0
                  
                  return (
                    <motion.div
                      key={item.stage}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-24 text-sm text-slate-400 text-right">{item.stage}</div>
                      <div className="flex-1">
                        <div className="h-8 bg-slate-800 rounded-lg overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / Math.max(applications.length, 1)) * 100}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className={`h-full ${item.color} rounded-lg flex items-center justify-end px-3`}
                          >
                            <span className="text-white font-medium text-sm">{item.count}</span>
                          </motion.div>
                        </div>
                      </div>
                      <div className="w-16 text-xs text-slate-500">
                        {index > 0 && `${conversion.toFixed(0)}%`}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Activity Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-800/30 rounded-xl">
            <div className="text-3xl font-bold text-white">{stats.totalContacts}</div>
            <div className="text-sm text-slate-400 mt-1">Total Contacts</div>
          </div>
          <div className="text-center p-4 bg-slate-800/30 rounded-xl">
            <div className="text-3xl font-bold text-white">{events.length}</div>
            <div className="text-sm text-slate-400 mt-1">Total Events</div>
          </div>
          <div className="text-center p-4 bg-slate-800/30 rounded-xl">
            <div className="text-3xl font-bold text-white">
              {applications.filter(a => a.status === 'rejected').length}
            </div>
            <div className="text-sm text-slate-400 mt-1">Rejections</div>
          </div>
          <div className="text-center p-4 bg-slate-800/30 rounded-xl">
            <div className="text-3xl font-bold text-white">
              {applications.filter(a => a.status === 'accepted').length}
            </div>
            <div className="text-sm text-slate-400 mt-1">Accepted</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color,
}: { 
  icon: React.ElementType
  label: string
  value: number | string
  color: string
}) {
  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400' },
    indigo: { bg: 'bg-indigo-500/10', icon: 'text-indigo-400' },
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400' },
    amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400' },
  }

  const colors = colorClasses[color]

  return (
    <div className="glass-card p-4">
      <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${colors.icon}`} />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  )
}
