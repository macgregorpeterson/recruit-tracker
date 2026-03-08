'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search,
  Filter,
  X,
  ChevronDown,
  SlidersHorizontal,
  Calendar,
  Building2,
  Tag,
  CheckCircle2,
  Clock
} from 'lucide-react'

interface FilterOption {
  id: string
  label: string
  type: 'select' | 'multiselect' | 'date' | 'text' | 'boolean'
  options?: { value: string; label: string; color?: string }[]
}

interface FilterValue {
  field: string
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between' | 'in'
  value: any
}

interface AdvancedFiltersProps {
  filters: FilterOption[]
  activeFilters: FilterValue[]
  onFilterChange: (filters: FilterValue[]) => void
  onSearch: (query: string) => void
  searchQuery: string
  resultCount: number
}

export function AdvancedFilters({
  filters,
  activeFilters,
  onFilterChange,
  onSearch,
  searchQuery,
  resultCount
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState<any>('')

  const addFilter = (field: string, operator: string, value: any) => {
    const existingIndex = activeFilters.findIndex(f => f.field === field)
    const newFilter = { field, operator, value }
    
    if (existingIndex >= 0) {
      const updated = [...activeFilters]
      updated[existingIndex] = newFilter
      onFilterChange(updated)
    } else {
      onFilterChange([...activeFilters, newFilter])
    }
    
    setSelectedFilter(null)
    setTempValue('')
  }

  const removeFilter = (field: string) => {
    onFilterChange(activeFilters.filter(f => f.field !== field))
  }

  const clearAllFilters = () => {
    onFilterChange([])
  }

  const getFilterLabel = (field: string) => {
    return filters.find(f => f.id === field)?.label || field
  }

  const getFilterOption = (field: string, value: string) => {
    const filter = filters.find(f => f.id === field)
    return filter?.options?.find(o => o.value === value)
  }

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-700 rounded transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
            isExpanded || activeFilters.length > 0
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-slate-800/50 text-slate-300 border border-slate-700 hover:border-slate-600'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilters.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {/* Active Filters */}
      <AnimatePresence>
        {(activeFilters.length > 0 || searchQuery) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2"
          >
            {searchQuery && (
              <FilterChip
                label={`Search: "${searchQuery}"`}
                onRemove={() => onSearch('')}
                color="blue"
              />
            )}
            {activeFilters.map((filter) => {
              const option = getFilterOption(filter.field, filter.value)
              return (
                <FilterChip
                  key={filter.field}
                  label={`${getFilterLabel(filter.field)}: ${option?.label || filter.value}`}
                  onRemove={() => removeFilter(filter.field)}
                  color={option?.color || 'slate'}
                />
              )
            })}
            <button
              onClick={clearAllFilters}
              className="text-xs text-slate-500 hover:text-slate-300 ml-2"
            >
              Clear all
            </button>
            <span className="text-xs text-slate-500 ml-auto">
              {resultCount} results
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">Filter by</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {filters.map((filter) => (
                  <div key={filter.id} className="relative">
                    {filter.type === 'select' && (
                      <select
                        value={activeFilters.find(f => f.field === filter.id)?.value || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            addFilter(filter.id, 'equals', e.target.value)
                          } else {
                            removeFilter(filter.id)
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="">{filter.label}</option>
                        {filter.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}

                    {filter.type === 'multiselect' && (
                      <div className="relative">
                        <button
                          onClick={() => setSelectedFilter(selectedFilter === filter.id ? null : filter.id)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-left text-white hover:border-slate-600 transition-colors flex items-center justify-between"
                        >
                          <span>{filter.label}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${selectedFilter === filter.id ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                          {selectedFilter === filter.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto"
                            >
                              {filter.options?.map((opt) => {
                                const isSelected = activeFilters
                                  .find(f => f.field === filter.id)
                                  ?.value?.includes(opt.value)
                                
                                return (
                                  <button
                                    key={opt.value}
                                    onClick={() => {
                                      const existing = activeFilters.find(f => f.field === filter.id)
                                      const currentValues = existing?.value || []
                                      const newValues = currentValues.includes(opt.value)
                                        ? currentValues.filter((v: string) => v !== opt.value)
                                        : [...currentValues, opt.value]
                                      
                                      if (newValues.length > 0) {
                                        addFilter(filter.id, 'in', newValues)
                                      } else {
                                        removeFilter(filter.id)
                                      }
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2"
                                  >
                                    <div className={`w-4 h-4 rounded border ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-600'} flex items-center justify-center`}>
                                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className={isSelected ? 'text-white' : 'text-slate-300'}>{opt.label}</span>
                                  </button>
                                )
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {filter.type === 'date' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          onChange={(e) => {
                            if (e.target.value) {
                              addFilter(filter.id, 'gt', e.target.value)
                            } else {
                              removeFilter(filter.id)
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FilterChip({ label, onRemove, color }: { label: string; onRemove: () => void; color: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  }

  const { bg, text, border } = colors[color] || colors.slate

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${bg} ${text} border ${border}`}
    >
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-white/10 rounded p-0.5 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.span>
  )
}

// Helper hook for using filters
export function useAdvancedFilters<T extends Record<string, any>>(
  items: T[],
  searchableFields: string[]
) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>([])

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search filter
      if (searchQuery) {
        const matchesSearch = searchableFields.some(field => {
          const value = item[field]
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchQuery.toLowerCase())
          }
          return false
        })
        if (!matchesSearch) return false
      }

      // Active filters
      for (const filter of activeFilters) {
        const itemValue = item[filter.field]
        
        switch (filter.operator) {
          case 'equals':
            if (itemValue !== filter.value) return false
            break
          case 'contains':
            if (typeof itemValue === 'string' && !itemValue.toLowerCase().includes(filter.value.toLowerCase())) {
              return false
            }
            break
          case 'in':
            if (Array.isArray(filter.value) && !filter.value.includes(itemValue)) {
              return false
            }
            break
          case 'gt':
            if (itemValue < filter.value) return false
            break
          case 'lt':
            if (itemValue > filter.value) return false
            break
        }
      }

      return true
    })
  }, [items, searchQuery, activeFilters, searchableFields])

  return {
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters,
    filteredItems
  }
}
