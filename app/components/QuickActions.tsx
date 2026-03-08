'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus,
  Users,
  Briefcase,
  Calendar,
  FileText,
  Mail,
  X,
  ChevronRight
} from 'lucide-react'

interface QuickActionsFabProps {
  onAddContact: () => void
  onAddApplication: () => void
  onAddEvent: () => void
  onAddNote: () => void
  onSendEmail?: () => void
}

export function QuickActionsFab({
  onAddContact,
  onAddApplication,
  onAddEvent,
  onAddNote,
  onSendEmail
}: QuickActionsFabProps) {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    { id: 'contact', label: 'Add Contact', icon: Users, color: 'bg-blue-500', onClick: onAddContact },
    { id: 'application', label: 'Add Application', icon: Briefcase, color: 'bg-indigo-500', onClick: onAddApplication },
    { id: 'event', label: 'Add Event', icon: Calendar, color: 'bg-purple-500', onClick: onAddEvent },
    { id: 'note', label: 'Add Note', icon: FileText, color: 'bg-cyan-500', onClick: onAddNote },
    ...(onSendEmail ? [{ id: 'email', label: 'Send Email', icon: Mail, color: 'bg-pink-500', onClick: onSendEmail }] : []),
  ]

  return (
    <div className="fixed bottom-8 right-8 z-40">
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Actions Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 mb-2 space-y-2"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  action.onClick()
                  setIsOpen(false)
                }}
                className="flex items-center gap-3 group"
              >
                <span className="px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700">
                  {action.label}
                </span>
                <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen 
            ? 'bg-slate-700 rotate-45' 
            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </motion.button>
    </div>
  )
}

// Quick Action Cards for Dashboard
interface QuickActionCardProps {
  title: string
  description: string
  icon: React.ElementType
  onClick: () => void
  color: string
}

export function QuickActionCard({ title, description, icon: Icon, onClick, color }: QuickActionCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all text-left group"
    >
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-white">{title}</h4>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
    </motion.button>
  )
}

// Quick Stats Row
interface QuickStatProps {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function QuickStat({ label, value, change, trend = 'neutral' }: QuickStatProps) {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-slate-400'
  }

  return (
    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
      <p className="text-sm text-slate-400">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        {change && (
          <span className={`text-sm ${trendColors[trend]}`}>{change}</span>
        )}
      </div>
    </div>
  )
}
