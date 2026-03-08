'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Linkedin, 
  Tag, 
  Calendar, 
  FileText, 
  Briefcase,
  ArrowUpRight,
  Clock,
  ExternalLink
} from 'lucide-react'
import { Contact, CalendarEvent, Note, Application } from '../types'
import { Modal } from './Modal'
import { STATUS_COLORS, STATUS_LABELS, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '../types'

interface ContactDetailViewProps {
  contact: Contact
  isOpen: boolean
  onClose: () => void
  events: CalendarEvent[]
  notes: Note[]
  applications: Application[]
  contacts: Contact[]
  onEdit: () => void
  onDelete: () => void
  onViewApplication: (app: Application) => void
  onViewEvent: (event: CalendarEvent) => void
  onAddNote: () => void
}

export function ContactDetailView({
  contact,
  isOpen,
  onClose,
  events,
  notes,
  applications,
  contacts,
  onEdit,
  onDelete,
  onViewApplication,
  onViewEvent,
  onAddNote,
}: ContactDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'notes' | 'applications'>('overview')

  // Get linked events
  const contactEvents = events.filter(e => e.contact_ids?.includes(contact.id))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  // Get linked notes
  const contactNotes = notes.filter(n => n.contact_id === contact.id)
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())

  // Get applications at same firm
  const firmApplications = applications.filter(a => 
    a.firm.toLowerCase() === contact.firm.toLowerCase()
  )

  // Get other contacts at same firm (smart suggestion)
  const relatedContacts = contacts.filter(c => 
    c.id !== contact.id && 
    c.firm.toLowerCase() === contact.firm.toLowerCase()
  )

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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center">
                <User className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{contact.name}</h2>
                <div className="flex items-center gap-2 text-slate-400 mt-1">
                  <Building2 className="w-4 h-4" />
                  <span>{contact.title}</span>
                  <span className="text-slate-600">•</span>
                  <span>{contact.firm}</span>
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

          {/* Contact Info */}
          <div className="flex flex-wrap gap-4 mt-4">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors"
              >
                <Phone className="w-4 h-4" />
                {contact.phone}
              </a>
            )}
            {contact.linkedin_url && (
              <a
                href={contact.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {contact.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-slate-700/50">
          <div className="flex gap-6">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              label="Overview"
              count={undefined}
            />
            <TabButton
              active={activeTab === 'events'}
              onClick={() => setActiveTab('events')}
              label="Events"
              count={contactEvents.length}
            />
            <TabButton
              active={activeTab === 'notes'}
              onClick={() => setActiveTab('notes')}
              label="Notes"
              count={contactNotes.length}
            />
            <TabButton
              active={activeTab === 'applications'}
              onClick={() => setActiveTab('applications')}
              label="Applications"
              count={firmApplications.length}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[500px] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <StatBox label="Events" value={contactEvents.length} icon={Calendar} />
                <StatBox label="Notes" value={contactNotes.length} icon={FileText} />
                <StatBox label="Firm Apps" value={firmApplications.length} icon={Briefcase} />
              </div>

              {/* Upcoming Events Preview */}
              {contactEvents.filter(e => new Date(e.start_time) > new Date()).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Upcoming Events</h4>
                  <div className="space-y-2">
                    {contactEvents
                      .filter(e => new Date(e.start_time) > new Date())
                      .slice(0, 3)
                      .map((event) => (
                        <EventCard key={event.id} event={event} onClick={() => onViewEvent(event)} />
                      ))}
                  </div>
                </div>
              )}

              {/* Recent Notes Preview */}
              {contactNotes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Recent Notes</h4>
                  <div className="space-y-2">
                    {contactNotes.slice(0, 2).map((note) => (
                      <NoteCard key={note.id} note={note} />
                    ))}
                  </div>
                </div>
              )}

              {/* Related Contacts */}
              {relatedContacts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                    Others at {contact.firm}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {relatedContacts.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-slate-800/50 text-slate-300 border border-slate-700/50"
                      >
                        <User className="w-3 h-3" />
                        {c.name} • {c.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-3">
              {contactEvents.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No events yet"
                  description="Schedule a coffee chat or call with this contact"
                />
              ) : (
                <>
                  {contactEvents.map((event) => (
                    <EventCard key={event.id} event={event} onClick={() => onViewEvent(event)} />
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-3">
              {contactNotes.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No notes yet"
                  description="Add notes from your conversations"
                  action={{ label: 'Add Note', onClick: onAddNote }}
                />
              ) : (
                <>
                  {contactNotes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-3">
              {firmApplications.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="No applications to this firm"
                  description="Track your applications at this firm"
                />
              ) : (
                <>
                  {firmApplications.map((app) => (
                    <ApplicationCard key={app.id} application={app} onClick={() => onViewApplication(app)} />
                  ))}
                </>
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
          active ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'
        }`}>
          {count}
        </span>
      )}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"
        />
      )}
    </button>
  )
}

function StatBox({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
      <div className="flex items-center gap-2 text-slate-400 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  )
}

function EventCard({ event, onClick }: { event: CalendarEvent; onClick?: () => void }) {
  const eventDate = new Date(event.start_time)
  const isPast = eventDate < new Date()

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`p-4 rounded-xl border cursor-pointer transition-all ${
        isPast 
          ? 'bg-slate-800/20 border-slate-700/30 opacity-60' 
          : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 ${
            EVENT_TYPE_COLORS[event.event_type]?.bg ?? 'bg-slate-700'
          }`}>
            <span className="text-xs font-bold text-slate-400">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</span>
            <span className="text-sm font-bold text-white">{eventDate.getDate()}</span>
          </div>
          <div>
            <h4 className="font-medium text-slate-200">{event.title}</h4>
            <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
              <span className="capitalize">{EVENT_TYPE_LABELS[event.event_type]}</span>
              <span>•</span>
              <span>{eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
            </div>
            {event.firm && <p className="text-xs text-slate-500 mt-1">{event.firm}</p>}
          </div>
        </div>
        {onClick && <ArrowUpRight className="w-4 h-4 text-slate-500" />}
      </div>
    </motion.div>
  )
}

function NoteCard({ note }: { note: Note }) {
  return (
    <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
      <h4 className="font-medium text-slate-200">{note.title}</h4>
      {note.content && (
        <p className="text-sm text-slate-400 mt-2 line-clamp-2">{note.content}</p>
      )}
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
        <Clock className="w-3 h-3" />
        {note.created_at && new Date(note.created_at).toLocaleDateString()}
      </div>
    </div>
  )
}

function ApplicationCard({ application, onClick }: { application: Application; onClick?: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 cursor-pointer hover:border-slate-600 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-slate-200">{application.firm}</h4>
          <p className="text-sm text-slate-400">{application.role}</p>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[application.status]}`}>
          {STATUS_LABELS[application.status]}
        </span>
      </div>
      {application.location && (
        <p className="text-xs text-slate-500 mt-2">{application.location}</p>
      )}
    </motion.div>
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
          className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
