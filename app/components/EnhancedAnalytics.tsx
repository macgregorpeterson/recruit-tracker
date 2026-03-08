'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Users,
  Briefcase,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Building2,
  Zap,
  Activity,
  GitCommit,
  Award,
  ChevronRight,
  ChevronDown,
  Info
} from 'lucide-react'
import { Application, Contact, CalendarEvent, ApplicationStatus, STATUS_ORDER, STATUS_LABELS } from '../types'

interface EnhancedAnalyticsProps {
  applications: Application[]
  contacts: Contact[]
  events: CalendarEvent[]
}

interface FunnelStage {
  status: ApplicationStatus
  count: number
  percentage: number
  dropOff: number
}

interface FirmStats {
  firm: string
  applications: number
  interviews: number
  offers: number
  rejectionRate: number
  avgResponseTime: number
  conversionRate: number
}

export function EnhancedAnalytics({ applications, contacts, events }: EnhancedAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '6m' | 'all'>('all')
  const [selectedMetric, setSelectedMetric] = useState<'overview' | 'funnel' | 'firms' | 'networking'>('overview')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // Filter data by time range
  const filteredApps = useMemo(() => {
    if (timeRange === 'all') return applications
    
    const now = new Date()
    const cutoff = new Date()
    
    switch (timeRange) {
      case '30d':
        cutoff.setDate(now.getDate() - 30)
        break
      case '90d':
        cutoff.setDate(now.getDate() - 90)
        break
      case '6m':
        cutoff.setMonth(now.getMonth() - 6)
        break
    }
    
    return applications.filter(app => 
      new Date(app.created_at || Date.now()) >= cutoff
    )
  }, [applications, timeRange])

  // Calculate core stats
  const stats = useMemo(() => {
    const total = filteredApps.length
    const active = filteredApps.filter(a => 
      !['rejected', 'withdrawn', 'accepted'].includes(a.status)
    ).length
    const offers = filteredApps.filter(a => a.status === 'offer').length
    const rejected = filteredApps.filter(a => a.status === 'rejected').length
    const interviews = filteredApps.filter(a => 
      ['phone-screen', 'first-round', 'second-round', 'superday'].includes(a.status)
    ).length
    
    const conversionRate = total > 0 ? Math.round((offers / total) * 100) : 0
    const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0
    
    return {
      total,
      active,
      offers,
      rejected,
      interviews,
      conversionRate,
      interviewRate,
      responseRate: total > 0 ? Math.round(((interviews + offers + rejected) / total) * 100) : 0
    }
  }, [filteredApps])

  // Calculate funnel data
  const funnelData = useMemo((): FunnelStage[] => {
    const stages: FunnelStage[] = []
    const total = filteredApps.length
    
    let previousCount = total
    
    STATUS_ORDER.forEach(status => {
      if (['withdrawn', 'accepted'].includes(status)) return
      
      const count = filteredApps.filter(a => {
        const statusIndex = STATUS_ORDER.indexOf(a.status)
        const currentIndex = STATUS_ORDER.indexOf(status)
        return statusIndex >= currentIndex
      }).length
      
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0
      const dropOff = previousCount > 0 ? Math.round(((previousCount - count) / previousCount) * 100) : 0
      
      stages.push({ status, count, percentage, dropOff: stages.length > 0 ? dropOff : 0 })
      previousCount = count
    })
    
    return stages
  }, [filteredApps])

  // Calculate firm statistics
  const firmStats = useMemo((): FirmStats[] => {
    const firmMap = new Map<string, FirmStats>()
    
    filteredApps.forEach(app => {
      if (!app.firm) return
      
      if (!firmMap.has(app.firm)) {
        firmMap.set(app.firm, {
          firm: app.firm,
          applications: 0,
          interviews: 0,
          offers: 0,
          rejectionRate: 0,
          avgResponseTime: 0,
          conversionRate: 0
        })
      }
      
      const stats = firmMap.get(app.firm)!
      stats.applications++
      
      if (['phone-screen', 'first-round', 'second-round', 'superday'].includes(app.status)) {
        stats.interviews++
      }
      
      if (app.status === 'offer') {
        stats.offers++
      }
    })
    
    return Array.from(firmMap.values())
      .map(stats => ({
        ...stats,
        rejectionRate: Math.round((filteredApps.filter(a => a.firm === stats.firm && a.status === 'rejected').length / stats.applications) * 100),
        conversionRate: stats.applications > 0 ? Math.round((stats.offers / stats.applications) * 100) : 0
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 10)
  }, [filteredApps])

  // Networking stats
  const networkingStats = useMemo(() => {
    const coffeeChats = events.filter(e => e.event_type === 'coffee')
    const phoneScreens = events.filter(e => e.event_type === 'phone-screen')
    const firstRounds = events.filter(e => e.event_type === 'first-round')
    const superdays = events.filter(e => e.event_type === 'superday')
    
    const recentContacts = contacts.filter(c => {
      const created = c.created_at ? new Date(c.created_at) : null
      return created && (new Date().getTime() - created.getTime()) < (30 * 24 * 60 * 60 * 1000)
    })
    
    return {
      totalContacts: contacts.length,
      recentContacts: recentContacts.length,
      coffeeChats: coffeeChats.length,
      phoneScreens: phoneScreens.length,
      firstRounds: firstRounds.length,
      superdays: superdays.length,
      conversionToInterview: contacts.length > 0 
        ? Math.round((firstRounds.length / contacts.length) * 100) 
        : 0
    }
  }, [contacts, events])

  // Weekly activity data
  const weeklyData = useMemo(() => {
    const weeks: { week: string; applications: number; events: number; contacts: number }[] = []
    
    for (let i = 11; i >= 0; i--) {
      const endDate = new Date()
      endDate.setDate(endDate.getDate() - (i * 7))
      const startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - 7)
      
      const weekApps = applications.filter(a => {
        const date = new Date(a.created_at || Date.now())
        return date >= startDate && date < endDate
      }).length
      
      const weekEvents = events.filter(e => {
        const date = new Date(e.start_time)
        return date >= startDate && date < endDate
      }).length
      
      const weekContacts = contacts.filter(c => {
        const date = new Date(c.created_at || Date.now())
        return date >= startDate && date < endDate
      }).length
      
      weeks.push({
        week: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        applications: weekApps,
        events: weekEvents,
        contacts: weekContacts
      })
    }
    
    return weeks
  }, [applications, events, contacts])

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    const distribution: Record<string, number> = {}
    filteredApps.forEach(app => {
      distribution[app.status] = (distribution[app.status] || 0) + 1
    })
    return Object.entries(distribution).map(([status, count]) => ({
      status,
      count,
      percentage: filteredApps.length > 0 ? Math.round((count / filteredApps.length) * 100) : 0
    })).sort((a, b) => b.count - a.count)
  }, [filteredApps])

  const statusColors: Record<string, string> = {
    'applied': 'bg-slate-500',
    'phone-screen': 'bg-blue-500',
    'first-round': 'bg-yellow-500',
    'second-round': 'bg-orange-500',
    'superday': 'bg-purple-500',
    'offer': 'bg-emerald-500',
    'rejected': 'bg-red-500',
    'withdrawn': 'bg-gray-500',
    'accepted': 'bg-green-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            Analytics Dashboard
          </h2>
          <p className="text-slate-400 mt-1">
            Track your recruiting performance and identify opportunities
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="6m">Last 6 Months</option>
            <option value="all">All Time</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'funnel', label: 'Conversion Funnel', icon: GitCommit },
          { id: 'firms', label: 'Firm Analysis', icon: Building2 },
          { id: 'networking', label: 'Networking', icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedMetric(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedMetric === tab.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedMetric === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              icon={Briefcase}
              label="Total Applications"
              value={stats.total}
              color="blue"
            />
            <MetricCard
              icon={Target}
              label="Interview Rate"
              value={`${stats.interviewRate}%`}
              subValue={`${stats.interviews} interviews`}
              color="purple"
            />
            <MetricCard
              icon={Award}
              label="Conversion Rate"
              value={`${stats.conversionRate}%`}
              subValue={`${stats.offers} offers`}
              color="emerald"
            />
            <MetricCard
              icon={TrendingUp}
              label="Response Rate"
              value={`${stats.responseRate}%`}
              color="amber"
            />
          </div>

          {/* Weekly Activity Chart */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Weekly Activity (Last 12 Weeks)
            </h3>
            
            <div className="h-64 flex items-end gap-2">
              {weeklyData.map((week, index) => {
                const maxValue = Math.max(...weeklyData.map(w => w.applications + w.events + w.contacts)) || 1
                const total = week.applications + week.events + week.contacts
                const heightPercent = (total / maxValue) * 100
                
                return (
                  <div key={week.week} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex flex-col justify-end h-48 gap-0.5">
                      {week.contacts > 0 && (
                        <div 
                          className="w-full bg-blue-500/80 rounded-t transition-all group-hover:bg-blue-400"
                          style={{ height: `${(week.contacts / maxValue) * 100}%` }}
                          title={`${week.contacts} contacts`}
                        />
                      )}
                      {week.applications > 0 && (
                        <div 
                          className="w-full bg-indigo-500/80 rounded-t transition-all group-hover:bg-indigo-400"
                          style={{ height: `${(week.applications / maxValue) * 100}%` }}
                          title={`${week.applications} applications`}
                        />
                      )}
                      {week.events > 0 && (
                        <div 
                          className="w-full bg-purple-500/80 rounded-t transition-all group-hover:bg-purple-400"
                          style={{ height: `${(week.events / maxValue) * 100}%` }}
                          title={`${week.events} events`}
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 -rotate-45 origin-top-left translate-y-4">
                      {week.week}
                    </span>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                      {week.contacts > 0 && `${week.contacts} contacts`}
                      {week.applications > 0 && `, ${week.applications} apps`}
                      {week.events > 0 && `, ${week.events} events`}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Legend */}
            <div className="flex gap-6 mt-8 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-xs text-slate-400">Contacts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-indigo-500" />
                <span className="text-xs text-slate-400">Applications</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-500" />
                <span className="text-xs text-slate-400">Events</span>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-400" />
                Pipeline Distribution
              </h3>
              
              <div className="space-y-3">
                {statusDistribution.map(({ status, count, percentage }) => (
                  <div key={status} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-slate-500'}`} />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{STATUS_LABELS[status as ApplicationStatus] || status}</span>
                        <span className="text-slate-400">{count}</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${statusColors[status] || 'bg-slate-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-white w-10 text-right">{percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Insights */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Key Insights
              </h3>
              
              <div className="space-y-4">
                {stats.conversionRate > 10 && (
                  <div className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-200">Strong conversion rate</p>
                      <p className="text-xs text-slate-400">
                        Your {stats.conversionRate}% offer rate is above average for banking recruiting.
                      </p>
                    </div>
                  </div>
                )}
                
                {stats.interviewRate < 20 && stats.total > 10 && (
                  <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-200">Low interview conversion</p>
                      <p className="text-xs text-slate-400">
                        Consider improving your resume or getting more referrals.
                      </p>
                    </div>
                  </div>
                )}
                
                {networkingStats.coffeeChats > 10 && (
                  <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Users className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-200">Active networker</p>
                      <p className="text-xs text-slate-400">
                        You've had {networkingStats.coffeeChats} coffee chats. Great job building relationships!
                      </p>
                    </div>
                  </div>
                )}
                
                {stats.active > 5 && (
                  <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <Briefcase className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-200">Active pipeline</p>
                      <p className="text-xs text-slate-400">
                        You have {stats.active} active applications. Follow up on any that haven't moved in 2+ weeks.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Funnel Tab */}
      {selectedMetric === 'funnel' && (
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-blue-400" />
            Conversion Funnel
          </h3>
          
          <div className="space-y-4">
            {funnelData.map((stage, index) => (
              <motion.div
                key={stage.status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex items-center gap-4">
                  {/* Stage Number */}
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-400 shrink-0">
                    {index + 1}
                  </div>
                  
                  {/* Bar */}
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white font-medium">{STATUS_LABELS[stage.status]}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">{stage.count} applications</span>
                        <span className="text-white font-medium">{stage.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-8 bg-slate-800 rounded-lg overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stage.percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`h-full rounded-lg ${statusColors[stage.status] || 'bg-slate-500'}`}
                      />
                    </div>
                  </div>
                  
                  {/* Drop-off */}
                  {stage.dropOff > 0 && (
                    <div className="w-24 text-right shrink-0">
                      <div className="text-xs text-red-400 flex items-center justify-end gap-1">
                        <ArrowDownRight className="w-3 h-3" />
                        {stage.dropOff}% drop
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Connector */}
                {index < funnelData.length - 1 && (
                  <div className="absolute left-4 top-12 w-0.5 h-4 bg-slate-800" />
                )}
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-slate-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Funnel Analysis</h4>
            <p className="text-sm text-slate-400">
              {stats.conversionRate > 5 
                ? `Your ${stats.conversionRate}% offer rate is strong. Most candidates see 3-5% conversion.`
                : `Consider focusing on interview prep. Your current ${stats.interviewRate}% interview rate could be improved.`}
            </p>
          </div>
        </div>
      )}

      {/* Firm Analysis Tab */}
      {selectedMetric === 'firms' && (
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-slate-700/50">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Firm Performance Analysis
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/50">
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-400">Firm</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-400">Applied</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-400">Interviews</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-400">Offers</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-400">Conversion</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-400">Rejection Rate</th>
                </tr>
              </thead>
              <tbody>
                {firmStats.map((firm, index) => (
                  <motion.tr
                    key={firm.firm}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30"
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-white">{firm.firm}</div>
                    </td>
                    <td className="text-center py-4 px-4 text-slate-300">{firm.applications}</td>
                    <td className="text-center py-4 px-4 text-slate-300">{firm.interviews}</td>
                    <td className="text-center py-4 px-4">
                      {firm.offers > 0 ? (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-medium">
                          {firm.offers}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${firm.conversionRate > 20 ? 'bg-emerald-500' : firm.conversionRate > 10 ? 'bg-yellow-500' : 'bg-slate-500'}`}
                            style={{ width: `${Math.min(firm.conversionRate * 5, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-300 w-10">{firm.conversionRate}%</span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className={`text-sm ${firm.rejectionRate > 50 ? 'text-red-400' : 'text-slate-300'}`}>
                        {firm.rejectionRate}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {firmStats.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No firm data available yet</p>
            </div>
          )}
        </div>
      )}

      {/* Networking Tab */}
      {selectedMetric === 'networking' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              icon={Users}
              label="Total Contacts"
              value={networkingStats.totalContacts}
              color="blue"
            />
            <MetricCard
              icon={Calendar}
              label="Coffee Chats"
              value={networkingStats.coffeeChats}
              color="amber"
            />
            <MetricCard
              icon={Target}
              label="Phone Screens"
              value={networkingStats.phoneScreens}
              color="purple"
            />
            <MetricCard
              icon={Zap}
              label="Contact → Interview"
              value={`${networkingStats.conversionToInterview}%`}
              color="emerald"
            />
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Networking Effectiveness
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Contact to Interview Conversion</div>
                    <div className="text-sm text-slate-400">
                      {networkingStats.firstRounds.length} interviews from {networkingStats.totalContacts} contacts
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{networkingStats.conversionToInterview}%</div>
                  <div className="text-xs text-slate-500">conversion rate</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/30 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">First Round Interviews</div>
                  <div className="text-2xl font-bold text-white">{networkingStats.firstRounds.length}</div>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Superdays</div>
                  <div className="text-2xl font-bold text-white">{networkingStats.superdays.length}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  color 
}: { 
  icon: React.ElementType
  label: string
  value: string | number
  subValue?: string
  color: string
}) {
  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400' },
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400' },
    amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400' },
  }

  const colors = colorClasses[color]

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
      {subValue && <div className="text-xs text-slate-500 mt-1">{subValue}</div>}
    </div>
  )
}
