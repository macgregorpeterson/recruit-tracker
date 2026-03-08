'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Scale,
  DollarSign,
  Building2,
  Briefcase,
  TrendingUp,
  Heart,
  Clock,
  MapPin,
  Users,
  Star,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calculator,
  Award,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  BarChart3,
  Edit3,
  Save
} from 'lucide-react'
import { Application } from '../types'

interface OfferComparisonToolProps {
  offers: Application[]
  onUpdateOffer: (offer: Application) => void
  contacts: any[]
}

interface ComparisonCriteria {
  id: string
  name: string
  weight: number
  category: 'compensation' | 'culture' | 'growth' | 'worklife'
}

interface OfferScore {
  offer: Application
  scores: Record<string, number>
  totalScore: number
}

const DEFAULT_CRITERIA: ComparisonCriteria[] = [
  { id: 'base_salary', name: 'Base Salary', weight: 25, category: 'compensation' },
  { id: 'bonus', name: 'Bonus Potential', weight: 20, category: 'compensation' },
  { id: 'culture', name: 'Company Culture', weight: 15, category: 'culture' },
  { id: 'growth', name: 'Career Growth', weight: 15, category: 'growth' },
  { id: 'wlb', name: 'Work/Life Balance', weight: 15, category: 'worklife' },
  { id: 'location', name: 'Location', weight: 10, category: 'worklife' },
]

const CATEGORY_COLORS = {
  compensation: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  culture: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  growth: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  worklife: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
}

export function OfferComparisonTool({ offers, onUpdateOffer, contacts }: OfferComparisonToolProps) {
  const [criteria, setCriteria] = useState<ComparisonCriteria[]>(DEFAULT_CRITERIA)
  const [offerScores, setOfferScores] = useState<Record<string, Record<string, number>>>({})
  const [showCriteriaEditor, setShowCriteriaEditor] = useState(false)
  const [showAddCriteria, setShowAddCriteria] = useState(false)
  const [newCriteriaName, setNewCriteriaName] = useState('')
  const [newCriteriaCategory, setNewCriteriaCategory] = useState<ComparisonCriteria['category']>('compensation')
  const [selectedOffer, setSelectedOffer] = useState<Application | null>(null)
  const [showCalculator, setShowCalculator] = useState(false)

  // Filter only offers
  const offerApplications = useMemo(() => 
    offers.filter(app => app.status === 'offer'),
    [offers]
  )

  // Calculate weighted scores
  const calculatedOffers = useMemo((): OfferScore[] => {
    return offerApplications.map(offer => {
      const scores: Record<string, number> = {}
      let totalScore = 0
      let totalWeight = 0

      criteria.forEach(criterion => {
        const score = offerScores[offer.id]?.[criterion.id] || 5
        scores[criterion.id] = score
        totalScore += score * (criterion.weight / 100)
        totalWeight += criterion.weight
      })

      // Normalize to 100
      const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0

      return {
        offer,
        scores,
        totalScore: Math.round(normalizedScore * 10) / 10
      }
    }).sort((a, b) => b.totalScore - a.totalScore)
  }, [offerApplications, offerScores, criteria])

  // Get top offer
  const topOffer = calculatedOffers[0]

  // Update score
  const updateScore = (offerId: string, criterionId: string, score: number) => {
    setOfferScores(prev => ({
      ...prev,
      [offerId]: {
        ...prev[offerId],
        [criterionId]: score
      }
    }))
  }

  // Update criteria weight
  const updateWeight = (criterionId: string, weight: number) => {
    setCriteria(prev => prev.map(c => 
      c.id === criterionId ? { ...c, weight } : c
    ))
  }

  // Add custom criteria
  const addCriteria = () => {
    if (!newCriteriaName.trim()) return
    
    const newCriterion: ComparisonCriteria = {
      id: `custom_${Date.now()}`,
      name: newCriteriaName,
      weight: 10,
      category: newCriteriaCategory
    }
    
    setCriteria(prev => [...prev, newCriterion])
    setNewCriteriaName('')
    setShowAddCriteria(false)
  }

  // Remove criteria
  const removeCriteria = (criterionId: string) => {
    setCriteria(prev => prev.filter(c => c.id !== criterionId))
  }

  // Get contacts at firm
  const getContactsAtFirm = (firm: string) => {
    return contacts.filter(c => c.firm === firm)
  }

  // Parse compensation from string
  const parseCompensation = (compString?: string) => {
    if (!compString) return { base: 0, bonus: 0, total: 0 }
    
    const numbers = compString.match(/\d+/g)?.map(Number) || []
    if (numbers.length >= 2) {
      return { base: numbers[0], bonus: numbers[1], total: numbers[0] + numbers[1] }
    }
    if (numbers.length === 1) {
      return { base: numbers[0], bonus: 0, total: numbers[0] }
    }
    return { base: 0, bonus: 0, total: 0 }
  }

  if (offerApplications.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Scale className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Offers Yet</h3>
        <p className="text-slate-400 max-w-md mx-auto">
          You haven't received any offers yet. Keep pushing through the process! 
          When you do receive offers, come back here to compare them side-by-side.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-emerald-400" />
            Offer Comparison
          </h2>
          <p className="text-slate-400 mt-1">
            Compare {offerApplications.length} offer{offerApplications.length !== 1 ? 's' : ''} side-by-side with weighted scoring
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showCalculator 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Total Comp Calculator
          </button>
          <button
            onClick={() => setShowCriteriaEditor(!showCriteriaEditor)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showCriteriaEditor 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Edit Criteria
          </button>
        </div>
      </div>

      {/* Top Offer Banner */}
      {topOffer && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Award className="w-8 h-8 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400">
                  Top Choice
                </span>
                <span className="text-3xl font-bold text-white">{topOffer.totalScore}/100</span>
              </div>
              <h3 className="text-xl font-semibold text-white">{topOffer.offer.firm}</h3>
              <p className="text-slate-400">{topOffer.offer.role}</p>
            </div>

            <div className="flex gap-4">
              {topOffer.offer.compensation && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-400">
                    ${(parseCompensation(topOffer.offer.compensation).total / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-slate-400">Total Comp</div>
                </div>
              )}
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-400">
                  {getContactsAtFirm(topOffer.offer.firm).length}
                </div>
                <div className="text-xs text-slate-400">Contacts</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Total Comp Calculator */}
      <AnimatePresence>
        {showCalculator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              Compensation Breakdown
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Firm</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Base Salary</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Bonus</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Total Comp</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Monthly</th>
                  </tr>
                </thead>
                <tbody>
                  {offerApplications.map(offer => {
                    const comp = parseCompensation(offer.compensation)
                    return (
                      <tr key={offer.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{offer.firm}</div>
                          <div className="text-xs text-slate-500">{offer.role}</div>
                        </td>
                        <td className="text-right py-3 px-4 text-slate-300">
                          ${comp.base.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4 text-slate-300">
                          ${comp.bonus.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className="font-semibold text-emerald-400">
                            ${comp.total.toLocaleString()}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4 text-slate-400">
                          ${Math.round(comp.total / 12).toLocaleString()}/mo
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Criteria Editor */}
      <AnimatePresence>
        {showCriteriaEditor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Comparison Criteria
              </h3>
              <button
                onClick={() => setShowAddCriteria(true)}
                className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
              >
                <Plus className="w-4 h-4" />
                Add Criteria
              </button>
            </div>

            <div className="space-y-3">
              {criteria.map(criterion => {
                const colors = CATEGORY_COLORS[criterion.category]
                return (
                  <div key={criterion.id} className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${colors.bg.replace('/10', '')}`} />
                    <div className="flex-1">
                      <div className="font-medium text-white">{criterion.name}</div>
                      <div className="text-xs text-slate-500 capitalize">{criterion.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={criterion.weight}
                        onChange={(e) => updateWeight(criterion.id, parseInt(e.target.value))}
                        className="w-24 accent-blue-500"
                      />
                      <span className="w-12 text-right text-sm text-slate-400">{criterion.weight}%</span>
                    </div>
                    {!['base_salary', 'bonus', 'culture', 'growth', 'wlb', 'location'].includes(criterion.id) && (
                      <button
                        onClick={() => removeCriteria(criterion.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Add Criteria Form */}
            <AnimatePresence>
              {showAddCriteria && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 bg-slate-800/50 rounded-lg"
                >
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Criteria name..."
                      value={newCriteriaName}
                      onChange={(e) => setNewCriteriaName(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <select
                      value={newCriteriaCategory}
                      onChange={(e) => setNewCriteriaCategory(e.target.value as any)}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
                    >
                      <option value="compensation">Compensation</option>
                      <option value="culture">Culture</option>
                      <option value="growth">Growth</option>
                      <option value="worklife">Work/Life</option>
                    </select>
                    <button
                      onClick={addCriteria}
                      className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30"
                    >
                      Add
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Matrix */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Detailed Comparison
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-400 sticky left-0 bg-slate-800/50 z-10">
                  Criteria
                </th>
                {calculatedOffers.map(({ offer, totalScore }, index) => (
                  <th key={offer.id} className="text-center py-4 px-4 min-w-[160px]">
                    <div className="space-y-1">
                      <div className="font-semibold text-white">{offer.firm}</div>
                      <div className="text-xs text-slate-500">{offer.role}</div>
                      <div className={`text-lg font-bold ${
                        index === 0 ? 'text-emerald-400' : 'text-slate-300'
                      }`}>
                        {totalScore}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map(criterion => {
                const colors = CATEGORY_COLORS[criterion.category]
                return (
                  <tr key={criterion.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="py-4 px-6 sticky left-0 bg-slate-900/50 z-10">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${colors.bg.replace('/10', '')}`} />
                        <span className="text-sm font-medium text-slate-300">{criterion.name}</span>
                        <span className="text-xs text-slate-500">({criterion.weight}%)</span>
                      </div>
                    </td>
                    {calculatedOffers.map(({ offer, scores }) => (
                      <td key={offer.id} className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={scores[criterion.id] || 5}
                            onChange={(e) => updateScore(offer.id, criterion.id, parseInt(e.target.value))}
                            className={`w-20 accent-${colors.text.split('-')[1]}-500`}
                          />
                          <span className="w-6 text-sm font-medium text-white">
                            {scores[criterion.id] || 5}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                )
              })}
              
              {/* Total Row */}
              <tr className="bg-slate-800/30 font-semibold">
                <td className="py-4 px-6 sticky left-0 bg-slate-800/30 z-10 text-white">
                  Total Score
                </td>
                {calculatedOffers.map(({ totalScore }, index) => (
                  <td key={index} className="py-4 px-4 text-center">
                    <span className={`text-xl font-bold ${
                      index === 0 ? 'text-emerald-400' : 'text-slate-300'
                    }`}>
                      {totalScore}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Offer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {calculatedOffers.map(({ offer, scores, totalScore }, index) => {
          const contactsAtFirm = getContactsAtFirm(offer.firm)
          const comp = parseCompensation(offer.compensation)
          
          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card p-5 relative overflow-hidden ${
                index === 0 ? 'border-emerald-500/30' : ''
              }`}
            >
              {index === 0 && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/20 to-transparent" />
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-white">{offer.firm}</h4>
                  <p className="text-sm text-slate-400">{offer.role}</p>
                </div>
                <div className={`text-2xl font-bold ${index === 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {totalScore}
                </div>
              </div>

              {offer.compensation && (
                <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                    <DollarSign className="w-4 h-4" />
                    Compensation
                  </div>
                  <div className="text-lg font-semibold text-emerald-400">
                    ${comp.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">
                    Base: ${comp.base.toLocaleString()} • Bonus: ${comp.bonus.toLocaleString()}
                  </div>
                </div>
              )}

              {offer.location && (
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                  <MapPin className="w-4 h-4" />
                  {offer.location}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                <Users className="w-4 h-4" />
                {contactsAtFirm.length} contact{contactsAtFirm.length !== 1 ? 's' : ''} at this firm
              </div>

              {/* Mini Score Breakdown */}
              <div className="space-y-2">
                {criteria.slice(0, 4).map(criterion => {
                  const score = scores[criterion.id] || 5
                  const colors = CATEGORY_COLORS[criterion.category]
                  return (
                    <div key={criterion.id} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-20 truncate">{criterion.name}</span>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${colors.bg.replace('/10', '/60')}`}
                          style={{ width: `${(score / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-6">{score}</span>
                    </div>
                  )
                })}
              </div>

              {index === 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Recommended Choice</span>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
