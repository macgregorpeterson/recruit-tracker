'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Application, Contact, CalendarEvent, ApplicationStatus, STATUS_ORDER, STATUS_COLORS, STATUS_LABELS } from '../types'
import { 
  TrendingUp, 
  Target, 
  Users, 
  Briefcase, 
  Calendar, 
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'

interface AnalyticsDashboardProps {
  applications: Application[]
  contacts: Contact[]
  events: CalendarEvent[]
}

export function AnalyticsDashboard({ applications, contacts, events }: AnalyticsDashboardProps) {
  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Status distribution
    const statusCounts = STATUS_ORDER.reduce((acc, status) => {
      acc[status] = applications.filter(a => a.status === status).length
      return acc
    }, {} as Record<ApplicationStatus, number>)

    // Conversion rates
    const totalApplied = applications.length
    const phoneScreens = statusCounts['phone-screen'] + statusCounts['first-round'] + statusCounts['second-round'] + statusCounts['superday'] + statusCounts['offer']
    const interviews = statusCounts['first-round'] + statusCounts['second-round'] + statusCounts['superday'] + statusCounts['offer']
    const offers = statusCounts['offer']

    const phoneScreenRate = totalApplied > 0 ? Math.round((phoneScreens / totalApplied) * 100) : 0
    const interviewRate = phoneScreens > 0 ? Math.round((interviews / phoneScreens) * 100) : 0
    const offerRate = interviews > 0 ? Math.round((offers / interviews) * 100) : 0

    // Funnel data
    const funnelData = [
      { stage: 'Applied', count: totalApplied, color: 'bg-slate-500' },
      { stage: 'Phone Screen', count: phoneScreens, color: 'bg-blue-500' },
      { stage: 'Interviews', count: interviews, color: 'bg-amber-500' },
      { stage: 'Offers', count: offers, color: 'bg-emerald-500' },
    ]

    // Top firms
    const firmCounts = applications.reduce((acc, app) => {
      acc[app.firm] = (acc[app.firm] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topFirms = Object.entries(firmCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // Activity over time (last 30 days)
    const recentApps = applications.filter(a => 
      a.created_at && new Date(a.created_at) > thirtyDaysAgo
    ).length

    const recentEvents = events.filter(e => 
      new Date(e.start_time) > thirtyDaysAgo && new Date(e.start_time) <= now
    ).length

    const upcomingEvents = events.filter(e => 
      new Date(e.start_time) > now
    ).length

    // Network stats
    const contactsWithEvents = contacts.filter(c => 
      events.some(e => e.contact_ids?.includes(c.id))
    ).length

    const networkingRate = contacts.length > 0 
      ? Math.round((contactsWithEvents / contacts.length) * 100) 
      : 0

    return {
      statusCounts,
      phoneScreenRate,
      interviewRate,
      offerRate,
      funnelData,
      topFirms,
      recentApps,
      recentEvents,
      upcomingEvents,
      contactsWithEvents,
      networkingRate,
      totalApplied,
      offers,
    }
  }, [applications, contacts, events])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-pink-400" />
            Analytics
          </h2>
          <p className="text-slate-400 mt-1">Insights into your recruiting performance</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Application → Screen"
          value={`${metrics.phoneScreenRate}%`}
          icon={ArrowUpRight}
          trend={metrics.phoneScreenRate > 30 ? 'good' : metrics.phoneScreenRate > 15 ? 'average' : 'low'}
          color="blue"
        />
        <MetricCard
          label="Screen → Interview"
          value={`${metrics.interviewRate}%`}
          icon={ArrowUpRight}
          trend={metrics.interviewRate > 50 ? 'good' : metrics.interviewRate > 30 ? 'average' : 'low'}
          color="amber"
        />
        <MetricCard
          label="Interview → Offer"
          value={`${metrics.offerRate}%`}
          icon={Award}
          trend={metrics.offerRate > 20 ? 'good' : metrics.offerRate > 10 ? 'average' : 'low'}
          color="emerald"
        />
        <MetricCard
          label="Network Utilization"
          value={`${metrics.networkingRate}%`}
          icon={Users}
          trend={metrics.networkingRate > 40 ? 'good' : metrics.networkingRate > 20 ? 'average' : 'low'}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Funnel Visualization */}
        <div className="col-span-12 lg:col-span-7">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Application Funnel
            </h3>
            
            <div className="space-y-4">
              {metrics.funnelData.map((stage, index) => {
                const maxCount = metrics.funnelData[0].count || 1
                const percentage = Math.round((stage.count / maxCount) * 100)
                
                return (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">{stage.stage}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-white">{stage.count}</span>
                        {index > 0 && (
                          <span className="text-xs text-slate-500">
                            {percentage}% of applied
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className={`h-full rounded-full ${stage.color}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Overall conversion</span>
                <span className="text-2xl font-bold text-white">
                  {metrics.totalApplied > 0 ? ((metrics.offers / metrics.totalApplied) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {metrics.offers} offers from {metrics.totalApplied} applications
              </p>
            </div>
          </div>
        </div>

        {/* Side Stats */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Top Firms */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              Most Applied Firms
            </h3>
            {metrics.topFirms.length === 0 ? (
              <p className="text-slate-500 text-sm">No applications yet</p>
            ) : (
              <div className="space-y-3">
                {metrics.topFirms.map(([firm, count], index) => (
                  <div key={firm} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-400">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">{firm}</span>
                        <span className="text-sm text-slate-400">{count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${(count / metrics.topFirms[0][1]) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Stats */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Last 30 Days
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <StatBox label="Applied" value={metrics.recentApps} />
              <StatBox label="Events" value={metrics.recentEvents} />
              <StatBox label="Upcoming" value={metrics.upcomingEvents} />
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-4">Pipeline Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3">
          {STATUS_ORDER.map((status) => {
            const count = metrics.statusCounts[status]
            const percentage = metrics.totalApplied > 0 ? Math.round((count / metrics.totalApplied) * 100) : 0
            
            return (
              <div 
                key={status}
                className="p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 text-center"
              >
                <div className={`text-2xl font-bold mb-1 ${STATUS_COLORS[status].split(' ')[1]}`}>
                  {count}
                </div>
                <div className="text-xs text-slate-400 mb-1">{STATUS_LABELS[status]}</div>
                <div className="text-xs text-slate-600">{percentage}%</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ 
  label, 
  value, 
  icon: Icon, 
  trend,
  color 
}: { 
  label: string
  value: string
  icon: React.ElementType
  trend: 'good' | 'average' | 'low'
  color: string
}) {
  const trendColors = {
    good: 'text-emerald-400',
    average: 'text-amber-400',
    low: 'text-red-400',
  }

  const trendIcons = {
    good: ArrowUpRight,
    average: Minus,
    low: ArrowDownRight,
  }

  const TrendIcon = trendIcons[trend]
  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400' },
    amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400' },
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400' },
  }

  const colors = colorClasses[color]

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        <div className={`flex items-center gap-1 ${trendColors[trend]}`}>
          <TrendIcon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-3 bg-slate-800/30 rounded-lg">
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  )
}
