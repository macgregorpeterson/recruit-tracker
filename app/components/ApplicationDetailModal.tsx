'use client'

import { Modal } from './Modal'
import { Application, Contact, Note, CalendarEvent, STATUS_COLORS, STATUS_LABELS, EVENT_TYPE_LABELS } from '../types'
import { Building2, Briefcase, MapPin, DollarSign, Calendar, FileText, Users, Clock, ArrowUpRight, ExternalLink, CheckCircle2 } from 'lucide-react'

interface ApplicationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  application: Application | null
  contacts: Contact[]
  notes: Note[]
  events: CalendarEvent[]
  onEdit: () => void
  onNavigate: (tab: string, filter?: string) => void
}

export function ApplicationDetailModal({
  isOpen,
  onClose,
  application,
  contacts,
  notes,
  events,
  onEdit,
  onNavigate
}: ApplicationDetailModalProps) {
  if (!application) return null

  const firmContacts = contacts.filter(c => 
    c.firm.toLowerCase() === application.firm.toLowerCase()
  )
  const appNotes = notes.filter(n => n.application_id === application.id)
  const appEvents = events.filter(e => 
    e.firm?.toLowerCase() === application.firm.toLowerCase()
  )

  const upcomingEvents = appEvents
    .filter(e => new Date(e.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  const daysSinceApplied = application.applied_date 
    ? Math.floor((Date.now() - new Date(application.applied_date).getTime()) / (1000 * 60 * 60 * 24))
    : null

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{application.firm}</h2>
              <p className="text-slate-400">{application.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${STATUS_COLORS[application.status]}`}>
              {STATUS_LABELS[application.status]}
            </span>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors border border-blue-500/20"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DetailCard
            icon={MapPin}
            label="Location"
            value={application.location || 'Not specified'}
            color="cyan"
          />
          <DetailCard
            icon={DollarSign}
            label="Compensation"
            value={application.compensation || 'Not specified'}
            color="emerald"
          />
          <DetailCard
            icon={Calendar}
            label="Applied"
            value={application.applied_date 
              ? new Date(application.applied_date).toLocaleDateString()
              : 'Unknown'
            }
            color="blue"
          />
          {daysSinceApplied !== null && (
            <DetailCard
              icon={Clock}
              label="Days in Pipeline"
              value={`${daysSinceApplied} days`}
              color="purple"
            />
          )}
        </div>

        {/* Deadlines */}
        {(application.deadline_date || application.offer_deadline) && (
          <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Key Dates
            </h3>
            <div className="space-y-2">
              {application.deadline_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Application Deadline</span>
                  <span className="text-sm text-slate-200">{new Date(application.deadline_date).toLocaleDateString()}</span>
                </div>
              )}
              {application.offer_deadline && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Offer Decision Due</span>
                  <span className={`text-sm font-medium ${new Date(application.offer_deadline) < new Date() ? 'text-red-400' : 'text-emerald-400'}`}>
                    {new Date(application.offer_deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Timeline */}
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Application Progress
          </h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700" />
            <div className="space-y-4">
              {['applied', 'phone-screen', 'first-round', 'second-round', 'superday', 'offer'].map((stage, index) => {
                const isCompleted = getStageIndex(application.status) >= index
                const isCurrent = application.status === stage
                
                return (
                  <div key={stage} className="flex items-center gap-4 relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 ${
                      isCompleted 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                        : isCurrent
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                          : 'bg-slate-800 border-slate-600 text-slate-500'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isCompleted || isCurrent ? 'text-slate-200' : 'text-slate-500'}`}>
                        {STATUS_LABELS[stage as keyof typeof STATUS_LABELS]}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-blue-400">Current Stage</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Contacts at Firm */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Contacts at {application.firm} ({firmContacts.length})
            </h3>
            <button 
              onClick={() => onNavigate('coverage', application.firm)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          {firmContacts.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No contacts at this firm yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {firmContacts.slice(0, 4).map((contact) => (
                <div 
                  key={contact.id} 
                  className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600 transition-colors cursor-pointer"
                  onClick={() => onNavigate('coverage')}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm font-bold text-slate-300">
                    {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{contact.name}</p>
                    <p className="text-xs text-slate-500 truncate">{contact.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
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
            <div className="space-y-2">
              {upcomingEvents.slice(0, 3).map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    event.event_type === 'coffee' ? 'bg-amber-500' :
                    event.event_type === 'superday' ? 'bg-purple-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">{event.title}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(event.start_time).toLocaleDateString()} • {EVENT_TYPE_LABELS[event.event_type]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {appNotes.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes ({appNotes.length})
              </h3>
              <button 
                onClick={() => onNavigate('notes')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View All <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {appNotes.slice(0, 3).map((note) => (
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

        {/* Application Notes */}
        {application.notes && (
          <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notes
            </h3>
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{application.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

function DetailCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType
  label: string
  value: string
  color: string
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    cyan: 'bg-cyan-500/10 text-cyan-400',
    purple: 'bg-purple-500/10 text-purple-400',
  }

  return (
    <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
      <div className={`w-8 h-8 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-200 truncate">{value}</p>
    </div>
  )
}

function getStageIndex(status: string): number {
  const stages = ['applied', 'phone-screen', 'first-round', 'second-round', 'superday', 'offer']
  return stages.indexOf(status)
}
