'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search,
  Users,
  Briefcase,
  Calendar,
  FileText,
  Plus,
  Coffee,
  Phone,
  Building2,
  ArrowRight,
  Command,
  Sparkles,
  TrendingUp,
  Target,
  Clock,
  X
  Brain
} from 'lucide-react'

interface CommandPaletteProps {
  contacts: any[]
  applications: any[]
  events: any[]
  notes: any[]
  onNavigate: (tab: string) => void
  onClose: () => void
  isOpen: boolean
}

interface CommandItem {
  id: string
  type: 'navigation' | 'action' | 'contact' | 'application' | 'event' | 'note' | 'ai'
  title: string
  subtitle?: string
  icon: React.ElementType
  color: string
  shortcut?: string
  action: () => void
  keywords: string[]
}

export function CommandPalette({ contacts, applications, events, notes, onNavigate, onClose, isOpen }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [items, setItems] = useState<CommandItem[]>([])

  // Build command items
  useEffect(() => {
    const commandItems: CommandItem[] = []

    // Navigation commands
    commandItems.push(
      {
        id: 'nav-dashboard',
        type: 'navigation',
        title: 'Go to Dashboard',
        subtitle: 'View your recruiting overview',
        icon: TrendingUp,
        color: 'blue',
        shortcut: '⌘D',
        action: () => { onNavigate('dashboard'); onClose() },
        keywords: ['dashboard', 'home', 'overview', 'stats']
      },
      {
        id: 'nav-coverage',
        type: 'navigation',
        title: 'Go to Coverage Book',
        subtitle: 'Manage your contacts',
        icon: Users,
        color: 'blue',
        shortcut: '⌘C',
        action: () => { onNavigate('coverage'); onClose() },
        keywords: ['contacts', 'coverage', 'network', 'people']
      },
      {
        id: 'nav-pipeline',
        type: 'navigation',
        title: 'Go to Pipeline',
        subtitle: 'Track your applications',
        icon: Briefcase,
        color: 'indigo',
        shortcut: '⌘P',
        action: () => { onNavigate('pipeline'); onClose() },
        keywords: ['applications', 'pipeline', 'jobs', 'apply']
      },
      {
        id: 'nav-calendar',
        type: 'navigation',
        title: 'Go to Calendar',
        subtitle: 'View upcoming events',
        icon: Calendar,
        color: 'purple',
        shortcut: '⌘L',
        action: () => { onNavigate('calendar'); onClose() },
        keywords: ['calendar', 'events', 'schedule', 'meetings']
      },
      {
        id: 'nav-notes',
        type: 'navigation',
        title: 'Go to Notes',
        subtitle: 'View your notes',
        icon: FileText,
        color: 'emerald',
        shortcut: '⌘N',
        action: () => { onNavigate('notes'); onClose() },
        keywords: ['notes', 'documents', 'write']
      },
      {
        id: 'nav-research',
        type: 'navigation',
        title: 'Go to Firm Research',
        subtitle: 'Research your target firms',
        icon: Building2,
        color: 'cyan',
        action: () => { onNavigate('research'); onClose() },
        keywords: ['research', 'firms', 'companies', 'due diligence']
      },
      {
        id: 'nav-prep',
        type: 'navigation',
        title: 'Go to Interview Prep',
        subtitle: 'Practice for interviews',
        icon: Brain,
        color: 'amber',
        action: () => { onNavigate('prep'); onClose() },
        keywords: ['prep', 'interview', 'practice', 'study']
      },
      {
        id: 'nav-analytics',
        type: 'navigation',
        title: 'Go to Analytics',
        subtitle: 'View your recruiting metrics',
        icon: Target,
        color: 'pink',
        action: () => { onNavigate('analytics'); onClose() },
        keywords: ['analytics', 'stats', 'metrics', 'data']
      },
      {
        id: 'nav-progress',
        type: 'navigation',
        title: 'Go to Progress & Achievements',
        subtitle: 'Track your recruiting journey',
        icon: Sparkles,
        color: 'yellow',
        action: () => { onNavigate('progress'); onClose() },
        keywords: ['achievements', 'progress', 'badges', 'xp', 'level']
      }
    )

    // Quick actions
    commandItems.push(
      {
        id: 'action-add-contact',
        type: 'action',
        title: 'Add New Contact',
        subtitle: 'Add someone to your coverage book',
        icon: Plus,
        color: 'blue',
        action: () => { onNavigate('coverage'); onClose() },
        keywords: ['add', 'new', 'contact', 'person']
      },
      {
        id: 'action-add-application',
        type: 'action',
        title: 'Add New Application',
        subtitle: 'Track a new job application',
        icon: Plus,
        color: 'indigo',
        action: () => { onNavigate('pipeline'); onClose() },
        keywords: ['add', 'new', 'application', 'job', 'apply']
      },
      {
        id: 'action-add-event',
        type: 'action',
        title: 'Schedule Event',
        subtitle: 'Add a coffee chat or interview',
        icon: Plus,
        color: 'purple',
        action: () => { onNavigate('calendar'); onClose() },
        keywords: ['add', 'new', 'event', 'schedule', 'meeting']
      },
      {
        id: 'action-add-note',
        type: 'action',
        title: 'Create Note',
        subtitle: 'Write a new note',
        icon: Plus,
        color: 'emerald',
        action: () => { onNavigate('notes'); onClose() },
        keywords: ['add', 'new', 'note', 'write']
      },
      {
        id: 'action-coffee-chat',
        type: 'action',
        title: 'Schedule Coffee Chat',
        subtitle: 'Quickly add a networking coffee',
        icon: Coffee,
        color: 'amber',
        action: () => { onNavigate('calendar'); onClose() },
        keywords: ['coffee', 'chat', 'network', 'meet']
      },
      {
        id: 'action-phone-screen',
        type: 'action',
        title: 'Log Phone Screen',
        subtitle: 'Add a phone interview to your calendar',
        icon: Phone,
        color: 'blue',
        action: () => { onNavigate('calendar'); onClose() },
        keywords: ['phone', 'screen', 'interview', 'call']
      }
    )

    // AI Suggestions
    commandItems.push(
      {
        id: 'ai-suggest-followup',
        type: 'ai',
        title: 'Suggest Follow-ups',
        subtitle: 'AI: Find contacts you should follow up with',
        icon: Sparkles,
        color: 'pink',
        action: () => { 
          alert('AI Feature: Would suggest contacts to follow up with based on last contact date')
          onClose()
        },
        keywords: ['ai', 'suggest', 'follow', 'up', 'smart']
      },
      {
        id: 'ai-prep-questions',
        type: 'ai',
        title: 'Generate Prep Questions',
        subtitle: 'AI: Create custom interview questions for upcoming interviews',
        icon: Brain,
        color: 'purple',
        action: () => { 
          alert('AI Feature: Would generate custom prep questions based on your upcoming interviews')
          onClose()
        },
        keywords: ['ai', 'prep', 'questions', 'interview', 'study']
      }
    )

    // Add contacts as searchable items
    contacts.slice(0, 5).forEach((contact, index) => {
      commandItems.push({
        id: `contact-${contact.id}`,
        type: 'contact',
        title: contact.name,
        subtitle: `${contact.firm} • ${contact.title || 'Contact'}`,
        icon: Users,
        color: 'blue',
        action: () => { onNavigate('coverage'); onClose() },
        keywords: [contact.name, contact.firm, 'contact', 'person', ...contact.tags || []]
      })
    })

    // Add applications as searchable items
    applications.slice(0, 5).forEach((app) => {
      commandItems.push({
        id: `app-${app.id}`,
        type: 'application',
        title: `${app.firm} - ${app.role}`,
        subtitle: `Status: ${app.status.replace('-', ' ')}`,
        icon: Briefcase,
        color: 'indigo',
        action: () => { onNavigate('pipeline'); onClose() },
        keywords: [app.firm, app.role, 'application', 'job', app.status]
      })
    })

    // Add upcoming events
    events
      .filter((e: any) => new Date(e.start_time) > new Date())
      .slice(0, 3)
      .forEach((event) => {
        commandItems.push({
          id: `event-${event.id}`,
          type: 'event',
          title: event.title,
          subtitle: `${event.firm || 'No firm'} • ${new Date(event.start_time).toLocaleDateString()}`,
          icon: Calendar,
          color: 'purple',
          action: () => { onNavigate('calendar'); onClose() },
          keywords: [event.title, event.firm || '', 'event', event.event_type]
        })
      })

    setItems(commandItems)
  }, [contacts, applications, events, notes, onNavigate, onClose])

  // Filter items based on query
  const filteredItems = items.filter(item => {
    if (!query) return item.type === 'navigation' || item.type === 'action' || item.type === 'ai'
    const searchTerms = query.toLowerCase().split(' ')
    return searchTerms.every(term => 
      item.title.toLowerCase().includes(term) ||
      item.subtitle?.toLowerCase().includes(term) ||
      item.keywords.some(k => k.toLowerCase().includes(term))
    )
  })

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredItems.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action()
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }, [isOpen, filteredItems, selectedIndex, onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        document.getElementById('command-input')?.focus()
      }, 100)
    }
  }, [isOpen])

  if (!isOpen) return null

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'text-blue-400 bg-blue-500/10',
      indigo: 'text-indigo-400 bg-indigo-500/10',
      purple: 'text-purple-400 bg-purple-500/10',
      emerald: 'text-emerald-400 bg-emerald-500/10',
      cyan: 'text-cyan-400 bg-cyan-500/10',
      amber: 'text-amber-400 bg-amber-500/10',
      pink: 'text-pink-400 bg-pink-500/10',
      yellow: 'text-yellow-400 bg-yellow-500/10',
    }
    return colors[color] || colors.blue
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      navigation: 'Go to',
      action: 'Action',
      contact: 'Contact',
      application: 'Application',
      event: 'Event',
      note: 'Note',
      ai: 'AI Feature'
    }
    return labels[type] || type
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Command Palette */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            id="command-input"
            type="text"
            placeholder="Search contacts, applications, or type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-lg"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try different keywords or commands</p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Group by type */}
              {['navigation', 'action', 'ai', 'contact', 'application', 'event'].map((groupType) => {
                const groupItems = filteredItems.filter(item => item.type === groupType)
                if (groupItems.length === 0) return null

                return (
                  <div key={groupType}>
                    <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {groupType === 'ai' ? '🤖 AI Features' : getTypeLabel(groupType)}
                    </div>
                    {groupItems.map((item, index) => {
                      const globalIndex = filteredItems.findIndex(i => i.id === item.id)
                      const Icon = item.icon
                      const isSelected = globalIndex === selectedIndex

                      return (
                        <motion.button
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                            isSelected
                              ? 'bg-blue-500/10 border border-blue-500/30'
                              : 'hover:bg-slate-800/50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor(item.color)}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{item.title}</span>
                              {item.type === 'ai' && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/30">
                                  AI
                                </span>
                              )}
                            </div>
                            {item.subtitle && (
                              <span className="text-sm text-slate-400 truncate block">{item.subtitle}</span>
                            )}
                          </div>
                          {item.shortcut && (
                            <span className="text-xs text-slate-500 px-2 py-1 bg-slate-800 rounded">
                              {item.shortcut}
                            </span>
                          )}
                          {isSelected && (
                            <ArrowRight className="w-4 h-4 text-blue-400" />
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-t border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">esc</kbd>
            <span>to close</span>
          </span>
        </div>
      </motion.div>
    </div>
  )
}
