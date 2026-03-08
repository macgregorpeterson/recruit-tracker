'use client'

import { Modal } from './Modal'
import { Contact, CalendarEvent, Note, Application, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, STATUS_COLORS, STATUS_LABELS } from '../types'
import { User, Building2, Mail, Phone, Linkedin, Tag, Calendar, FileText, Briefcase, ArrowUpRight, ExternalLink, Clock } from 'lucide-react'

interface ContactDetailModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact | null
  events: CalendarEvent[]
  notes: Note[]
  applications: Application[]
  onEdit: () => void
  onNavigate: (tab: string, filter?: string) => void
}

export function ContactDetailModal({ 
  isOpen, 
  onClose, 
  contact, 
  events, 
  notes, 
  applications,
  onEdit,
  onNavigate 
}: ContactDetailModalProps) {
  if (!contact) return null

  const contactEvents = events.filter(e => e.contact_ids?.includes(contact.id))
  const contactNotes = notes.filter(n => n.contact_id === contact.id)
  const contactApplications = applications.filter(a => 
    a.firm.toLowerCase() === contact.firm.toLowerCase()
  )

  const upcomingEvents = contactEvents
    .filter(e => new Date(e.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
              {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{contact.name}</h2>
              <p className="text-slate-400">{contact.title} at {contact.firm}</p>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors border border-blue-500/20"
          >
            Edit Contact
          </button>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4">
          {contact.email && (
            <a 
              href={`mailto:${contact.email}`}
              className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm text-slate-200 truncate group-hover:text-blue-400 transition-colors">{contact.email}</p>
              </div>
            </a>
          )}
          {contact.phone && (
            <a 
              href={`tel:${contact.phone}`}
              className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm text-slate-200 group-hover:text-emerald-400 transition-colors">{contact.phone}</p>
              </div>
            </a>
          )}
          {contact.linkedin_url && (
            <a 
              href={contact.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors group col-span-2"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Linkedin className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500">LinkedIn</p>
                <p className="text-sm text-slate-200 truncate group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                  {contact.linkedin_url}
                  <ExternalLink className="w-3 h-3" />
                </p>
              </div>
            </a>
          )}
        </div>

        {/* Tags */}
        {contact.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {contact.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming Events ({upcomingEvents.length})
            </h3>
            <button 
              onClick={() => onNavigate('calendar')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No upcoming events with this contact</p>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.slice(0, 3).map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30"
                >
                  <div className={`w-2 h-2 rounded-full ${EVENT_TYPE_COLORS[event.event_type].bg.replace('/20', '')}`} />
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">{event.title}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(event.start_time).toLocaleDateString()} • {EVENT_TYPE_LABELS[event.event_type]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Applications */}
        {contactApplications.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Applications at {contact.firm} ({contactApplications.length})
              </h3>
              <button 
                onClick={() => onNavigate('pipeline', contact.firm)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View All <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {contactApplications.slice(0, 3).map((app) => (
                <div 
                  key={app.id} 
                  className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/30"
                >
                  <div>
                    <p className="text-sm text-slate-200">{app.role}</p>
                    <p className="text-xs text-slate-500">Applied {new Date(app.applied_date || app.created_at || '').toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_COLORS[app.status]}`}>
                    {STATUS_LABELS[app.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {contactNotes.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Linked Notes ({contactNotes.length})
              </h3>
              <button 
                onClick={() => onNavigate('notes')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View All <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {contactNotes.slice(0, 3).map((note) => (
                <div 
                  key={note.id} 
                  className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30"
                >
                  <p className="text-sm text-slate-200">{note.title}</p>
                  {note.content && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{note.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
          <StatBox label="Total Events" value={contactEvents.length} />
          <StatBox label="Notes" value={contactNotes.length} />
          <StatBox label="Connected Since" value={new Date(contact.created_at || '').toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} />
        </div>
      </div>
    </Modal>
  )
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}
