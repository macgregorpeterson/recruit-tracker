'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Copy,
  Check,
  Plus,
  Search,
  Folder,
  Tag,
  Star,
  MoreHorizontal,
  Edit3,
  Trash2,
  Download,
  Upload,
  FilePlus,
  Briefcase,
  Mail,
  User,
  Building2,
  Sparkles,
  Wand2,
  History,
  Clock,
  ChevronRight,
  X,
  Save,
  Eye
} from 'lucide-react'

interface ApplicationTemplate {
  id: string
  name: string
  type: 'cover-letter' | 'resume' | 'email' | 'thank-you' | 'follow-up' | 'networking'
  category: string
  content: string
  variables: string[]
  tags: string[]
  isFavorite: boolean
  usageCount: number
  lastUsed?: string
  createdAt: string
  description?: string
}

interface TemplateUsage {
  id: string
  templateId: string
  applicationId?: string
  firm?: string
  role?: string
  usedAt: string
  customizedContent: string
}

interface ApplicationTemplatesProps {
  onUseTemplate: (template: ApplicationTemplate, variables: Record<string, string>) => void
  applications?: any[]
}

const TEMPLATE_TYPES = [
  { id: 'all', label: 'All Templates', icon: FileText },
  { id: 'cover-letter', label: 'Cover Letters', icon: FilePlus },
  { id: 'resume', label: 'Resume Snippets', icon: User },
  { id: 'email', label: 'Emails', icon: Mail },
  { id: 'thank-you', label: 'Thank You Notes', icon: Star },
  { id: 'follow-up', label: 'Follow-ups', icon: Clock },
  { id: 'networking', label: 'Networking', icon: Building2 },
]

const SAMPLE_TEMPLATES: ApplicationTemplate[] = [
  {
    id: '1',
    name: 'Investment Banking Summer Analyst - Standard',
    type: 'cover-letter',
    category: 'IB',
    content: `Dear {{hiring_manager}},

I am writing to express my strong interest in the Summer Analyst position at {{firm}}. As a {{year}} at {{school}} studying {{major}}, I have developed a passion for financial markets and M&A advisory.

Through my experience at {{previous_experience}}, I gained hands-on experience in {{skills}}. I am particularly drawn to {{firm}}'s reputation for {{firm_strength}} and its track record of {{achievement}}.

I would welcome the opportunity to discuss how my background in {{background}} aligns with {{firm}}'s needs. Thank you for your consideration.

Best regards,
{{your_name}}`,
    variables: ['hiring_manager', 'firm', 'year', 'school', 'major', 'previous_experience', 'skills', 'firm_strength', 'achievement', 'background', 'your_name'],
    tags: ['Summer', 'IB', 'Standard'],
    isFavorite: true,
    usageCount: 12,
    lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Standard cover letter template for IB summer analyst positions'
  },
  {
    id: '2',
    name: 'Coffee Chat Follow-up',
    type: 'networking',
    category: 'Networking',
    content: `Hi {{contact_name}},

Thank you so much for taking the time to speak with me earlier {{timeframe}}. I really enjoyed learning about your experience in {{group}} and {{firm}}'s approach to {{topic}}.

Your insights on {{specific_topic}} were particularly valuable as I continue to explore opportunities in {{industry}}.

I would love to stay in touch as I progress through the recruiting process. Please let me know if there's ever anything I can help with on my end.

Best,
{{your_name}}`,
    variables: ['contact_name', 'timeframe', 'group', 'firm', 'topic', 'specific_topic', 'industry', 'your_name'],
    tags: ['Networking', 'Follow-up'],
    isFavorite: true,
    usageCount: 8,
    lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Follow-up email after coffee chat or informational interview'
  },
  {
    id: '3',
    name: 'Superday Thank You',
    type: 'thank-you',
    category: 'IB',
    content: `Dear {{interviewer_name}},

Thank you for the opportunity to interview for the {{position}} position at {{firm}} today. I thoroughly enjoyed our conversation about {{discussion_topic}} and learning more about {{firm}}'s {{aspect}}.

I was particularly impressed by {{specific_detail}} and remain very enthusiastic about the opportunity to join your team.

Thank you again for your time and consideration. I look forward to hearing from you regarding next steps.

Best regards,
{{your_name}}`,
    variables: ['interviewer_name', 'position', 'firm', 'discussion_topic', 'aspect', 'specific_detail', 'your_name'],
    tags: ['Thank You', 'Superday', 'Interview'],
    isFavorite: false,
    usageCount: 3,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Thank you email after superday or final round interview'
  },
  {
    id: '4',
    name: 'Deal Experience - M&A',
    type: 'resume',
    category: 'Experience',
    content: `• Supported {{deal_type}} transaction valued at {{value}} in the {{industry}} sector
• Built {{model_type}} to analyze {{analysis_type}}, resulting in {{outcome}}
• Prepared {{materials}} for {{audience}} presentations
• Conducted {{research_type}} research on {{companies}} comparable companies`,
    variables: ['deal_type', 'value', 'industry', 'model_type', 'analysis_type', 'outcome', 'materials', 'audience', 'research_type', 'companies'],
    tags: ['M&A', 'Experience', 'Bullet'],
    isFavorite: true,
    usageCount: 15,
    lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Resume bullet point template for M&A deal experience'
  },
  {
    id: '5',
    name: 'Cold Outreach - Alumni',
    type: 'networking',
    category: 'Networking',
    content: `Hi {{contact_name}},

My name is {{your_name}}, and I'm a {{year}} at {{school}}. I came across your profile and saw that you also graduated from {{school}} and now work in {{group}} at {{firm}}.

I'm very interested in learning more about {{topic}} and would greatly appreciate {{time_amount}} of your time for a brief conversation about your experience at {{firm}}.

Would you be available for a quick call or coffee chat {{timeframe}}?

Best,
{{your_name}}`,
    variables: ['contact_name', 'your_name', 'year', 'school', 'group', 'firm', 'topic', 'time_amount', 'timeframe'],
    tags: ['Cold', 'Alumni', 'Outreach'],
    isFavorite: false,
    usageCount: 6,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Cold email template for reaching out to alumni'
  },
]

export function ApplicationTemplates({ onUseTemplate, applications = [] }: ApplicationTemplatesProps) {
  const [templates, setTemplates] = useState<ApplicationTemplate[]>(SAMPLE_TEMPLATES)
  const [activeType, setActiveType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<ApplicationTemplate | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUseModal, setShowUseModal] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [previewMode, setPreviewMode] = useState(false)

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      if (activeType !== 'all' && t.type !== activeType) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return t.name.toLowerCase().includes(query) ||
               t.tags.some(tag => tag.toLowerCase().includes(query)) ||
               t.description?.toLowerCase().includes(query)
      }
      return true
    }).sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return b.isFavorite ? 1 : -1
      return b.usageCount - a.usageCount
    })
  }, [templates, activeType, searchQuery])

  const toggleFavorite = (id: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    ))
  }

  const copyTemplate = (template: ApplicationTemplate, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(template.content)
    setCopiedId(template.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleUseTemplate = (template: ApplicationTemplate) => {
    setSelectedTemplate(template)
    setVariableValues({})
    setShowUseModal(true)
    setPreviewMode(false)
  }

  const generatePreview = () => {
    if (!selectedTemplate) return ''
    let content = selectedTemplate.content
    selectedTemplate.variables.forEach(v => {
      const value = variableValues[v] || `{{${v}}}`
      content = content.replace(new RegExp(`{{${v}}}`, 'g'), value)
    })
    return content
  }

  const saveAndCopy = () => {
    if (!selectedTemplate) return
    const content = generatePreview()
    navigator.clipboard.writeText(content)
    
    // Update usage count
    setTemplates(prev => prev.map(t => 
      t.id === selectedTemplate.id 
        ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date().toISOString() } 
        : t
    ))
    
    onUseTemplate(selectedTemplate, variableValues)
    setShowUseModal(false)
    setCopiedId(selectedTemplate.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = TEMPLATE_TYPES.find(t => t.id === type)
    return typeConfig?.icon || FileText
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'cover-letter': 'blue',
      'resume': 'emerald',
      'email': 'purple',
      'thank-you': 'amber',
      'follow-up': 'cyan',
      'networking': 'pink',
    }
    return colors[type] || 'slate'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Application Templates</h2>
            <p className="text-sm text-slate-400">Reusable templates for applications and outreach</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="text-2xl font-bold text-white">{templates.length}</div>
          <div className="text-sm text-slate-400">Total Templates</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-2xl font-bold text-white">
            {templates.filter(t => t.isFavorite).length}
          </div>
          <div className="text-sm text-slate-400">Favorites</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-2xl font-bold text-white">
            {templates.reduce((sum, t) => sum + t.usageCount, 0)}
          </div>
          <div className="text-sm text-slate-400">Total Uses</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-2xl font-bold text-white">
            {templates.filter(t => t.lastUsed && new Date(t.lastUsed) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
          </div>
          <div className="text-sm text-slate-400">Used This Week</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {TEMPLATE_TYPES.slice(0, 4).map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeType === type.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{type.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template, idx) => {
          const Icon = getTypeIcon(template.type)
          const color = getTypeColor(template.type)

          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedTemplate(template)}
              className="glass-card p-5 cursor-pointer transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-${color}-500/10 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${color}-400`} />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(template.id)
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      template.isFavorite
                        ? 'text-yellow-400'
                        : 'text-slate-600 hover:text-yellow-400'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${template.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => copyTemplate(template, e)}
                    className="p-1.5 text-slate-600 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {copiedId === template.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-white mb-1 line-clamp-1">{template.name}</h3>
              <p className="text-sm text-slate-400 mb-3 line-clamp-2">{template.description}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                {template.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <History className="w-3 h-3" />
                    {template.usageCount} uses
                  </span>
                  {template.lastUsed && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(template.lastUsed).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUseTemplate(template)
                  }}
                  className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Use
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Use Template Modal */}
      <AnimatePresence>
        {showUseModal && selectedTemplate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
              onClick={() => setShowUseModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl md:max-h-[85vh] bg-slate-900 rounded-2xl border border-slate-800 z-50 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getTypeIcon(selectedTemplate.type)
                    const color = getTypeColor(selectedTemplate.type)
                    return (
                      <div className={`w-10 h-10 rounded-lg bg-${color}-500/10 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${color}-400`} />
                      </div>
                    )
                  })()}
                  <div>
                    <h3 className="font-semibold text-white">{selectedTemplate.name}</h3>
                    <p className="text-sm text-slate-400">Fill in the variables to customize</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      previewMode
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => setShowUseModal(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {previewMode ? (
                  <div className="bg-slate-800/50 rounded-xl p-6 whitespace-pre-wrap text-slate-300 leading-relaxed">
                    {generatePreview()}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-400">
                      This template has {selectedTemplate.variables.length} variables to fill in:
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedTemplate.variables.map((variable) => (
                        <div key={variable}>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5 capitalize">
                            {variable.replace(/_/g, ' ')}
                          </label>
                          <input
                            type="text"
                            value={variableValues[variable] || ''}
                            onChange={(e) => setVariableValues(prev => ({
                              ...prev,
                              [variable]: e.target.value
                            }))}
                            placeholder={`Enter ${variable.replace(/_/g, ' ')}...`}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  {selectedTemplate.usageCount} previous uses
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowUseModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveAndCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ApplicationTemplates
