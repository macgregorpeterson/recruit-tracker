'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle,
  Target,
  Clock,
  Users,
  Briefcase,
  ArrowRight,
  Zap,
  CheckCircle2,
  Sparkles,
  BarChart3
} from 'lucide-react'
import { Contact, Application, CalendarEvent, Note } from '../types'

interface SmartInsightsEngineProps {
  contacts: Contact[]
  applications: Application[]
  events: CalendarEvent[]
  notes: Note[]
  onNavigate: (tab: string) => void
  onAddContact?: () => void
  onAddApplication?: () => void
}

interface Insight {
  id: string
  type: 'opportunity' | 'warning' | 'action' | 'milestone' | 'tip'
  title: string
  message: string
  priority: 'high' | 'medium' | 'low'
  metric?: { value: number; label: string; trend?: 'up' | 'down' | 'stable' }
  action?: { label: string; tab: string }
  icon: React.ElementType
}

export function SmartInsightsEngine({ 
  contacts, 
  applications, 
  events, 
  notes,
  onNavigate,
  onAddContact,
  onAddApplication
}: SmartInsightsEngineProps) {
  
  const insights = useMemo(() => {
    const newInsights: Insight[] = []
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // 1. Pipeline Health Analysis
    const activeApps = applications.filter(a => 
      !['rejected', 'withdrawn', 'accepted'].includes(a.status)
    )
    const conversionRate = applications.length > 0 
      ? (applications.filter(a => a.status === 'offer').length / applications.length) * 100 
      : 0
    
    if (conversionRate > 20) {
      newInsights.push({
        id: 'high-conversion',
        type: 'milestone',
        title: 'Exceptional Conversion Rate!',
        message: `Your ${conversionRate.toFixed(1)}% conversion rate is above industry average. Keep doing what you're doing!`,
        priority: 'low',
        metric: { value: conversionRate, label: 'Conversion Rate', trend: 'up' },
        action: { label: 'View Pipeline', tab: 'pipeline' },
        icon: TrendingUp
      })
    } else if (conversionRate < 5 && applications.length > 10) {
      newInsights.push({
        id: 'low-conversion',
        type: 'warning',
        title: 'Conversion Rate Below Average',
        message: 'Consider reviewing your application materials or targeting strategy.',
        priority: 'medium',
        metric: { value: conversionRate, label: 'Conversion Rate', trend: 'down' },
        action: { label: 'Review Applications', tab: 'pipeline' },
        icon: AlertTriangle
      })
    }

    // 2. Activity Analysis
    const recentEvents = events.filter(e => new Date(e.start_time) >= weekAgo)
    const recentContacts = contacts.filter(c => 
      c.created_at && new Date(c.created_at) >= weekAgo
    )
    
    if (recentEvents.length === 0 && events.length > 0) {
      newInsights.push({
        id: 'no-recent-events',
        type: 'action',
        title: 'No Events This Week',
        message: 'Stay active in your recruiting process. Schedule coffee chats or info sessions.',
        priority: 'medium',
        action: { label: 'Schedule Event', tab: 'calendar' },
        icon: Clock
      })
    }

    if (recentContacts.length >= 3) {
      newInsights.push({
        id: 'networking-momentum',
        type: 'milestone',
        title: 'Great Networking Week!',
        message: `You've added ${recentContacts.length} new contacts this week. Keep building those relationships!`,
        priority: 'low',
        metric: { value: recentContacts.length, label: 'New Contacts This Week', trend: 'up' },
        action: { label: 'View Coverage Book', tab: 'coverage' },
        icon: Users
      })
    }

    // 3. Application Distribution Analysis
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const appliedCount = statusCounts['applied'] || 0
    const interviewCount = ['phone-screen', 'first-round', 'second-round', 'superday']
      .reduce((sum, status) => sum + (statusCounts[status] || 0), 0)
    
    if (appliedCount > interviewCount * 3 && appliedCount > 5) {
      newInsights.push({
        id: 'follow-up-needed',
        type: 'opportunity',
        title: 'Follow-Up Opportunities',
        message: `${appliedCount} applications haven't progressed. Consider reaching out to recruiters for updates.`,
        priority: 'medium',
        metric: { value: appliedCount, label: 'Pending Applications' },
        action: { label: 'View Pipeline', tab: 'pipeline' },
        icon: Target
      })
    }

    // 4. Firm Concentration Analysis
    const firmCounts = contacts.reduce((acc, c) => {
      acc[c.firm] = (acc[c.firm] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topFirm = Object.entries(firmCounts).sort(([,a], [,b]) => b - a)[0]
    if (topFirm && topFirm[1] >= 5) {
      const [firmName, count] = topFirm
      newInsights.push({
        id: 'firm-concentration',
        type: 'tip',
        title: 'Strong Firm Network',
        message: `You have ${count} contacts at ${firmName}. Leverage this for referrals!`,
        priority: 'low',
        metric: { value: count, label: `Contacts at ${firmName}` },
        action: { label: 'View Contacts', tab: 'coverage' },
        icon: Lightbulb
      })
    }

    // 5. Deadline Alerts
    const urgentDeadlines = applications.filter(a => {
      if (!a.deadline_date || a.applied_date) return false
      const daysUntil = Math.ceil((new Date(a.deadline_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntil <= 3 && daysUntil >= 0
    })

    if (urgentDeadlines.length > 0) {
      newInsights.push({
        id: 'urgent-deadlines',
        type: 'warning',
        title: 'Urgent Deadlines Approaching',
        message: `${urgentDeadlines.length} application${urgentDeadlines.length > 1 ? 's' : ''} due within 3 days. Don't miss out!`,
        priority: 'high',
        metric: { value: urgentDeadlines.length, label: 'Urgent Deadlines' },
        action: { label: 'View Deadlines', tab: 'reminders' },
        icon: AlertTriangle
      })
    }

    // 6. Offer Strategy
    const offers = applications.filter(a => a.status === 'offer')
    if (offers.length >= 2) {
      newInsights.push({
        id: 'multiple-offers',
        type: 'opportunity',
        title: 'Multiple Offers - Time to Negotiate!',
        message: `You have ${offers.length} offers. Use them to negotiate better terms!`,
        priority: 'high',
        metric: { value: offers.length, label: 'Active Offers' },
        action: { label: 'Compare Offers', tab: 'offers' },
        icon: Zap
      })
    }

    // 7. Superday Prep Reminder
    const upcomingSuperdays = events.filter(e => 
      e.event_type === 'superday' && 
      new Date(e.start_time) >= now &&
      new Date(e.start_time) <= new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    )

    if (upcomingSuperdays.length > 0) {
      newInsights.push({
        id: 'superday-prep',
        type: 'action',
        title: 'Superday Preparation Needed',
        message: `You have ${upcomingSuperdays.length} superday${upcomingSuperdays.length > 1 ? 's' : ''} coming up. Time to prep!`,
        priority: 'high',
        action: { label: 'Start Prep', tab: 'prep' },
        icon: Target
      })
    }

    // 8. Networking Gaps
    const staleContacts = contacts.filter(c => {
      if (!c.last_contacted) return false
      const daysSince = Math.floor((now.getTime() - new Date(c.last_contacted).getTime()) / (1000 * 60 * 60 * 24))
      return daysSince >= 21
    })

    if (staleContacts.length >= 3) {
      newInsights.push({
        id: 'stale-contacts',
        type: 'action',
        title: 'Reconnect With Contacts',
        message: `${staleContacts.length} contacts haven't heard from you in 3+ weeks. Send a quick update!`,
        priority: 'medium',
        metric: { value: staleContacts.length, label: 'Stale Contacts' },
        action: { label: 'View Contacts', tab: 'coverage' },
        icon: Users
      })
    }

    // 9. Goal Tracking
    const monthlyGoal = 20 // Example goal
    const thisMonthApps = applications.filter(a => 
      a.created_at && new Date(a.created_at).getMonth() === now.getMonth()
    ).length
    
    if (thisMonthApps >= monthlyGoal) {
      newInsights.push({
        id: 'monthly-goal',
        type: 'milestone',
        title: 'Monthly Goal Achieved! 🎉',
        message: `You've submitted ${thisMonthApps} applications this month. Crushing it!`,
        priority: 'low',
        metric: { value: thisMonthApps, label: 'Applications This Month', trend: 'up' },
        action: { label: 'View Analytics', tab: 'analytics' },
        icon: CheckCircle2
      })
    }

    // 10. Diversification Tip
    const uniqueFirms = new Set(contacts.map(c => c.firm)).size
    if (uniqueFirms < 5 && contacts.length > 10) {
      newInsights.push({
        id: 'diversify',
        type: 'tip',
        title: 'Diversify Your Network',
        message: 'Most of your contacts are concentrated at a few firms. Consider expanding!',
        priority: 'low',
        metric: { value: uniqueFirms, label: 'Firms in Network' },
        action: { label: 'Add Contacts', tab: 'coverage' },
        icon: Sparkles
      })
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return newInsights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  }, [contacts, applications, events, notes])

  const highPriorityCount = insights.filter(i => i.priority === 'high').length
  const stats = {
    totalInsights: insights.length,
    opportunities: insights.filter(i => i.type === 'opportunity').length,
    warnings: insights.filter(i => i.type === 'warning').length,
    actions: insights.filter(i => i.type === 'action').length
  }

  const getInsightStyles = (type: string, priority: string) => {
    const baseStyles = {
      opportunity: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20',
      warning: 'from-amber-500/10 to-amber-600/5 border-amber-500/20',
      action: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
      milestone: 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
      tip: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20'
    }
    
    const priorityStyles = {
      high: 'shadow-lg',
      medium: '',
      low: 'opacity-90'
    }
    
    return `${baseStyles[type as keyof typeof baseStyles]} ${priorityStyles[priority as keyof typeof priorityStyles]}`
  }

  const getIconColor = (type: string) => {
    const colors = {
      opportunity: 'text-emerald-400',
      warning: 'text-amber-400',
      action: 'text-blue-400',
      milestone: 'text-purple-400',
      tip: 'text-cyan-400'
    }
    return colors[type as keyof typeof colors]
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.totalInsights}</div>
          <div className="text-xs text-slate-500">Total Insights</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{stats.opportunities}</div>
          <div className="text-xs text-slate-500">Opportunities</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{stats.warnings}</div>
          <div className="text-xs text-slate-500">Warnings</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.actions}</div>
          <div className="text-xs text-slate-500">Actions</div>
        </div>
      </div>

      {highPriorityCount > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <div>
            <div className="font-medium text-amber-300">{highPriorityCount} High Priority Items</div>
            <div className="text-sm text-amber-400/70">These require your attention soon</div>
          </div>
        </div>
      )}

      {/* Insights Grid */}
      <div className="grid gap-4">
        {insights.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Add more data to get personalized insights</p>
          </div>
        ) : (
          insights.map((insight, index) => {
            const Icon = insight.icon
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${getInsightStyles(insight.type, insight.priority)}`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-slate-900/50 flex items-center justify-center shrink-0`}>
                      <Icon className={`w-6 h-6 ${getIconColor(insight.type)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-white flex items-center gap-2">
                            {insight.title}
                            {insight.priority === 'high' && (
                              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                                High Priority
                              </span>
                            )}
                          </h4>
                          <p className="text-slate-400 mt-1">{insight.message}</p>
                        </div>
                        {insight.metric && (
                          <div className="text-right shrink-0">
                            <div className="text-2xl font-bold text-white">{insight.metric.value}</div>
                            <div className="text-xs text-slate-500">{insight.metric.label}</div>
                            {insight.metric.trend && (
                              <div className={`text-xs ${
                                insight.metric.trend === 'up' ? 'text-emerald-400' : 
                                insight.metric.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                              }`}>
                                {insight.metric.trend === 'up' ? '↑' : insight.metric.trend === 'down' ? '↓' : '→'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {insight.action && (
                        <button
                          onClick={() => onNavigate(insight.action!.tab)}
                          className="mt-4 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors group"
                        >
                          {insight.action.label}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Quick Actions */}
      {insights.length > 0 && (
        <div className="glass-card p-6">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Quick Actions Based on Insights
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigate('pipeline')}
              className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-left transition-colors group"
            >
              <Briefcase className="w-5 h-5 text-blue-400 mb-2" />
              <div className="text-sm font-medium text-white">Review Pipeline</div>
              <div className="text-xs text-slate-500 mt-1">{applications.length} applications</div>
            </button>
            <button
              onClick={() => onNavigate('coverage')}
              className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-left transition-colors group"
            >
              <Users className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="text-sm font-medium text-white">Network Check</div>
              <div className="text-xs text-slate-500 mt-1">{contacts.length} contacts</div>
            </button>
            <button
              onClick={() => onNavigate('reminders')}
              className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-left transition-colors group"
            >
              <Clock className="w-5 h-5 text-amber-400 mb-2" />
              <div className="text-sm font-medium text-white">Check Deadlines</div>
              <div className="text-xs text-slate-500 mt-1">Upcoming tasks</div>
            </button>
            <button
              onClick={() => onNavigate('prep')}
              className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-left transition-colors group"
            >
              <Target className="w-5 h-5 text-purple-400 mb-2" />
              <div className="text-sm font-medium text-white">Interview Prep</div>
              <div className="text-xs text-slate-500 mt-1">Practice questions</div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SmartInsightsEngine
