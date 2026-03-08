'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Keyboard, 
  X, 
  Command,
  Search,
  Plus,
  Calendar,
  ArrowRight
} from 'lucide-react'

interface KeyboardShortcutsProps {
  onSearch: () => void
  onAddContact: () => void
  onAddApplication: () => void
  onAddEvent: () => void
  onNavigate: (tab: string) => void
}

const SHORTCUTS = [
  { key: '⌘K', action: 'Open search', description: 'Search across all data' },
  { key: '⌘/', action: 'Show shortcuts', description: 'View all keyboard shortcuts' },
  { key: '⌘N C', action: 'Add contact', description: 'Create new contact' },
  { key: '⌘N A', action: 'Add application', description: 'Create new application' },
  { key: '⌘N E', action: 'Add event', description: 'Create new calendar event' },
  { key: '1', action: 'Coverage Book', description: 'Navigate to contacts' },
  { key: '2', action: 'Pipeline', description: 'Navigate to applications' },
  { key: '3', action: 'Calendar', description: 'Navigate to calendar' },
  { key: '4', action: 'Notes', description: 'Navigate to notes' },
  { key: '5', action: 'Analytics', description: 'Navigate to analytics' },
  { key: 'Esc', action: 'Close modal', description: 'Close any open modal' },
]

export function KeyboardShortcutsProvider({ 
  onSearch, 
  onAddContact, 
  onAddApplication, 
  onAddEvent,
  onNavigate 
}: KeyboardShortcutsProps) {
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [keyBuffer, setKeyBuffer] = useState<string[]>([])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onSearch()
        return
      }

      // Cmd/Ctrl + / for shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setShowShortcuts(true)
        return
      }

      // Cmd/Ctrl + N for new items
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        setKeyBuffer(['n'])
        setTimeout(() => setKeyBuffer([]), 1000)
        return
      }

      // Handle second key after Cmd+N
      if (keyBuffer.includes('n')) {
        if (e.key.toLowerCase() === 'c') {
          e.preventDefault()
          onAddContact()
          setKeyBuffer([])
          return
        }
        if (e.key.toLowerCase() === 'a') {
          e.preventDefault()
          onAddApplication()
          setKeyBuffer([])
          return
        }
        if (e.key.toLowerCase() === 'e') {
          e.preventDefault()
          onAddEvent()
          setKeyBuffer([])
          return
        }
      }

      // Number keys for navigation (when not in input)
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        switch (e.key) {
          case '1':
            onNavigate('coverage')
            break
          case '2':
            onNavigate('pipeline')
            break
          case '3':
            onNavigate('calendar')
            break
          case '4':
            onNavigate('notes')
            break
          case '5':
            onNavigate('analytics')
            break
          case '?':
            setShowShortcuts(true)
            break
        }
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        setShowShortcuts(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keyBuffer, onSearch, onAddContact, onAddApplication, onAddEvent, onNavigate])

  return (
    <>
      {/* Keyboard Shortcut Hint */}
      <AnimatePresence>
        {keyBuffer.includes('n') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 glass-strong rounded-xl p-4 shadow-2xl"
          >
            <p className="text-sm text-slate-300 mb-2">Press key to create:</p>
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-sm">
                <kbd className="px-2 py-0.5 bg-slate-700 rounded text-slate-300">C</kbd>
                <span className="text-slate-400">Contact</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <kbd className="px-2 py-0.5 bg-slate-700 rounded text-slate-300">A</kbd>
                <span className="text-slate-400">Application</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <kbd className="px-2 py-0.5 bg-slate-700 rounded text-slate-300">E</kbd>
                <span className="text-slate-400">Event</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl max-w-2xl w-full overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Keyboard className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Keyboard Shortcuts</h3>
                    <p className="text-sm text-slate-400">Speed up your workflow</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Shortcuts List */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SHORTCUTS.map((shortcut, index) => (
                    <motion.div
                      key={shortcut.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
                    >
                      <kbd className="px-3 py-1.5 bg-slate-700 rounded-lg text-sm font-mono text-slate-300 shrink-0 min-w-[60px] text-center">
                        {shortcut.key}
                      </kbd>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{shortcut.action}</p>
                        <p className="text-xs text-slate-500">{shortcut.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-800/30 border-t border-slate-700/50 text-center">
                <p className="text-sm text-slate-500">
                  Pro tip: Use <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">?</kbd> anywhere to open this guide
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
