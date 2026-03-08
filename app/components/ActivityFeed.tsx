'use client'

import { motion } from 'framer-motion'
import { 
  User, 
  Briefcase, 
  Calendar, 
  FileText,
  Plus,
  Edit3,
  CheckCircle2,
  ArrowRight,
  Clock
} from 'lucide-react'

export type ActivityType = 'contact' | 'application' | 'event' | 'note'
export type ActivityAction = 'created' | 'updated' | 'status_changed' | 'completed'

export interface Activity {
  id: string
  type: ActivityType
  action: ActivityAction
  entityId: string
  entityName: string
  entityTitle?: string
  metadata?: Record<string, any>
  createdAt: string
}

interface ActivityFeedProps {
  activities: Activity[]
  maxItems?: number
  showViewAll?: boolean
  onViewAll?: () => void
}

const activityConfig: Record<ActivityType, { icon: React.ElementType; color: string; label: string }> = {
  contact: { icon: User, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Contact' },
  application: { icon: Briefcase, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', label: 'Application' },
  event: { icon: Calendar, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Event' },
  note: { icon: FileText, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Note' },
}

const actionConfig: Record<ActivityAction, { icon: React.ElementType; label: string }> = {
  created: { icon: Plus, label: 'added' },
  updated: { icon: Edit3, label: 'updated' },
  status_changed: { icon: ArrowRight, label: 'moved to' },
  completed: { icon: CheckCircle2, label: 'completed' },
}

export function ActivityFeed({ activities, maxItems = 10, showViewAll, onViewAll }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems)

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500">No activity yet</p>
        <p className="text-sm text-slate-600 mt-1">Your recent actions will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {displayActivities.map((activity, index) => (
        <ActivityItem key={activity.id} activity={activity} index={index} />
      ))}
      
      {showViewAll && activities.length > maxItems && onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full py-3 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          View all activity →
        </button>
      )}
    </div>
  )
}

function ActivityItem({ activity, index }: { activity: Activity; index: number }) {
  const config = activityConfig[activity.type]
  const action = actionConfig[activity.action]
  const Icon = config.icon
  const ActionIcon = action.icon

  const timeAgo = getTimeAgo(activity.createdAt)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 group"
    >
      {/* Icon */}
      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${config.color}`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-slate-300">
            <span className="font-medium text-white">{activity.entityName}</span>
            {' '}
            <span className="text-slate-500">{action.label}</span>
            {' '}
            {activity.action === 'status_changed' && activity.metadata?.newStatus && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300">
                {activity.metadata.newStatus}
              </span>
            )}
            {activity.entityTitle && activity.action !== 'status_changed' && (
              <span className="text-slate-400">{activity.entityTitle}</span>
            )}
          </p>
          <span className="text-xs text-slate-600 shrink-0">{timeAgo}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{config.label}</p>
      </div>
    </motion.div>
  )
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Helper function to create activity items
export function createActivity(
  type: ActivityType,
  action: ActivityAction,
  entityId: string,
  entityName: string,
  entityTitle?: string,
  metadata?: Record<string, any>
): Activity {
  return {
    id: Math.random().toString(36).substring(2, 9),
    type,
    action,
    entityId,
    entityName,
    entityTitle,
    metadata,
    createdAt: new Date().toISOString(),
  }
}
