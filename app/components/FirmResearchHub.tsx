'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, 
  Search, 
  Star, 
  TrendingUp, 
  Users,
  DollarSign,
  Clock,
  Plus,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Filter,
  ArrowUpRight,
  Briefcase,
  Target,
  Lightbulb,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Application, Contact, Note } from '../types'

interface FirmResearch {
  id: string
  firm: string
  type: 'BB' | 'MM' | 'EB' | 'PE' | 'HF' | 'Other'
  cultureScore?: number
  workLifeScore?: number
  compensationScore?: number
  dealExposure?: string
  pros: string[]
  cons: string[]
  keyContacts: string[]
  recentDeals?: string[]
  interviewInsights?: string
  website?: string
  headquarters?: string
  size?: string
  isSaved?: boolean
}

interface FirmResearchHubProps {
  applications: Application[]
  contacts: Contact[]
  notes: Note[]
  onNavigate: (tab: string) => void
}

const SAMPLE_FIRMS: FirmResearch[] = [
  {
    id: '1',
    firm: 'Goldman Sachs',
    type: 'BB',
    cultureScore: 7,
    workLifeScore: 4,
    compensationScore: 9,
    dealExposure: 'High volume, large cap M&A',
    pros: ['Top-tier brand', 'Excellent exit opportunities', 'Comprehensive training'],
    cons: ['Long hours', 'Intense culture', 'High turnover'],
    keyContacts: ['John Smith - MD', 'Sarah Chen - VP'],
    recentDeals: ['Advised on $50B tech merger', 'Led $2B IPO'],
    interviewInsights: 'Focus on technicals and market knowledge. Expect multiple rounds with case studies.',
    website: 'https://goldmansachs.com',
    headquarters: 'New York, NY',
    size: '40,000+ employees'
  },
  {
    id: '2',
    firm: 'Blackstone',
    type: 'PE',
    cultureScore: 8,
    workLifeScore: 5,
    compensationScore: 10,
    dealExposure: 'Large buyouts, real estate, credit',
    pros: ['Market leader in PE', 'Diverse platforms', 'Strong track record'],
    cons: ['Very competitive', 'Long hours', 'High expectations'],
    keyContacts: ['Mike Johnson - Principal'],
    recentDeals: ['$10B acquisition', 'Major real estate portfolio'],
    interviewInsights: 'Heavy focus on investment thesis and past deal experience.',
    website: 'https://blackstone.com',
    headquarters: 'New York, NY',
    size: '3,000+ employees'
  },
  {
    id: '3',
    firm: 'Evercore',
    type: 'EB',
    cultureScore: 8,
    workLifeScore: 6,
    compensationScore: 9,
    dealExposure: 'Elite M&A advisory, restructuring',
    pros: ['Boutique culture', 'Senior exposure', 'Top M&A shop'],
    cons: ['Smaller brand outside finance', 'Still long hours', 'Limited geographies'],
    keyContacts: ['Emily Davis - MD'],
    recentDeals: ['Advised on $30B merger', 'Major restructuring'],
    interviewInsights: 'Looking for genuine interest in advisory. Culture fit is key.',
    website: 'https://evercore.com',
    headquarters: 'New York, NY',
    size: '1,800+ employees'
  }
]

export function FirmResearchHub({ applications, contacts, notes, onNavigate }: FirmResearchHubProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [expandedFirm, setExpandedFirm] = useState<string | null>(null)
  const [savedFirms, setSavedFirms] = useState<Set<string>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)

  // Aggregate firm data from applications and contacts
  const firmData = useMemo(() => {
    const firmMap = new Map<string, { 
      applications: Application[], 
      contacts: Contact[], 
      notes: Note[] 
    }>()

    // Add applications
    applications.forEach(app => {
      if (!firmMap.has(app.firm)) {
        firmMap.set(app.firm, { applications: [], contacts: [], notes: [] })
      }
      firmMap.get(app.firm)!.applications.push(app)
    })

    // Add contacts
    contacts.forEach(contact => {
      if (!firmMap.has(contact.firm)) {
        firmMap.set(contact.firm, { applications: [], contacts: [], notes: [] })
      }
      firmMap.get(contact.firm)!.contacts.push(contact)
    })

    // Add notes
    notes.forEach(note => {
      if (note.firm) {
        if (!firmMap.has(note.firm)) {
          firmMap.set(note.firm, { applications: [], contacts: [], notes: [] })
        }
        firmMap.get(note.firm)!.notes.push(note)
      }
    })

    return firmMap
  }, [applications, contacts, notes])

  // Merge with sample data
  const allFirms = useMemo(() => {
    const firms: FirmResearch[] = [...SAMPLE_FIRMS]
    
    firmData.forEach((data, firmName) => {
      const existing = firms.find(f => f.firm.toLowerCase() === firmName.toLowerCase())
      if (existing) {
        existing.keyContacts = [...new Set([...existing.keyContacts, ...data.contacts.map(c => c.name)])]
      } else {
        firms.push({
          id: `generated-${firmName}`,
          firm: firmName,
          type: 'Other',
          pros: [],
          cons: [],
          keyContacts: data.contacts.map(c => c.name),
          isSaved: false
        })
      }
    })

    return firms
  }, [firmData])

  const filteredFirms = useMemo(() => {
    return allFirms.filter(firm => {
      const matchesSearch = firm.firm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        firm.interviewInsights?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === 'all' || firm.type === selectedType
      return matchesSearch && matchesType
    })
  }, [allFirms, searchQuery, selectedType])

  const toggleSaved = (firmId: string) => {
    setSavedFirms(prev => {
      const newSet = new Set(prev)
      if (newSet.has(firmId)) {
        newSet.delete(firmId)
      } else {
        newSet.add(firmId)
      }
      return newSet
    })
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'BB': 'Bulge Bracket',
      'MM': 'Middle Market',
      'EB': 'Elite Boutique',
      'PE': 'Private Equity',
      'HF': 'Hedge Fund',
      'Other': 'Other'
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'BB': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'MM': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'EB': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'PE': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'HF': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'Other': 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
    return colors[type] || colors['Other']
  }

  const renderStars = (score?: number) => {
    if (!score) return <span className="text-slate-500 text-xs">N/A</span>
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            className={`w-3 h-3 ${star <= Math.round(score / 2) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} 
          />
        ))}
        <span className="ml-1 text-xs text-slate-400">{score}/10</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-400" />
            Firm Research Hub
          </h2>
          <p className="text-slate-400 mt-1">Research firms, track contacts, and prepare for interviews</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Firm
        </motion.button>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search firms, insights, deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'BB', 'EB', 'PE', 'MM'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedType === type
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-transparent'
                }`}
              >
                {type === 'all' ? 'All Types' : getTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Firms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredFirms.map((firm, index) => {
          const isExpanded = expandedFirm === firm.id
          const firmStats = firmData.get(firm.firm) || { applications: [], contacts: [], notes: [] }
          const isSaved = savedFirms.has(firm.id)

          return (
            <motion.div
              key={firm.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glass-card overflow-hidden transition-all ${
                isExpanded ? 'lg:col-span-2' : ''
              }`}
            >
              {/* Card Header */}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center text-xl font-bold text-slate-300">
                      {firm.firm.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{firm.firm}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getTypeColor(firm.type)}`}>
                          {getTypeLabel(firm.type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                        {firm.headquarters && <span>{firm.headquarters}</span>}
                        {firm.size && <span>• {firm.size}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSaved(firm.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isSaved ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500 hover:text-blue-400 hover:bg-slate-800'
                      }`}
                    >
                      {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setExpandedFirm(isExpanded ? null : firm.id)}
                      className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700/50">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Culture</div>
                    {renderStars(firm.cultureScore)}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Work/Life</div>
                    {renderStars(firm.workLifeScore)}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Compensation</div>
                    {renderStars(firm.compensationScore)}
                  </div>
                </div>

                {/* Connection Stats */}
                <div className="flex gap-4 mt-4">
                  {firmStats.applications.length > 0 && (
                    <div 
                      onClick={() => onNavigate('pipeline')}
                      className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4" />
                      {firmStats.applications.length} application{firmStats.applications.length > 1 ? 's' : ''}
                    </div>
                  )}
                  {firmStats.contacts.length > 0 && (
                    <div 
                      onClick={() => onNavigate('coverage')}
                      className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      {firmStats.contacts.length} contact{firmStats.contacts.length > 1 ? 's' : ''}
                    </div>
                  )}
                  {firmStats.notes.length > 0 && (
                    <div 
                      onClick={() => onNavigate('notes')}
                      className="flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 cursor-pointer"
                    >
                      <Target className="w-4 h-4" />
                      {firmStats.notes.length} note{firmStats.notes.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-700/50 bg-slate-800/30"
                  >
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Pros & Cons */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-emerald-400 mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Pros
                          </h4>
                          <ul className="space-y-1">
                            {firm.pros.map((pro, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="text-emerald-500 mt-1">•</span>
                                {pro}
                              </li>
                            ))}
                            {firm.pros.length === 0 && <li className="text-sm text-slate-500 italic">No pros added yet</li>}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-red-400 mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 rotate-180" />
                            Cons
                          </h4>
                          <ul className="space-y-1">
                            {firm.cons.map((con, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                {con}
                              </li>
                            ))}
                            {firm.cons.length === 0 && <li className="text-sm text-slate-500 italic">No cons added yet</li>}
                          </ul>
                        </div>
                      </div>

                      {/* Interview Insights */}
                      <div className="space-y-4">
                        {firm.interviewInsights && (
                          <div>
                            <h4 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              Interview Insights
                            </h4>
                            <p className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg">
                              {firm.interviewInsights}
                            </p>
                          </div>
                        )}

                        {firm.recentDeals && firm.recentDeals.length > 0 && (
                          <div>
                            <h4 className="font-medium text-purple-400 mb-2 flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Recent Deals
                            </h4>
                            <ul className="space-y-1">
                              {firm.recentDeals.map((deal, i) => (
                                <li key={i} className="text-sm text-slate-300">• {deal}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {firm.keyContacts.length > 0 && (
                          <div>
                            <h4 className="font-medium text-amber-400 mb-2 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Key Contacts
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {firm.keyContacts.map((contact, i) => (
                                <span key={i} className="px-2 py-1 bg-slate-700/50 rounded-lg text-xs text-slate-300">
                                  {contact}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {firm.website && (
                          <a
                            href={firm.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Visit Website
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {filteredFirms.length === 0 && (
        <div className="text-center py-12 glass-card">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No firms found</h3>
          <p className="text-slate-400">Try adjusting your search or filters</p>
        </div>
      )}
    </motion.div>
  )
}
