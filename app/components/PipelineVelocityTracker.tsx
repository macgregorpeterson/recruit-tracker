'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Timer,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  BarChart3,
  Calendar,
  ChevronRight,
  ArrowRight,
  Gauge,
  Activity,
  Speedometer,
  Hourglass
} from 'lucide-react'
import { Application, ApplicationStatus, STATUS_ORDER, STATUS_COLORS, STATUS_LABELS } from '../types'

interface StageMetrics {
  stage: ApplicationStatus
  avgDays: number
  medianDays: number
  minDays: number
  maxDays: number
  count: number
  velocity: 'fast' | 'normal' | 'slow'
  trend: 'improving' | 'stable' | 'worsening'
}

interface PipelineVelocity {
  overall: {
    avgTotalDays: number
    medianTotalDays: number
    fastestOffer: number
    slowestOffer: number
    activeApplications: number
    completedApplications: number
  }
  byStage: StageMetrics[]
  bottlenecks: string[]
  recommendations: string[]
}

interface PipelineVelocityTrackerProps {
  applications: Application[]
  onViewApplication: (id: string) => void
}

// Calculate days between two dates
const daysBetween = (start: string, end: string): number => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
}

// Get mock stage transitions (in real app, would come from database)
const getStageTransitions = (app: Application): { stage: ApplicationStatus; enteredAt: string }[] => {
  // Mock data - simulate realistic stage transitions
  const transitions: { stage: ApplicationStatus; enteredAt: string }[] = []
  const applied = new Date(app.applied_date || app.created_at || Date.now())
  
  transitions.push({ stage: 'applied', enteredAt: applied.toISOString() })
  
  if (app.status !== 'applied') {
    const phoneScreen = new Date(applied.getTime() + 7 * 24 * 60 * 60 * 1000)
    transitions.push({ stage: 'phone-screen', enteredAt: phoneScreen.toISOString() })
  }
  
  if (['first-round', 'second-round', 'superday', 'offer', 'accepted'].includes(app.status)) {
    const firstRound = new Date(applied.getTime() + 14 * 24 * 60 * 60 * 1000)
    transitions.push({ stage: 'first-round', enteredAt: firstRound.toISOString() })
  }
  
  if (['second-round', 'superday', 'offer', 'accepted'].includes(app.status)) {
    const secondRound = new Date(applied.getTime() + 21 * 24 * 60 * 60 * 1000)
    transitions.push({ stage: 'second-round', enteredAt: secondRound.toISOString() })
  }
  
  if (['superday', 'offer', 'accepted'].includes(app.status)) {
    const superday = new Date(applied.getTime() + 28 * 24 * 60 * 60 * 1000)
    transitions.push({ stage: 'superday', enteredAt: superday.toISOString() })
  }
  
  if (['offer', 'accepted'].includes(app.status)) {
    const offer = new Date(applied.getTime() + 35 * 24 * 60 * 60 * 1000)
    transitions.push({ stage: 'offer', enteredAt: offer.toISOString() })
  }
  
  if (app.status === 'accepted') {
    const accepted = new Date(applied.getTime() + 42 * 24 * 60 * 60 * 1000)
    transitions.push({ stage: 'accepted', enteredAt: accepted.toISOString() })
  }
  
  return transitions
}

export function PipelineVelocityTracker({ applications, onViewApplication }: PipelineVelocityTrackerProps) {
  const [selectedStage, setSelectedStage] = useState<ApplicationStatus | null>(null)
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '6m' | 'all'>('all')

  const velocity = useMemo<PipelineVelocity>(() => {
    const completed = applications.filter(a => 
      ['offer', 'accepted', 'rejected', 'withdrawn'].includes(a.status)
    )
    const active = applications.filter(a => 
      !['rejected', 'withdrawn', 'accepted'].includes(a.status)
    )

    // Calculate overall metrics
    const totalDays = completed.map(app => {
      const transitions = getStageTransitions(app)
      if (transitions.length < 2) return 0
      return daysBetween(transitions[0].enteredAt, transitions[transitions.length - 1].enteredAt)
    }).filter(d => d > 0)

    const avgTotalDays = totalDays.length > 0 
      ? Math.round(totalDays.reduce((a, b) => a + b, 0) / totalDays.length)
      : 0
    
    const sortedDays = [...totalDays].sort((a, b) => a - b)
    const medianTotalDays = sortedDays.length > 0
      ? sortedDays[Math.floor(sortedDays.length / 2)]
      : 0

    // Calculate by stage
    const stageMetrics: StageMetrics[] = []
    const relevantStages: ApplicationStatus[] = ['applied', 'phone-screen', 'first-round', 'second-round', 'superday', 'offer']
    
    relevantStages.forEach((stage, idx) => {
      const nextStage = relevantStages[idx + 1]
      if (!nextStage) return

      const stageDurations: number[] = []
      
      applications.forEach(app => {
        const transitions = getStageTransitions(app)
        const currentStageIdx = transitions.findIndex(t => t.stage === stage)
        const nextStageIdx = transitions.findIndex(t => t.stage === nextStage)
        
        if (currentStageIdx !== -1 && nextStageIdx !== -1) {
          const duration = daysBetween(
            transitions[currentStageIdx].enteredAt,
            transitions[nextStageIdx].enteredAt
          )
          if (duration > 0) stageDurations.push(duration)
        }
      })

      if (stageDurations.length > 0) {
        const sorted = [...stageDurations].sort((a, b) => a - b)
        const avg = Math.round(stageDurations.reduce((a, b) => a + b, 0) / stageDurations.length)
        const median = sorted[Math.floor(sorted.length / 2)]
        
        // Determine velocity
        let velocity: 'fast' | 'normal' | 'slow'
        if (avg <= 7) velocity = 'fast'
        else if (avg <= 14) velocity = 'normal'
        else velocity = 'slow'

        // Determine trend (mock data for demo)
        const trend = Math.random() > 0.6 ? 'improving' : Math.random() > 0.3 ? 'stable' : 'worsening'

        stageMetrics.push({
          stage,
          avgDays: avg,
          medianDays: median,
          minDays: sorted[0],
          maxDays: sorted[sorted.length - 1],
          count: stageDurations.length,
          velocity,
          trend
        })
      }
    })

    // Identify bottlenecks
    const bottlenecks = stageMetrics
      .filter(s => s.velocity === 'slow')
      .map(s => STATUS_LABELS[s.stage])

    // Generate recommendations
    const recommendations: string[] = []
    if (bottlenecks.includes('Applied')) {
      recommendations.push('Consider following up on applications stuck in "Applied" for >2 weeks')
    }
    if (bottlenecks.includes('First Round')) {
      recommendations.push('Practice technical skills to move faster through first rounds')
    }
    if (avgTotalDays > 45) {
      recommendations.push('Your average time to offer is above industry standard (45 days)')
    }
    if (stageMetrics.some(s => s.stage === 'phone-screen' && s.count < 3)) {
      recommendations.push('Increase outreach to get more phone screens')
    }

    return {
      overall: {
        avgTotalDays,
        medianTotalDays,
        fastestOffer: sortedDays[0] || 0,
        slowestOffer: sortedDays[sortedDays.length - 1] || 0,
        activeApplications: active.length,
        completedApplications: completed.length
      },
      byStage: stageMetrics,
      bottlenecks,
      recommendations
    }
  }, [applications])

  const getVelocityColor = (velocity: string) => {
    switch (velocity) {
      case 'fast': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      case 'normal': return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
      case 'slow': return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-emerald-400" />
      case 'worsening': return <TrendingDown className="w-4 h-4 text-red-400" />
      default: return <Activity className="w-4 h-4 text-slate-400" />
    }
  }

  // Get applications for selected stage
  const getStageApplications = (stage: ApplicationStatus) => {
    return applications.filter(app => {
      const transitions = getStageTransitions(app)
      return transitions.some(t => t.stage === stage)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
            <Timer className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Pipeline Velocity</h2>
            <p className="text-sm text-slate-400">Track time spent in each recruiting stage</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(['30d', '90d', '6m', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {range === 'all' ? 'All Time' : range}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-slate-400">Avg Time to Offer</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {velocity.overall.avgTotalDays}
            <span className="text-lg text-slate-500"> days</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Median: {velocity.overall.medianTotalDays} days
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-slate-400">Fastest Offer</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">
            {velocity.overall.fastestOffer || '-'}
            <span className="text-lg text-slate-500"> days</span>
          </div>
          <div className="text-xs text-emerald-500/70 mt-1">
            Industry avg: 45 days
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Hourglass className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-slate-400">Slowest Offer</span>
          </div>
          <div className="text-3xl font-bold text-amber-400">
            {velocity.overall.slowestOffer || '-'}
            <span className="text-lg text-slate-500"> days</span>
          </div>
          <div className="text-xs text-amber-500/70 mt-1">
            Review for delays
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-400">Active Pipeline</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {velocity.overall.activeApplications}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {velocity.overall.completedApplications} completed
          </div>
        </motion.div>
      </div>

      {/* Stage Velocity Chart */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-orange-400" />
          Time by Stage
        </h3>
        <div className="space-y-4">
          {velocity.byStage.map((stage, idx) => (
            <motion.div
              key={stage.stage}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedStage(selectedStage === stage.stage ? null : stage.stage)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedStage === stage.stage
                  ? 'bg-slate-800/50 border-orange-500/30'
                  : 'bg-slate-800/20 border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getVelocityColor(stage.velocity)}`}>
                    {stage.velocity.toUpperCase()}
                  </span>
                  <h4 className="font-medium text-white">{STATUS_LABELS[stage.stage]}</h4>
                  <span className="text-sm text-slate-500">({stage.count} applications)</span>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(stage.trend)}
                  <span className="text-lg font-semibold text-white">{stage.avgDays} days</span>
                  <ChevronRight className={`w-5 h-5 text-slate-500 transition-transform ${
                    selectedStage === stage.stage ? 'rotate-90' : ''
                  }`} />
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((stage.avgDays / 21) * 100, 100)}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`h-full rounded-full ${
                    stage.velocity === 'fast' ? 'bg-emerald-500' :
                    stage.velocity === 'normal' ? 'bg-blue-500' :
                    'bg-amber-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Min: {stage.minDays}d</span>
                <span>Median: {stage.medianDays}d</span>
                <span>Max: {stage.maxDays}d</span>
              </div>

              {/* Expanded Details */}
              {selectedStage === stage.stage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-slate-700/50"
                >
                  <h5 className="text-sm font-medium text-slate-300 mb-3">Applications in this stage:</h5>
                  <div className="space-y-2">
                    {getStageApplications(stage.stage).slice(0, 5).map((app) => {
                      const transitions = getStageTransitions(app)
                      const stageEntry = transitions.find(t => t.stage === stage.stage)
                      const daysInStage = stageEntry 
                        ? daysBetween(stageEntry.enteredAt, new Date().toISOString())
                        : 0

                      return (
                        <div
                          key={app.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            onViewApplication(app.id)
                          }}
                          className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 cursor-pointer"
                        >
                          <div>
                            <span className="font-medium text-white">{app.firm}</span>
                            <span className="text-slate-400 mx-2">•</span>
                            <span className="text-sm text-slate-400">{app.role}</span>
                          </div>
                          <span className={`text-sm ${
                            daysInStage > 14 ? 'text-amber-400' : 'text-slate-400'
                          }`}>
                            {daysInStage} days
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottlenecks & Recommendations */}
      <div className="grid grid-cols-2 gap-4">
        {velocity.bottlenecks.length > 0 && (
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h4 className="font-semibold text-white">Bottlenecks</h4>
            </div>
            <div className="space-y-2">
              {velocity.bottlenecks.map((bottleneck, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs text-amber-400">
                    {i + 1}
                  </div>
                  <span>{bottleneck} stage is slow</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {velocity.recommendations.length > 0 && (
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="w-5 h-5 text-emerald-400" />
              <h4 className="font-semibold text-white">Recommendations</h4>
            </div>
            <div className="space-y-2">
              {velocity.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Velocity Tips */}
      <div className="glass-card p-5 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Velocity Tips
        </h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="font-medium text-emerald-400 mb-1">Fast (&lt;7 days)</div>
            <p className="text-slate-400">Great! Keep momentum with quick follow-ups.</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="font-medium text-blue-400 mb-1">Normal (7-14 days)</div>
            <p className="text-slate-400">Standard pace. Monitor for any delays.</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="font-medium text-amber-400 mb-1">Slow (&gt;14 days)</div>
            <p className="text-slate-400">Consider follow-up or alternative paths.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PipelineVelocityTracker
