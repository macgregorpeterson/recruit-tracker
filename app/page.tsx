'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
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
  LogOut
} from 'lucide-react'

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Types
interface Contact {
  id: string
  name: string
  firm: string
  title: string
  email: string
  lastContact: string
  tags: string[]
}

interface Application {
  id: string
  firm: string
  role: string
  status: 'applied' | 'phone' | 'first' | 'second' | 'superday' | 'offer' | 'rejected'
  appliedDate: string
}

const STATUS_COLORS: Record<string, string> = {
  applied: 'bg-gray-100 text-gray-800',
  phone: 'bg-blue-100 text-blue-800',
  first: 'bg-yellow-100 text-yellow-800',
  second: 'bg-orange-100 text-orange-800',
  superday: 'bg-purple-100 text-purple-800',
  offer: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const STATUS_LABELS: Record<string, string> = {
  applied: 'Applied',
  phone: 'Phone Screen',
  first: 'First Round',
  second: 'Second Round',
  superday: 'Superday',
  offer: 'Offer',
  rejected: 'Rejected',
}

export default function RecruitTracker() {
  const [activeTab, setActiveTab] = useState<'coverage' | 'pipeline' | 'calendar' | 'notes'>('coverage')
  const [searchQuery, setSearchQuery] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check auth status
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
    
    // Fetch contacts
    const { data: contactsData } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (contactsData) {
      setContacts(contactsData.map(c => ({
        id: c.id,
        name: c.name,
        firm: c.firm,
        title: c.title || '',
        email: c.email || '',
        lastContact: 'Recently',
        tags: c.tags || []
      })))
    }

    // Fetch applications
    const { data: appsData } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (appsData) {
      setApplications(appsData.map(a => ({
        id: a.id,
        firm: a.firm,
        role: a.role,
        status: a.status,
        appliedDate: a.applied_date || a.created_at
      })))
    }
    
    setLoading(false)
  }

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setContacts([])
    setApplications([])
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">RecruitTracker</h1>
            <p className="text-slate-400">Your banking recruiting command center</p>
          </div>
          <button
            onClick={handleSignIn}
            className="w-full py-3 px-4 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-white">RecruitTracker</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search coverage book, firms, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-80 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900/30 border-r border-slate-800 min-h-screen">
          <div className="p-4">
            <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-500 hover:to-indigo-500 transition-all">
              <Plus className="w-4 h-4" />
              Quick Add
            </button>
          </div>

          <nav className="px-3 space-y-1">
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
            />
            <NavButton 
              active={activeTab === 'notes'} 
              onClick={() => setActiveTab('notes')}
              icon={FileText}
              label="Notes"
            />
          </nav>

          <div className="mt-8 px-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">This Week</p>
            <div className="space-y-2">
              <Stat label="Meetings" value="8" />
              <Stat label="Applications" value={applications.length.toString()} />
              <Stat label="Contacts" value={contacts.length.toString()} />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'coverage' && <CoverageBookTab contacts={contacts} />}
              {activeTab === 'pipeline' && <PipelineTab applications={applications} />}
              {activeTab === 'calendar' && <CalendarTab />}
              {activeTab === 'notes' && <NotesTab />}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

// Navigation Button
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
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active 
          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      {count !== undefined && (
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

// Coverage Book Tab
function CoverageBookTab({ contacts }: { contacts: Contact[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Coverage Book</h2>
          <p className="text-sm text-slate-400 mt-1">Your network across firms</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by name or firm..."
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64"
          />
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-500 hover:to-indigo-500 transition-all">
            Add Contact
          </button>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No contacts yet</h3>
          <p className="text-slate-400 mb-6">Start building your coverage book</p>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium">
            Add Your First Contact
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Firm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Tags</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-200">{contact.name}</div>
                    <div className="text-sm text-slate-500">{contact.email}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{contact.firm}</td>
                  <td className="px-6 py-4 text-slate-300">{contact.title}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {contact.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Pipeline Tab
function PipelineTab({ applications }: { applications: Application[] }) {
  const stages = ['applied', 'phone', 'first', 'second', 'superday', 'offer', 'rejected'] as const
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Application Pipeline</h2>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-500 hover:to-indigo-500 transition-all">
          Add Application
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageApps = applications.filter((app) => app.status === stage)
          return (
            <div key={stage} className="flex-shrink-0 w-72">
              <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-3">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-slate-200">{STATUS_LABELS[stage]}</h3>
                  <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">
                    {stageApps.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {stageApps.map((app) => (
                    <div key={app.id} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
                      <div className="font-medium text-slate-200">{app.firm}</div>
                      <div className="text-sm text-slate-400">{app.role}</div>
                      <div className="text-xs text-slate-500 mt-2">
                        Applied {new Date(app.appliedDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Calendar Tab - Manual Entry for Recruiting Events
function CalendarTab() {
  const [events, setEvents] = useState([
    { id: '1', title: 'Coffee Chat with John Smith', firm: 'Goldman Sachs', type: 'coffee', date: '2026-03-10', time: '14:00', contact: 'John Smith', notes: 'Discuss team culture' },
    { id: '2', title: 'Superday', firm: 'Blackstone', type: 'interview', date: '2026-03-11', time: '09:00', contact: 'Recruiting Team', notes: '4 rounds scheduled' },
    { id: '3', title: 'Follow-up Call', firm: 'KKR', type: 'phone', date: '2026-03-13', time: '15:30', contact: 'Sarah Chen', notes: 'Process update' },
  ])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const days = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    return { days, firstDay, month, year }
  }

  const { days, firstDay, month, year } = getDaysInMonth()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  
  const eventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Calendar</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-500 hover:to-indigo-500 transition-all"
        >
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Calendar Grid */}
        <div className="col-span-8">
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => setSelectedDate(new Date(year, month - 1, 1))}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                ←
              </button>
              <h3 className="text-xl font-semibold text-white">{monthNames[month]} {year}</h3>
              <button 
                onClick={() => setSelectedDate(new Date(year, month + 1, 1))}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                →
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">{day}</div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24" />
              ))}
              {Array.from({ length: days }).map((_, day) => {
                const dayNum = day + 1
                const dayEvents = eventsForDay(dayNum)
                const isToday = new Date().toDateString() === new Date(year, month, dayNum).toDateString()
                
                return (
                  <div 
                    key={dayNum}
                    className={`h-24 border border-slate-800 rounded-lg p-2 ${isToday ? 'bg-blue-500/10 border-blue-500/30' : 'hover:bg-slate-800/30'} transition-colors cursor-pointer`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-400' : 'text-slate-400'}`}>{dayNum}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div key={event.id} className={`text-xs px-2 py-1 rounded truncate ${
                          event.type === 'coffee' ? 'bg-amber-500/20 text-amber-400' :
                          event.type === 'interview' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-slate-500">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events List */}
        <div className="col-span-4">
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => (
                <div key={event.id} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      event.type === 'coffee' ? 'bg-amber-500' :
                      event.type === 'interview' ? 'bg-purple-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-slate-200 text-sm">{event.title}</div>
                      <div className="text-xs text-slate-400">{event.firm} • {event.time}</div>
                      <div className="text-xs text-slate-500 mt-1">{new Date(event.date).toLocaleDateString()}</div>
                      {event.notes && <div className="text-xs text-slate-500 mt-1 italic">{event.notes}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Notes Tab
function NotesTab() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Notes</h2>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-500 hover:to-indigo-500 transition-all">
          New Note
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Folder Sidebar */}
        <div className="col-span-3">
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-3">Folders</h3>
            <div className="space-y-1">
              <FolderItem name="All Notes" active />
              <FolderItem name="Coverage Book Notes" />
              <FolderItem name="Interview Prep" />
              <FolderItem name="Firm Research" />
              <FolderItem name="Personal" />
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="col-span-9">
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl">
            <div className="p-4 border-b border-slate-800">
              <input
                type="text"
                placeholder="Search notes..."
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="divide-y divide-slate-800">
              <NoteItem 
                title="Goldman Coffee Chat - John Smith"
                preview="Discussed team culture and deal flow. They're looking for someone with strong modeling skills..."
                date="Mar 5"
                linkedTo="Coverage Book: John Smith"
              />
              <NoteItem 
                title="Blackstone Superday Prep"
                preview="Key technical questions to review: LBO modeling, Paper LBO walkthrough, Market outlook..."
                date="Mar 3"
                linkedTo="Interview Prep"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Folder Item
function FolderItem({ name, active }: { name: string; active?: boolean }) {
  return (
    <button className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
      active ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
    }`}>
      {name}
    </button>
  )
}

// Note Item
function NoteItem({ title, preview, date, linkedTo }: {
  title: string
  preview: string
  date: string
  linkedTo: string
}) {
  return (
    <div className="p-4 hover:bg-slate-800/30 cursor-pointer transition-colors">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-medium text-slate-200">{title}</h4>
        <span className="text-xs text-slate-500">{date}</span>
      </div>
      <p className="text-sm text-slate-400 mb-2">{preview}</p>
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
        Linked: {linkedTo}
      </span>
    </div>
  )
}