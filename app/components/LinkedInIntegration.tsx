'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Linkedin, 
  Users, 
  MessageSquare, 
  Link2, 
  Download, 
  CheckCircle2,
  Search,
  UserPlus,
  Mail,
  Briefcase,
  TrendingUp,
  Globe,
  Award,
  Share2,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react'

interface LinkedInProfile {
  id: string
  name: string
  headline: string
  company: string
  location: string
  connections: number
  mutualConnections: number
  profileUrl: string
  isOpenToWork?: boolean
  sharedConnections: string[]
}

interface NetworkingOpportunity {
  type: 'alumni' | 'shared_connection' | 'company' | 'group'
  contact: LinkedInProfile
  reason: string
  priority: 'high' | 'medium' | 'low'
}

interface InMailMessage {
  id: string
  to: string
  subject: string
  preview: string
  sentAt: string
  status: 'sent' | 'delivered' | 'read' | 'replied'
}

export function LinkedInIntegration() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [activeTab, setActiveTab] = useState<'network' | 'import' | 'messages' | 'insights'>('network')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProfile, setSelectedProfile] = useState<LinkedInProfile | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)

  // Mock data
  const profiles: LinkedInProfile[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      headline: 'Managing Director at Goldman Sachs',
      company: 'Goldman Sachs',
      location: 'New York, NY',
      connections: 2847,
      mutualConnections: 12,
      profileUrl: 'linkedin.com/in/sarahchen',
      sharedConnections: ['Alex Johnson', 'Michael Park'],
      isOpenToWork: false
    },
    {
      id: '2',
      name: 'James Miller',
      headline: 'VP Investment Banking at Morgan Stanley',
      company: 'Morgan Stanley',
      location: 'New York, NY',
      connections: 1523,
      mutualConnections: 5,
      profileUrl: 'linkedin.com/in/jamesmiller',
      sharedConnections: ['Emma Davis'],
      isOpenToWork: false
    },
    {
      id: '3',
      name: 'Priya Patel',
      headline: 'Associate at Evercore | Former JPM Analyst',
      company: 'Evercore',
      location: 'New York, NY',
      connections: 892,
      mutualConnections: 8,
      profileUrl: 'linkedin.com/in/priyapatel',
      sharedConnections: ['David Kim', 'Lisa Wang'],
      isOpenToWork: false
    },
    {
      id: '4',
      name: 'Robert Zhang',
      headline: 'Analyst at Blackstone | UPenn \'24',
      company: 'Blackstone',
      location: 'New York, NY',
      connections: 456,
      mutualConnections: 23,
      profileUrl: 'linkedin.com/in/robertzhang',
      sharedConnections: ['Jennifer Lee', 'Chris Taylor', '5 others'],
      isOpenToWork: true
    }
  ]

  const opportunities: NetworkingOpportunity[] = [
    {
      type: 'alumni',
      contact: profiles[3],
      reason: 'UPenn alum at target firm - strong connection',
      priority: 'high'
    },
    {
      type: 'shared_connection',
      contact: profiles[0],
      reason: '12 mutual connections including 2 close contacts',
      priority: 'high'
    },
    {
      type: 'company',
      contact: profiles[2],
      reason: 'Active in investment banking recruitment',
      priority: 'medium'
    }
  ]

  const messages: InMailMessage[] = [
    {
      id: '1',
      to: 'Sarah Chen',
      subject: 'Coffee chat request - UPenn student interested in IB',
      preview: 'Hi Sarah, I hope this message finds you well. I\'m a junior at UPenn...',
      sentAt: '2 days ago',
      status: 'read'
    },
    {
      id: '2',
      to: 'James Miller',
      subject: 'Following up on info session',
      preview: 'Thank you for the insightful presentation yesterday...',
      sentAt: '1 week ago',
      status: 'replied'
    }
  ]

  const handleConnect = () => {
    setIsConnecting(true)
    setTimeout(() => {
      setIsConnecting(false)
      setIsConnected(true)
    }, 2000)
  }

  const handleImport = (profile: LinkedInProfile) => {
    setSelectedProfile(profile)
    setShowImportModal(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <div className="w-2 h-2 rounded-full bg-slate-500" />
      case 'delivered': return <div className="w-2 h-2 rounded-full bg-blue-400" />
      case 'read': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      case 'replied': return <MessageSquare className="w-4 h-4 text-violet-400" />
      default: return null
    }
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#0077b5] to-[#00a0dc] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Linkedin className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect LinkedIn</h2>
          <p className="text-slate-400 mb-8">
            Import your professional network, track InMail messages, and discover networking opportunities automatically.
          </p>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="px-8 py-4 bg-[#0077b5] hover:bg-[#006396] disabled:bg-slate-700 text-white rounded-xl font-medium transition-all flex items-center gap-3 mx-auto"
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Linkedin className="w-5 h-5" />
                Connect LinkedIn Account
              </>
            )}
          </button>
          <p className="text-xs text-slate-500 mt-4">
            Your data is securely synced and never shared with third parties
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0077b5] to-[#00a0dc] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Linkedin className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">LinkedIn Integration</h2>
            <p className="text-slate-400">Professional network management and outreach</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-emerald-300">Connected</span>
          </div>
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'LinkedIn Contacts', value: '1,247', icon: Users, color: 'blue' },
          { label: 'Imported to RT', value: '89', icon: Download, color: 'emerald' },
          { label: 'Active Conversations', value: '12', icon: MessageSquare, color: 'violet' },
          { label: 'Opportunities', value: '24', icon: Sparkles, color: 'amber' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
              </div>
              <span className="text-2xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50">
        {[
          { id: 'network', label: 'Network', icon: Users },
          { id: 'import', label: 'Import Contacts', icon: Download },
          { id: 'messages', label: 'InMail', icon: Mail },
          { id: 'insights', label: 'Opportunities', icon: TrendingUp },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#0077b5] text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Network Tab */}
      {activeTab === 'network' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Your Network</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search connections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-64 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0077b5]/50"
                />
              </div>
            </div>

            <div className="space-y-4">
              {profiles.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.company.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((profile, i) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                    <span className="text-lg font-semibold text-white">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white truncate">{profile.name}</h4>
                      {profile.isOpenToWork && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400">
                          #OpenToWork
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 truncate">{profile.headline}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {profile.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {profile.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {profile.mutualConnections} mutual
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleImport(profile)}
                      className="px-3 py-1.5 text-sm text-[#0077b5] hover:bg-[#0077b5]/10 rounded-lg transition-colors"
                    >
                      Import
                    </button>
                    <button className="px-3 py-1.5 bg-[#0077b5] hover:bg-[#006396] text-white text-sm rounded-lg transition-colors flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Message
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" />
              Import to RecruitTracker
            </h3>
            <p className="text-slate-400 mb-6">
              Import your LinkedIn connections directly into your Coverage Book. We'll automatically extract firm, title, and contact information.
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/30 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">Bulk Import</span>
                  <span className="text-sm text-slate-400">1,247 available</span>
                </div>
                <button className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl text-emerald-300 font-medium transition-all flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Import All Connections
                </button>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">Smart Filter</span>
                  <span className="text-sm text-slate-400">~180 matches</span>
                </div>
                <button className="w-full py-3 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-xl text-violet-300 font-medium transition-all flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Import Finance Professionals Only
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Recently Imported
            </h3>
            <div className="space-y-3">
              {profiles.slice(0, 3).map((profile, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{profile.name}</p>
                    <p className="text-sm text-slate-400">{profile.company}</p>
                  </div>
                  <span className="text-xs text-slate-500">Just now</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">InMail Messages</h3>
              <button className="px-4 py-2 bg-[#0077b5] hover:bg-[#006396] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Compose
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-700/50">
            {messages.map((message) => (
              <div key={message.id} className="p-6 hover:bg-slate-700/20 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-white">
                      {message.to.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-white">{message.to}</h4>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(message.status)}
                        <span className="text-xs text-slate-500">{message.sentAt}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 mb-1">{message.subject}</p>
                    <p className="text-sm text-slate-500 truncate">{message.preview}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Networking Opportunities
            </h3>
            <div className="space-y-4">
              {opportunities.map((opp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-gradient-to-r from-amber-500/5 to-transparent border border-amber-500/20 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      opp.priority === 'high' ? 'bg-red-400' : 'bg-amber-400'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{opp.contact.name}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-400 capitalize">{opp.type.replace('_', ' ')}</span>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{opp.reason}</p>
                      <button className="text-sm text-[#0077b5] hover:text-[#00a0dc] flex items-center gap-1">
                        View Profile
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-violet-400" />
              Network Strength
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Bulge Bracket Coverage</span>
                  <span className="text-white font-medium">85%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Elite Boutique Coverage</span>
                  <span className="text-white font-medium">62%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full w-[62%] bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Alumni Network</span>
                  <span className="text-white font-medium">91%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full w-[91%] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                </div>
              </div>
              <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl mt-6">
                <p className="text-sm text-violet-300">
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  <strong>AI Insight:</strong> You have strong connections at Goldman Sachs and Evercore. Consider reaching out to 2nd-degree connections at Morgan Stanley to expand coverage.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Import Contact</h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                  <span className="text-xl font-semibold text-white">
                    {selectedProfile.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-white">{selectedProfile.name}</h4>
                  <p className="text-sm text-slate-400">{selectedProfile.headline}</p>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl text-emerald-300 font-medium transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Import to Coverage Book
                </button>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="w-full py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-slate-300 font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
