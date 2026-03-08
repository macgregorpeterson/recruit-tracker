'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText,
  Search,
  Plus,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Clock,
  ArrowRight,
  Tag,
  Building2,
  Users,
  Calendar,
  Trash2,
  Edit3
} from 'lucide-react'
import { Note, Contact, Application, CalendarEvent } from '../types'

interface NotesTabProps {
  notes: Note[]
  contacts: Contact[]
  applications: Application[]
  onAdd: () => void
  onSelect: (note: Note) => void
}

const FOLDERS = [
  { id: 'all', name: 'All Notes', icon: FileText },
  { id: 'contacts', name: 'Contact Notes', icon: Users },
  { id: 'interviews', name: 'Interview Notes', icon: Calendar },
  { id: 'firms', name: 'Firm Research', icon: Building2 },
  { id: 'personal', name: 'Personal', icon: Folder },
]

export function NotesTab({ notes, contacts, applications, onAdd, onSelect }: NotesTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('all')

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content?.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (selectedFolder === 'all') return matchesSearch
    if (selectedFolder === 'contacts') return matchesSearch && note.contact_id
    if (selectedFolder === 'interviews') return matchesSearch && note.application_id
    if (selectedFolder === 'firms') return matchesSearch && !note.contact_id && !note.application_id && !note.is_folder
    if (selectedFolder === 'personal') return matchesSearch && note.is_folder
    
    return matchesSearch
  })

  const getLinkedEntity = (note: Note) => {
    if (note.contact_id) {
      const contact = contacts.find(c => c.id === note.contact_id)
      return contact ? { type: 'contact', name: contact.name } : null
    }
    if (note.application_id) {
      const app = applications.find(a => a.id === note.application_id)
      return app ? { type: 'application', name: `${app.firm} - ${app.role}` } : null
    }
    return null
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Notes</h2>
          <p className="text-sm text-slate-400 mt-1">{notes.length} notes across {FOLDERS.length - 1} folders</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search notes..."
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
            New Note
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Folder Sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <div className="glass-card p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-400" />
              Folders
            </h3>
            <div className="space-y-1">
              {FOLDERS.map(folder => {
                const Icon = folder.icon
                const count = folder.id === 'all' ? notes.length : notes.filter(n => {
                  if (folder.id === 'contacts') return n.contact_id
                  if (folder.id === 'interviews') return n.application_id
                  if (folder.id === 'firms') return !n.contact_id && !n.application_id && !n.is_folder
                  if (folder.id === 'personal') return n.is_folder
                  return true
                }).length
                
                return (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                      selectedFolder === folder.id 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {folder.name}
                    </div>
                    <span className="text-xs text-slate-500">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="col-span-12 lg:col-span-9">
          <div className="glass-card overflow-hidden">
            {filteredNotes.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {notes.length === 0 ? 'No notes yet' : 'No notes found'}
                </h3>
                <p className="text-slate-400 mb-6">
                  {notes.length === 0 ? 'Start taking notes on your recruiting journey' : 'Try a different search term'}
                </p>
                <button 
                  onClick={onAdd}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium"
                >
                  Create Your First Note
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredNotes.map((note, index) => {
                  const linkedEntity = getLinkedEntity(note)
                  
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => onSelect(note)}
                      className="p-5 hover:bg-slate-800/30 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-slate-200 group-hover:text-white transition-colors text-lg">
                          {note.title}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {note.updated_at && new Date(note.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {note.content && (
                        <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                          {note.content}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3">
                        {linkedEntity && (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            linkedEntity.type === 'contact' 
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {linkedEntity.type === 'contact' ? <Users className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                            {linkedEntity.name}
                          </span>
                        )}
                        
                        {note.created_at && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Created {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
