'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  X, 
  User, 
  Building2, 
  Briefcase, 
  FileText, 
  Calendar,
  ArrowRight,
  Command
} from 'lucide-react'
import { Contact, Application, Note, CalendarEvent } from '../types'

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  contacts: Contact[]
  applications: Application[]
  notes: Note[]
  events: CalendarEvent[]
  onSelectContact: (contact: Contact) => void
  onSelectApplication: (app: Application) => void
  onSelectNote: (note: Note) => void
  onSelectEvent: (event: CalendarEvent) => void
}

type SearchResult = 
  | { type: 'contact'; item: Contact }
  | { type: 'application'; item: Application }
  | { type: 'note'; item: Note }
  | { type: 'event'; item: CalendarEvent }

export function SearchOverlay({
  isOpen,
  onClose,
  contacts,
  applications,
  notes,
  events,
  onSelectContact,
  onSelectApplication,
  onSelectNote,
  onSelectEvent,
}: SearchOverlayProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Filter results based on query
  const results = useMemo(() => {
    if (!query.trim()) return []
    
    const q = query.toLowerCase()
    const matched: SearchResult[] = []

    // Search contacts
    contacts.forEach(contact => {
      if (
        contact.name.toLowerCase().includes(q) ||
        contact.firm.toLowerCase().includes(q) ||
        contact.title?.toLowerCase().includes(q) ||
        contact.tags?.some(tag => tag.toLowerCase().includes(q))
      ) {
        matched.push({ type: 'contact', item: contact })
      }
    })

    // Search applications
    applications.forEach(app => {
      if (
        app.firm.toLowerCase().includes(q) ||
        app.role.toLowerCase().includes(q) ||
        app.location?.toLowerCase().includes(q)
      ) {
        matched.push({ type: 'application', item: app })
      }
    })

    // Search notes
    notes.forEach(note => {
      if (
        note.title.toLowerCase().includes(q) ||
        note.content?.toLowerCase().includes(q)
      ) {
        matched.push({ type: 'note', item: note })
      }
    })

    // Search events
    events.forEach(event => {
      if (
        event.title.toLowerCase().includes(q) ||
        event.firm?.toLowerCase().includes(q) ||
        event.description?.toLowerCase().includes(q)
      ) {
        matched.push({ type: 'event', item: event })
      }
    })

    return matched.slice(0, 20) // Limit to 20 results
  }, [query, contacts, applications, notes, events])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(i => (i + 1) % results.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(i => (i - 1 + results.length) % results.length)
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex])
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  const handleSelect = (result: SearchResult) => {
    switch (result.type) {
      case 'contact':
        onSelectContact(result.item)
        break
      case 'application':
        onSelectApplication(result.item)
        break
      case 'note':
        onSelectNote(result.item)
        break
      case 'event':
        onSelectEvent(result.item)
        break
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Search Container */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="relative w-full max-w-2xl mx-4"
        >
          {/* Search Input */}
          <div className="glass-strong rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
            <div className="flex items-center px-6 py-4 border-b border-slate-700/50">
              <Search className="w-6 h-6 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search contacts, applications, notes, events..."
                className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder-slate-500 px-4"
              />
              <div className="flex items-center gap-2">
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">
                  <Command className="w-3 h-3" />
                  <span>K</span>
                </kbd>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {query.trim() === '' ? (
                <div className="p-8 text-center text-slate-500">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Start typing to search...</p>
                  <p className="text-sm mt-2">Search across contacts, applications, notes, and events</p>
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p>No results found for &quot;{query}&quot;</p>
                </div>
              ) : (
                <div className="py-2">
                  {results.map((result, index) => (
                    <SearchResultItem
                      key={`${result.type}-${result.item.id}`}
                      result={result}
                      isSelected={index === selectedIndex}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {results.length > 0 && (
              <div className="px-6 py-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">↑↓</kbd>
                    <span>to navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">↵</kbd>
                    <span>to select</span>
                  </span>
                </div>
                <span>{results.length} results</span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function SearchResultItem({ result, isSelected, onClick, onMouseEnter }: { 
  result: SearchResult
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
}) {
  const icons = {
    contact: User,
    application: Briefcase,
    note: FileText,
    event: Calendar,
  }

  const colors = {
    contact: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    application: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    note: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    event: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  }

  const Icon = icons[result.type]

  const getSubtitle = () => {
    switch (result.type) {
      case 'contact':
        return `${result.item.title} at ${result.item.firm}`
      case 'application':
        return `${result.item.role} • ${result.item.status}`
      case 'note':
        return result.item.content?.slice(0, 60) + '...' || 'No content'
      case 'event':
        return `${result.item.firm} • ${new Date(result.item.start_time).toLocaleDateString()}`
    }
  }

  return (
    <motion.button
      layout
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-colors ${
        isSelected ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${colors[result.type]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-200 truncate">
            {result.type === 'application' ? result.item.firm : result.item.title}
          </span>
          <span className="text-xs text-slate-500 capitalize">{result.type}</span>
        </div>
        <p className="text-sm text-slate-400 truncate">{getSubtitle()}</p>
      </div>
      {isSelected && <ArrowRight className="w-5 h-5 text-slate-400" />}
    </motion.button>
  )
}

// Hook for keyboard shortcut
export function useSearchHotkey(callback: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        callback()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [callback])
}
