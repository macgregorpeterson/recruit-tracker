'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy,
  Flame,
  Target,
  Zap,
  Star,
  Crown,
  Medal,
  Award,
  TrendingUp,
  Clock,
  Users,
  Briefcase,
  Calendar,
  FileText,
  ArrowUpRight
} from 'lucide-react'

interface GamificationProfileProps {
  contacts: any[]
  applications: any[]
  events: any[]
  notes: any[]
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ElementType
  unlocked: boolean
  unlockedAt?: string
  progress?: number
  maxProgress: number
  color: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string
  weeklyActivity: boolean[]
}

export function GamificationProfile({ contacts, applications, events, notes }: GamificationProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'stats'>('overview')
  const [showConfetti, setShowConfetti] = useState(false)

  // Calculate stats
  const stats = {
    totalContacts: contacts.length,
    totalApplications: applications.length,
    totalEvents: events.length,
    totalNotes: notes.length,
    offers: applications.filter((a: any) => a.status === 'offer').length,
    interviews: events.filter((e: any) => e.event_type?.includes('interview')).length,
    coffeeChats: events.filter((e: any) => e.event_type === 'coffee').length,
  }

  // Calculate level and XP
  const xpPerContact = 10
  const xpPerApplication = 25
  const xpPerEvent = 15
  const xpPerNote = 5
  const xpPerOffer = 200

  const totalXP = 
    (stats.totalContacts * xpPerContact) +
    (stats.totalApplications * xpPerApplication) +
    (stats.totalEvents * xpPerEvent) +
    (stats.totalNotes * xpPerNote) +
    (stats.offers * xpPerOffer)

  const level = Math.floor(totalXP / 500) + 1
  const xpInLevel = totalXP % 500
  const xpToNextLevel = 500
  const progressPercent = (xpInLevel / xpToNextLevel) * 100

  // Generate streak data
  const streakData: StreakData = {
    currentStreak: Math.min(stats.totalEvents + stats.totalNotes, 14),
    longestStreak: Math.max(Math.min(stats.totalEvents + stats.totalNotes + 3, 21), 5),
    lastActiveDate: new Date().toISOString(),
    weeklyActivity: [true, true, false, true, true, true, false]
  }

  // Generate achievements
  const achievements: Achievement[] = [
    {
      id: 'first-contact',
      title: 'Network Starter',
      description: 'Add your first contact to the Coverage Book',
      icon: Users,
      unlocked: stats.totalContacts >= 1,
      progress: Math.min(stats.totalContacts, 1),
      maxProgress: 1,
      color: 'blue',
      rarity: 'common'
    },
    {
      id: 'networker',
      title: 'Social Butterfly',
      description: 'Build a network of 10+ contacts',
      icon: Users,
      unlocked: stats.totalContacts >= 10,
      progress: stats.totalContacts,
      maxProgress: 10,
      color: 'blue',
      rarity: 'rare'
    },
    {
      id: 'first-app',
      title: 'First Step',
      description: 'Submit your first application',
      icon: Briefcase,
      unlocked: stats.totalApplications >= 1,
      progress: Math.min(stats.totalApplications, 1),
      maxProgress: 1,
      color: 'indigo',
      rarity: 'common'
    },
    {
      id: 'applicant-pro',
      title: 'Application Machine',
      description: 'Submit 10+ applications',
      icon: Briefcase,
      unlocked: stats.totalApplications >= 10,
      progress: stats.totalApplications,
      maxProgress: 10,
      color: 'indigo',
      rarity: 'rare'
    },
    {
      id: 'pipeline-master',
      title: 'Pipeline Pro',
      description: 'Have 20+ applications in your pipeline',
      icon: Target,
      unlocked: stats.totalApplications >= 20,
      progress: stats.totalApplications,
      maxProgress: 20,
      color: 'purple',
      rarity: 'epic'
    },
    {
      id: 'first-coffee',
      title: 'Coffee Connoisseur',
      description: 'Schedule your first coffee chat',
      icon: Calendar,
      unlocked: stats.coffeeChats >= 1,
      progress: Math.min(stats.coffeeChats, 1),
      maxProgress: 1,
      color: 'amber',
      rarity: 'common'
    },
    {
      id: 'networking-ninja',
      title: 'Networking Ninja',
      description: 'Complete 5+ coffee chats',
      icon: Calendar,
      unlocked: stats.coffeeChats >= 5,
      progress: stats.coffeeChats,
      maxProgress: 5,
      color: 'amber',
      rarity: 'rare'
    },
    {
      id: 'first-interview',
      title: 'Interview Ready',
      description: 'Land your first interview',
      icon: Zap,
      unlocked: stats.interviews >= 1,
      progress: Math.min(stats.interviews, 1),
      maxProgress: 1,
      color: 'yellow',
      rarity: 'common'
    },
    {
      id: 'interview-veteran',
      title: 'Interview Veteran',
      description: 'Complete 10+ interviews',
      icon: Zap,
      unlocked: stats.interviews >= 10,
      progress: stats.interviews,
      maxProgress: 10,
      color: 'yellow',
      rarity: 'rare'
    },
    {
      id: 'offer-received',
      title: 'Winner Winner',
      description: 'Receive your first offer',
      icon: Trophy,
      unlocked: stats.offers >= 1,
      progress: Math.min(stats.offers, 1),
      maxProgress: 1,
      color: 'emerald',
      rarity: 'epic'
    },
    {
      id: 'offer-collector',
      title: 'Offer Collector',
      description: 'Receive 3+ offers',
      icon: Crown,
      unlocked: stats.offers >= 3,
      progress: stats.offers,
      maxProgress: 3,
      color: 'emerald',
      rarity: 'legendary'
    },
    {
      id: 'note-taker',
      title: 'Detail Oriented',
      description: 'Write your first note',
      icon: FileText,
      unlocked: stats.totalNotes >= 1,
      progress: Math.min(stats.totalNotes, 1),
      maxProgress: 1,
      color: 'cyan',
      rarity: 'common'
    },
    {
      id: 'documentation-pro',
      title: 'Documentation Pro',
      description: 'Write 20+ notes',
      icon: FileText,
      unlocked: stats.totalNotes >= 20,
      progress: stats.totalNotes,
      maxProgress: 20,
      color: 'cyan',
      rarity: 'rare'
    },
    {
      id: 'streak-master',
      title: 'Streak Master',
      description: 'Maintain a 7-day activity streak',
      icon: Flame,
      unlocked: streakData.currentStreak >= 7,
      progress: streakData.currentStreak,
      maxProgress: 7,
      color: 'orange',
      rarity: 'epic'
    },
    {
      id: 'all-rounder',
      title: 'All-Rounder',
      description: 'Have contacts, applications, events, and notes',
      icon: Star,
      unlocked: stats.totalContacts > 0 && stats.totalApplications > 0 && stats.totalEvents > 0 && stats.totalNotes > 0,
      progress: [stats.totalContacts > 0, stats.totalApplications > 0, stats.totalEvents > 0, stats.totalNotes > 0].filter(Boolean).length,
      maxProgress: 4,
      color: 'pink',
      rarity: 'epic'
    }
  ]

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const unlockedPercent = Math.round((unlockedCount / achievements.length) * 100)

  const rarityColors = {
    common: 'from-slate-400 to-slate-500',
    rare: 'from-blue-400 to-indigo-500',
    epic: 'from-purple-400 to-pink-500',
    legendary: 'from-amber-400 to-orange-500'
  }

  const rarityBorders = {
    common: 'border-slate-500/30',
    rare: 'border-blue-500/30',
    epic: 'border-purple-500/30',
    legendary: 'border-amber-500/30'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Your Progress
          </h2>
          <p className="text-slate-400 mt-1">Track your recruiting journey achievements</p>
        </div>
        <div className="flex gap-2">
          {['overview', 'achievements', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Profile Card */}
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                  <Crown className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border-2 border-yellow-500">
                  <span className="text-sm font-bold text-yellow-400">{level}</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-white">Level {level} Recruiter</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    {unlockedPercent}% Complete
                  </span>
                </div>
                <p className="text-slate-400 mb-4">
                  {unlockedCount} of {achievements.length} achievements unlocked
                </p>
                
                {/* XP Bar */}
                <div className="w-full">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">XP Progress</span>
                    <span className="text-white font-medium">{xpInLevel} / {xpToNextLevel} XP</span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <StatBox value={totalXP} label="Total XP" icon={Star} color="yellow" />
                <StatBox value={streakData.currentStreak} label="Day Streak" icon={Flame} color="orange" />
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Weekly Activity
            </h3>
            <div className="flex justify-between items-end">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <div key={day + index} className="flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: streakData.weeklyActivity[index] ? 60 : 20 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`w-8 rounded-t-lg ${
                      streakData.weeklyActivity[index]
                        ? 'bg-gradient-to-t from-blue-500 to-blue-400'
                        : 'bg-slate-700'
                    }`}
                  />
                  <span className="text-xs text-slate-500">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Medal className="w-5 h-5 text-purple-400" />
                Recent Unlocks
              </h3>
              <button
                onClick={() => setActiveTab('achievements')}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View All <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {achievements
                .filter(a => a.unlocked)
                .slice(0, 3)
                .map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} compact />
                ))}
              {achievements.filter(a => a.unlocked).length === 0 && (
                <p className="text-slate-500 text-sm col-span-full text-center py-4">
                  No achievements unlocked yet. Start recruiting to earn your first badge!
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              <span className="text-slate-400">Common</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              <span className="text-slate-400">Rare</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-400" />
              <span className="text-slate-400">Epic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-slate-400">Legendary</span>
            </div>
          </div>

          {/* Achievement Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AchievementCard achievement={achievement} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value={stats.totalContacts} label="Contacts" icon={Users} color="blue" />
          <StatCard value={stats.totalApplications} label="Applications" icon={Briefcase} color="indigo" />
          <StatCard value={stats.totalEvents} label="Events" icon={Calendar} color="purple" />
          <StatCard value={stats.totalNotes} label="Notes" icon={FileText} color="cyan" />
          <StatCard value={stats.offers} label="Offers" icon={Trophy} color="emerald" />
          <StatCard value={stats.interviews} label="Interviews" icon={Zap} color="yellow" />
          <StatCard value={stats.coffeeChats} label="Coffee Chats" icon={Calendar} color="amber" />
          <StatCard value={Math.round(totalXP / 10)} label="Engagement" icon={TrendingUp} color="pink" />
        </div>
      )}
    </div>
  )
}

function StatBox({ value, label, icon: Icon, color }: { value: number; label: string; icon: any; color: string }) {
  const colorClasses: Record<string, string> = {
    yellow: 'bg-yellow-500/10 text-yellow-400',
    orange: 'bg-orange-500/10 text-orange-400',
    blue: 'bg-blue-500/10 text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
  }

  return (
    <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="text-lg font-bold">{value.toLocaleString()}</span>
      </div>
      <span className="text-xs opacity-80">{label}</span>
    </div>
  )
}

function StatCard({ value, label, icon: Icon, color }: { value: number; label: string; icon: any; color: string }) {
  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400', border: 'border-blue-500/20' },
    indigo: { bg: 'bg-indigo-500/10', icon: 'text-indigo-400', border: 'border-indigo-500/20' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'border-purple-500/20' },
    cyan: { bg: 'bg-cyan-500/10', icon: 'text-cyan-400', border: 'border-cyan-500/20' },
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
    yellow: { bg: 'bg-yellow-500/10', icon: 'text-yellow-400', border: 'border-yellow-500/20' },
    amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'border-amber-500/20' },
    pink: { bg: 'bg-pink-500/10', icon: 'text-pink-400', border: 'border-pink-500/20' },
  }

  const colors = colorClasses[color]

  return (
    <div className={`glass-card p-4 ${colors.border}`}>
      <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${colors.icon}`} />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  )
}

function AchievementCard({ achievement, compact = false }: { achievement: Achievement; compact?: boolean }) {
  const rarityColors = {
    common: 'from-slate-400 to-slate-500',
    rare: 'from-blue-400 to-indigo-500',
    epic: 'from-purple-400 to-pink-500',
    legendary: 'from-amber-400 to-orange-500'
  }

  const rarityBorders = {
    common: 'border-slate-500/30',
    rare: 'border-blue-500/30',
    epic: 'border-purple-500/30',
    legendary: 'border-amber-500/30'
  }

  const Icon = achievement.icon

  if (compact) {
    return (
      <div className={`p-4 rounded-xl border ${rarityBorders[achievement.rarity]} bg-slate-800/30 flex items-center gap-3`}>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rarityColors[achievement.rarity]} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm truncate">{achievement.title}</p>
          <p className="text-xs text-slate-500 capitalize">{achievement.rarity}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-5 rounded-xl border ${achievement.unlocked ? rarityBorders[achievement.rarity] : 'border-slate-700/50'} ${
      achievement.unlocked ? 'bg-slate-800/40' : 'bg-slate-800/20 opacity-60'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          achievement.unlocked
            ? `bg-gradient-to-br ${rarityColors[achievement.rarity]}`
            : 'bg-slate-700'
        }`}>
          <Icon className={`w-6 h-6 ${achievement.unlocked ? 'text-white' : 'text-slate-500'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold ${achievement.unlocked ? 'text-white' : 'text-slate-500'}`}>
              {achievement.title}
            </h4>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
              achievement.rarity === 'common' ? 'bg-slate-700 text-slate-400' :
              achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
              achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
              {achievement.rarity}
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-3">{achievement.description}</p>
          
          {/* Progress Bar */}
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Progress</span>
              <span className={achievement.unlocked ? 'text-emerald-400' : 'text-slate-400'}>
                {achievement.progress} / {achievement.maxProgress}
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(achievement.progress! / achievement.maxProgress) * 100}%` }}
                transition={{ duration: 0.5 }}
                className={`h-full rounded-full ${
                  achievement.unlocked
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : 'bg-slate-500'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
