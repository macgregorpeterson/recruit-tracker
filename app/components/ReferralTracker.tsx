'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Plus, 
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  TrendingUp,
  Target,
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Filter,
  ArrowRight,
  Link2,
  Briefcase,
  Star,
  Trash2,
  Edit3,
  Send
} from 'lucide-react'
import { Contact, Application } from '../types'

interface ReferralTrackerProps {
  contacts: Contact[]
  applications: Application[]
  onAddReferral?: (referral: Referral) => void
  onUpdateReferral?: (id: string, updates: Partial<Referral>) => void
  onDeleteReferral?: (id: string) => void
  referrals?: Referral[]
}

export interface Referral {
  id: string
  contactId: string
  contactName: string
  firm: string
  applicationId?: string
  role?: string
  status: 'requested' | 'pending' | 'submitted' | 'accepted' | 'declined' | 'no_response'
  requestDate: string
  responseDate?: string
  notes?: string
  followUpCount: number
  lastFollowUpDate?: string
  referralStrength: 'strong' | 'moderate' | 'weak'
  outcome?: 'interview' | 'offer' | 'rejection' | 'ongoing'
}

const STATUS_CONFIG: Record<Referral['status'], { label: string; color: string; icon: React.ElementType }> = {
  requested: { label: 'Requested', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: Clock },
  pending: { label: 'Pending Response', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', icon: HelpCircle },
  submitted: { label: 'Referral Submitted', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', icon: CheckCircle2 },
  accepted: { label: 'Accepted', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 },
  declined: { label: 'Declined', color: 'text-red-400 bg-red-500/10 border-red-500/30', icon: XCircle },
  no_response: { label: 'No Response', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30', icon: Clock }
}

const OUTCOME_CONFIG: Record<string, { label: string; color: string }> = {
  interview: { label: 'Led to Interview', color: 'text-blue-400' },
  offer: { label: 'Led to Offer', color: 'text-emerald-400' },
  rejection: { label: 'Rejection', color: 'text-red-400' },
  ongoing: { label: 'Ongoing', color: 'text-amber-400' }
}

const STRENGTH_LABELS: Record<string, string> = {
  strong: 'Strong Referral (Senior/Superday)',
  moderate: 'Moderate (First Round/Phone)',
  weak: 'Weak (Application Push Only)'
}

export function ReferralTracker({ 
  contacts, 
  applications,
  onAddReferral,
  onUpdateReferral,
  onDeleteReferral,
  referrals: externalReferrals = []
}: ReferralTrackerProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedReferral, setExpandedReferral] = useState<string | null>(null)
  const [selectedContact, setSelectedContact] = useState<string>('')
  const [selectedApplication, setSelectedApplication] = useState<string>('')
  const [referralStrength, setReferralStrength] = useState<Referral['referralStrength']>('moderate')
  const [notes, setNotes] = useState('')
  const [activeTab, setActiveTab] = useState<'active' | 'successful' | 'all'>('active')

  // Use external referrals if provided, otherwise compute from contacts/applications
  const referrals = externalReferrals.length > 0 ? externalReferrals : useMemo(() => {
    // Derive referrals from contacts with referral tags
    return contacts
      .filter(c => c.tags?.includes('referral') || c.tags?.includes('referrer'))
      .map((contact, index) => {
        const relatedApp = applications.find(a => a.firm === contact.firm)
        return {
          id: `derived-${index}`,
          contactId: contact.id,
          contactName: contact.name,
          firm: contact.firm,
          applicationId: relatedApp?.id,
          role: relatedApp?.role,
          status: 'pending' as Referral['status'],
          requestDate: contact.created_at || new Date().toISOString(),
          followUpCount: 0,
          referralStrength: 'moderate' as Referral['referralStrength']
        }
      })
  }, [contacts, applications, externalReferrals.length])

  const filteredReferrals = useMemo(() => {
    return referrals.filter(referral => {
      const matchesSearch = 
        referral.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        referral.firm.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || referral.status === statusFilter
      const matchesTab = activeTab === 'all' ? true :
        activeTab === 'successful' ? 
          ['submitted', 'accepted'].includes(referral.status) || 
          (referral.outcome === 'offer' || referral.outcome === 'interview') :
        ['requested', 'pending', 'submitted'].includes(referral.status)
      return matchesSearch && matchesStatus && matchesTab
    })
  }, [referrals, searchQuery, statusFilter, activeTab])

  const stats = useMemo(() => ({
    total: referrals.length,
    pending: referrals.filter(r => ['requested', 'pending'].includes(r.status)).length,
    submitted: referrals.filter(r => r.status === 'submitted').length,
    accepted: referrals.filter(r => r.status === 'accepted').length,
    successRate: referrals.filter(r => r.outcome === 'offer' || r.outcome === 'interview').length / Math.max(referrals.length, 1) * 100
  }), [referrals])

  const handleAddReferral = () => {
    const contact = contacts.find(c => c.id === selectedContact)
    const application = applications.find(a => a.id === selectedApplication)
    
    if (!contact) return

    const newReferral: Referral = {
      id: Date.now().toString(),
      contactId: contact.id,
      contactName: contact.name,
      firm: contact.firm,
      applicationId: application?.id,
      role: application?.role,
      status: 'requested',
      requestDate: new Date().toISOString(),
      followUpCount: 0,
      referralStrength,
      notes
    }

    onAddReferral?.(newReferral)
    setShowAddModal(false)
    resetForm()
  }

  const resetForm = () => {
    setSelectedContact('')
    setSelectedApplication('')
    setReferralStrength('moderate')
    setNotes('')
  }

  const handleFollowUp = (referral: Referral) => {
    onUpdateReferral?.(referral.id, {
      followUpCount: referral.followUpCount + 1,
      lastFollowUpDate: new Date().toISOString()
    })
  }

  const handleStatusChange = (id: string, newStatus: Referral['status']) => {
    onUpdateReferral?.(id, { 
      status: newStatus,
      responseDate: newStatus === 'accepted' || newStatus === 'declined' ? new Date().toISOString() : undefined
    })
  }

  const potentialReferrers = contacts.filter(c => 
    !referrals.some(r => r.contactId === c.id) ||
    c.tags?.includes('referral-source')
  )

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard label="Total Referrals" value={stats.total} icon={Users} color="blue" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="amber" />
        <StatCard label="Submitted" value={stats.submitted} icon={CheckCircle2} color="purple" />
        <StatCard label="Accepted" value={stats.accepted} icon={Award} color="emerald" />
        <StatCard label="Success Rate" value={`${stats.successRate.toFixed(0)}%`} icon={TrendingUp} color="pink" />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['active', 'successful', 'all'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search referrals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Referral
          </motion.button>
        </div>
      </div>

      {/* Referrals List */}
      <div className="space-y-3">
        {filteredReferrals.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-medium text-white mb-2">No referrals yet</h3>
            <p className="text-slate-400 mb-4">Start tracking your referral requests to maximize your chances</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              Add Your First Referral
            </button>
          </div>
        ) : (
          filteredReferrals.map(referral => {
            const statusConfig = STATUS_CONFIG[referral.status]
            const StatusIcon = statusConfig.icon
            const isExpanded = expandedReferral === referral.id

            return (
              <motion.div
                key={referral.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedReferral(isExpanded ? null : referral.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig.color}`}>
                        <StatusIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{referral.contactName}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-300">{referral.firm}</span>
                          {referral.role && (
                            <>
                              <span className="text-slate-500">•</span>
                              <span className="text-sm text-slate-400">{referral.role}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                          <span className="text-slate-500">
                            Requested {new Date(referral.requestDate).toLocaleDateString()}
                          </span>
                          {referral.followUpCount > 0 && (
                            <span className="text-amber-400 text-xs">
                              {referral.followUpCount} follow-up{referral.followUpCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {referral.outcome && (
                        <span className={`text-sm font-medium ${OUTCOME_CONFIG[referral.outcome].color}`}>
                          {OUTCOME_CONFIG[referral.outcome].label}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-800"
                    >
                      <div className="p-4 space-y-4">
                        {/* Referral Strength */}
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-slate-400">Referral Strength:</span>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3].map(star => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  (referral.referralStrength === 'strong' && star <= 3) ||
                                  (referral.referralStrength === 'moderate' && star <= 2) ||
                                  (referral.referralStrength === 'weak' && star <= 1)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-slate-300 ml-2">
                              {STRENGTH_LABELS[referral.referralStrength]}
                            </span>
                          </div>
                        </div>

                        {/* Notes */}
                        {referral.notes && (
                          <div className="p-3 bg-slate-800/50 rounded-lg">
                            <span className="text-sm text-slate-400">Notes:</span>
                            <p className="text-sm text-slate-300 mt-1">{referral.notes}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                          <span className="text-sm text-slate-400">Update Status:</span>
                          <div className="flex items-center gap-2">
                            {(['requested', 'pending', 'submitted', 'accepted', 'declined'] as const).map(status => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(referral.id, status)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                  referral.status === status
                                    ? STATUS_CONFIG[status].color
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                {STATUS_CONFIG[status].label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          <button
                            onClick={() => handleFollowUp(referral)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            Log Follow-up
                          </button>
                          <button
                            onClick={() => {
                              const contact = contacts.find(c => c.id === referral.contactId)
                              if (contact?.email) {
                                window.location.href = `mailto:${contact.email}`
                              }
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            Email Contact
                          </button>
                          <button
                            onClick={() => onDeleteReferral?.(referral.id)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Add Referral Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Add Referral Request</h3>
                    <p className="text-sm text-slate-400">Track a new referral request</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                >
                  <ChevronDown className="w-5 h-5 rotate-180" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Select Contact</label>
                  <select
                    value={selectedContact}
                    onChange={(e) => setSelectedContact(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Choose a contact...</option>
                    {potentialReferrers.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} - {contact.firm} ({contact.title})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Link to Application (Optional)</label>
                  <select
                    value={selectedApplication}
                    onChange={(e) => setSelectedApplication(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Select application...</option>
                    {applications.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.firm} - {app.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Referral Strength</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['weak', 'moderate', 'strong'] as const).map(strength => (
                      <button
                        key={strength}
                        onClick={() => setReferralStrength(strength)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          referralStrength === strength
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex justify-center gap-0.5 mb-1">
                          {[1, 2, 3].map(star => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                (strength === 'strong' && star <= 3) ||
                                (strength === 'moderate' && star <= 2) ||
                                (strength === 'weak' && star <= 1)
                                  ? 'fill-current'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs capitalize">{strength}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional context about this referral..."
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddReferral}
                    disabled={!selectedContact}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Referral
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    pink: 'text-pink-400 bg-pink-500/10'
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-xs text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  )
}

export default ReferralTracker
