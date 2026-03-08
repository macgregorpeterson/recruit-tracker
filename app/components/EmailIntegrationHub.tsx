'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  Inbox, 
  Send, 
  FileText, 
  Search,
  Plus,
  MoreHorizontal,
  Paperclip,
  Reply,
  Forward,
  Trash2,
  Archive,
  Star,
  Clock,
  CheckCircle2,
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  Download,
  Edit3,
  Save,
  AlertCircle
} from 'lucide-react'
import { Contact, Application } from '../types'

interface Email {
  id: string
  threadId: string
  from: string
  to: string[]
  subject: string
  body: string
  timestamp: string
  isRead: boolean
  isStarred: boolean
  hasAttachments: boolean
  labels: string[]
  firm?: string
}

interface EmailThread {
  id: string
  subject: string
  emails: Email[]
  participants: string[]
  lastUpdated: string
  isUnread: boolean
  firm?: string
}

interface EmailIntegrationHubProps {
  contacts: Contact[]
  applications: Application[]
}

const MOCK_EMAILS: Email[] = [
  {
    id: '1',
    threadId: 't1',
    from: 'recruiting@goldmansachs.com',
    to: ['user@email.com'],
    subject: 'Interview Confirmation - Summer Analyst Position',
    body: `Hi there,

Thank you for your application to Goldman Sachs. We would like to invite you to interview for the Summer Analyst position.

Your interview is scheduled for:
Date: March 15, 2026
Time: 2:00 PM EST
Format: Video (Zoom)

Please confirm your availability by replying to this email.

Best regards,
Goldman Sachs Recruiting`,
    timestamp: '2026-03-08T10:00:00Z',
    isRead: false,
    isStarred: true,
    hasAttachments: false,
    labels: ['interview', 'goldman-sachs'],
    firm: 'Goldman Sachs'
  },
  {
    id: '2',
    threadId: 't1',
    from: 'user@email.com',
    to: ['recruiting@goldmansachs.com'],
    subject: 'Re: Interview Confirmation - Summer Analyst Position',
    body: `Dear Recruiting Team,

Thank you for the opportunity. I confirm my availability for the interview on March 15th at 2:00 PM EST.

I look forward to speaking with you.

Best regards`,
    timestamp: '2026-03-08T11:30:00Z',
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    labels: ['interview', 'goldman-sachs'],
    firm: 'Goldman Sachs'
  },
  {
    id: '3',
    threadId: 't2',
    from: 'john.smith@evercore.com',
    to: ['user@email.com'],
    subject: 'Coffee Chat Follow-up',
    body: `Hi,

Great speaking with you yesterday. As promised, I've attached some materials about our firm culture and recent deals.

Let me know if you have any questions.

Best,
John`,
    timestamp: '2026-03-07T14:00:00Z',
    isRead: true,
    isStarred: false,
    hasAttachments: true,
    labels: ['networking', 'evercore'],
    firm: 'Evercore'
  }
]

export function EmailIntegrationHub({ contacts, applications }: EmailIntegrationHubProps) {
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'starred' | 'drafts' | 'templates'>('inbox')
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [firmFilter, setFirmFilter] = useState<string>('all')

  // Group emails into threads
  const threads = useMemo(() => {
    const threadMap = new Map<string, Email[]>()
    MOCK_EMAILS.forEach(email => {
      if (!threadMap.has(email.threadId)) {
        threadMap.set(email.threadId, [])
      }
      threadMap.get(email.threadId)!.push(email)
    })

    return Array.from(threadMap.entries()).map(([threadId, emails]) => {
      const sorted = emails.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      return {
        id: threadId,
        subject: sorted[0].subject.replace('Re: ', ''),
        emails: sorted,
        participants: [...new Set(sorted.flatMap(e => [e.from, ...e.to]))],
        lastUpdated: sorted[sorted.length - 1].timestamp,
        isUnread: sorted.some(e => !e.isRead),
        firm: sorted[0].firm
      }
    }).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
  }, [])

  const filteredThreads = useMemo(() => {
    return threads.filter(thread => {
      const matchesSearch = 
        thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.participants.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesFirm = firmFilter === 'all' || thread.firm === firmFilter
      return matchesSearch && matchesFirm
    })
  }, [threads, searchQuery, firmFilter])

  const stats = {
    unread: threads.filter(t => t.isUnread).length,
    starred: threads.filter(t => t.emails.some(e => e.isStarred)).length,
    total: threads.length
  }

  const firms = [...new Set(threads.map(t => t.firm).filter(Boolean))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Mail className="w-7 h-7 text-blue-400" />
            Email Hub
          </h2>
          <p className="text-slate-400 mt-1">Manage all recruiting communications in one place</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Compose
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Unread" value={stats.unread} icon={Mail} color="blue" />
        <StatCard label="Starred" value={stats.starred} icon={Star} color="amber" />
        <StatCard label="Total Threads" value={stats.total} icon={Inbox} color="emerald" />
        <StatCard label="Firms" value={firms.length} icon={Building2} color="purple" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3 space-y-2">
          <FolderButton 
            active={activeFolder === 'inbox'} 
            onClick={() => setActiveFolder('inbox')}
            icon={Inbox}
            label="Inbox"
            count={stats.unread}
          />
          <FolderButton 
            active={activeFolder === 'starred'} 
            onClick={() => setActiveFolder('starred')}
            icon={Star}
            label="Starred"
          />
          <FolderButton 
            active={activeFolder === 'sent'} 
            onClick={() => setActiveFolder('sent')}
            icon={Send}
            label="Sent"
          />
          <FolderButton 
            active={activeFolder === 'drafts'} 
            onClick={() => setActiveFolder('drafts')}
            icon={FileText}
            label="Drafts"
          />
          <FolderButton 
            active={activeFolder === 'templates'} 
            onClick={() => setActiveFolder('templates')}
            icon={FileText}
            label="Templates"
          />

          <div className="pt-4 border-t border-slate-800">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 px-3">Filter by Firm</p>
            <button
              onClick={() => setFirmFilter('all')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                firmFilter === 'all' 
                  ? 'bg-blue-500/10 text-blue-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              All Firms
            </button>
            {firms.map(firm => (
              <button
                key={firm}
                onClick={() => setFirmFilter(firm!)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  firmFilter === firm 
                    ? 'bg-blue-500/10 text-blue-400' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                {firm}
              </button>
            ))}
          </div>
        </div>

        {/* Thread List */}
        <div className="col-span-4">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {filteredThreads.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No emails found</p>
                </div>
              ) : (
                filteredThreads.map(thread => (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className={`w-full p-4 text-left border-b border-slate-800 hover:bg-slate-800/30 transition-colors ${
                      selectedThread?.id === thread.id ? 'bg-blue-500/5 border-l-4 border-l-blue-500' : ''
                    } ${thread.isUnread ? 'bg-slate-800/20' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${thread.isUnread ? 'text-white' : 'text-slate-300'}`}>
                          {thread.participants[0]}
                        </div>
                        <div className={`text-sm truncate mt-0.5 ${thread.isUnread ? 'text-slate-200' : 'text-slate-400'}`}>
                          {thread.subject}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {thread.emails[thread.emails.length - 1].body.substring(0, 60)}...
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-slate-500">
                          {new Date(thread.lastUpdated).toLocaleDateString()}
                        </span>
                        {thread.emails.some(e => e.isStarred) && (
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        )}
                        {thread.emails.some(e => e.hasAttachments) && (
                          <Paperclip className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                    {thread.firm && (
                      <div className="mt-2">
                        <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full">
                          {thread.firm}
                        </span>
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Thread Detail */}
        <div className="col-span-5">
          {selectedThread ? (
            <div className="glass-card h-full flex flex-col">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-semibold text-white">{selectedThread.subject}</h3>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <Archive className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <Star className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedThread.emails.map((email, index) => (
                  <div key={email.id} className="space-y-3">
                    {index > 0 && (
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-slate-800" />
                        <span className="text-xs text-slate-500">
                          {new Date(email.timestamp).toLocaleString()}
                        </span>
                        <div className="flex-1 h-px bg-slate-800" />
                      </div>
                    )}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {email.from[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{email.from}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(email.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          to: {email.to.join(', ')}
                        </div>
                        <div className="mt-3 text-sm text-slate-300 whitespace-pre-wrap">
                          {email.body}
                        </div>
                        {email.hasAttachments && (
                          <div className="mt-3 flex items-center gap-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg">
                              <Paperclip className="w-4 h-4 text-slate-400" />
                              <span className="text-xs text-slate-300">attachment.pdf</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-800">
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                    <Reply className="w-4 h-4" />
                    Reply
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
                    <Forward className="w-4 h-4" />
                    Forward
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card h-full flex flex-col items-center justify-center text-slate-500">
              <Mail className="w-16 h-16 mb-4 opacity-30" />
              <p>Select an email to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowCompose(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-semibold text-white">New Message</h3>
                <button
                  onClick={() => setShowCompose(false)}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400 w-12">To:</span>
                  <input
                    type="text"
                    placeholder="recipient@firm.com"
                    className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400 w-12">Subject:</span>
                  <input
                    type="text"
                    placeholder="Enter subject..."
                    className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <textarea
                  placeholder="Write your message..."
                  className="w-full h-64 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
              </div>

              <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <FileText className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowCompose(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Discard
                  </button>
                  <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                    Send
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

function FolderButton({ active, onClick, icon: Icon, label, count }: {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
  count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active 
          ? 'bg-blue-500/10 text-blue-400' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      {count !== undefined && count > 0 && (
        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  )
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string
  value: number
  icon: React.ElementType
  color: string
}) {
  const colors: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    purple: 'text-purple-400 bg-purple-500/10'
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
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

export default EmailIntegrationHub
