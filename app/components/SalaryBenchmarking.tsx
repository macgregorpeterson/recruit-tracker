'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  Building2,
  MapPin,
  Filter,
  Search,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
  Download,
  Target,
  Award,
  Briefcase
} from 'lucide-react'
import { Application } from '../types'

interface SalaryData {
  firm: string
  role: string
  location: string
  base: number
  bonus: number
  total: number
  year: number
  level: 'analyst' | 'associate' | 'vp' | 'director' | 'md'
  type: 'bb' | 'eb' | 'mm' | 'pe' | 'hf'
}

interface SalaryBenchmarkingProps {
  applications: Application[]
}

const MOCK_SALARY_DATA: SalaryData[] = [
  // Bulge Bracket
  { firm: 'Goldman Sachs', role: 'Investment Banking Analyst', location: 'New York', base: 110000, bonus: 90000, total: 200000, year: 2025, level: 'analyst', type: 'bb' },
  { firm: 'Goldman Sachs', role: 'Investment Banking Associate', location: 'New York', base: 175000, bonus: 150000, total: 325000, year: 2025, level: 'associate', type: 'bb' },
  { firm: 'Goldman Sachs', role: 'Investment Banking Analyst', location: 'San Francisco', base: 110000, bonus: 95000, total: 205000, year: 2025, level: 'analyst', type: 'bb' },
  { firm: 'Morgan Stanley', role: 'Investment Banking Analyst', location: 'New York', base: 110000, bonus: 85000, total: 195000, year: 2025, level: 'analyst', type: 'bb' },
  { firm: 'JPMorgan', role: 'Investment Banking Analyst', location: 'New York', base: 110000, bonus: 85000, total: 195000, year: 2025, level: 'analyst', type: 'bb' },
  { firm: 'Bank of America', role: 'Investment Banking Analyst', location: 'New York', base: 110000, bonus: 75000, total: 185000, year: 2025, level: 'analyst', type: 'bb' },
  { firm: 'Citi', role: 'Investment Banking Analyst', location: 'New York', base: 110000, bonus: 75000, total: 185000, year: 2025, level: 'analyst', type: 'bb' },
  
  // Elite Boutiques
  { firm: 'Evercore', role: 'Investment Banking Analyst', location: 'New York', base: 110000, bonus: 110000, total: 220000, year: 2025, level: 'analyst', type: 'eb' },
  { firm: 'Centerview', role: 'Investment Banking Analyst', location: 'New York', base: 110000, bonus: 115000, total: 225000, year: 2025, level: 'analyst', type: 'eb' },
  { firm: 'Lazard', role: 'Investment Banking Analyst', location: 'New York', base: 110000, bonus: 95000, total: 205000, year: 2025, level: 'analyst', type: 'eb' },
  { firm: 'Moelis', role: 'Investment Banking Analyst', location: 'New York', base: 110000, bonus: 100000, total: 210000, year: 2025, level: 'analyst', type: 'eb' },
  { firm: 'PJT Partners', role: 'Investment Banking Analyst', location: 'New York', base: 110000, bonus: 105000, total: 215000, year: 2025, level: 'analyst', type: 'eb' },
  { firm: 'Guggenheim', role: 'Investment Banking Analyst', location: 'New York', base: 110000, bonus: 90000, total: 200000, year: 2025, level: 'analyst', type: 'eb' },
  
  // Middle Market
  { firm: 'Houlihan Lokey', role: 'Investment Banking Analyst', location: 'New York', base: 100000, bonus: 65000, total: 165000, year: 2025, level: 'analyst', type: 'mm' },
  { firm: 'William Blair', role: 'Investment Banking Analyst', location: 'Chicago', base: 95000, bonus: 60000, total: 155000, year: 2025, level: 'analyst', type: 'mm' },
  { firm: 'Lincoln International', role: 'Investment Banking Analyst', location: 'Chicago', base: 95000, bonus: 55000, total: 150000, year: 2025, level: 'analyst', type: 'mm' },
  
  // Private Equity
  { firm: 'Blackstone', role: 'Private Equity Analyst', location: 'New York', base: 110000, bonus: 100000, total: 210000, year: 2025, level: 'analyst', type: 'pe' },
  { firm: 'KKR', role: 'Private Equity Analyst', location: 'New York', base: 110000, bonus: 105000, total: 215000, year: 2025, level: 'analyst', type: 'pe' },
  { firm: 'Carlyle', role: 'Private Equity Analyst', location: 'New York', base: 110000, bonus: 95000, total: 205000, year: 2025, level: 'analyst', type: 'pe' },
  { firm: 'Bain Capital', role: 'Private Equity Analyst', location: 'Boston', base: 110000, bonus: 100000, total: 210000, year: 2025, level: 'analyst', type: 'pe' },
  
  // Hedge Funds
  { firm: 'Citadel', role: 'Investment Analyst', location: 'New York', base: 120000, bonus: 120000, total: 240000, year: 2025, level: 'analyst', type: 'hf' },
  { firm: 'Jane Street', role: 'Trading Analyst', location: 'New York', base: 150000, bonus: 150000, total: 300000, year: 2025, level: 'analyst', type: 'hf' },
  { firm: 'Two Sigma', role: 'Quantitative Analyst', location: 'New York', base: 140000, bonus: 130000, total: 270000, year: 2025, level: 'analyst', type: 'hf' },
]

export function SalaryBenchmarking({ applications }: SalaryBenchmarkingProps) {
  const [selectedFirm, setSelectedFirm] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'chart' | 'compare'>('table')
  const [compareFirms, setCompareFirms] = useState<string[]>([])
  const [showYourOffers, setShowYourOffers] = useState(true)

  // Get unique values
  const firms = useMemo(() => [...new Set(MOCK_SALARY_DATA.map(d => d.firm))].sort(), [])
  const locations = useMemo(() => [...new Set(MOCK_SALARY_DATA.map(d => d.location))].sort(), [])
  const types = useMemo(() => [...new Set(MOCK_SALARY_DATA.map(d => d.type))], [])

  // Filter data
  const filteredData = useMemo(() => {
    return MOCK_SALARY_DATA.filter(d => {
      if (selectedFirm !== 'all' && d.firm !== selectedFirm) return false
      if (selectedLocation !== 'all' && d.location !== selectedLocation) return false
      if (selectedType !== 'all' && d.type !== selectedType) return false
      return true
    })
  }, [selectedFirm, selectedLocation, selectedType])

  // Calculate stats
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null
    
    const totals = filteredData.map(d => d.total)
    const bases = filteredData.map(d => d.base)
    const bonuses = filteredData.map(d => d.bonus)
    
    return {
      avgTotal: Math.round(totals.reduce((a, b) => a + b, 0) / totals.length),
      medianTotal: totals.sort((a, b) => a - b)[Math.floor(totals.length / 2)],
      minTotal: Math.min(...totals),
      maxTotal: Math.max(...totals),
      avgBase: Math.round(bases.reduce((a, b) => a + b, 0) / bases.length),
      avgBonus: Math.round(bonuses.reduce((a, b) => a + b, 0) / bonuses.length),
      count: filteredData.length
    }
  }, [filteredData])

  // Get user offers from applications
  const userOffers = useMemo(() => {
    return applications
      .filter(a => a.status === 'offer' && a.compensation)
      .map(a => ({
        firm: a.firm,
        role: a.role,
        compensation: a.compensation
      }))
  }, [applications])

  // Group by firm type
  const byType = useMemo(() => {
    const grouped: Record<string, { avg: number; count: number; firms: string[] }> = {}
    
    filteredData.forEach(d => {
      if (!grouped[d.type]) {
        grouped[d.type] = { avg: 0, count: 0, firms: [] }
      }
      grouped[d.type].avg += d.total
      grouped[d.type].count++
      if (!grouped[d.type].firms.includes(d.firm)) {
        grouped[d.type].firms.push(d.firm)
      }
    })
    
    Object.keys(grouped).forEach(key => {
      grouped[key].avg = Math.round(grouped[key].avg / grouped[key].count)
    })
    
    return grouped
  }, [filteredData])

  const typeLabels: Record<string, string> = {
    bb: 'Bulge Bracket',
    eb: 'Elite Boutique',
    mm: 'Middle Market',
    pe: 'Private Equity',
    hf: 'Hedge Fund'
  }

  const typeColors: Record<string, string> = {
    bb: 'bg-blue-500',
    eb: 'bg-purple-500',
    mm: 'bg-amber-500',
    pe: 'bg-emerald-500',
    hf: 'bg-rose-500'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  const toggleCompareFirm = (firm: string) => {
    setCompareFirms(prev => 
      prev.includes(firm) 
        ? prev.filter(f => f !== firm)
        : prev.length < 3 ? [...prev, firm] : prev
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-500">Avg Total Comp</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.avgTotal)}</div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-500">Median</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.medianTotal)}</div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-500">Range</span>
            </div>
            <div className="text-lg font-bold text-white">
              {formatCurrency(stats.minTotal)} - {formatCurrency(stats.maxTotal)}
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-500">Data Points</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.count}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Filters:</span>
          </div>
          
          <select
            value={selectedFirm}
            onChange={(e) => setSelectedFirm(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Firms</option>
            {firms.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Locations</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Types</option>
            {types.map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}
          </select>

          <div className="flex-1" />
          
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
            {(['table', 'chart', 'compare'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Offers Banner */}
      {userOffers.length > 0 && showYourOffers && (
        <div className="glass-card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-emerald-400" />
              <span className="font-medium text-white">Your Offers</span>
              <span className="text-sm text-slate-400">
                {userOffers.length} offer{userOffers.length > 1 ? 's' : ''} received
              </span>
            </div>
            <button
              onClick={() => setShowYourOffers(false)}
              className="text-slate-400 hover:text-white"
            >
              Hide
            </button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {userOffers.map((offer, i) => (
              <div key={i} className="bg-slate-800/50 rounded-lg p-3">
                <div className="font-medium text-white">{offer.firm}</div>
                <div className="text-sm text-slate-400">{offer.role}</div>
                {offer.compensation && (
                  <div className="text-sm text-emerald-400 mt-1">{offer.compensation}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'table' && (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Firm</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Location</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Base</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Bonus</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Total</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{row.firm}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{row.role}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {row.location}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-300">{formatCurrency(row.base)}</td>
                      <td className="px-4 py-3 text-right text-sm text-emerald-400">{formatCurrency(row.bonus)}</td>
                      <td className="px-4 py-3 text-right font-medium text-white">{formatCurrency(row.total)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[row.type].replace('bg-', 'bg-').replace('500', '500/20')} ${typeColors[row.type].replace('bg-', 'text-')}`}>
                          {typeLabels[row.type]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {viewMode === 'chart' && (
          <motion.div
            key="chart"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 gap-6"
          >
            {/* By Type Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Average by Firm Type
              </h3>
              <div className="space-y-4">
                {Object.entries(byType).sort(([,a], [,b]) => b.avg - a.avg).map(([type, data]) => (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300">{typeLabels[type]}</span>
                      <span className="text-sm font-medium text-white">{formatCurrency(data.avg)}</span>
                    </div>
                    <div className="h-8 bg-slate-800 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(data.avg / 300000) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className={`h-full ${typeColors[type]}`}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {data.count} reports • {data.firms.length} firms
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribution */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-400" />
                Compensation Distribution
              </h3>
              <div className="space-y-3">
                {[
                  { range: '$150K - $175K', count: filteredData.filter(d => d.total >= 150000 && d.total < 175000).length },
                  { range: '$175K - $200K', count: filteredData.filter(d => d.total >= 175000 && d.total < 200000).length },
                  { range: '$200K - $225K', count: filteredData.filter(d => d.total >= 200000 && d.total < 225000).length },
                  { range: '$225K - $250K', count: filteredData.filter(d => d.total >= 225000 && d.total < 250000).length },
                  { range: '$250K+', count: filteredData.filter(d => d.total >= 250000).length },
                ].map((bin, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 w-28">{bin.range}</span>
                    <div className="flex-1 h-6 bg-slate-800 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(bin.count / Math.max(filteredData.length, 1)) * 100}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                    <span className="text-sm text-slate-300 w-8 text-right">{bin.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'compare' && (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="glass-card p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Select up to 3 firms to compare</h3>
              <div className="flex flex-wrap gap-2">
                {firms.map(firm => (
                  <button
                    key={firm}
                    onClick={() => toggleCompareFirm(firm)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      compareFirms.includes(firm)
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {firm}
                  </button>
                ))}
              </div>
            </div>

            {compareFirms.length > 0 && (
              <div className="glass-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Metric</th>
                      {compareFirms.map(firm => (
                        <th key={firm} className="px-4 py-3 text-right text-xs font-medium text-white">{firm}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {[
                      { label: 'Avg Total Comp', key: 'total' },
                      { label: 'Avg Base Salary', key: 'base' },
                      { label: 'Avg Bonus', key: 'bonus' },
                      { label: 'Data Points', key: 'count' },
                    ].map((metric) => (
                      <tr key={metric.key}>
                        <td className="px-4 py-3 text-sm text-slate-400">{metric.label}</td>
                        {compareFirms.map(firm => {
                          const firmData = filteredData.filter(d => d.firm === firm)
                          let value: string | number = '-'
                          
                          if (metric.key === 'count') {
                            value = firmData.length
                          } else if (firmData.length > 0) {
                            const avg = Math.round(firmData.reduce((sum, d) => sum + d[metric.key as keyof SalaryData] as number, 0) / firmData.length)
                            value = formatCurrency(avg)
                          }
                          
                          return (
                            <td key={firm} className="px-4 py-3 text-right text-sm text-white">
                              {value}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Footer */}
      <div className="glass-card p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-slate-400">
          <span className="text-slate-300 font-medium">About this data:</span> Salary figures represent 2025 total compensation 
          for Investment Banking Analyst positions across major financial centers. Data includes base salary and year-end bonus. 
          Actual compensation may vary based on performance, group profitability, and market conditions.
        </div>
      </div>
    </div>
  )
}

export default SalaryBenchmarking
