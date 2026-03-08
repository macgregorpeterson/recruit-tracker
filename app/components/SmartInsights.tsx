'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  Users,
  Briefcase,
  Calendar,
  Target,
  Zap,
  ArrowRight,
  Lightbulb,
  Brain,
  BarChart3
} from 'lucide-react'
import { ApplicationStatus, STATUS_ORDER } from '../types'

interface SmartInsightsProps {
  contacts: any[]
  applications: any[]
  events: any[]
  notes: any[]
  onAction: (action: string, data?: any) => void
}

interface Insight {
  id: string
  type: 'action' | 'warning' | 'celebration' | 'tip' | 'pattern'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action?: {
    label: string
    route: string
    data?: any
  }
  icon: any
  color: string
}

export function SmartInsights({ contacts, applications, events, notes, onAction }: SmartInsightsProps) {
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([])
  const [showAll, setShowAll] = useState(false)

  const insights = useMemo(() => {
    const generatedInsights: Insight[] = []

    // Calculate days since last contact for each contact
    const now = new Date()
    contacts.forEach(contact => {
      const lastContact = contact.last_contact_date ? new Date(contact.last_contact_date) : null
      const daysSince = lastContact ? Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)) : 999
      
      if (daysSince > 30 && daysSince < 45) {
        generatedInsights.push({
          id: `followup-${contact.id}`,
          type: 'action',
          priority: 'medium',
          title: `Follow up with ${contact.name}`,
          description: `It's been ${daysSince} days since your last interaction. Time to maintain the relationship!`,
          action: { label: 'View Contact', route: 'coverage', data: { contactId: contact.id } },
          icon: Users,
          color: 'blue'
        })
      }
    })

    // Check for applications without recent activity
    const activeApps = applications.filter(app => 
      !['rejected', 'withdrawn', 'accepted', 'offer'].includes(app.status)
    )
    
    activeApps.forEach(app => {
      const appliedDate = app.applied_date ? new Date(app.applied_date) : null
      const daysSince = appliedDate ? Math.floor((now.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
      
      if (daysSince > 21 && app.status === 'applied') {
        generatedInsights.push({
          id: `stuck-${app.id}`,
          type: 'warning',
          priority: 'high',
          title: `${app.firm} application may be stuck`,
          description: `No movement in ${daysSince} days. Consider reaching out to your contacts there.`,
          action: { label: 'View Pipeline', route: 'pipeline', data: { appId: app.id } },
          icon: AlertCircle,
          color: 'amber'
        })
      }
    })

    // Celebrate milestones
    const offerCount = applications.filter(a => a.status === 'offer').length
    if (offerCount > 0 && offerCount % 5 === 0) {
      generatedInsights.push({
        id: `milestone-offers`,
        type: 'celebration',
        priority: 'low',
        title: `🎉 ${offerCount} Offers!`,
        description: 'You\'ve received multiple offers. Great work on your recruiting journey!',
        icon: CheckCircle2,
        color: 'emerald'
      })
    }

    // Interview prep reminders
    const upcomingInterviews = events.filter(e => 
      e.event_type?.includes('round') || e.event_type === 'superday'
    ).filter(e => {
      const eventDate = new Date(e.start_time)
      const daysUntil = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntil >= 0 && daysUntil <= 3
    })

    upcomingInterviews.forEach(event => {
      const daysUntil = Math.floor((new Date(event.start_time).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      generatedInsights.push({
        id: `prep-${event.id}`,
        type: 'action',
        priority: 'high',
        title: `${event.firm || 'Interview'} ${daysUntil === 0 ? 'today' : 'in ' + daysUntil + ' days'}`,
        description: `Prepare for your ${event.event_type?.replace('-', ' ')}. Review your notes and practice key questions.`,
        action: { label: 'Start Prep', route: 'prep', data: { eventId: event.id } },
        icon: Brain,
        color: 'purple'
      })
    })

    // Pipeline conversion tips
    const totalApplied = applications.length
    const interviewStages = ['phone-screen', 'first-round', 'second-round', 'superday']
    const interviewCount = applications.filter(a => interviewStages.includes(a.status)).length
    
    if (totalApplied > 10 && interviewCount / totalApplied < 0.2) {
      generatedInsights.push({
        id: 'low-conversion',
        type: 'tip',
        priority: 'medium',
        title: 'Low interview conversion rate',
        description: `Only ${Math.round((interviewCount / totalApplied) * 100)}% of applications are converting to interviews. Consider enhancing your resume or getting more referrals.`,
        action: { label: 'View Analytics', route: 'analytics' },
        icon: TrendingUp,
        color: 'pink'
      })
    }

    // Calendar gaps
    const nextWeekEvents = events.filter(e => {
      const eventDate = new Date(e.start_time)
      const daysUntil = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntil >= 0 && daysUntil <= 7
    })

    if (nextWeekEvents.length === 0 && activeApps.length > 0) {
      generatedInsights.push({
        id: 'calendar-gap',
        type: 'action',
        priority: 'low',
        title: 'No events scheduled this week',
        description: 'Your calendar is open. Time to schedule some coffee chats or follow-ups!',
        action: { label: 'Schedule Events', route: 'calendar' },
        icon: Calendar,
        color: 'cyan'
      })
    }

    // Firm research gaps
    const appliedFirms = [...new Set(applications.map(a => a.firm))]
    const researchedFirms = [] // Would come from firm research data
    const unresearched = appliedFirms.filter(f => !researchedFirms.includes(f))
    
    if (unresearched.length > 0) {
      generatedInsights.push({
        id: 'research-gap',
        type: 'tip',
        priority: 'medium',
        title: `Research needed for ${unresearched.length} firms`,
        description: `You've applied to ${unresearched.join(', ')} but haven't added research notes.`,
        action: { label: 'Add Research', route: 'research' },
        icon: Target,
        color: 'orange'
      })
    }

    // Networking velocity
    const recentContacts = contacts.filter(c => {
      const created = c.created_at ? new Date(c.created_at) : null
      return created && (now.getTime() - created.getTime()) < (7 * 24 * 60 * 60 * 1000)
    })
    
    if (recentContacts.length >= 5) {
      generatedInsights.push({
        id: 'networking-velocity',
        type: 'celebration',
        priority: 'low',
        title: 'Strong networking week!',
        description: `You added ${recentContacts.length} new contacts this week. Keep up the momentum!`,
        icon: Zap,
        color: 'yellow'
      })
    }

    return generatedInsights.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }, [contacts, applications, events, notes])

  const visibleInsights = showAll 
    ? insights.filter(i => !dismissedInsights.includes(i.id))
    : insights.filter(i => !dismissedInsights.includes(i.id)).slice(0, 4)

  const colorClasses: Record<string, { bg: string; border: string; icon: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-400', text: 'text-blue-400' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: 'text-amber-400', text: 'text-amber-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400', text: 'text-emerald-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-400', text: 'text-purple-400' },
    pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/20', icon: 'text-pink-400', text: 'text-pink-400' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: 'text-cyan-400', text: 'text-cyan-400' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: 'text-orange-400', text: 'text-orange-400' },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: 'text-yellow-400', text: 'text-yellow-400' },
  }

  if (insights.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="font-semibold text-white mb-1">All caught up!</h3>
        <p className="text-sm text-slate-400">No insights right now. Keep up the great work!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">AI Insights</h3>
          <span className="text-xs text-slate-500">({insights.filter(i => !dismissedInsights.includes(i.id)).length})</span>
        </div>
        {insights.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            {showAll ? 'Show Less' : 'View All'}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {visibleInsights.map((insight, index) => {
          const colors = colorClasses[insight.color]
          const Icon = insight.icon

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border ${colors.border} ${colors.bg} relative group`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg bg-slate-900/50 flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white">{insight.title}</h4>
                    {insight.priority === 'high' && (
                      <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">High Priority</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{insight.description}</p>
                  
                  {insight.action && (
                    <button
                      onClick={() => onAction(insight.action!.route, insight.action!.data)}
                      className={`flex items-center gap-1 text-sm ${colors.text} hover:underline`}
                    >
                      {insight.action.label}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setDismissedInsights(prev => [...prev, insight.id])}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-300 transition-all"
                >
                  <span className="sr-only">Dismiss</span>
                  ×
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {insights.filter(i => !dismissedInsights.includes(i.id)).length > 4 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          + {insights.filter(i => !dismissedInsights.includes(i.id)).length - 4} more insights
        </button>
      )}
    </div>
  )
}
