'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import { Note, Contact, CalendarEvent, Application } from '../types'
import { FileText, Link2, Loader2, Folder } from 'lucide-react'

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (note: Partial<Note>) => Promise<void>
  note?: Note | null
  contacts: Contact[]
  events: CalendarEvent[]
  applications: Application[]
}

export function NoteModal({ isOpen, onClose, onSave, note, contacts, events, applications }: NoteModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Note>>({
    title: note?.title || '',
    content: note?.content || '',
    contact_id: note?.contact_id || null,
    event_id: note?.event_id || null,
    application_id: note?.application_id || null,
    is_folder: note?.is_folder || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedContact = contacts.find(c => c.id === formData.contact_id)
  const selectedEvent = events.find(e => e.id === formData.event_id)
  const selectedApplication = applications.find(a => a.id === formData.application_id)

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={note ? 'Edit Note' : 'New Note'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <FileText className="w-4 h-4 inline mr-1.5" />
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              placeholder="e.g., Coffee Chat Notes - John Smith"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
              <Folder className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">Folder</span>
              <input
                type="checkbox"
                checked={formData.is_folder}
                onChange={(e) => setFormData({ ...formData, is_folder: e.target.checked })}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50"
              />
            </label>
          </div>
        </div>

        {!formData.is_folder && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  <Link2 className="w-4 h-4 inline mr-1.5" />
                  Link to Contact
                </label>
                <select
                  value={formData.contact_id || ''}
                  onChange={(e) => setFormData({ ...formData, contact_id: e.target.value || null })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="">None</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  <Link2 className="w-4 h-4 inline mr-1.5" />
                  Link to Event
                </label>
                <select
                  value={formData.event_id || ''}
                  onChange={(e) => setFormData({ ...formData, event_id: e.target.value || null })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="">None</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  <Link2 className="w-4 h-4 inline mr-1.5" />
                  Link to Application
                </label>
                <select
                  value={formData.application_id || ''}
                  onChange={(e) => setFormData({ ...formData, application_id: e.target.value || null })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="">None</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.firm} - {app.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(selectedContact || selectedEvent || selectedApplication) && (
              <div className="flex flex-wrap gap-2 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Linked to:</span>
                {selectedContact && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Contact: {selectedContact.name}
                  </span>
                )}
                {selectedEvent && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Event: {selectedEvent.title}
                  </span>
                )}
                {selectedApplication && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    App: {selectedApplication.firm}
                  </span>
                )}
              </div>
            )}
          </>
        )}

        {!formData.is_folder && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none font-mono text-sm leading-relaxed"
              placeholder="Write your notes here... Use markdown for formatting."
            />
          </div>
        )}

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
            {note ? 'Save Changes' : 'Create Note'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
