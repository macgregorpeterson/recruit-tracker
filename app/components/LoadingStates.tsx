'use client'

import { motion } from 'framer-motion'

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'card' | 'table'
  count?: number
  message?: string
}

export function LoadingState({ type = 'spinner', count = 3, message = 'Loading...' }: LoadingStateProps) {
  if (type === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full"
        />
        <p className="text-slate-500 mt-4 text-sm">{message}</p>
      </div>
    )
  }

  if (type === 'skeleton') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="h-16 bg-slate-800/30 rounded-xl border border-slate-700/30 overflow-hidden"
          >
            <div className="h-full w-full shimmer" />
          </motion.div>
        ))}
      </div>
    )
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="h-32 bg-slate-800/30 rounded-xl border border-slate-700/30 overflow-hidden"
          >
            <div className="h-full w-full shimmer" />
          </motion.div>
        ))}
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
        <div className="h-12 bg-slate-800/50 border-b border-slate-800" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-16 border-b border-slate-800/50 overflow-hidden">
            <div className="h-full w-full shimmer" />
          </div>
        ))}
      </div>
    )
  }

  return null
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: { 
  icon: React.ElementType
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-700/30">
        <Icon className="w-10 h-10 text-slate-600" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 max-w-sm mx-auto mb-6">{description}</p>
      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-500 hover:to-indigo-500 transition-all"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}

export function ErrorState({ 
  message = 'Something went wrong', 
  onRetry 
}: { 
  message?: string
  onRetry?: () => void 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16"
    >
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{message}</h3>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors mt-4"
        >
          Try Again
        </button>
      )}
    </motion.div>
  )
}
