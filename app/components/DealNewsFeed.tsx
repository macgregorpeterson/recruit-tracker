'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Newspaper,
  TrendingUp,
  Building2,
  DollarSign,
  Clock,
  ExternalLink,
  Filter,
  Bell,
  Bookmark,
  Share2,
  ChevronRight,
  Briefcase,
  Globe,
  Zap,
  Target,
  BarChart3,
  Flame,
  Sparkles
} from 'lucide-react'

interface DealNews {
  id: string
  type: 'ma' | 'ipo' | 'funding' | 'earnings' | 'layoffs' | 'hiring' | 'leadership'
  headline: string
  summary: string
  firms: string[]
  value?: string
  date: string
  source: string
  sourceUrl?: string
  relevance: 'high' | 'medium' | 'low'
  category: 'investment-banking' | 'private-equity' | 'hedge-funds' | 'consulting' | 'tech'
  read: boolean
  bookmarked: boolean
}

interface DealNewsFeedProps {
  onTrackFirm: (firm: string) => void
  onAddNote: (news: DealNews) => void
  trackedFirms?: string[]
}

const NEWS_CATEGORIES = [
  { id: 'all', label: 'All News', icon: Globe },
  { id: 'ma', label: 'M&A Deals', icon: Briefcase },
  { id: 'ipo', label: 'IPOs', icon: TrendingUp },
  { id: 'funding', label: 'Funding', icon: DollarSign },
  { id: 'hiring', label: 'Hiring', icon: Building2 },
  { id: 'leadership', label: 'Leadership', icon: Target },
]

const RELEVANCE_BADGES = {
  high: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'High Relevance' },
  medium: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Medium' },
  low: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: 'Low' },
}

const TYPE_ICONS: Record<string, any> = {
  ma: Briefcase,
  ipo: TrendingUp,
  funding: DollarSign,
  earnings: BarChart3,
  layoffs: Flame,
  hiring: Building2,
  leadership: Target,
}

const TYPE_COLORS: Record<string, string> = {
  ma: 'blue',
  ipo: 'emerald',
  funding: 'purple',
  earnings: 'cyan',
  layoffs: 'red',
  hiring: 'green',
  leadership: 'orange',
}

export function DealNewsFeed({ onTrackFirm, onAddNote, trackedFirms = [] }: DealNewsFeedProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeRelevance, setActiveRelevance] = useState<'all' | 'high' | 'medium'>('all')
  const [news, setNews] = useState<DealNews[]>([])
  const [selectedNews, setSelectedNews] = useState<DealNews | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  // Mock news data (in real app, would come from API)
  useEffect(() => {
    const mockNews: DealNews[] = [
      {
        id: '1',
        type: 'ma',
        headline: 'Goldman Sachs Advises on $45B Tech Merger',
        summary: 'Goldman Sachs is serving as lead advisor on the largest technology merger of 2026, signaling strong deal flow in TMT sector.',
        firms: ['Goldman Sachs', 'Morgan Stanley'],
        value: '$45B',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: 'Reuters',
        relevance: 'high',
        category: 'investment-banking',
        read: false,
        bookmarked: false,
      },
      {
        id: '2',
        type: 'hiring',
        headline: 'Evercore Expands Healthcare Team with 15 New Hires',
        summary: 'Boutique investment bank Evercore continues aggressive expansion in healthcare coverage, targeting senior analysts and associates.',
        firms: ['Evercore'],
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        source: 'Bloomberg',
        relevance: 'high',
        category: 'investment-banking',
        read: false,
        bookmarked: false,
      },
      {
        id: '3',
        type: 'ipo',
        headline: 'Blackstone-Backed Company Files for $2.5B IPO',
        summary: 'Another major exit for Blackstone\'s private equity portfolio, with strong aftermarket performance expected.',
        firms: ['Blackstone', 'JP Morgan'],
        value: '$2.5B',
        date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        source: 'WSJ',
        relevance: 'medium',
        category: 'private-equity',
        read: false,
        bookmarked: false,
      },
      {
        id: '4',
        type: 'leadership',
        headline: 'Centerview Partners Names New Co-Head of M&A',
        summary: 'Internal promotion signals continued growth and opportunity for junior bankers at the elite boutique.',
        firms: ['Centerview Partners'],
        date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        source: 'Financial Times',
        relevance: 'medium',
        category: 'investment-banking',
        read: true,
        bookmarked: false,
      },
      {
        id: '5',
        type: 'funding',
        headline: 'Sequoia Leads $500M Series D for Fintech Startup',
        summary: 'Major funding round indicates continued VC interest in fintech sector, potential future M&A target.',
        firms: ['Sequoia Capital'],
        value: '$500M',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        source: 'TechCrunch',
        relevance: 'low',
        category: 'tech',
        read: true,
        bookmarked: true,
      },
      {
        id: '6',
        type: 'ma',
        headline: 'KKR Acquires Healthcare Services Provider for $8.2B',
        summary: 'Latest healthcare buyout shows PE firms continue aggressive deployment of record dry powder.',
        firms: ['KKR'],
        value: '$8.2B',
        date: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
        source: 'Bloomberg',
        relevance: 'high',
        category: 'private-equity',
        read: false,
        bookmarked: false,
      },
      {
        id: '7',
        type: 'earnings',
        headline: 'Q1 2026: Investment Banking Revenue Up 15% YoY',
        summary: 'Strong M&A and IPO activity drives revenue growth across bulge bracket firms.',
        firms: ['Goldman Sachs', 'Morgan Stanley', 'JP Morgan'],
        date: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        source: 'CNBC',
        relevance: 'medium',
        category: 'investment-banking',
        read: true,
        bookmarked: false,
      },
      {
        id: '8',
        type: 'hiring',
        headline: 'Citadel Expands Quantitative Research Team',
        summary: 'Hedge fund giant continues recruiting push for top STEM talent amid competition.',
        firms: ['Citadel'],
        date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        source: 'Business Insider',
        relevance: 'high',
        category: 'hedge-funds',
        read: false,
        bookmarked: false,
      },
    ]
    setNews(mockNews)
  }, [])

  const filteredNews = news.filter(item => {
    if (activeCategory !== 'all' && item.type !== activeCategory) return false
    if (activeRelevance !== 'all' && item.relevance !== activeRelevance) return false
    return true
  })

  const unreadCount = news.filter(n => !n.read).length
  const highRelevanceCount = news.filter(n => n.relevance === 'high' && !n.read).length

  const markAsRead = (id: string) => {
    setNews(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const toggleBookmark = (id: string) => {
    setNews(prev => prev.map(n => n.id === id ? { ...n, bookmarked: !n.bookmarked } : n))
  }

  const formatTimeAgo = (date: string) => {
    const hours = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60))
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const getRelevanceScore = (item: DealNews) => {
    let score = 0
    if (item.relevance === 'high') score += 30
    if (item.relevance === 'medium') score += 20
    if (item.type === 'hiring') score += 25
    if (item.firms.some(f => trackedFirms.includes(f))) score += 50
    if (!item.read) score += 10
    return score
  }

  const sortedNews = [...filteredNews].sort((a, b) => getRelevanceScore(b) - getRelevanceScore(a))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
            <Newspaper className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Deal & News Feed</h2>
            <p className="text-sm text-slate-400">Stay updated on market-moving deals and firm news</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              notificationsEnabled
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle notifications"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-slate-300">
            {highRelevanceCount > 0 ? (
              <span className="text-yellow-400 font-medium">{highRelevanceCount} high priority updates</span>
            ) : (
              'No high priority updates'
            )}
          </span>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-lg">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-sm text-blue-400">{unreadCount} unread</span>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {NEWS_CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const count = cat.id === 'all' 
            ? news.length 
            : news.filter(n => n.type === cat.id).length
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                activeCategory === cat.id ? 'bg-blue-600' : 'bg-slate-700'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-4 flex items-center gap-4">
              <span className="text-sm text-slate-400">Relevance:</span>
              {(['all', 'high', 'medium'] as const).map((rel) => (
                <button
                  key={rel}
                  onClick={() => setActiveRelevance(rel)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    activeRelevance === rel
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {rel.charAt(0).toUpperCase() + rel.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* News Feed */}
      <div className="space-y-3">
        {sortedNews.map((item, idx) => {
          const Icon = TYPE_ICONS[item.type]
          const color = TYPE_COLORS[item.type]
          const relevanceBadge = RELEVANCE_BADGES[item.relevance]

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => {
                markAsRead(item.id)
                setSelectedNews(item)
              }}
              className={`glass-card p-5 cursor-pointer transition-all hover:scale-[1.01] group ${
                !item.read ? 'bg-slate-800/40' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 text-${color}-400`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-semibold ${!item.read ? 'text-white' : 'text-slate-300'}`}>
                      {!item.read && (
                        <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2" />
                      )}
                      {item.headline}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleBookmark(item.id)
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.bookmarked
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'text-slate-500 hover:text-yellow-400'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${item.bookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-400 mb-3 line-clamp-2">{item.summary}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`px-2 py-1 rounded-full border ${relevanceBadge.color}`}>
                      {relevanceBadge.label}
                    </span>
                    {item.value && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <DollarSign className="w-3 h-3" />
                        {item.value}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(item.date)}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500">{item.source}</span>
                  </div>

                  {/* Firms */}
                  <div className="flex items-center gap-2 mt-3">
                    {item.firms.map((firm) => (
                      <button
                        key={firm}
                        onClick={(e) => {
                          e.stopPropagation()
                          onTrackFirm(firm)
                        }}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                          trackedFirms.includes(firm)
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {trackedFirms.includes(firm) && <Zap className="w-3 h-3 inline mr-1" />}
                        {firm}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* News Detail Modal */}
      <AnimatePresence>
        {selectedNews && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
              onClick={() => setSelectedNews(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[80vh] bg-slate-900 rounded-2xl border border-slate-800 z-50 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const Icon = TYPE_ICONS[selectedNews.type]
                      const color = TYPE_COLORS[selectedNews.type]
                      return (
                        <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 text-${color}-400`} />
                        </div>
                      )
                    })()}
                    <div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${RELEVANCE_BADGES[selectedNews.relevance].color}`}>
                        {RELEVANCE_BADGES[selectedNews.relevance].label}
                      </span>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(selectedNews.date)}
                        <span>•</span>
                        <span>{selectedNews.source}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedNews(null)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <h2 className="text-xl font-bold text-white mb-4">{selectedNews.headline}</h2>
                <p className="text-slate-300 leading-relaxed mb-6">{selectedNews.summary}</p>

                {selectedNews.value && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-xl mb-6">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-sm text-slate-400">Deal Value</span>
                      <p className="text-lg font-semibold text-emerald-400">{selectedNews.value}</p>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Related Firms</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNews.firms.map((firm) => (
                      <button
                        key={firm}
                        onClick={() => onTrackFirm(firm)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                          trackedFirms.includes(firm)
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        {firm}
                        {trackedFirms.includes(firm) && <Zap className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleBookmark(selectedNews.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedNews.bookmarked
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${selectedNews.bookmarked ? 'fill-current' : ''}`} />
                    {selectedNews.bookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                  <button
                    onClick={() => onAddNote(selectedNews)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Add Note
                  </button>
                </div>
                {selectedNews.sourceUrl && (
                  <a
                    href={selectedNews.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Read Full Story
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DealNewsFeed
