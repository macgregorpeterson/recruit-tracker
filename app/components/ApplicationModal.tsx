'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import { Application, ApplicationStatus, STATUS_LABELS, STATUS_COLORS } from '../types'
import { Building2, Briefcase, MapPin, DollarSign, Calendar, Loader2, FileText } from 'lucide-react'

interface ApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (application: Partial<Application>) => Promise<void>
  application?: Application | null
}

const STATUS_ORDER: ApplicationStatus[] = [
  'applied', 'phone-screen', 'first-round', 'second-round', 'superday', 'offer', 'rejected', 'withdrawn', 'accepted'
]

export function ApplicationModal({ isOpen, onClose, onSave, application }: ApplicationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Application>>({
    firm: application?.firm || '',
    role: application?.role || '',
    location: application?.location || '',
    status: application?.status || 'applied',
    applied_date: application?.applied_date || new Date().toISOString().split('T')[0],
    deadline_date: application?.deadline_date || '',
    offer_deadline: application?.offer_deadline || '',
    compensation: application?.compensation || '',
    notes: application?.notes || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving application:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={application ? 'Edit Application' : 'Add Application'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <Building2 className="w-4 h-4 inline mr-1.5" />
              Firm *
            </label>
            <input
              type="text"
              required
              value={formData.firm}
              onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              placeholder="e.g., Blackstone"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <Briefcase className="w-4 h-4 inline mr-1.5" />
              Role *
            </label>
            <input
              type="text"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              placeholder="e.g., Investment Banking Analyst"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <MapPin className="w-4 h-4 inline mr-1.5" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              placeholder="e.g., New York, NY"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <DollarSign className="w-4 h-4 inline mr-1.5" />
              Compensation
            </label>
            <input
              type="text"
              value={formData.compensation}
              onChange={(e) => setFormData({ ...formData, compensation: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              placeholder="e.g., $110k base"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            {STATUS_ORDER.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFormData({ ...formData, status })}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  formData.status === status
                    ? STATUS_COLORS[status]
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1.5" />
              Applied Date
            </label>
            <input
              type="date"
              value={formData.applied_date}
              onChange={(e) => setFormData({ ...formData, applied_date: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1.5" />
              Deadline
            </label>
            <input
              type="date"
              value={formData.deadline_date}
              onChange={(e) => setFormData({ ...formData, deadline_date: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        {formData.status === 'offer' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1.5" />
              Offer Deadline
            </label>
            <input
              type="date"
              value={formData.offer_deadline}
              onChange={(e) => setFormData({ ...formData, offer_deadline: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            <FileText className="w-4 h-4 inline mr-1.5" />
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
            placeholder="Any additional notes about this application..."
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
            disabled={isLoading || !formData.firm || !formData.role}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {application ? 'Save Changes' : 'Add Application'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
