'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Mail, 
  Calendar, 
  Tag,
  X,
  ChevronDown,
  MoreHorizontal,
  Archive,
  Download,
  Share2,
  Filter
} from 'lucide-react'

interface BulkActionsProps {
  selectedIds: string[]
  onSelectAll: () => void
  onClearSelection: () => void
  onDelete: (ids: string[]) => void
  onExport: (ids: string[]) => void
  onTag: (ids: string[], tag: string) => void
  onArchive: (ids: string[]) => void
  totalCount: number
  itemType: 'contacts' | 'applications' | 'events' | 'notes'
}

export function BulkActions({
  selectedIds,
  onSelectAll,
  onClearSelection,
  onDelete,
  onExport,
  onTag,
  onArchive,
  totalCount,
  itemType
}: BulkActionsProps) {
  const [showTagInput, setShowTagInput] = useState(false)
  const [tagValue, setTagValue] = useState('')
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const isAllSelected = selectedIds.length === totalCount && totalCount > 0
  const hasSelection = selectedIds.length > 0

  const handleTagSubmit = () => {
    if (tagValue.trim()) {
      onTag(selectedIds, tagValue.trim())
      setTagValue('')
      setShowTagInput(false)
    }
  }

  const handleDelete = () => {
    onDelete(selectedIds)
    setShowConfirmDelete(false)
  }

  if (!hasSelection) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50"
      >
        <button
          onClick={onSelectAll}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Square className="w-5 h-5" />
          <span className="text-sm">Select all {totalCount} {itemType}</span>
        </button>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-2 p-3 bg-blue-500/10 rounded-xl border border-blue-500/30"
      >
        {/* Selection Info */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 rounded-lg">
          <CheckSquare className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">
            {selectedIds.length} selected
          </span>
          <button
            onClick={onClearSelection}
            className="ml-2 p-0.5 hover:bg-blue-500/30 rounded transition-colors"
          >
            <X className="w-3 h-3 text-blue-400" />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-700" />

        {/* Actions */}
        <button
          onClick={() => setShowTagInput(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
        >
          <Tag className="w-4 h-4" />
          Add Tag
        </button>

        <button
          onClick={() => onExport(selectedIds)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
        >
          <Download className="w-4 h-4" />
          Export
        </button>

        <button
          onClick={() => onArchive(selectedIds)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
        >
          <Archive className="w-4 h-4" />
          Archive
        </button>

        <div className="w-px h-6 bg-slate-700" />

        <button
          onClick={() => setShowConfirmDelete(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </motion.div>

      {/* Tag Input Modal */}
      <AnimatePresence>
        {showTagInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowTagInput(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Add Tags</h3>
              <p className="text-slate-400 text-sm mb-4">
                Add tags to {selectedIds.length} selected {itemType}
              </p>
              <input
                type="text"
                placeholder="Enter tags separated by commas..."
                value={tagValue}
                onChange={(e) => setTagValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTagSubmit()}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTagInput(false)}
                  className="flex-1 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTagSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Add Tags
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowConfirmDelete(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 p-6"
            >
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Delete {selectedIds.length} {itemType}?</h3>
              <p className="text-slate-400 text-sm mb-6">
                This action cannot be undone. The selected {itemType} will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Hook for managing bulk selection
export function useBulkSelection(items: { id: string }[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    setSelectedIds(items.map(item => item.id))
  }

  const clearSelection = () => {
    setSelectedIds([])
  }

  const isSelected = (id: string) => selectedIds.includes(id)

  return {
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    hasSelection: selectedIds.length > 0
  }
}

// Checkbox component for selection
interface SelectionCheckboxProps {
  checked: boolean
  onChange: () => void
  className?: string
}

export function SelectionCheckbox({ checked, onChange, className = '' }: SelectionCheckboxProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      className={`p-1 rounded-lg transition-colors ${className}`}
    >
      {checked ? (
        <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center">
          <CheckSquare className="w-4 h-4 text-white" />
        </div>
      ) : (
        <Square className="w-5 h-5 text-slate-500 hover:text-slate-400" />
      )}
    </button>
  )
}
