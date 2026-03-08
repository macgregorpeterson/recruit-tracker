'use client'

import { motion } from 'framer-motion'
import { DashboardStats, ApplicationStatus, STATUS_ORDER, STATUS_LABELS } from '../types'
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Zap
} from 'lucide-react'

interface AnalyticsDashboardProps {
  stats: DashboardStats
  applications: any[]
}

export function AnalyticsDashboard({ stats, applications }: AnalyticsDashboardProps) {
  // Calculate stage conversion rates
  const getStageCount = (status: ApplicationStatus) => 
    applications.filter(a => a.status === status).length

  const appliedCount = getStageCount('applied')
  const phoneCount = getStageCount('phone-screen')
  const firstRoundCount = getStageCount('first-round')
  const secondRoundCount = getStageCount('second-round')
  const superdayCount = getStageCount('superday')
  const offerCount = getStageCount('offer')

  const conversionRate = appliedCount > 0 ? Math.round((offerCount / appliedCount) * 100) : 0
  const interviewRate = appliedCount > 0 ? Math.round(((phoneCount + firstRoundCount + secondRoundCount + superdayCount) / appliedCount) * 100) : 0

  // Get top targeted firms
  const firmCounts = applications.reduce((acc, app) => {
    acc[app.firm] = (acc[app.firm] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topFirms = Object.entries(firmCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Calculate pipeline health score
  const activeApps = applications.filter(a => 
    !['rejected', 'withdrawn', 'accepted'].includes(a.status)
  ).length
  const pipelineHealth = Math.min(100, (activeApps / 15) * 100) // Target 15 active apps for 100%

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            Analytics & Insights
          </h2>
          <p className="text-slate-400 mt-1">Data-driven insights for your recruiting journey</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Target}
          label="Offer Conversion"
          value={`${conversionRate}%`}
          subValue={offerCount > 0 ? `${offerCount} offers from ${appliedCount} apps` : 'Apply to see rate'}
          trend={conversionRate > 10 ? '+Strong' : undefined}
          color="emerald"
        />
        <MetricCard
          icon={Zap}
          label="Interview Rate"
          value={`${interviewRate}%`}
          subValue="Getting first conversations"
          color="blue"
        />
        <MetricCard
          icon={PieChart}
          label="Pipeline Health"
          value={`${Math.round(pipelineHealth)}%`}
          subValue={`${activeApps} active applications`}
          color={pipelineHealth > 60 ? 'purple' : 'orange'}
        />
        <MetricCard
          icon={Clock}
          label="Avg. Time to Offer"
          value="--"
          subValue="Need completed offers"
          color="amber"
        />
      </div>

      {/* Pipeline Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Pipeline Funnel
          </h3>
          <div className="space-y-3">
            <FunnelBar 
              label="Applied" 
              count={appliedCount} 
              total={Math.max(appliedCount, 1)} 
              color="bg-slate-500" 
            />
            <FunnelBar 
              label="Phone Screen" 
              count={phoneCount} 
              total={Math.max(appliedCount, 1)} 
              color="bg-blue-500" 
            />
            <FunnelBar 
              label="First Round" 
              count={firstRoundCount} 
              total={Math.max(appliedCount, 1)} 
              color="bg-yellow-500" 
            />
            <FunnelBar 
              label="Second Round" 
              count={secondRoundCount} 
              total={Math.max(appliedCount, 1)} 
              color="bg-orange-500" 
            />
            <FunnelBar 
              label="Superday" 
              count={superdayCount} 
              total={Math.max(appliedCount, 1)} 
              color="bg-purple-500" 
            />
            <FunnelBar 
              label="Offers" 
              count={offerCount} 
              total={Math.max(appliedCount, 1)} 
              color="bg-emerald-500" 
            />
          </div>
        </div>

        {/* Top Targeted Firms */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Most Targeted Firms
          </h3>
          {topFirms.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No applications yet</p>
              <p className="text-sm mt-1">Add applications to see your top targets</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topFirms.map(([firm, count], index) => (
                <motion.div
                  key={firm}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-400">
                      {index + 1}
                    </span>
                    <span className="text-slate-200">{firm}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / (topFirms[0][1] || 1)) * 100}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      />
                    </div>
                    <span className="text-sm text-slate-400 w-6 text-right">{count}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Smart Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecommendationCard
            type="info"
            title="Diversify Your Pipeline"
            description="You're heavily concentrated in 2 firms. Consider adding 5-7 more targets to improve your odds."
            show={topFirms.length > 0 && topFirms[0][1] >= 3}
          />
          <RecommendationCard
            type="action"
            title="Follow Up on Applications"
            description={`You have ${appliedCount} applications in 'Applied' stage. Consider reaching out to recruiters.`}
            show={appliedCount >= 3}
          />
          <RecommendationCard
            type="success"
            title="Strong Interview Rate!"
            description="You're converting applications to interviews well. Keep up the networking!"
            show={interviewRate > 30}
          />
          <RecommendationCard
            type="warning"
            title="Build Your Coverage Book"
            description="More contacts = better referrals. Aim for 3-5 contacts per target firm."
            show={stats.totalContacts < 10}
          />
        </div>
      </div>
    </div>
  )
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  trend,
  color 
}: { 
  icon: React.ElementType
  label: string
  value: string
  subValue: string
  trend?: string
  color: string
}) {
  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400', border: 'border-blue-500/20' },
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'border-purple-500/20' },
    amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'border-amber-500/20' },
    orange: { bg: 'bg-orange-500/10', icon: 'text-orange-400', border: 'border-orange-500/20' },
  }

  const colors = colorClasses[color]

  return (
    <div className={`glass-card p-4 ${colors.border}`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-400 flex items-center">
            {trend}
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-slate-400">{label}</div>
        <div className="text-xs text-slate-500 mt-1">{subValue}</div>
      </div>
    </div>
  )
}

function FunnelBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-slate-400 w-28">{label}</span>
      <div className="flex-1 h-8 bg-slate-800/50 rounded-lg overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full ${color} rounded-lg flex items-center justify-end px-3`}
        >
          {count > 0 && <span className="text-sm font-medium text-white">{count}</span>}
        </motion.div>
      </div>
      <span className="text-sm text-slate-500 w-12 text-right">{percentage.toFixed(0)}%</span>
    </div>
  )
}

function RecommendationCard({ 
  type, 
  title, 
  description, 
  show 
}: { 
  type: 'info' | 'action' | 'success' | 'warning'
  title: string
  description: string
  show: boolean
}) {
  if (!show) return null

  const colors = {
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    action: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border ${colors[type]}`}
    >
      <h4 className="font-medium text-white mb-1">{title}</h4>
      <p className="text-sm text-slate-300">{description}</p>
    </motion.div>
  )
}
