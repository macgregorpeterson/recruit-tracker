'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Building2, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar,
  Clock,
  User,
  FileText,
  ArrowUpRight,
  ExternalLink,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Application, Contact, Note, CalendarEvent } from '../types'
import { Modal } from './Modal'
import { STATUS_COLORS, STATUS_LABELS, STATUS_ORDER } from '../types'

interface ApplicationDetailViewProps {
  application: Application
  isOpen: boolean
  onClose: () => void
  contacts: Contact[]
  notes: Note[]
  events: CalendarEvent[]
  onEdit: () => void
  onDelete: () => void
  onViewContact: (contact: Contact) => void
  onAddNote: () => void
  onStatusChange: (newStatus: Application['status']) => void
}

export function ApplicationDetailView({
  application,
  isOpen,
  onClose,
  contacts,
  notes,
  events,
  onEdit,
  onDelete,
  onViewContact,
  onAddNote,
  onStatusChange,
}: ApplicationDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'notes' | 'timeline'>('overview')

  // Get contacts at same firm
  const firmContacts = contacts.filter(c => 
    c.firm.toLowerCase() === application.firm.toLowerCase()
  )

  // Get linked notes
  const appNotes = notes.filter(n => n.application_id === application.id)
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())

  // Get linked events
  const appEvents = events.filter(e => 
    e.firm?.toLowerCase() === application.firm.toLowerCase()
  ).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  // Calculate days since applied
  const daysSinceApplied = application.applied_date 
    ? Math.floor((new Date().getTime() - new Date(application.applied_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Status timeline for visualization
  const currentStatusIndex = STATUS_ORDER.indexOf(application.status)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-3xl"
    >
      <div className="-mt-6 -mx-6">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-700/50">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{application.firm}</h2>
                <div className="flex items-center gap-2 text-slate-400 mt-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{application.role}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                Edit
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Status Badge & Quick Actions */}
          <div className="flex items-center gap-4 mt-4">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${STATUS_COLORS[application.status]}`}>
              {STATUS_LABELS[application.status]}
            </span>
            {application.applied_date && (
              <span className="text-sm text-slate-500">
                Applied {daysSinceApplied === 0 ? 'today' : `${daysSinceApplied} days ago`}
              </span>
            )}
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {application.location && (
              <InfoItem icon={MapPin} label="Location" value={application.location} />
            )}
            {application.compensation && (
              <InfoItem icon={DollarSign} label="Compensation" value={application.compensation} />
            )}
            {application.deadline_date && (
              <InfoItem 
                icon={Clock} 
                label="Deadline" 
                value={new Date(application.deadline_date).toLocaleDateString()} 
                highlight={new Date(application.deadline_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
              />
            )}
            {application.offer_deadline && (
              <InfoItem 
                icon={Calendar} 
                label="Offer Deadline" 
                value={new Date(application.offer_deadline).toLocaleDateString()}
                highlight
              />
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-slate-700/50">
          <div className="flex gap-6">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              label="Overview"
            />
            <TabButton
              active={activeTab === 'contacts'}
              onClick={() => setActiveTab('contacts')}
              label="Contacts"
              count={firmContacts.length}
            />
            <TabButton
              active={activeTab === 'notes'}
              onClick={() => setActiveTab('notes')}
              label="Notes"
              count={appNotes.length}
            />
            <TabButton
              active={activeTab === 'timeline'}
              onClick={() => setActiveTab('timeline')}
              label="Timeline"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[500px] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Pipeline */}
              <div>
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Application Progress</h4>
                <div className="relative">
                  <div className="absolute top-5 left-0 right-0 h-1 bg-slate-800 rounded-full" />
                  <div className="absolute top-5 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                    style={{ width: `${((currentStatusIndex + 1) / STATUS_ORDER.length) * 100}%` }}
                  />
                  <div className="relative flex justify-between">
                    {STATUS_ORDER.map((status, index) => {
                      const isCompleted = index <= currentStatusIndex
                      const isCurrent = index === currentStatusIndex
                      return (
                        <button
                          key={status}
                          onClick={() => onStatusChange(status)}
                          className="flex flex-col items-center gap-2 group"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCurrent 
                              ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30' 
                              : isCompleted 
                                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                                : 'bg-slate-800 border-slate-700 text-slate-600 hover:border-slate-600'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <span className="text-xs font-bold">{index + 1}</span>
                            )}
                          </div>
                          <span className={`text-xs font-medium ${
                            isCurrent ? 'text-blue-400' : isCompleted ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            {STATUS_LABELS[status]}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Notes Preview */}
              {appNotes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Latest Notes</h4>
                    <button 
                      onClick={() => setActiveTab('notes')}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-2">
                    {appNotes.slice(0, 2).map((note) => (
                      <NoteCard key={note.id} note={note} />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Events */}
              {appEvents.filter(e => new Date(e.start_time) > new Date()).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Upcoming Events</h4>
                  <div className="space-y-2">
                    {appEvents
                      .filter(e => new Date(e.start_time) > new Date())
                      .slice(0, 2)
                      .map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                  </div>
                </div>
              )}

              {/* Application Notes */}
              {application.notes && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Application Notes</h4>
                  <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                    <p className="text-slate-300 whitespace-pre-wrap">{application.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-3">
              {firmContacts.length === 0 ? (
                <EmptyState
                  icon={User}
                  title="No contacts at this firm"
                  description="Add contacts to build your coverage book"
                />
              ) : (
                <>
                  {firmContacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} onClick={() => onViewContact(contact)} />
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-3">
              {appNotes.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No notes yet"
                  description="Add notes about your application process"
                  action={{ label: 'Add Note', onClick: onAddNote }}
                />
              ) : (
                <>
                  {appNotes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <TimelineItem
                icon={CheckCircle2}
                color="blue"
                title="Application Submitted"
                date={application.applied_date}
                description={`Applied for ${application.role} position`}
              />
              {appEvents.map((event) => (
                <TimelineItem
                  key={event.id}
                  icon={Calendar}
                  color="purple"
                  title={event.title}
                  date={event.start_time}
                  description={event.description || `${event.event_type} at ${event.firm}`}
                />
              ))}
              {currentStatusIndex > 0 && (
                <TimelineItem
                  icon={TrendingUp}
                  color="emerald"
                  title={`Status: ${STATUS_LABELS[application.status]}`}
                  date={application.updated_at}
                  description="Current application status"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

function TabButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={`relative py-3 text-sm font-medium transition-colors ${
        active ? 'text-white' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
          active ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'
        }`}>
          {count}
        </span>
      )}
      {active && (
        <motion.div
          layoutId="appActiveTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
        />
      )}
    </button>
  )
}

function InfoItem({ icon: Icon, label, value, highlight }: { icon: React.ElementType; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-3 rounded-lg border ${highlight ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/30 border-slate-700/30'}`}>
      <div className="flex items-center gap-2 text-slate-500 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-sm font-medium ${highlight ? 'text-amber-400' : 'text-slate-200'}`}>{value}</div>
    </div>
  )
}

function ContactCard({ contact, onClick }: { contact: Contact; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 cursor-pointer hover:border-slate-600 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="font-medium text-slate-200">{contact.name}</h4>
            <p className="text-sm text-slate-400">{contact.title}</p>
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-500" />
      </div>
    </motion.div>
  )
}

function NoteCard({ note }: { note: Note }) {
  return (
    <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
      <h4 className="font-medium text-slate-200">{note.title}</h4>
      {note.content && (
        <p className="text-sm text-slate-400 mt-2 line-clamp-3">{note.content}</p>
      )}
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
        <Clock className="w-3 h-3" />
        {note.created_at && new Date(note.created_at).toLocaleDateString()}
      </div>
    </div>
  )
}

function EventCard({ event }: { event: CalendarEvent }) {
  const eventDate = new Date(event.start_time)
  return (
    <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-slate-200">{event.title}</h4>
          <p className="text-sm text-slate-400">
            {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  )
}

function TimelineItem({ icon: Icon, color, title, date, description }: { icon: React.ElementType; color: string; title: string; date?: string; description: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  }

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="w-px flex-1 bg-slate-800 my-2" />
      </div>
      <div className="flex-1 pb-6">
        <h4 className="font-medium text-slate-200">{title}</h4>
        {date && (
          <p className="text-xs text-slate-500 mt-1">{new Date(date).toLocaleDateString()} {new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
        )}
        <p className="text-sm text-slate-400 mt-2">{description}</p>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, description, action }: { icon: React.ElementType; title: string; description: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-slate-600" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-500/20 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
