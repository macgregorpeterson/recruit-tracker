'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Calendar, 
  Clock, 
  Building2, 
  FileText, 
  User,
  Trash2,
  Edit3,
  Link2
} from 'lucide-react'
import { CalendarEvent, Contact } from '../types'
import { Modal } from './Modal'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '../types'

interface EventDetailModalProps {
  event: CalendarEvent
  isOpen: boolean
  onClose: () => void
  contacts: Contact[]
  onEdit: () => void
  onDelete: () => void
  onViewContact: (contact: Contact) => void
}

export function EventDetailModal({
  event,
  isOpen,
  onClose,
  contacts,
  onEdit,
  onDelete,
  onViewContact,
}: EventDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const startDate = new Date(event.start_time)
  const endDate = new Date(event.end_time)
  const isPast = endDate < new Date()

  const linkedContacts = contacts.filter(c => event.contact_ids?.includes(c.id))

  const handleDelete = () => {
    onDelete()
    setShowDeleteConfirm(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-lg"
    >
      <div className="-mt-6 -mx-6">
        {/* Header */}
        <div className={`px-6 pt-6 pb-4 border-b border-slate-700/50 ${isPast ? 'opacity-60' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${EVENT_TYPE_COLORS[event.event_type].bg} ${EVENT_TYPE_COLORS[event.event_type].text} ${EVENT_TYPE_COLORS[event.event_type].border}`}>
                <Calendar className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{event.title}</h2>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border mt-2 ${EVENT_TYPE_COLORS[event.event_type].bg} ${EVENT_TYPE_COLORS[event.event_type].text} ${EVENT_TYPE_COLORS[event.event_type].border}`}>
                  {EVENT_TYPE_LABELS[event.event_type]}
                </span>
                {isPast && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-400">
                    Completed
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Date & Time */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">
                {startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - 
                {endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Firm */}
          {event.firm && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">{event.firm}</p>
                <p className="text-xs text-slate-500 mt-0.5">Company</p>
              </div>
            </div>
          )}

          {/* Linked Contacts */}
          {linkedContacts.length > 0 && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center shrink-0">
                <Link2 className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-300 mb-2">
                  {linkedContacts.length} Linked Contact{linkedContacts.length > 1 ? 's' : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  {linkedContacts.map((contact) => (
                    <motion.button
                      key={contact.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => onViewContact(contact)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                    >
                      <User className="w-3 h-3" />
                      {contact.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-300 mb-1">Description</p>
                <p className="text-sm text-slate-400 whitespace-pre-wrap">{event.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 pb-6"
          >
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-sm text-red-400 mb-3">Are you sure you want to delete this event?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
  )
}
