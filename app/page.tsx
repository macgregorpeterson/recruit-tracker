'use client'

import { useState } from 'react'
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
  MoreHorizontal,
  Filter,
  ChevronDown,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react'

// Types
interface Contact {
  id: string
  name: string
  firm: string
  title: string
  email: string
  lastContact: string
  tags: string[]
  priority: 'high' | 'medium' | 'low'
}

interface Application {
  id: string
  firm: string
  role: string
  status: 'applied' | 'phone' | 'first' | 'second' | 'superday' | 'offer' | 'rejected'
  appliedDate: string
  notes: string
}

// Sample Data
const SAMPLE_CONTACTS: Contact[] = [
  { id: '1', name: 'John Smith', firm: 'Goldman Sachs', title: 'Managing Director', email: 'john.smith@gs.com', lastContact: '2 days ago', tags: ['Referral', 'Met at Event'], priority: 'high' },
  { id: '2', name: 'Sarah Chen', firm: 'Blackstone', title: 'Principal', email: 'sarah.chen@bx.com', lastContact: '1 week ago', tags: ['Alumni'], priority: 'high' },
  { id: '3', name: 'Mike Johnson', firm: 'JP Morgan', title: 'VP', email: 'mike.j@jpm.com', lastContact: '3 days ago', tags: ['Cold Outreach'], priority: 'medium' },
  { id: '4', name: 'Emily Davis', firm: 'KKR', title: 'Partner', email: 'emily.davis@kkr.com', lastContact: '2 weeks ago', tags: ['Referral', 'Follow-up'], priority: 'high' },
  { id: '5', name: 'David Park', firm: 'Carlyle', title: 'Managing Director', email: 'david.park@carlyle.com', lastContact: '1 month ago', tags: ['Cold Outreach'], priority: 'low' },
]

const SAMPLE_APPLICATIONS: Application[] = [
  { id: '1', firm: 'Goldman Sachs', role: 'Investment Banking Associate', status: 'superday', appliedDate: '2024-02-15', notes: 'Superday scheduled for next week' },
  { id: '2', firm: 'Blackstone', role: 'Private Equity Associate', status: 'first', appliedDate: '2024-02-10', notes: 'Waiting to hear back' },
  { id: '3', firm: 'KKR', role: 'Private Equity Associate', status: 'applied', appliedDate: '2024-03-01', notes: 'Applied online, no response yet' },
  { id: '4', firm: 'Bain Capital', role: 'Private Equity Associate', status: 'phone', appliedDate: '2024-02-20', notes: 'Phone screen completed' },
  { id: '5', firm: 'Carlyle', role: 'Investment Associate', status: 'second', appliedDate: '2024-01-28', notes: 'Second round next week' },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; gradient: string }> = {
  applied: { label: 'Applied', color: 'text-slate-400', gradient: 'from-slate-500/20 to-slate-600/20' },
  phone: { label: 'Phone', color: 'text-blue-400', gradient: 'from-blue-500/20 to-blue-600/20' },
  first: { label: '1st Round', color: 'text-amber-400', gradient: 'from-amber-500/20 to-amber-600/20' },
  second: { label: '2nd Round', color: 'text-orange-400', gradient: 'from-orange-500/20 to-orange-600/20' },
  superday: { label: 'Superday', color: 'text-purple-400', gradient: 'from-purple-500/20 to-purple-600/20' },
  offer: { label: 'Offer', color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-emerald-600/20' },
  rejected: { label: 'Rejected', color: 'text-rose-400', gradient: 'from-rose-500/20 to-rose-600/20' },
}

export default function RecruitTracker() {
  const [activeTab, setActiveTab] = useState<'coverage' | 'pipeline' | 'calendar' | 'notes'>('coverage')
  const [searchQuery, setSearchQuery] = useState('')

  const stats = {
    contacts: SAMPLE_CONTACTS.length,
    applications: SAMPLE_APPLICATIONS.length,
    interviews: 3,
    offers: 0
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">RecruitTracker</h1>
              <p className="text-xs text-slate-500">Banking Recruiting Command Center</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search coverage book, firms, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-80 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30">
              <Plus className="w-4 h-4" />
              <span>Add New</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-slate-900/30 border-r border-slate-800 min-h-screen">
          {/* Stats Cards */}
          <div className="p-4 grid grid-cols-2 gap-3">
            <StatCard icon={Users} label="Contacts" value={stats.contacts} trend="+2" />
            <StatCard icon={Briefcase} label="Applications" value={stats.applications} trend="+1" />
          </div>

          <nav className="px-3 space-y-1 mt-2">
            <NavButton 
              active={activeTab === 'coverage'} 
              onClick={() => setActiveTab('coverage')}
              icon={Target}
              label="Coverage Book"
              count={stats.contacts}
            />
            <NavButton 
              active={activeTab === 'pipeline'} 
              onClick={() => setActiveTab('pipeline')}
              icon={TrendingUp}
              label="Pipeline"
              count={stats.applications}
            />
            <NavButton 
              active={activeTab === 'calendar'} 
              onClick={() => setActiveTab('calendar')}
              icon={Calendar}
              label="Calendar"
              count={8}
            />
            <NavButton 
              active={activeTab === 'notes'} 
              onClick={() => setActiveTab('notes')}
              icon={FileText}
              label="Notes"
              count={12}
            />
          </nav>

          {/* Quick Stats */}
          <div className="mt-6 mx-4 p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">This Week</span>
            </div>
            <div className="space-y-2">
              <QuickStat label="Meetings" value="8" />
              <QuickStat label="Interviews" value="3" />
              <QuickStat label="Offers" value="0" />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'coverage' && <CoverageBookTab contacts={SAMPLE_CONTACTS} />}
          {activeTab === 'pipeline' && <PipelineTab applications={SAMPLE_APPLICATIONS} />}
          {activeTab === 'calendar' && <CalendarTab />}
          {activeTab === 'notes' && <NotesTab />}
        </main>
      </div>
    </div>
  )
}

// Stat Card
function StatCard({ icon: Icon, label, value, trend }: { icon: any; label: string; value: number; trend: string }) {
  return (
    <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-4 h-4 text-slate-400" />
        <span className="text-xs text-emerald-400 font-medium">{trend}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}

// Navigation Button
function NavButton({ active, onClick, icon: Icon, label, count }: {
  active: boolean
  onClick: () => void
  icon: any
  label: string
  count: number
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'
      }`}>
        {count}
      </span>
    </button>
  )
}

// Quick Stat
function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-200">{value}</span>
    </div>
  )
}

// Coverage Book Tab
function CoverageBookTab({ contacts }: { contacts: Contact[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Coverage Book</h2>
          <p className="text-sm text-slate-400 mt-1">Your network across {new Set(contacts.map(c => c.firm)).size} firms</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-slate-300 hover:bg-slate-800 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800/50 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Firm</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Contact</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                      <span className="text-sm font-bold text-indigo-300">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{contact.name}</div>
                      <div className="text-sm text-slate-500">{contact.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300">{contact.firm}</td>
                <td className="px-6 py-4 text-slate-400">{contact.title}</td>
                <td className="px-6 py-4 text-slate-500">{contact.lastContact}</td>
                <td className="px-6 py-4">
                  <PriorityBadge priority={contact.priority} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Priority Badge
function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[priority] || colors.low}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}

// Pipeline Tab
function PipelineTab({ applications }: { applications: Application[] }) {
  const stages = ['applied', 'phone', 'first', 'second', 'superday', 'offer', 'rejected'] as const
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Application Pipeline</h2>
          <p className="text-sm text-slate-400 mt-1">Track your recruiting progress</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageApps = applications.filter((app) => app.status === stage)
          const config = STATUS_CONFIG[stage]
          return (
            <div key={stage} className="flex-shrink-0 w-80">
              <div className={`p-4 rounded-2xl bg-gradient-to-b ${config.gradient} border border-slate-700/50`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-semibold ${config.color}`}>{config.label}</h3>
                  <span className="bg-slate-800/50 text-slate-300 text-xs px-2 py-1 rounded-full">
                    {stageApps.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {stageApps.map((app) => (
                    <div key={app.id} className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all group cursor-pointer">
                      <div className="font-semibold text-white mb-1">{app.firm}</div>
                      <div className="text-sm text-slate-400 mb-3">{app.role}</div>
                      <div className="text-xs text-slate-500">
                        Applied {new Date(app.appliedDate).toLocaleDateString()}
                      </div>
                      {app.notes && (
                        <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-400">
                          {app.notes}
                        </div>
                      )}
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

// Calendar Tab
function CalendarTab() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Calendar</h2>
          <p className="text-sm text-slate-400 mt-1">Upcoming recruiting events</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-slate-300 hover:bg-slate-800 transition-all">
            <Building2 className="w-4 h-4" />
            Connect Google
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Today</h3>
          <EventCard 
            title="Coffee Chat"
            firm="Goldman Sachs"
            type="coffee"
            time="2:00 PM"
            contact="John Smith"
            description="Discuss team culture and deal flow"
          />
          <EventCard 
            title="Phone Screen"
            firm="KKR"
            type="phone"
            time="4:30 PM"
            contact="Recruiting Team"
            description="Initial screening with HR"
          />
          
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mt-8">Tomorrow</h3>
          <EventCard 
            title="Superday"
            firm="Blackstone"
            type="interview"
            time="9:00 AM"
            contact="Multiple Interviewers"
            description="Full day of interviews - bring 5 copies of resume"
          />
        </div>

        {/* Mini Calendar */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">March 2024</h3>
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
            {['S','M','T','W','T','F','S'].map(d => (
              <div key={d} className="text-slate-500 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 31 }, (_, i) => (
              <button
                key={i}
                className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-colors ${
                  i + 1 === 8
                    ? 'bg-indigo-600 text-white'
                    : [5, 12, 15, 22].includes(i + 1)
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-6 space-y-2">
            <div className="text-xs text-slate-500">Legend</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-indigo-500/20 border border-indigo-500/30"></div>
              <span className="text-slate-400">Has Events</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-indigo-600"></div>
              <span className="text-slate-400">Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Event Card
function EventCard({ title, firm, type, time, contact, description }: {
  title: string
  firm: string
  type: 'coffee' | 'interview' | 'phone'
  time: string
  contact: string
  description: string
}) {
  const icons = { coffee: Coffee, interview: Building2, phone: Phone }
  const gradients = {
    coffee: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
    interview: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    phone: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30'
  }
  const Icon = icons[type]
  
  return (
    <div className={`flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-r ${gradients[type]} border backdrop-blur-sm`}>
      <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <h4 className="font-semibold text-white">{title} - {firm}</h4>
          <span className="text-sm text-slate-400 flex items-center gap-1 flex-shrink-0 ml-4">
            <Clock className="w-4 h-4" />
            {time}
          </span>
        </div>
        <p className="text-sm text-slate-300 mb-1">{contact}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
  )
}

// Notes Tab
function NotesTab() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Notes</h2>
          <p className="text-sm text-slate-400 mt-1">Call notes, interview prep, and research</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Folder Sidebar */}
        <div className="col-span-3">
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-4">
            <h3 className="font-semibold text-white mb-4">Folders</h3>
            <div className="space-y-1">
              <FolderItem name="All Notes" count={12} active />
              <FolderItem name="Coverage Book Notes" count={5} />
              <FolderItem name="Interview Prep" count={3} />
              <FolderItem name="Firm Research" count={2} />
              <FolderItem name="Personal" count={2} />
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="col-span-9">
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <input
                type="text"
                placeholder="Search notes..."
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div className="divide-y divide-slate-800">
              <NoteListItem 
                title="Goldman Coffee Chat - John Smith"
                preview="Discussed team culture and deal flow. They're looking for someone with strong modeling skills and entrepreneurial mindset..."
                date="Mar 5"
                linkedTo="Coverage Book: John Smith"
                tags={['Referral', 'High Priority']}
              />
              <NoteListItem 
                title="Blackstone Superday Prep"
                preview="Key technical questions to review: LBO modeling, Paper LBO walkthrough, Market outlook, Why PE, Why Blackstone..."
                date="Mar 3"
                linkedTo="Interview Prep"
                tags={['Superday']}
              />
              <NoteListItem 
                title="KKR Process Update"
                preview="Spoke with recruiter. They're moving to first rounds next week. Need to prepare for 3 back-to-back interviews..."
                date="Mar 1"
                linkedTo="Coverage Book: KKR"
                tags={['Process Update']}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Folder Item
function FolderItem({ name, count, active }: { name: string; count: number; active?: boolean }) {
  return (
    <button className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
      active 
        ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }`}>
      <span>{name}</span>
      <span className={`text-xs ${active ? 'text-indigo-400' : 'text-slate-600'}`}>{count}</span>
    </button>
  )
}

// Note List Item
function NoteListItem({ title, preview, date, linkedTo, tags }: {
  title: string
  preview: string
  date: string
  linkedTo: string
  tags: string[]
}) {
  return (
    <div className="p-5 hover:bg-slate-800/30 transition-colors cursor-pointer group">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{title}</h4>
        <span className="text-xs text-slate-500">{date}</span>
      </div>
      <p className="text-sm text-slate-400 mb-3 line-clamp-2">{preview}</p>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Users className="w-3 h-3" />
          {linkedTo}
        </span>
        <div className="flex gap-1">
          {tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}