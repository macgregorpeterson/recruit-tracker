'use client'

import { useState } from 'react'
import { 
  Users, 
  Calendar, 
  FileText, 
  Briefcase, 
  Search,
  Plus,
  MoreHorizontal,
  Phone,
  Coffee,
  Building2,
  Clock
} from 'lucide-react'
import Link from 'next/link'

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

// Sample Data
const SAMPLE_CONTACTS: Contact[] = [
  { id: '1', name: 'John Smith', firm: 'Goldman Sachs', title: 'Managing Director', email: 'john.smith@gs.com', lastContact: '2 days ago', tags: ['Referral', 'Met at Event'] },
  { id: '2', name: 'Sarah Chen', firm: 'Blackstone', title: 'Principal', email: 'sarah.chen@bx.com', lastContact: '1 week ago', tags: ['Alumni'] },
  { id: '3', name: 'Mike Johnson', firm: 'JP Morgan', title: 'VP', email: 'mike.j@jpm.com', lastContact: '3 days ago', tags: ['Cold Outreach'] },
]

const SAMPLE_APPLICATIONS: Application[] = [
  { id: '1', firm: 'Goldman Sachs', role: 'Investment Banking Associate', status: 'superday', appliedDate: '2024-02-15' },
  { id: '2', firm: 'Blackstone', role: 'Private Equity Associate', status: 'first', appliedDate: '2024-02-10' },
  { id: '3', firm: 'KKR', role: 'Private Equity Associate', status: 'applied', appliedDate: '2024-03-01' },
  { id: '4', firm: 'Bain Capital', role: 'Private Equity Associate', status: 'phone', appliedDate: '2024-02-20' },
]

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
  const [activeTab, setActiveTab] = useState<'contacts' | 'pipeline' | 'calendar' | 'notes'>('contacts')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">RecruitTracker</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts, firms, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-80 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Link 
              href="/"
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              Quick Add
            </button>
          </div>

          <nav className="px-3 space-y-1">
            <NavButton 
              active={activeTab === 'contacts'} 
              onClick={() => setActiveTab('contacts')}
              icon={Users}
              label="Rolodex"
            />
            <NavButton 
              active={activeTab === 'pipeline'} 
              onClick={() => setActiveTab('pipeline')}
              icon={Briefcase}
              label="Pipeline"
              badge="4"
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
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">This Week</p>
            <div className="space-y-2">
              <Stat label="Meetings" value="8" />
              <Stat label="Applications" value="12" />
              <Stat label="Interviews" value="3" />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'contacts' && <ContactsTab contacts={SAMPLE_CONTACTS} />}
          {activeTab === 'pipeline' && <PipelineTab applications={SAMPLE_APPLICATIONS} />}
          {activeTab === 'calendar' && <CalendarTab />}
          {activeTab === 'notes' && <NotesTab />}
        </main>
      </div>
    </div>
  )
}

// Navigation Button
function NavButton({ active, onClick, icon: Icon, label, badge }: {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
  badge?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      {badge && (
        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  )
}

// Stat Component
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}

// Contacts Tab
function ContactsTab({ contacts }: { contacts: Contact[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Rolodex</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by name or firm..."
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Add Contact
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Firm</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{contact.name}</div>
                  <div className="text-sm text-gray-500">{contact.email}</div>
                </td>
                <td className="px-6 py-4 text-gray-700">{contact.firm}</td>
                <td className="px-6 py-4 text-gray-700">{contact.title}</td>
                <td className="px-6 py-4 text-gray-500">{contact.lastContact}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-1 flex-wrap">
                    {contact.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
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

// Pipeline Tab
function PipelineTab({ applications }: { applications: Application[] }) {
  const stages = ['applied', 'phone', 'first', 'second', 'superday', 'offer', 'rejected'] as const
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Application Pipeline</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          Add Application
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageApps = applications.filter((app) => app.status === stage)
          return (
            <div key={stage} className="flex-shrink-0 w-72">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-900">{STATUS_LABELS[stage]}</h3>
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                    {stageApps.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {stageApps.map((app) => (
                    <div key={app.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                      <div className="font-medium text-gray-900">{app.firm}</div>
                      <div className="text-sm text-gray-600">{app.role}</div>
                      <div className="text-xs text-gray-400 mt-2">
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

// Calendar Tab
function CalendarTab() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Calendar</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            Connect Google Calendar
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Add Event
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Calendar</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Sync recruiting events from Google Calendar to track coffee chats, interviews, and follow-ups
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
          Connect Google Calendar
        </button>
      </div>

      {/* Sample Events */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Upcoming</h3>
        <div className="space-y-3">
          <EventCard 
            title="Coffee Chat - Goldman Sachs"
            firm="Goldman Sachs"
            type="coffee"
            time="Today, 2:00 PM"
            contact="John Smith"
          />
          <EventCard 
            title="Superday - Blackstone"
            firm="Blackstone"
            type="interview"
            time="Tomorrow, 9:00 AM"
            contact="Recruiting Team"
          />
          <EventCard 
            title="Follow-up Call"
            firm="KKR"
            type="phone"
            time="Friday, 3:00 PM"
            contact="Sarah Chen"
          />
        </div>
      </div>
    </div>
  )
}

// Event Card
function EventCard({ title, firm, type, time, contact }: {
  title: string
  firm: string
  type: 'coffee' | 'interview' | 'phone'
  time: string
  contact: string
}) {
  const icons = { coffee: Coffee, interview: Building2, phone: Phone }
  const Icon = icons[type]
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-sm text-gray-500">{firm} • {contact}</div>
      </div>
      <div className="text-sm text-gray-500 flex items-center gap-1">
        <Clock className="w-4 h-4" />
        {time}
      </div>
    </div>
  )
}

// Notes Tab
function NotesTab() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          New Note
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Folder Sidebar */}
        <div className="col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Folders</h3>
            <div className="space-y-1">
              <FolderItem name="All Notes" active />
              <FolderItem name="Call Notes" />
              <FolderItem name="Interview Prep" />
              <FolderItem name="Firm Research" />
              <FolderItem name="Personal" />
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="col-span-9">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search notes..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="divide-y divide-gray-100">
              <NoteItem 
                title="Goldman Coffee Chat - John Smith"
                preview="Discussed team culture and deal flow. They're looking for someone with strong modeling skills..."
                date="Mar 5"
                linkedTo="John Smith"
              />
              <NoteItem 
                title="Blackstone Superday Prep"
                preview="Key technical questions to review: LBO modeling, Paper LBO walkthrough, Market outlook..."
                date="Mar 3"
                linkedTo="Interview Prep"
              />
              <NoteItem 
                title="KKR Process Update"
                preview="Spoke with recruiter. They're moving to first rounds next week. Need to prepare for..."
                date="Mar 1"
                linkedTo="KKR"
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
      active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
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
    <div className="p-4 hover:bg-gray-50 cursor-pointer">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <span className="text-xs text-gray-400">{date}</span>
      </div>
      <p className="text-sm text-gray-500 mb-2">{preview}</p>
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
        Linked: {linkedTo}
      </span>
    </div>
  )
}