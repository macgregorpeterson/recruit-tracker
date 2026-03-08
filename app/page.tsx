'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  FileText, 
  Briefcase, 
  Search,
  Plus,
  Phone,
  Coffee,
  Building2,
  Clock,
  LogOut,
  LayoutDashboard,
  Target,
  Sparkles,
  Brain,
  ChevronRight,
  TrendingUp,
  Award,
  BarChart3,
  ArrowUpRight,
  X,
  Mail,
  MapPin,
  DollarSign,
  CheckCircle2,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw,
  Bell,
  BookOpen,
  Lightbulb,
  Database,
  Keyboard,
  GitCommit,
  Scale,
  FolderOpen,
  Trophy,
  Zap,
  Flame,
  FileEdit,
  Link2,
  Smartphone,
  CalendarClock
} from 'lucide-react'
import { Contact, Application, CalendarEvent, Note, ApplicationStatus, EventType, DashboardStats, RecentActivity } from './types'

// Import tab components
import { DashboardTab } from './components/DashboardTab'
import { CoverageBookTab } from './components/CoverageBookTab'
import { PipelineTab } from './components/PipelineTab'
import { CalendarTab } from './components/CalendarTab'
import { NotesTab } from './components/NotesTab'
import { AnalyticsTab } from './components/AnalyticsTab'
import { SmartTodayWidget } from './components/SmartTodayWidget'
import { FirmResearchHub } from './components/FirmResearchHub'
import { DeadlineReminders } from './components/DeadlineReminders'
import { InterviewPrepTracker } from './components/InterviewPrepTracker'
import { EmailTemplateManager } from './components/EmailTemplateManager'
import { DataImportExport } from './components/DataImportExport'
import { KeyboardShortcutsProvider } from './components/KeyboardShortcuts'
import { NetworkingTimeline } from './components/NetworkingTimeline'
import { OfferComparisonTool } from './components/OfferComparisonTool'
import { DocumentVault } from './components/DocumentVault'
import { EnhancedAnalytics } from './components/EnhancedAnalytics'
import { GamificationProfile } from './components/GamificationProfile'
import { DealFlowVisualization } from './components/DealFlowVisualization'
import { QuickActionsFab } from './components/QuickActions'
import { BulkActions } from './components/BulkActions'
import { NotificationCenter } from './components/NotificationCenter'
import { CoverageBookExport } from './components/CoverageBookExport'
import { SmartInsightsEngine } from './components/SmartInsightsEngine'
import { AICoverLetterGenerator } from './components/AICoverLetterGenerator'
import { InterviewScheduler } from './components/InterviewScheduler'
import { PWAManager } from './components/PWAManager'
import { ReferralTracker } from './components/ReferralTracker'
import { EmailIntegrationHub } from './components/EmailIntegrationHub'
import { CalendarSyncManager } from './components/CalendarSyncManager'
import { InterviewPerformanceTracker } from './components/InterviewPerformanceTracker'
import { DealNewsFeed } from './components/DealNewsFeed'
import { ApplicationTemplates } from './components/ApplicationTemplates'
import { PipelineVelocityTracker } from './components/PipelineVelocityTracker'

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const STATUS_COLORS: Record<ApplicationStatus, { bg: string; text: string; border: string }> = {
  applied: { bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/30' },
  'phone-screen': { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
  'first-round': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30' },
  'second-round': { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30' },
  superday: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
  offer: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  rejected: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' },
  withdrawn: { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30' },
  accepted: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' },
}

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  'phone-screen': 'Phone Screen',
  'first-round': 'First Round',
  'second-round': 'Second Round',
  superday: 'Superday',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  accepted: 'Accepted',
}

const EVENT_TYPE_COLORS: Record<EventType, { bg: string; text: string }> = {
  coffee: { bg: 'bg-amber-500/20', text: 'text-amber-300' },
  'info-session': { bg: 'bg-cyan-500/20', text: 'text-cyan-300' },
  'phone-screen': { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  'first-round': { bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
  superday: { bg: 'bg-purple-500/20', text: 'text-purple-300' },
  'follow-up': { bg: 'bg-pink-500/20', text: 'text-pink-300' },
}

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  coffee: 'Coffee Chat',
  'info-session': 'Info Session',
  'phone-screen': 'Phone Screen',
  'first-round': 'First Round',
  superday: 'Superday',
  'follow-up': 'Follow-up',
}

export default function RecruitTracker() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'coverage' | 'pipeline' | 'calendar' | 'notes' | 'analytics' | 'prep' | 'research' | 'reminders' | 'templates' | 'data' | 'timeline' | 'offers' | 'documents' | 'gamification' | 'dealflow' | 'insights' | 'coverletter' | 'scheduler' | 'mobile' | 'referrals' | 'email' | 'calendarsync' | 'performance' | 'deals' | 'apptemplates' | 'velocity'>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Modal states
  const [showContactModal, setShowContactModal] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        fetchData()
      } else {
        setLoading(false)
      }
    }
    checkUser()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    const [{ data: contactsData }, { data: appsData }, { data: eventsData }, { data: notesData }] = await Promise.all([
      supabase.from('contacts').select('*').order('created_at', { ascending: false }),
      supabase.from('applications').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('*').order('start_time', { ascending: true }),
      supabase.from('notes').select('*').order('updated_at', { ascending: false }),
    ])
    
    if (contactsData) setContacts(contactsData)
    if (appsData) setApplications(appsData)
    if (eventsData) setEvents(eventsData)
    if (notesData) setNotes(notesData)
    
    setLoading(false)
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchData()
    setTimeout(() => setRefreshing(false), 500)
  }

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setContacts([])
    setApplications([])
    setEvents([])
    setNotes([])
  }

  // Calculate dashboard stats
  const dashboardStats: DashboardStats = {
    totalContacts: contacts.length,
    totalApplications: applications.length,
    activeApplications: applications.filter(a => !['rejected', 'withdrawn', 'accepted'].includes(a.status)).length,
    upcomingEvents: events.filter(e => new Date(e.start_time) > new Date()).length,
    offersReceived: applications.filter(a => a.status === 'offer').length,
    interviewsThisWeek: events.filter(e => {
      const eventDate = new Date(e.start_time)
      const now = new Date()
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return eventDate >= now && eventDate <= weekFromNow && ['phone-screen', 'first-round', 'superday'].includes(e.event_type)
    }).length,
    conversionRate: applications.length > 0 ? Math.round((applications.filter(a => a.status === 'offer').length / applications.length) * 100) : 0,
    avgTimeToOffer: 0,
    responseRate: 0,
    topFirms: [],
    stageDistribution: applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {} as Record<ApplicationStatus, number>),
  }

  const recentActivity: RecentActivity[] = [
    ...contacts.slice(0, 3).map(c => ({
      id: c.id,
      type: 'contact' as const,
      action: 'created' as const,
      title: `Added ${c.name}`,
      entityName: c.firm,
      timestamp: c.created_at || new Date().toISOString(),
    })),
    ...applications.slice(0, 3).map(a => ({
      id: a.id,
      type: 'application' as const,
      action: 'created' as const,
      title: `Applied to ${a.firm}`,
      entityName: a.role,
      timestamp: a.created_at || new Date().toISOString(),
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(prev => !prev)
      }
      // Cmd/Ctrl + / for keyboard shortcuts help
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setShowKeyboardShortcuts(true)
      }
      // Cmd/Ctrl + N for new items
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        // Quick add - opens contact modal by default
        setShowContactModal(true)
      }
      // Number keys for navigation (when not in input)
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        switch (e.key) {
          case '1':
            setActiveTab('dashboard')
            break
          case '2':
            setActiveTab('coverage')
            break
          case '3':
            setActiveTab('pipeline')
            break
          case '4':
            setActiveTab('calendar')
            break
          case '5':
            setActiveTab('notes')
            break
          case '6':
            setActiveTab('analytics')
            break
          case '7':
            setActiveTab('research')
            break
          case '8':
            setActiveTab('reminders')
            break
          case '9':
            setActiveTab('prep')
            break
          case '0':
            setActiveTab('gamification')
            break
          case 'e':
          case 'E':
            setActiveTab('email')
            break
          case 's':
          case 'S':
            setActiveTab('scheduler')
            break
          case 'r':
          case 'R':
            setActiveTab('referrals')
            break
          case 'l':
          case 'L':
            setActiveTab('coverletter')
            break
          case 'm':
          case 'M':
            setActiveTab('mobile')
            break
          case 'c':
          case 'C':
            if (e.shiftKey) {
              setActiveTab('calendarsync')
            }
            break
          case 'p':
          case 'P':
            if (e.shiftKey) {
              setActiveTab('performance')
            }
            break
          case 'd':
          case 'D':
            if (e.shiftKey) {
              setActiveTab('deals')
            }
            break
          case 't':
          case 'T':
            if (e.shiftKey) {
              setActiveTab('apptemplates')
            }
            break
          case 'v':
          case 'V':
            if (e.shiftKey) {
              setActiveTab('velocity')
            }
            break
          case '?':
            setShowKeyboardShortcuts(true)
            break
        }
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowCommandPalette(false)
        setShowKeyboardShortcuts(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 max-w-md w-full shadow-2xl"
        >
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20"
            >
              <Briefcase className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">RecruitTracker</h1>
            <p className="text-slate-400">Your banking recruiting command center</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignIn}
            className="w-full py-3 px-4 bg-white text-slate-900 rounded-xl font-medium hover:bg-slate-100 transition-colors flex items-center justify-center gap-3 shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </motion.button>
          
          <p className="text-center text-xs text-slate-500 mt-6">
            Secure authentication powered by Supabase
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">RecruitTracker</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={refreshData}
              className={`p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all ${refreshing ? 'animate-spin' : ''}`}
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowKeyboardShortcuts(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Keyboard shortcuts (⌘/)"
            >
              <Keyboard className="w-5 h-5" />
            </button>

            <NotificationCenter
              applications={applications}
              events={events}
              contacts={contacts}
              onNavigate={setActiveTab}
            />

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowCommandPalette(true)}
                className="pl-9 pr-4 py-2 w-64 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <button
              onClick={handleSignOut}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900/30 border-r border-slate-800 min-h-[calc(100vh-64px)] sticky top-16">
          <div className="p-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowContactModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Quick Add
            </motion.button>
          </div>

          <nav className="px-3 space-y-1">
            <NavButton 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
              icon={LayoutDashboard}
              label="Dashboard"
            />
            <NavButton 
              active={activeTab === 'coverage'} 
              onClick={() => setActiveTab('coverage')}
              icon={Users}
              label="Coverage Book"
              count={contacts.length}
            />
            <NavButton 
              active={activeTab === 'pipeline'} 
              onClick={() => setActiveTab('pipeline')}
              icon={Briefcase}
              label="Pipeline"
              count={applications.length}
            />
            <NavButton 
              active={activeTab === 'calendar'} 
              onClick={() => setActiveTab('calendar')}
              icon={Calendar}
              label="Calendar"
              count={events.filter(e => new Date(e.start_time) > new Date()).length}
            />
            <NavButton 
              active={activeTab === 'notes'} 
              onClick={() => setActiveTab('notes')}
              icon={FileText}
              label="Notes"
              count={notes.length}
            />
            <NavButton 
              active={activeTab === 'analytics'} 
              onClick={() => setActiveTab('analytics')}
              icon={BarChart3}
              label="Analytics"
            />
            <NavButton 
              active={activeTab === 'research'} 
              onClick={() => setActiveTab('research')}
              icon={BookOpen}
              label="Firm Research"
            />
            <NavButton 
              active={activeTab === 'reminders'} 
              onClick={() => setActiveTab('reminders')}
              icon={Bell}
              label="Reminders"
              count={applications.filter(a => a.deadline_date && !a.applied_date).length}
            />
            <NavButton 
              active={activeTab === 'prep'} 
              onClick={() => setActiveTab('prep')}
              icon={Brain}
              label="Interview Prep"
            />
            <NavButton 
              active={activeTab === 'templates'} 
              onClick={() => setActiveTab('templates')}
              icon={Mail}
              label="Email Templates"
            />
            <NavButton 
              active={activeTab === 'data'} 
              onClick={() => setActiveTab('data')}
              icon={Database}
              label="Data & Backup"
            />
            
            <div className="pt-4 mt-4 border-t border-slate-800">
              <p className="px-3 text-xs font-medium text-slate-600 uppercase tracking-wider mb-2">Advanced</p>
              <NavButton 
                active={activeTab === 'insights'} 
                onClick={() => setActiveTab('insights')}
                icon={Lightbulb}
                label="AI Insights"
              />
              <NavButton 
                active={activeTab === 'timeline'} 
                onClick={() => setActiveTab('timeline')}
                icon={GitCommit}
                label="Timeline"
              />
              <NavButton 
                active={activeTab === 'offers'} 
                onClick={() => setActiveTab('offers')}
                icon={Scale}
                label="Offer Compare"
                count={applications.filter(a => a.status === 'offer').length}
              />
              <NavButton 
                active={activeTab === 'documents'} 
                onClick={() => setActiveTab('documents')}
                icon={FolderOpen}
                label="Documents"
              />
              <NavButton 
                active={activeTab === 'dealflow'} 
                onClick={() => setActiveTab('dealflow')}
                icon={TrendingUp}
                label="Deal Flow"
                count={applications.filter(a => !['rejected', 'withdrawn', 'accepted'].includes(a.status)).length}
              />
              <NavButton 
                active={activeTab === 'gamification'} 
                onClick={() => setActiveTab('gamification')}
                icon={Trophy}
                label="Progress"
              />
            </div>
            
            <div className="pt-4 mt-4 border-t border-slate-800">
              <p className="px-3 text-xs font-medium text-slate-600 uppercase tracking-wider mb-2">Power Tools</p>
              <NavButton 
                active={activeTab === 'email'} 
                onClick={() => setActiveTab('email')}
                icon={Mail}
                label="Email Hub"
              />
              <NavButton 
                active={activeTab === 'scheduler'} 
                onClick={() => setActiveTab('scheduler')}
                icon={CalendarClock}
                label="Interview Scheduler"
              />
              <NavButton 
                active={activeTab === 'referrals'} 
                onClick={() => setActiveTab('referrals')}
                icon={Link2}
                label="Referral Tracker"
              />
              <NavButton 
                active={activeTab === 'coverletter'} 
                onClick={() => setActiveTab('coverletter')}
                icon={FileEdit}
                label="AI Cover Letter"
              />
              <NavButton 
                active={activeTab === 'mobile'} 
                onClick={() => setActiveTab('mobile')}
                icon={Smartphone}
                label="Mobile & PWA"
              />
              <NavButton 
                active={activeTab === 'calendarsync'} 
                onClick={() => setActiveTab('calendarsync')}
                icon={RefreshCw}
                label="Calendar Sync"
              />
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800">
              <p className="px-3 text-xs font-medium text-slate-600 uppercase tracking-wider mb-2">New Features</p>
              <NavButton 
                active={activeTab === 'performance'} 
                onClick={() => setActiveTab('performance')}
                icon={Trophy}
                label="Interview Performance"
              />
              <NavButton 
                active={activeTab === 'deals'} 
                onClick={() => setActiveTab('deals')}
                icon={TrendingUp}
                label="Deal & News Feed"
              />
              <NavButton 
                active={activeTab === 'apptemplates'} 
                onClick={() => setActiveTab('apptemplates')}
                icon={FileText}
                label="App Templates"
              />
              <NavButton 
                active={activeTab === 'velocity'} 
                onClick={() => setActiveTab('velocity')}
                icon={Target}
                label="Pipeline Velocity"
              />
            </div>
          </nav>

          <div className="mt-8 px-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">This Week</p>
            <div className="space-y-2">
              <Stat label="Active Apps" value={dashboardStats.activeApplications.toString()} />
              <Stat label="Contacts" value={contacts.length.toString()} />
              <Stat label="Interviews" value={dashboardStats.interviewsThisWeek.toString()} />
            </div>
          </div>

          {/* Mini Progress */}
          {applications.length > 0 && (
            <div className="mt-6 px-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Pipeline Health</p>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((dashboardStats.offersReceived / Math.max(applications.filter(a => a.status === 'offer' || a.status === 'rejected').length, 1)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {dashboardStats.offersReceived} offers • {dashboardStats.conversionRate}% conversion
              </p>
            </div>
          )}

          {/* Export Button */}
          <div className="mt-6 px-4">
            <button
              onClick={() => setShowExportModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-colors border border-slate-700/50"
            >
              <Download className="w-4 h-4" />
              Export Coverage Book
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <SmartTodayWidget
                      events={events}
                      applications={applications}
                      contacts={contacts}
                      onNavigate={setActiveTab}
                      onAddEvent={() => setShowEventModal(true)}
                    />
                    <DashboardTab 
                      stats={dashboardStats}
                      recentActivity={recentActivity}
                      contacts={contacts}
                      applications={applications}
                      events={events}
                      onNavigate={setActiveTab}
                      onAddContact={() => setShowContactModal(true)}
                      onAddApplication={() => setShowApplicationModal(true)}
                      onAddEvent={() => setShowEventModal(true)}
                      onAddNote={() => setShowNoteModal(true)}
                    />
                  </div>
                )}
                {activeTab === 'coverage' && (
                  <CoverageBookTab 
                    contacts={contacts} 
                    onAdd={() => setShowContactModal(true)}
                    onSelect={setSelectedContact}
                    applications={applications}
                    notes={notes.filter(n => n.contact_id)}
                  />
                )}
                {activeTab === 'pipeline' && (
                  <PipelineTab 
                    applications={applications}
                    onAdd={() => setShowApplicationModal(true)}
                    onSelect={setSelectedApplication}
                    events={events}
                    notes={notes.filter(n => n.application_id)}
                  />
                )}
                {activeTab === 'calendar' && (
                  <CalendarTab 
                    events={events}
                    onAdd={() => setShowEventModal(true)}
                    onSelect={setSelectedEvent}
                    contacts={contacts}
                    applications={applications}
                  />
                )}
                {activeTab === 'notes' && (
                  <NotesTab 
                    notes={notes}
                    contacts={contacts}
                    applications={applications}
                    onAdd={() => setShowNoteModal(true)}
                    onSelect={setSelectedNote}
                  />
                )}
                {activeTab === 'analytics' && (
                  <EnhancedAnalytics 
                    applications={applications} 
                    contacts={contacts}
                    events={events} 
                  />
                )}
                {activeTab === 'research' && (
                  <FirmResearchHub
                    applications={applications}
                    contacts={contacts}
                    notes={notes}
                    onNavigate={setActiveTab}
                  />
                )}
                {activeTab === 'reminders' && (
                  <DeadlineReminders
                    applications={applications}
                    events={events}
                    onUpdateApplication={async (id, updates) => {
                      await supabase.from('applications').update(updates).eq('id', id)
                      fetchData()
                    }}
                  />
                )}
                {activeTab === 'prep' && (
                  <InterviewPrepTracker applications={applications} />
                )}
                {activeTab === 'templates' && (
                  <EmailTemplateManager 
                    contacts={contacts} 
                    applications={applications}
                    onSendEmail={(template, variables) => {
                      console.log('Email sent:', template, variables)
                    }}
                  />
                )}
                {activeTab === 'data' && (
                  <DataImportExport 
                    contacts={contacts}
                    applications={applications}
                    events={events}
                    notes={notes}
                    onImport={(data) => {
                      console.log('Data imported:', data)
                      fetchData()
                    }}
                  />
                )}
                {activeTab === 'timeline' && (
                  <NetworkingTimeline 
                    contacts={contacts}
                    applications={applications}
                    events={events}
                    notes={notes}
                    onActivityClick={(type, id) => {
                      console.log('Activity clicked:', type, id)
                    }}
                  />
                )}
                {activeTab === 'offers' && (
                  <OfferComparisonTool 
                    offers={applications}
                    contacts={contacts}
                    onUpdateOffer={(offer) => {
                      console.log('Offer updated:', offer)
                    }}
                  />
                )}
                {activeTab === 'documents' && (
                  <DocumentVault />
                )}
                {activeTab === 'dealflow' && (
                  <DealFlowVisualization
                    applications={applications}
                    onSelectApplication={setSelectedApplication}
                  />
                )}
                {activeTab === 'gamification' && (
                  <GamificationProfile
                    contacts={contacts}
                    applications={applications}
                    events={events}
                    notes={notes}
                  />
                )}
                {activeTab === 'insights' && (
                  <SmartInsightsEngine
                    contacts={contacts}
                    applications={applications}
                    events={events}
                    notes={notes}
                    onNavigate={setActiveTab}
                  />
                )}
                {activeTab === 'email' && (
                  <EmailIntegrationHub 
                    contacts={contacts}
                    applications={applications}
                  />
                )}
                {activeTab === 'scheduler' && (
                  <InterviewScheduler
                    applications={applications}
                    contacts={contacts}
                    existingEvents={events}
                    onScheduleEvent={(event) => {
                      console.log('Event scheduled:', event)
                    }}
                  />
                )}
                {activeTab === 'referrals' && (
                  <ReferralTracker
                    contacts={contacts}
                    applications={applications}
                  />
                )}
                {activeTab === 'coverletter' && (
                  <AICoverLetterGenerator
                    applications={applications}
                    contacts={contacts}
                    onSaveLetter={(letter) => {
                      console.log('Letter saved:', letter)
                    }}
                  />
                )}
                {activeTab === 'mobile' && (
                  <PWAManager />
                )}
                {activeTab === 'calendarsync' && (
                  <CalendarSyncManager
                    events={events}
                    onSync={() => console.log('Calendar synced')}
                  />
                )}
                {activeTab === 'performance' && (
                  <InterviewPerformanceTracker
                    applications={applications}
                    events={events}
                    onAddPerformance={(performance) => {
                      console.log('Performance added:', performance)
                    }}
                    onUpdatePerformance={(id, updates) => {
                      console.log('Performance updated:', id, updates)
                    }}
                  />
                )}
                {activeTab === 'deals' && (
                  <DealNewsFeed
                    onTrackFirm={(firm) => {
                      console.log('Tracking firm:', firm)
                    }}
                    onAddNote={(news) => {
                      console.log('Note added for news:', news)
                    }}
                    trackedFirms={['Goldman Sachs', 'Evercore', 'Blackstone']}
                  />
                )}
                {activeTab === 'apptemplates' && (
                  <ApplicationTemplates
                    onUseTemplate={(template, variables) => {
                      console.log('Template used:', template, variables)
                    }}
                    applications={applications}
                  />
                )}
                {activeTab === 'velocity' && (
                  <PipelineVelocityTracker
                    applications={applications}
                    onViewApplication={(id) => {
                      const app = applications.find(a => a.id === id)
                      if (app) setSelectedApplication(app)
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Coverage Book Export Modal */}
      <CoverageBookExport
        contacts={contacts}
        applications={applications}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          contacts={contacts}
          applications={applications}
          events={events}
          notes={notes}
          onNavigate={(tab) => { setActiveTab(tab as any); setShowCommandPalette(false) }}
          onAddContact={() => { setShowContactModal(true); setShowCommandPalette(false) }}
          onAddApplication={() => { setShowApplicationModal(true); setShowCommandPalette(false) }}
          onAddEvent={() => { setShowEventModal(true); setShowCommandPalette(false) }}
          onAddNote={() => { setShowNoteModal(true); setShowCommandPalette(false) }}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowKeyboardShortcuts(false)} />
      )}

      {/* Quick Actions FAB */}
      <QuickActionsFab
        onAddContact={() => setShowContactModal(true)}
        onAddApplication={() => setShowApplicationModal(true)}
        onAddEvent={() => setShowEventModal(true)}
        onAddNote={() => setShowNoteModal(true)}
      />
    </div>
  )
}

// Navigation Button Component
function NavButton({ active, onClick, icon: Icon, label, count }: {
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
          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      {count !== undefined && count > 0 && (
        <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  )
}

// Stat Component
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-200">{value}</span>
    </div>
  )
}

// Keyboard Shortcuts Modal
function KeyboardShortcutsModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { key: '⌘K', action: 'Open search/command palette', category: 'Navigation' },
    { key: '⌘/', action: 'Show keyboard shortcuts', category: 'Navigation' },
    { key: '⌘N', action: 'Quick add (contact)', category: 'Actions' },
    { key: '1', action: 'Go to Dashboard', category: 'Navigation' },
    { key: '2', action: 'Go to Coverage Book', category: 'Navigation' },
    { key: '3', action: 'Go to Pipeline', category: 'Navigation' },
    { key: '4', action: 'Go to Calendar', category: 'Navigation' },
    { key: '5', action: 'Go to Notes', category: 'Navigation' },
    { key: '6', action: 'Go to Analytics', category: 'Navigation' },
    { key: '7', action: 'Go to Firm Research', category: 'Navigation' },
    { key: '8', action: 'Go to Reminders', category: 'Navigation' },
    { key: '9', action: 'Go to Interview Prep', category: 'Navigation' },
    { key: '0', action: 'Go to Progress', category: 'Navigation' },
    { key: 'E', action: 'Go to Email Hub', category: 'Power Tools' },
    { key: 'S', action: 'Go to Interview Scheduler', category: 'Power Tools' },
    { key: 'R', action: 'Go to Referral Tracker', category: 'Power Tools' },
    { key: 'L', action: 'Go to AI Cover Letter', category: 'Power Tools' },
    { key: 'M', action: 'Go to Mobile & PWA', category: 'Power Tools' },
    { key: 'C', action: 'Go to Calendar Sync', category: 'Power Tools' },
    { key: '?', action: 'Show this help', category: 'Navigation' },
    { key: 'Esc', action: 'Close modals', category: 'Navigation' },
  ]

  const categories = [...new Set(shortcuts.map(s => s.category))]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Keyboard Shortcuts</h3>
              <p className="text-sm text-slate-400">Speed up your workflow</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {categories.map(category => (
            <div key={category} className="mb-6">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{category}</h4>
              <div className="space-y-2">
                {shortcuts.filter(s => s.category === category).map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-300">{shortcut.action}</span>
                    <kbd className="px-3 py-1 bg-slate-700 rounded-lg text-sm font-mono text-slate-300">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/30 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-500">
            Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">?</kbd> anywhere to show this help
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// Command Palette Component
function CommandPalette({ 
  isOpen, 
  onClose, 
  contacts, 
  applications, 
  events, 
  notes,
  onNavigate,
  onAddContact,
  onAddApplication,
  onAddEvent,
  onAddNote
}: {
  isOpen: boolean
  onClose: () => void
  contacts: Contact[]
  applications: Application[]
  events: CalendarEvent[]
  notes: Note[]
  onNavigate: (tab: string) => void
  onAddContact: () => void
  onAddApplication: () => void
  onAddEvent: () => void
  onAddNote: () => void
}) {
  const [query, setQuery] = useState('')

  const results = [
    { type: 'action', label: 'Add Contact', icon: Users, action: onAddContact },
    { type: 'action', label: 'Add Application', icon: Briefcase, action: onAddApplication },
    { type: 'action', label: 'Add Event', icon: Calendar, action: onAddEvent },
    { type: 'action', label: 'Add Note', icon: FileText, action: onAddNote },
    { type: 'nav', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => onNavigate('dashboard') },
    { type: 'nav', label: 'Go to Coverage Book', icon: Users, action: () => onNavigate('coverage') },
    { type: 'nav', label: 'Go to Pipeline', icon: Briefcase, action: () => onNavigate('pipeline') },
    { type: 'nav', label: 'Go to Calendar', icon: Calendar, action: () => onNavigate('calendar') },
    { type: 'nav', label: 'Go to Notes', icon: FileText, action: () => onNavigate('notes') },
    { type: 'nav', label: 'Go to Analytics', icon: BarChart3, action: () => onNavigate('analytics') },
    ...contacts.slice(0, 5).map(c => ({ type: 'contact', label: c.name, sublabel: c.firm, action: () => onNavigate('coverage') })),
    ...applications.slice(0, 5).map(a => ({ type: 'application', label: a.firm, sublabel: a.role, action: () => onNavigate('pipeline') })),
  ].filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    ('sublabel' in item && item.sublabel?.toLowerCase().includes(query.toLowerCase()))
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
      >
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search commands, contacts, applications..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-lg"
              autoFocus
            />
            <button onClick={onClose} className="p-1 text-slate-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.map((result, i) => (
            <button
              key={i}
              onClick={() => { result.action(); onClose() }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors text-left"
            >
              {'icon' in result && result.icon && <result.icon className="w-5 h-5 text-slate-400" />}
              <div className="flex-1">
                <div className="text-white">{result.label}</div>
                {'sublabel' in result && result.sublabel && (
                  <div className="text-sm text-slate-500">{result.sublabel}</div>
                )}
              </div>
              <span className="text-xs text-slate-600 uppercase">{result.type}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
