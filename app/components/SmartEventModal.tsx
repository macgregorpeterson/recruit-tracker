'use client'

import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { CalendarEvent, EventType, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, Contact, Application } from '../types'
import { Calendar, Clock, Building2, FileText, User, Loader2, Link2, Sparkles, Mail, Lightbulb } from 'lucide-react'

interface SmartEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Partial<CalendarEvent>) => Promise<void>
  event?: CalendarEvent | null
  contacts: Contact[]
  applications: Application[]
  initialDate?: Date
  initialContactId?: string
  initialFirm?: string
}

const EVENT_TYPES: EventType[] = ['coffee', 'info-session', 'phone-screen', 'first-round', 'superday', 'follow-up']

// Email templates for different event types
const EMAIL_TEMPLATES: Record<EventType, string> = {
  'coffee': `Hi [Name],

I hope this email finds you well. I'm a [Year] at [School] interested in learning more about [Firm]'s [Group] team and your experience there.

Would you have time for a brief coffee chat or call in the coming weeks? I'd really appreciate the opportunity to hear your perspective on the firm and the recruiting process.

I'm free [Days/Times]. Please let me know what works best for you.

Best regards,
[Your Name]`,

  'follow-up': `Hi [Name],

Thank you so much for taking the time to speak with me [Yesterday/Last Week]. I really appreciated hearing about [Specific Topic Discussed] - it gave me great insight into [Firm]'s culture and approach.

[Optional: Mention something specific you discussed or follow up on a question]

I've attached my resume for your reference. I would love to stay in touch as I continue exploring opportunities in [Industry].

Thanks again,
[Your Name]`,

  'info-session': `Hi [Name],

It was great meeting you at [Firm]'s info session [Yesterday/Last Week]. I particularly enjoyed hearing about [Specific Topic] and it reinforced my interest in [Firm].

I would love to continue the conversation and learn more about your experience. Would you be available for a brief call or coffee chat?

I'm flexible with timing and happy to work around your schedule.

Best,
[Your Name]`,

  'phone-screen': '',
  'first-round': '',
  'superday': ''
}

export function SmartEventModal({ isOpen, onClose, onSave, event, contacts, applications, initialDate, initialContactId, initialFirm }: SmartEventModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'email'>('details')
  const [showEmailGenerator, setShowEmailGenerator] = useState(false)
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: event?.title || '',
    description: event?.description || '',
    firm: event?.firm || initialFirm || '',
    event_type: event?.event_type || 'coffee',
    start_time: event?.start_time || (initialDate ? formatDateTimeLocal(initialDate) : formatDateTimeLocal(new Date())),
    end_time: event?.end_time || (initialDate ? formatDateTimeLocal(addHours(initialDate, 1)) : formatDateTimeLocal(addHours(new Date(), 1))),
    contact_ids: event?.contact_ids || (initialContactId ? [initialContactId] : []),
  })

  // Get contacts from the selected firm for smart suggestions
  const firmContacts = contacts.filter(c => 
    formData.firm && c.firm.toLowerCase().includes(formData.firm.toLowerCase())
  )

  // Get applications at the selected firm
  const firmApplications = applications.filter(a => 
    formData.firm && a.firm.toLowerCase().includes(formData.firm.toLowerCase())
  )

  // Auto-fill firm name when contact is selected
  useEffect(() => {
    if (!event && formData.contact_ids?.length === 1 && !formData.firm) {
      const selectedContact = contacts.find(c => c.id === formData.contact_ids![0])
      if (selectedContact) {
        setFormData(prev => ({ ...prev, firm: selectedContact.firm }))
      }
    }
  }, [formData.contact_ids, contacts, event])

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
  const primaryContact = linkedContacts[0]

  const getEmailTemplate = () => {
    let template = EMAIL_TEMPLATES[formData.event_type || 'coffee']
    if (primaryContact) {
      template = template.replace(/\[Name\]/g, primaryContact.name)
    }
    if (formData.firm) {
      template = template.replace(/\[Firm\]/g, formData.firm)
    }
    return template
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={event ? 'Edit Event' : 'Schedule Event'}
      maxWidth="max-w-2xl"
    >
      {/* Tabs */}
      {!event && (
        <div className="flex gap-4 mb-6 border-b border-slate-700/50">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'details' ? 'text-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Event Details
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'email' ? 'text-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Mail className="w-4 h-4" />
            Outreach Email
            {linkedContacts.length > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                Ready
              </span>
            )}
          </button>
        </div>
      )}

      {activeTab === 'details' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Smart Title Suggestion */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1.5" />
              Title *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder={formData.event_type === 'coffee' ? "e.g., Coffee Chat with John" : "e.g., Superday Interview"}
              />
              {linkedContacts.length > 0 && !formData.title && (
                <button
                  type="button"
                  onClick={() => setFormData({ 
                    ...formData, 
                    title: `${EVENT_TYPE_LABELS[formData.event_type || 'coffee']} - ${linkedContacts.map(c => c.name).join(', ')}` 
                  })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Suggest
                </button>
              )}
            </div>
          </div>

          {/* Firm Input with Suggestions */}
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
              list="firm-suggestions"
            />
            <datalist id="firm-suggestions">
              {[...new Set(contacts.map(c => c.firm))].map(firm => (
                <option key={firm} value={firm} />
              ))}
            </datalist>
          </div>

          {/* Event Type Selection */}
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

          {/* Date/Time */}
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

          {/* Linked Contacts with Smart Suggestions */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <Link2 className="w-4 h-4 inline mr-1.5" />
              Linked Contacts
            </label>
            
            {/* Smart Suggestions */}
            {formData.firm && firmContacts.length > 0 && formData.contact_ids?.length === 0 && (
              <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-400 mb-2 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Contacts at {formData.firm}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {firmContacts.slice(0, 3).map(contact => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => toggleContact(contact.id)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 transition-colors"
                    >
                      + {contact.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
            
            {linkedContacts.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {linkedContacts.map((contact) => (
                  <span
                    key={contact.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  >
                    <User className="w-3 h-3" />
                    {contact.name}
                    <button
                      type="button"
                      onClick={() => toggleContact(contact.id)}
                      className="hover:text-indigo-300 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Related Applications */}
          {firmApplications.length > 0 && (
            <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <p className="text-xs text-slate-500 mb-2">Your applications at {formData.firm}:</p>
              <div className="space-y-1">
                {firmApplications.map(app => (
                  <div key={app.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{app.role}</span>
                    <span className="text-slate-500 capitalize">{app.status.replace('-', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <FileText className="w-4 h-4 inline mr-1.5" />
              Notes & Preparation
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
              placeholder="Add preparation notes, questions to ask, or things to remember..."
            />
          </div>

          {/* Actions */}
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
              {event ? 'Save Changes' : 'Schedule Event'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'email' && (
        <div className="space-y-4">
          {linkedContacts.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Select a contact first</h3>
              <p className="text-slate-400 text-sm mb-4">Go back to Event Details and link a contact to generate an outreach email.</p>
              <button
                onClick={() => setActiveTab('details')}
                className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors"
              >
                Back to Details
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Outreach Email Template
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    To: {linkedContacts.map(c => c.name).join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getEmailTemplate())
                    // Could show toast here
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Copy
                </button>
              </div>
              
              <textarea
                value={getEmailTemplate()}
                onChange={() => {}}
                rows={16}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm leading-relaxed resize-none"
                readOnly
              />
              
              <p className="text-xs text-slate-500">
                💡 Tip: Customize this template with specific details about your conversation or shared interests.
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setActiveTab('details')}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
