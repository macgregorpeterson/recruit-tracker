'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Search,
  Plus,
  Mail,
  Phone,
  Linkedin,
  Building2,
  Tag,
  ArrowUpRight,
  Filter,
  MoreHorizontal,
  Briefcase,
  FileText,
  Calendar
} from 'lucide-react'
import { Contact, Application, Note } from '../types'

interface CoverageBookTabProps {
  contacts: Contact[]
  onAdd: () => void
  onSelect: (contact: Contact) => void
  applications: Application[]
  notes: Note[]
}

export function CoverageBookTab({ contacts, onAdd, onSelect, applications, notes }: CoverageBookTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const allTags = Array.from(new Set(contacts.flatMap(c => c.tags || [])))

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.firm.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = !selectedTag || contact.tags?.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const getContactStats = (contact: Contact) => {
    const contactApps = applications.filter(a => a.firm === contact.firm)
    const contactNotes = notes.filter(n => n.contact_id === contact.id)
    return { apps: contactApps.length, notes: contactNotes.length }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Coverage Book</h2>
          <p className="text-sm text-slate-400 mt-1">Your network across {allTags.length} categories</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </motion.button>
        </div>
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !selectedTag ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedTag === tag ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center"
        >
          <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {contacts.length === 0 ? 'No contacts yet' : 'No matches found'}
          </h3>
          <p className="text-slate-400 mb-6">
            {contacts.length === 0 
              ? 'Start building your coverage book to track your network'
              : 'Try adjusting your search or filters'}
          </p>
          {contacts.length === 0 && (
            <button 
              onClick={onAdd}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              Add Your First Contact
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact, index) => {
            const stats = getContactStats(contact)
            return (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelect(contact)}
                className="glass-card p-5 cursor-pointer group hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-lg font-bold text-blue-400 border border-blue-500/20">
                      {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{contact.name}</h3>
                      <p className="text-sm text-slate-400">{contact.title}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100" />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Building2 className="w-4 h-4" />
                    <span>{contact.firm}</span>
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                </div>

                {contact.tags && contact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {contact.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    {contact.tags.length > 3 && (
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded-full">
                        +{contact.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{stats.apps} apps</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{stats.notes} notes</span>
                  </div>
                  <div className="ml-auto text-xs text-slate-500">
                    {contact.created_at && (
                      <span>Added {new Date(contact.created_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
