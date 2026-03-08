'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Newspaper,
  Building2,
  Users,
  Briefcase,
  Clock,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Target,
  Zap,
  Calendar,
  ChevronRight,
  ExternalLink,
  Bookmark,
  Share2,
  Bell,
  Filter,
  Search
} from 'lucide-react'

interface MarketNews {
  id: string
  title: string
  source: string
  summary: string
  category: 'hiring' | 'deals' | 'culture' | 'market' | 'layoffs'
  impact: 'high' | 'medium' | 'low'
  firms: string[]
  date: string
  url?: string
  isSaved?: boolean
}

interface HiringTrend {
  firm: string
  trend: 'up' | 'down' | 'stable'
  percentage: number
  openRoles: number
  lastUpdated: string
}

interface MarketIntelligenceProps {
  onTrackFirm?: (firm: string) => void
  onSaveNews?: (news: MarketNews) => void
}

const MOCK_NEWS: MarketNews[] = [
  {
    id: '1',
    title: 'Goldman Sachs Accelerates Tech Investment Banking Hiring',
    source: 'Bloomberg',
    summary: 'Goldman Sachs plans to increase analyst hiring by 15% for their TMT group, focusing on candidates with software engineering backgrounds.',
    category: 'hiring',
    impact: 'high',
    firms: ['Goldman Sachs'],
    date: '2025-03-07',
  },
  {
    id: '2',
    title: 'Evercore Wins Advisory Role on $50B Mega-Merger',
    source: 'Reuters',
    summary: 'Evercore named exclusive financial advisor on the largest M&A deal of 2025, cementing their position in the top-tier advisory league tables.',
    category: 'deals',
    impact: 'high',
    firms: ['Evercore'],
    date: '2025-03-06',
  },
  {
    id: '3',
    title: 'Banking Culture Shift: Return-to-Office Mandates Relax',
    source: 'WSJ',
    summary: 'Multiple bulge bracket banks are adjusting RTO policies to 3 days per week, a potential sign of evolving workplace culture in finance.',
    category: 'culture',
    impact: 'medium',
    firms: ['Morgan Stanley', 'JPMorgan', 'Bank of America'],
    date: '2025-03-05',
  },
  {
    id: '4',
    title: 'Q1 2025 M&A Volume Up 23% YoY',
    source: 'PitchBook',
    summary: 'M&A activity showing strong recovery with technology and healthcare leading deal flow. Boutique advisors gaining market share.',
    category: 'market',
    impact: 'high',
    firms: [],
    date: '2025-03-04',
  },
  {
    id: '5',
    title: 'Citadel Expands Quantitative Research Team',
    source: 'Financial Times',
    summary: 'Citadel announces plans to hire 200+ quantitative researchers globally, signaling continued investment in systematic strategies.',
    category: 'hiring',
    impact: 'medium',
    firms: ['Citadel'],
    date: '2025-03-03',
  },
  {
    id: '6',
    title: 'Middle Market Firms See Record Deal Flow',
    source: 'PE Hub',
    summary: 'Middle market investment banks reporting busiest Q1 in years, with particular strength in industrial and business services sectors.',
    category: 'market',
    impact: 'medium',
    firms: ['Houlihan Lokey', 'Lincoln International'],
    date: '2025-03-02',
  },
  {
    id: '7',
    title: 'Blackstone Announces Record $100B Fund Close',
    source: 'Bloomberg',
    summary: 'Largest private equity fund in history closes, signaling continued institutional appetite for alternative investments.',
    category: 'deals',
    impact: 'high',
    firms: ['Blackstone'],
    date: '2025-03-01',
  },
  {
    id: '8',
    title: 'Junior Banker Retention Crisis Deepens',
    source: 'Business Insider',
    summary: 'Survey shows 40% of first-year analysts considering exit opportunities, prompting banks to review compensation and work-life policies.',
    category: 'culture',
    impact: 'medium',
    firms: [],
    date: '2025-02-28',
  },
]

const MOCK_TRENDS: HiringTrend[] = [
  { firm: 'Goldman Sachs', trend: 'up', percentage: 15, openRoles: 142, lastUpdated: '2025-03-07' },
  { firm: 'Evercore', trend: 'up', percentage: 12, openRoles: 38, lastUpdated: '2025-03-07' },
  { firm: 'Centerview', trend: 'up', percentage: 8, openRoles: 24, lastUpdated: '2025-03-06' },
  { firm: 'Morgan Stanley', trend: 'stable', percentage: 0, openRoles: 89, lastUpdated: '2025-03-07' },
  { firm: 'JPMorgan', trend: 'up', percentage: 5, openRoles: 201, lastUpdated: '2025-03-06' },
  { firm: 'Blackstone', trend: 'up', percentage: 20, openRoles: 67, lastUpdated: '2025-03-05' },
  { firm: 'Citadel', trend: 'up', percentage: 25, openRoles: 156, lastUpdated: '2025-03-04' },
  { firm: 'Houlihan Lokey', trend: 'stable', percentage: 2, openRoles: 45, lastUpdated: '2025-03-05' },
  { firm: 'Bank of America', trend: 'down', percentage: -8, openRoles: 112, lastUpdated: '2025-03-07' },
  { firm: 'Citi', trend: 'down', percentage: -12, openRoles: 78, lastUpdated: '2025-03-06' },
]

const UPCOMING_EVENTS = [
  { date: 'Mar 15', title: 'Goldman Sachs Superday', type: 'interview' },
  { date: 'Mar 18', title: 'Evercore Info Session', type: 'networking' },
  { date: 'Mar 22', title: 'Morgan Stanley Application Deadline', type: 'deadline' },
  { date: 'Mar 25', title: 'Banking Careers Fair', type: 'event' },
  { date: 'Apr 1', title: 'JP Morgan Summer Internship Start', type: 'internship' },
]

export function MarketIntelligence({ onTrackFirm, onSaveNews }: MarketIntelligenceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [savedNews, setSavedNews] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [trackedFirms, setTrackedFirms] = useState<Set<string>>(new Set())

  const categories = [
    { id: 'all', label: 'All News', icon: Newspaper },
    { id: 'hiring', label: 'Hiring', icon: Users },
    { id: 'deals', label: 'Deals', icon: Briefcase },
    { id: 'culture', label: 'Culture', icon: Building2 },
    { id: 'market', label: 'Market', icon: TrendingUp },
  ]

  const filteredNews = useMemo(() => {
    return MOCK_NEWS.filter(news => {
      if (selectedCategory !== 'all' && news.category !== selectedCategory) return false
      if (searchQuery && !news.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [selectedCategory, searchQuery])

  const toggleSaveNews = (newsId: string) => {
    setSavedNews(prev => {
      const newSet = new Set(prev)
      if (newSet.has(newsId)) {
        newSet.delete(newsId)
      } else {
        newSet.add(newsId)
      }
      return newSet
    })
  }

  const toggleTrackFirm = (firm: string) => {
    setTrackedFirms(prev => {
      const newSet = new Set(prev)
      if (newSet.has(firm)) {
        newSet.delete(firm)
      } else {
        newSet.add(firm)
      }
      return newSet
    })
    onTrackFirm?.(firm)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      hiring: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      deals: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      culture: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      market: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      layoffs: 'bg-red-500/20 text-red-400 border-red-500/30',
    }
    return colors[category] || 'bg-slate-500/20 text-slate-400'
  }

  const getImpactIndicator = (impact: string) => {
    switch (impact) {
      case 'high':
        return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">High Impact</span>
      case 'medium':
        return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">Medium</span>
      default:
        return <span className="px-2 py-0.5 bg-slate-500/20 text-slate-400 text-xs rounded-full">Low</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Market Pulse Header */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-500">M&A Volume (Q1)</span>
          </div>
          <div className="text-2xl font-bold text-white">+23%</div>
          <div className="text-xs text-emerald-400">vs last year</div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-500">Open IB Roles</span>
          </div>
          <div className="text-2xl font-bold text-white">1,247</div>
          <div className="text-xs text-emerald-400">+8% this month</div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-500">Deal Activity</span>
          </div>
          <div className="text-2xl font-bold text-white">156</div>
          <div className="text-xs text-slate-400">Active mandates</div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-500">Markets</span>
          </div>
          <div className="text-2xl font-bold text-white">Bullish</div>
          <div className="text-xs text-emerald-400">S&P +4.2%</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main News Feed */}
        <div className="col-span-2 space-y-4">
          {/* Search and Filters */}
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search market intelligence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* News List */}
          <div className="space-y-3">
            {filteredNews.map((news, index) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-4 hover:bg-slate-800/40 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getCategoryColor(news.category)}`}>
                    {news.category === 'hiring' && <Users className="w-5 h-5" />}
                    {news.category === 'deals' && <Briefcase className="w-5 h-5" />}
                    {news.category === 'culture' && <Building2 className="w-5 h-5" />}
                    {news.category === 'market' && <TrendingUp className="w-5 h-5" />}
                    {news.category === 'layoffs' && <TrendingDown className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                        {news.title}
                      </h3>
                      {getImpactIndicator(news.impact)}
                    </div>
                    
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{news.summary}</p>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs text-slate-500">{news.source}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-500">
                        {new Date(news.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      
                      {news.firms.length > 0 && (
                        <>
                          <span className="text-slate-600">•</span>
                          <div className="flex items-center gap-1">
                            {news.firms.map((firm, i) => (
                              <button
                                key={firm}
                                onClick={() => toggleTrackFirm(firm)}
                                className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                                  trackedFirms.has(firm)
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                              >
                                {firm}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleSaveNews(news.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        savedNews.has(news.id)
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'hover:bg-slate-700 text-slate-400'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${savedNews.has(news.id) ? 'fill-current' : ''}`} />
                    </button>
                    {news.url && (
                      <a
                        href={news.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Hiring Trends */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Hiring Trends
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {MOCK_TRENDS.slice(0, 6).map((trend) => (
                <div key={trend.firm} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{trend.firm}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{trend.openRoles} roles</span>
                    <div className={`flex items-center gap-0.5 text-xs ${
                      trend.trend === 'up' ? 'text-emerald-400' :
                      trend.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {trend.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                      {trend.trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
                      {trend.trend === 'stable' && <Minus className="w-3 h-3" />}
                      {Math.abs(trend.percentage)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 pb-4">
              <button className="w-full py-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                View All Trends →
              </button>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                Key Dates
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {UPCOMING_EVENTS.map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="text-center min-w-[3rem]">
                    <div className="text-xs text-slate-500">{event.date.split(' ')[0]}</div>
                    <div className="text-lg font-bold text-white">{event.date.split(' ')[1]}</div>
                  </div>
                  <div>
                    <div className="text-sm text-white">{event.title}</div>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      event.type === 'interview' ? 'bg-blue-500/20 text-blue-400' :
                      event.type === 'deadline' ? 'bg-red-500/20 text-red-400' :
                      event.type === 'internship' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {event.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracked Firms */}
          {trackedFirms.size > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  Tracked Firms
                </h3>
                <span className="text-xs text-slate-500">{trackedFirms.size}</span>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {Array.from(trackedFirms).map((firm) => (
                    <span
                      key={firm}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full"
                    >
                      {firm}
                      <button
                        onClick={() => toggleTrackFirm(firm)}
                        className="hover:text-blue-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Newsletter Signup */}
          <div className="glass-card p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <div className="flex items-center gap-3 mb-3">
              <Bell className="w-5 h-5 text-blue-400" />
              <h3 className="font-medium text-white">Daily Briefing</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              Get market intelligence delivered to your inbox every morning.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketIntelligence
