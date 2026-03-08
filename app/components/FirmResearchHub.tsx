'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  Star, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Plus,
  Search,
  ExternalLink,
  Target,
  Briefcase,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Award
} from 'lucide-react'

interface FirmResearchHubProps {
  contacts: any[]
  applications: any[]
}

interface FirmResearch {
  id: string
  firm: string
  cultureScore?: number
  dealExposure?: string
  workLifeBalance?: string
  compensationNotes?: string
  pros: string[]
  cons: string[]
  keyContacts: string[]
  interviewInsights?: string
  recentDeals?: string
  targetStatus: 'target' | 'reached_out' | 'interviewing' | 'offer' | 'not_interested'
}

const MOCK_FIRMS: FirmResearch[] = [
  {
    id: '1',
    firm: 'Goldman Sachs',
    cultureScore: 7,
    dealExposure: 'Excellent - Top-tier deal flow across all sectors',
    workLifeBalance: 'Intense - 80-100 hours typical',
    compensationNotes: 'Top of street, strong bonus',
    pros: ['Unmatched brand', 'Best exit opps', 'Top talent'],
    cons: ['Intense culture', 'Long hours', 'Competitive'],
    keyContacts: ['John Smith - MD', 'Sarah Chen - VP'],
    interviewInsights: 'Very technical, expect multiple modeling tests',
    recentDeals: 'Advised on $50B M&A deal',
    targetStatus: 'interviewing'
  },
  {
    id: '2',
    firm: 'Blackstone',
    cultureScore: 8,
    dealExposure: 'Great - Diverse portfolio companies',
    workLifeBalance: 'Demanding but structured',
    compensationNotes: 'Excellent carry for senior roles',
    pros: ['Prestigious', 'Great training', 'Smart people'],
    cons: ['Very selective', 'Long process'],
    keyContacts: ['Recruiting Team'],
    interviewInsights: 'Case study heavy, know their portfolio',
    targetStatus: 'target'
  }
]

export function FirmResearchHub({ contacts, applications }: FirmResearchHubProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFirm, setSelectedFirm] = useState<FirmResearch | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  const filteredFirms = MOCK_FIRMS.filter(firm => {
    const matchesSearch = firm.firm.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || firm.targetStatus === filter
    return matchesSearch && matchesFilter
  })

  // Get unique firms from applications
  const appliedFirms = [...new Set(applications.map((a: any) => a.firm))]
  const targetFirms = appliedFirms.filter(firm => 
    !MOCK_FIRMS.some(mf => mf.firm.toLowerCase() === firm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'target': return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
      case 'reached_out': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'interviewing': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'offer': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      case 'not_interested': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      default: return 'bg-slate-500/20 text-slate-300'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-cyan-400" />
            Firm Research Hub
          </h2>
          <p className="text-slate-400 mt-1">Deep research on your target firms</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-cyan-500 hover:to-blue-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Research
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search firms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'target', 'interviewing', 'offer'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Firms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFirms.map((firm, index) => (
          <motion.div
            key={firm.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedFirm(firm)}
            className="glass-card p-5 hover:border-cyan-500/30 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                    {firm.firm}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(firm.targetStatus)}`}>
                    {firm.targetStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
              {firm.cultureScore && (
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">{firm.cultureScore}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              {firm.workLifeBalance && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{firm.workLifeBalance}</span>
                </div>
              )}
              {firm.compensationNotes && (
                <div className="flex items-center gap-2 text-slate-400">
                  <DollarSign className="w-4 h-4" />
                  <span>{firm.compensationNotes}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-400">
                <Users className="w-4 h-4" />
                <span>{firm.keyContacts.length} contacts</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <div className="flex flex-wrap gap-2">
                {firm.pros.slice(0, 2).map((pro, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                    + {pro}
                  </span>
                ))}
                {firm.cons.slice(0, 2).map((con, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                    - {con}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Suggested Firms to Research */}
      {targetFirms.length > 0 && !searchQuery && (
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            Suggested Research
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            You&apos;ve applied to these firms but haven&apos;t added research notes yet.
          </p>
          <div className="flex flex-wrap gap-2">
            {targetFirms.slice(0, 5).map((firm) => (
              <button
                key={firm}
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-sm text-slate-300 transition-colors"
              >
                {firm}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Firm Detail Modal */}
      {selectedFirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedFirm.firm}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(selectedFirm.targetStatus)}`}>
                        {selectedFirm.targetStatus.replace('_', ' ')}
                      </span>
                      {selectedFirm.cultureScore && (
                        <span className="flex items-center gap-1 text-sm text-yellow-400">
                          <Star className="w-4 h-4 fill-yellow-400" />
                          {selectedFirm.cultureScore}/10
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFirm(null)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <StatItem icon={Briefcase} label="Deal Exposure" value={selectedFirm.dealExposure?.slice(0, 30) + '...'} />
                <StatItem icon={Clock} label="Work/Life" value={selectedFirm.workLifeBalance?.slice(0, 30) + '...'} />
                <StatItem icon={DollarSign} label="Comp" value={selectedFirm.compensationNotes?.slice(0, 30) + '...'} />
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-emerald-400" />
                    Pros
                  </h4>
                  <ul className="space-y-2">
                    {selectedFirm.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-emerald-400 mt-0.5">+</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4 text-red-400" />
                    Cons
                  </h4>
                  <ul className="space-y-2">
                    {selectedFirm.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-red-400 mt-0.5">-</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Key Contacts */}
              <div>
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Key Contacts
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFirm.keyContacts.map((contact, i) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm">
                      {contact}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interview Insights */}
              {selectedFirm.interviewInsights && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    Interview Insights
                  </h4>
                  <p className="text-sm text-slate-300">{selectedFirm.interviewInsights}</p>
                </div>
              )}

              {/* Recent Deals */}
              {selectedFirm.recentDeals && (
                <div>
                  <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    Recent Deal Activity
                  </h4>
                  <p className="text-sm text-slate-400">{selectedFirm.recentDeals}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function StatItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="p-3 bg-slate-800/30 rounded-lg">
      <div className="flex items-center gap-2 text-slate-400 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm text-slate-200">{value}</p>
    </div>
  )
}
