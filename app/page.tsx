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
  Lightbulb
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'coverage' | 'pipeline' | 'calendar' | 'notes' | 'analytics' | 'prep' | 'research' | 'reminders'>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
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
      if (e.metaKey && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(prev => !prev)
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false)
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
                  <AnalyticsTab stats={dashboardStats} applications={applications} events={events} />
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
                  <div className="glass-card p-8 text-center">
                    <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Interview Prep</h3>
                    <p className="text-slate-400">Coming soon - Track your interview preparation progress</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

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
