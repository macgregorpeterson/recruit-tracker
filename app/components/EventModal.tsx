'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import { CalendarEvent, EventType, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, Contact } from '../types'
import { Calendar, Clock, Building2, FileText, User, Loader2, Link2 } from 'lucide-react'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Partial<CalendarEvent>) => Promise<void>
  event?: CalendarEvent | null
  contacts: Contact[]
  initialDate?: Date
}

const EVENT_TYPES: EventType[] = ['coffee', 'info-session', 'phone-screen', 'first-round', 'superday', 'follow-up']

export function EventModal({ isOpen, onClose, onSave, event, contacts, initialDate }: EventModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: event?.title || '',
    description: event?.description || '',
    firm: event?.firm || '',
    event_type: event?.event_type || 'coffee',
    start_time: event?.start_time || (initialDate ? formatDateTimeLocal(initialDate) : formatDateTimeLocal(new Date())),
    end_time: event?.end_time || (initialDate ? formatDateTimeLocal(addHours(initialDate, 1)) : formatDateTimeLocal(addHours(new Date(), 1))),
    contact_ids: event?.contact_ids || [],
  })

  function formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  function addHours(date: Date, hours: number): Date {
    const newDate = new Date(date)
    newDate.setHours(newDate.getHours() + hours)
    return newDate
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving event:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleContact = (contactId: string) => {
    const currentIds = formData.contact_ids || []
    if (currentIds.includes(contactId)) {
      setFormData({ ...formData, contact_ids: currentIds.filter(id => id !== contactId) })
    } else {
      setFormData({ ...formData, contact_ids: [...currentIds, contactId] })
    }
  }

  const linkedContacts = contacts.filter(c => formData.contact_ids?.includes(c.id))

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={event ? 'Edit Event' : 'Add Event'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            <Calendar className="w-4 h-4 inline mr-1.5" />
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            placeholder="e.g., Coffee Chat with John"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            <Building2 className="w-4 h-4 inline mr-1.5" />
            Firm
          </label>
          <input
            type="text"
            value={formData.firm}
            onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            placeholder="e.g., Goldman Sachs"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Event Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {EVENT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, event_type: type })}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  formData.event_type === type
                    ? EVENT_TYPE_COLORS[type]
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {EVENT_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <Clock className="w-4 h-4 inline mr-1.5" />
              Start Time *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <Clock className="w-4 h-4 inline mr-1.5" />
              End Time *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            <Link2 className="w-4 h-4 inline mr-1.5" />
            Linked Contacts
          </label>
          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  toggleContact(e.target.value)
                  e.target.value = ''
                }
              }}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="">Select a contact to link...</option>
              {contacts
                .filter(c => !formData.contact_ids?.includes(c.id))
                .map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name} ({contact.firm})
                  </option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
          </div>
          
          {linkedContacts.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {linkedContacts.map((contact) => (
                <span
                  key={contact.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                >
                  {contact.name}
                  <button
                    type="button"
                    onClick={() => toggleContact(contact.id)}
                    className="hover:text-indigo-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            <FileText className="w-4 h-4 inline mr-1.5" />
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
            placeholder="Add details about this event..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !formData.title}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {event ? 'Save Changes' : 'Add Event'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
