'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Star,
  TrendingUp,
  Target,
  Brain,
  MessageCircle,
  FileText,
  Calendar,
  ChevronRight,
  Plus,
  Edit3,
  BarChart3,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Mic,
  Video,
  Users
} from 'lucide-react'
import { Application, ApplicationStatus, CalendarEvent } from '../types'

interface InterviewRound {
  id: string
  applicationId: string
  roundType: 'phone-screen' | 'first-round' | 'second-round' | 'superday' | 'final'
  date: string
  interviewers?: string[]
  rating?: number
  technicalScore?: number
  behavioralScore?: number
  fitScore?: number
  notes?: string
  feedback?: string
  strengths?: string[]
  improvements?: string[]
  followUpItems?: string[]
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  recordingUrl?: string
}

interface InterviewPerformanceTrackerProps {
  applications: Application[]
  events: CalendarEvent[]
  onAddPerformance: (performance: InterviewRound) => void
  onUpdatePerformance: (id: string, updates: Partial<InterviewRound>) => void
}

const ROUND_CONFIG: Record<string, { icon: any; label: string; color: string; weight: number }> = {
  'phone-screen': { icon: Phone, label: 'Phone Screen', color: 'blue', weight: 1 },
  'first-round': { icon: Users, label: 'First Round', color: 'yellow', weight: 2 },
  'second-round': { icon: Target, label: 'Second Round', color: 'orange', weight: 3 },
  'superday': { icon: Zap, label: 'Superday', color: 'purple', weight: 4 },
  'final': { icon: Trophy, label: 'Final Round', color: 'emerald', weight: 5 },
}

import { Phone } from 'lucide-react'

export function InterviewPerformanceTracker({
  applications,
  events,
  onAddPerformance,
  onUpdatePerformance
}: InterviewPerformanceTrackerProps) {
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewMode, setViewMode] = useState<'overview' | 'detail' | 'analytics'>('overview')
  const [editingRound, setEditingRound] = useState<InterviewRound | null>(null)

  // Mock interview rounds data (would come from database)
  const [interviewRounds, setInterviewRounds] = useState<InterviewRound[]>([
    {
      id: '1',
      applicationId: 'app1',
      roundType: 'phone-screen',
      date: '2026-03-01',
      interviewers: ['John Smith', 'Sarah Chen'],
      rating: 4,
      technicalScore: 85,
      behavioralScore: 90,
      fitScore: 88,
      notes: 'Went well, asked about deal experience',
      feedback: 'Strong technical background, good communication',
      strengths: ['Technical knowledge', 'Communication'],
      improvements: ['More specific examples'],
      followUpItems: ['Send thank you email', 'Prepare for technical round'],
      status: 'completed'
    },
    {
      id: '2',
      applicationId: 'app1',
      roundType: 'first-round',
      date: '2026-03-05',
      interviewers: ['Michael Park'],
      rating: 5,
      technicalScore: 92,
      behavioralScore: 88,
      fitScore: 90,
      notes: 'Excel modeling test went smoothly',
      feedback: 'Excellent modeling skills',
      strengths: ['Financial modeling', 'Attention to detail'],
      improvements: [],
      followUpItems: ['Follow up on superday scheduling'],
      status: 'completed'
    }
  ])

  const activeApplications = applications.filter(a => 
    !['rejected', 'withdrawn', 'accepted'].includes(a.status)
  )

  const getApplicationRounds = (appId: string) => {
    return interviewRounds.filter(r => r.applicationId === appId).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }

  const calculateOverallStats = useMemo(() => {
    const completed = interviewRounds.filter(r => r.status === 'completed')
    if (completed.length === 0) return null

    const avgRating = completed.reduce((sum, r) => sum + (r.rating || 0), 0) / completed.length
    const avgTechnical = completed.reduce((sum, r) => sum + (r.technicalScore || 0), 0) / completed.length
    const avgBehavioral = completed.reduce((sum, r) => sum + (r.behavioralScore || 0), 0) / completed.length
    const avgFit = completed.reduce((sum, r) => sum + (r.fitScore || 0), 0) / completed.length

    const roundTypeStats = Object.keys(ROUND_CONFIG).map(type => {
      const typeRounds = completed.filter(r => r.roundType === type)
      return {
        type,
        count: typeRounds.length,
        avgRating: typeRounds.length > 0 
          ? typeRounds.reduce((sum, r) => sum + (r.rating || 0), 0) / typeRounds.length 
          : 0
      }
    })

    return {
      totalInterviews: completed.length,
      avgRating: Math.round(avgRating * 10) / 10,
      avgTechnical: Math.round(avgTechnical),
      avgBehavioral: Math.round(avgBehavioral),
      avgFit: Math.round(avgFit),
      roundTypeStats,
      improvementAreas: getCommonImprovements(completed),
      topStrengths: getCommonStrengths(completed)
    }
  }, [interviewRounds])

  const getCommonImprovements = (rounds: InterviewRound[]) => {
    const allImprovements = rounds.flatMap(r => r.improvements || [])
    const counts: Record<string, number> = {}
    allImprovements.forEach(i => { counts[i] = (counts[i] || 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([item]) => item)
  }

  const getCommonStrengths = (rounds: InterviewRound[]) => {
    const allStrengths = rounds.flatMap(r => r.strengths || [])
    const counts: Record<string, number> = {}
    allStrengths.forEach(s => { counts[s] = (counts[s] || 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([item]) => item)
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-emerald-400'
    if (rating >= 4) return 'text-blue-400'
    if (rating >= 3) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500'
    if (score >= 80) return 'bg-blue-500'
    if (score >= 70) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Interview Performance</h2>
            <p className="text-sm text-slate-400">Track and analyze your interview performance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            {(['overview', 'detail', 'analytics'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Interview
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {calculateOverallStats && (
        <div className="grid grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-400">Avg Rating</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {calculateOverallStats.avgRating}
              <span className="text-lg text-slate-500">/5</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-400">Technical</span>
            </div>
            <div className="text-3xl font-bold text-white">{calculateOverallStats.avgTechnical}%</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-slate-400">Behavioral</span>
            </div>
            <div className="text-3xl font-bold text-white">{calculateOverallStats.avgBehavioral}%</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-400">Culture Fit</span>
            </div>
            <div className="text-3xl font-bold text-white">{calculateOverallStats.avgFit}%</div>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {activeApplications.map((app, idx) => {
              const rounds = getApplicationRounds(app.id)
              const avgRating = rounds.length > 0
                ? rounds.reduce((sum, r) => sum + (r.rating || 0), 0) / rounds.length
                : 0

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedApplication(app.id)}
                  className={`glass-card p-5 cursor-pointer transition-all hover:scale-[1.01] ${
                    selectedApplication === app.id ? 'ring-2 ring-purple-500/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xl font-bold text-white">
                        {app.firm.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{app.firm}</h3>
                        <p className="text-sm text-slate-400">{app.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-slate-400">Completed Rounds</div>
                        <div className="text-lg font-semibold text-white">{rounds.length}</div>
                      </div>
                      {rounds.length > 0 && (
                        <div className="text-right">
                          <div className="text-sm text-slate-400">Avg Rating</div>
                          <div className={`text-lg font-semibold ${getRatingColor(avgRating)}`}>
                            {avgRating.toFixed(1)}
                          </div>
                        </div>
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    </div>
                  </div>

                  {/* Round Progress */}
                  {rounds.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <div className="flex items-center gap-2">
                        {rounds.map((round, i) => {
                          const config = ROUND_CONFIG[round.roundType]
                          const Icon = config.icon
                          return (
                            <div key={round.id} className="flex items-center">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                round.rating && round.rating >= 4
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-slate-700 text-slate-400'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              {i < rounds.length - 1 && (
                                <div className="w-8 h-0.5 bg-slate-700 mx-1" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {viewMode === 'detail' && selectedApplication && (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {(() => {
              const app = activeApplications.find(a => a.id === selectedApplication)
              const rounds = getApplicationRounds(selectedApplication)
              if (!app) return null

              return (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={() => setSelectedApplication(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ← Back
                    </button>
                    <h3 className="text-lg font-semibold text-white">{app.firm} - Interview History</h3>
                  </div>

                  {rounds.map((round, idx) => (
                    <motion.div
                      key={round.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass-card p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-${ROUND_CONFIG[round.roundType].color}-500/20 flex items-center justify-center`}>
                            {(() => {
                              const Icon = ROUND_CONFIG[round.roundType].icon
                              return <Icon className={`w-5 h-5 text-${ROUND_CONFIG[round.roundType].color}-400`} />
                            })()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{ROUND_CONFIG[round.roundType].label}</h4>
                            <p className="text-sm text-slate-400">
                              {new Date(round.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {round.rating && (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="font-medium text-white">{round.rating}</span>
                            </div>
                          )}
                          <button
                            onClick={() => setEditingRound(round)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Scores */}
                      {round.technicalScore && (
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          {[
                            { label: 'Technical', score: round.technicalScore },
                            { label: 'Behavioral', score: round.behavioralScore },
                            { label: 'Culture Fit', score: round.fitScore }
                          ].map((item) => (
                            <div key={item.label} className="bg-slate-800/50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">{item.label}</span>
                                <span className="font-semibold text-white">{item.score}%</span>
                              </div>
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${getScoreColor(item.score || 0)} transition-all duration-500`}
                                  style={{ width: `${item.score}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Notes & Feedback */}
                      <div className="grid grid-cols-2 gap-4">
                        {round.notes && (
                          <div className="bg-slate-800/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-blue-400" />
                              <span className="text-sm font-medium text-slate-300">Your Notes</span>
                            </div>
                            <p className="text-sm text-slate-400">{round.notes}</p>
                          </div>
                        )}
                        {round.feedback && (
                          <div className="bg-slate-800/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageCircle className="w-4 h-4 text-emerald-400" />
                              <span className="text-sm font-medium text-slate-300">Feedback Received</span>
                            </div>
                            <p className="text-sm text-slate-400">{round.feedback}</p>
                          </div>
                        )}
                      </div>

                      {/* Strengths & Improvements */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {round.strengths && round.strengths.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span className="text-sm font-medium text-emerald-400">Strengths</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {round.strengths.map((s, i) => (
                                <span key={i} className="px-2 py-1 text-xs bg-emerald-500/10 text-emerald-400 rounded-full">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {round.improvements && round.improvements.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-4 h-4 text-amber-400" />
                              <span className="text-sm font-medium text-amber-400">Areas to Improve</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {round.improvements.map((imp, i) => (
                                <span key={i} className="px-2 py-1 text-xs bg-amber-500/10 text-amber-400 rounded-full">
                                  {imp}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </>
              )
            })()}
          </motion.div>
        )}

        {viewMode === 'analytics' && calculateOverallStats && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Performance by Round Type */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Performance by Round Type
              </h3>
              <div className="space-y-4">
                {calculateOverallStats.roundTypeStats
                  .filter(stat => stat.count > 0)
                  .map((stat) => (
                    <div key={stat.type} className="flex items-center gap-4">
                      <span className="w-32 text-sm text-slate-400">
                        {ROUND_CONFIG[stat.type].label}
                      </span>
                      <div className="flex-1 h-8 bg-slate-800 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stat.avgRating / 5) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full bg-gradient-to-r from-${ROUND_CONFIG[stat.type].color}-500 to-${ROUND_CONFIG[stat.type].color}-400`}
                        />
                      </div>
                      <span className="w-16 text-right font-semibold text-white">
                        {stat.avgRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-500">({stat.count})</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-2 gap-4">
              {calculateOverallStats.topStrengths.length > 0 && (
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-semibold text-white">Your Strengths</h4>
                  </div>
                  <div className="space-y-2">
                    {calculateOverallStats.topStrengths.map((strength, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-400">
                          {i + 1}
                        </div>
                        <span className="text-slate-300">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {calculateOverallStats.improvementAreas.length > 0 && (
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                    <h4 className="font-semibold text-white">Focus Areas</h4>
                  </div>
                  <div className="space-y-2">
                    {calculateOverallStats.improvementAreas.map((area, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs text-amber-400">
                          {i + 1}
                        </div>
                        <span className="text-slate-300">{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default InterviewPerformanceTracker
