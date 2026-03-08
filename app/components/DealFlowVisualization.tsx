'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Briefcase,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react'
import { Application, ApplicationStatus } from '../types'

interface DealFlowVisualizationProps {
  applications: Application[]
  onSelectApplication: (app: Application) => void
}

interface DealStage {
  id: ApplicationStatus
  label: string
  description: string
  icon: React.ElementType
  color: string
  gradient: string
}

const DEAL_STAGES: DealStage[] = [
  { 
    id: 'applied', 
    label: 'Applied', 
    description: 'Initial submission',
    icon: Briefcase,
    color: 'text-slate-300',
    gradient: 'from-slate-500 to-slate-600'
  },
  { 
    id: 'phone-screen', 
    label: 'Phone Screen', 
    description: 'Recruiter call',
    icon: Users,
    color: 'text-blue-300',
    gradient: 'from-blue-500 to-blue-600'
  },
  { 
    id: 'first-round', 
    label: 'First Round', 
    description: 'Initial interviews',
    icon: Target,
    color: 'text-yellow-300',
    gradient: 'from-yellow-500 to-yellow-600'
  },
  { 
    id: 'second-round', 
    label: 'Second Round', 
    description: 'Team interviews',
    icon: Users,
    color: 'text-orange-300',
    gradient: 'from-orange-500 to-orange-600'
  },
  { 
    id: 'superday', 
    label: 'Superday', 
    description: 'Final round',
    icon: Building2,
    color: 'text-purple-300',
    gradient: 'from-purple-500 to-purple-600'
  },
  { 
    id: 'offer', 
    label: 'Offer', 
    description: 'Offer received',
    icon: DollarSign,
    color: 'text-emerald-300',
    gradient: 'from-emerald-500 to-emerald-600'
  },
]

interface DealFlowItem extends Application {
  stageIndex: number
  progress: number
  daysInStage: number
  velocity: 'fast' | 'normal' | 'slow'
}

export function DealFlowVisualization({ applications, onSelectApplication }: DealFlowVisualizationProps) {
  const [selectedFirm, setSelectedFirm] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'pipeline' | 'timeline'>('pipeline')

  // Process applications into deal flow items
  const dealFlowItems: DealFlowItem[] = useMemo(() => {
    const now = new Date()
    
    return applications
      .filter(app => !['withdrawn', 'rejected'].includes(app.status))
      .map(app => {
        const stageIndex = DEAL_STAGES.findIndex(s => s.id === app.status)
        const appliedDate = app.applied_date ? new Date(app.applied_date) : now
        const daysInStage = Math.floor((now.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24))
        
        let velocity: 'fast' | 'normal' | 'slow' = 'normal'
        if (daysInStage < 7) velocity = 'fast'
        else if (daysInStage > 21) velocity = 'slow'
        
        return {
          ...app,
          stageIndex: stageIndex >= 0 ? stageIndex : 0,
          progress: Math.min(((stageIndex + 1) / DEAL_STAGES.length) * 100, 100),
          daysInStage,
          velocity
        }
      })
      .sort((a, b) => b.stageIndex - a.stageIndex || a.daysInStage - b.daysInStage)
  }, [applications])

  // Group by stage
  const stageGroups = useMemo(() => {
    const groups: Record<string, DealFlowItem[]> = {}
    DEAL_STAGES.forEach(stage => {
      groups[stage.id] = dealFlowItems.filter(item => item.status === stage.id)
    })
    return groups
  }, [dealFlowItems])

  // Get unique firms for filter
  const firms = useMemo(() => 
    [...new Set(dealFlowItems.map(item => item.firm))].sort(),
    [dealFlowItems]
  )

  const filteredItems = selectedFirm 
    ? dealFlowItems.filter(item => item.firm === selectedFirm)
    : dealFlowItems

  const stats = {
    totalActive: dealFlowItems.length,
    avgProgress: dealFlowItems.length > 0 
      ? Math.round(dealFlowItems.reduce((sum, item) => sum + item.progress, 0) / dealFlowItems.length)
      : 0,
    fastMoving: dealFlowItems.filter(item => item.velocity === 'fast').length,
    stalled: dealFlowItems.filter(item => item.velocity === 'slow').length,
    offers: dealFlowItems.filter(item => item.status === 'offer').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            Deal Flow
          </h2>
          <p className="text-slate-400 mt-1">Track your recruiting pipeline progression</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Firm Filter */}
          <select
            value={selectedFirm || ''}
            onChange={(e) => setSelectedFirm(e.target.value || null)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">All Firms</option>
            {firms.map(firm => (
              <option key={firm} value={firm}>{firm}</option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'pipeline'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'timeline'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Active Deals" value={stats.totalActive} icon={Briefcase} color="blue" />
        <StatCard label="Avg Progress" value={`${stats.avgProgress}%`} icon={Target} color="indigo" />
        <StatCard label="Fast Moving" value={stats.fastMoving} icon={ArrowUpRight} color="emerald" />
        <StatCard label="Stalled" value={stats.stalled} icon={Clock} color="orange" />
        <StatCard label="Offers" value={stats.offers} icon={DollarSign} color="green" />
      </div>

      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <div className="space-y-4">
          {DEAL_STAGES.map((stage, stageIndex) => {
            const items = stageGroups[stage.id] || []
            if (items.length === 0) return null

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stageIndex * 0.1 }}
                className="bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden"
              >
                {/* Stage Header */}
                <div className={`p-4 bg-gradient-to-r ${stage.gradient} bg-opacity-10`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-slate-900/50 flex items-center justify-center ${stage.color}`}>
                        <stage.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{stage.label}</h3>
                        <p className="text-sm text-slate-400">{stage.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-white">{items.length}</span>
                      <span className="text-sm text-slate-400">deals</span>
                    </div>
                  </div>
                </div>

                {/* Stage Items */}
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((item) => (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectApplication(item)}
                        className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600 text-left transition-all group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                            {item.firm}
                          </h4>
                          <VelocityIndicator velocity={item.velocity} />
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{item.role}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            {item.daysInStage} days
                          </span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span className="text-slate-400">
                              {Math.round(item.progress)}%
                            </span>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            className={`h-full rounded-full bg-gradient-to-r ${stage.gradient}`}
                          />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No active deals</h3>
              <p className="text-slate-400">Start adding applications to see your deal flow</p>
            </div>
          )}
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-6">
          <div className="space-y-6">
            {filteredItems.map((item, index) => (
              <TimelineItem 
                key={item.id} 
                item={item} 
                index={index}
                onClick={() => onSelectApplication(item)}
              />
            ))}
            
            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">No applications match your criteria</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function VelocityIndicator({ velocity }: { velocity: 'fast' | 'normal' | 'slow' }) {
  const config = {
    fast: { icon: ArrowUpRight, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    normal: { icon: Minus, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    slow: { icon: ArrowDownRight, color: 'text-orange-400', bg: 'bg-orange-500/10' }
  }

  const { icon: Icon, color, bg } = config[velocity]

  return (
    <div className={`w-6 h-6 rounded-lg ${bg} flex items-center justify-center`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400' }
  }

  const { bg, text } = colors[color]

  return (
    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
      <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${text}`} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  )
}

function TimelineItem({ item, index, onClick }: { item: DealFlowItem; index: number; onClick: () => void }) {
  const stage = DEAL_STAGES[item.stageIndex]
  const StageIcon = stage?.icon || Briefcase

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="flex items-center gap-4 cursor-pointer group"
    >
      {/* Timeline Line */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${stage?.gradient || 'from-slate-500 to-slate-600'}`} />
        {index < 999 && <div className="w-0.5 h-16 bg-slate-700 mt-1" />}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all group-hover:bg-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
              {item.firm}
            </h4>
            <p className="text-sm text-slate-400">{item.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${stage?.gradient || ''} bg-opacity-10 ${stage?.color || 'text-slate-300'}`}>
              {stage?.label}
            </span>
            <VelocityIndicator velocity={item.velocity} />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {item.applied_date ? new Date(item.applied_date).toLocaleDateString() : 'N/A'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {item.daysInStage} days in stage
          </span>
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {Math.round(item.progress)}% complete
          </span>
        </div>
      </div>
    </motion.div>
  )
}
