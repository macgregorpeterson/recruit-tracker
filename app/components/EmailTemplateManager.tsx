'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  Copy, 
  Check, 
  Sparkles, 
  User, 
  Briefcase,
  Coffee,
  Send,
  Edit3,
  Plus,
  X,
  Search,
  Clock,
  RefreshCw,
  Star,
  MessageSquare
} from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  category: 'cold_outreach' | 'follow_up' | 'thank_you' | 'interview_prep' | 'offer_negotiation'
  subject: string
  body: string
  variables: string[]
  tone: 'professional' | 'friendly' | 'formal'
  usageCount: number
  lastUsed?: string
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: '1',
    name: 'Cold Outreach - First Touch',
    category: 'cold_outreach',
    subject: 'Quick question about {{firm}}',
    body: `Hi {{name}},

I hope this message finds you well. I'm a {{school}} student interested in {{industry}} and have long admired {{firm}}'s work, particularly {{recent_deal}}.

I would love to learn more about your experience at {{firm}} and any advice you might have for someone looking to break into the industry. Would you be open to a brief 15-minute chat sometime this week?

Best regards,
{{my_name}}`,
    variables: ['name', 'firm', 'school', 'industry', 'recent_deal', 'my_name'],
    tone: 'professional',
    usageCount: 42
  },
  {
    id: '2',
    name: 'Post-Coffee Chat Thank You',
    category: 'thank_you',
    subject: 'Thank you for the conversation',
    body: `Hi {{name}},

Thank you so much for taking the time to speak with me today. I really appreciated learning about {{specific_topic}} and your insights on {{firm}}'s culture.

Your advice about {{advice_given}} was particularly valuable, and I've already started looking into {{action_item}}.

I hope our paths cross again soon. Please don't hesitate to reach out if there's ever anything I can help with.

Best,
{{my_name}}`,
    variables: ['name', 'specific_topic', 'firm', 'advice_given', 'action_item', 'my_name'],
    tone: 'friendly',
    usageCount: 38
  },
  {
    id: '3',
    name: 'Follow-up After No Response',
    category: 'follow_up',
    subject: 'Re: {{original_subject}}',
    body: `Hi {{name}},

I hope you're doing well. I wanted to follow up on my email from {{days_ago}} days ago regarding {{topic}}.

I understand you're busy, but I'd still love to connect if you have any availability in the coming weeks. I'm particularly interested in discussing {{specific_interest}}.

Looking forward to hearing from you.

Best,
{{my_name}}`,
    variables: ['name', 'original_subject', 'days_ago', 'topic', 'specific_interest', 'my_name'],
    tone: 'professional',
    usageCount: 27
  },
  {
    id: '4',
    name: 'Superday Thank You',
    category: 'thank_you',
    subject: 'Thank you - {{firm}} Superday',
    body: `Hi {{name}},

Thank you for taking the time to interview me during {{firm}}'s Superday process. I really enjoyed our conversation about {{discussion_topic}} and learning more about the team's approach to {{specific_area}}.

After meeting with everyone, I'm even more excited about the opportunity to join {{firm}}. The {{quality}} culture and {{aspect}} really resonate with what I'm looking for in my career.

Please let me know if you need any additional information from me. I look forward to hearing from the team soon.

Best regards,
{{my_name}}`,
    variables: ['name', 'firm', 'discussion_topic', 'specific_area', 'quality', 'aspect', 'my_name'],
    tone: 'formal',
    usageCount: 15
  },
  {
    id: '5',
    name: 'Referral Request',
    category: 'cold_outreach',
    subject: '{{firm}} Application - Referral Request',
    body: `Hi {{name}},

I hope you're well. I'm reaching out because I'm planning to apply to {{firm}}'s {{position}} position and would be incredibly grateful for a referral.

I've been following {{firm}}'s work for some time, particularly {{recent_initiative}}, and believe my experience in {{relevant_experience}} would allow me to contribute meaningfully to the team.

I've attached my resume for your reference. I completely understand if you're not comfortable providing a referral, but any advice on the application process would be greatly appreciated.

Thank you for considering my request.

Best,
{{my_name}}`,
    variables: ['name', 'firm', 'position', 'recent_initiative', 'relevant_experience', 'my_name'],
    tone: 'professional',
    usageCount: 23
  }
]

const CATEGORY_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  cold_outreach: { label: 'Cold Outreach', color: 'blue', icon: Mail },
  follow_up: { label: 'Follow-up', color: 'amber', icon: RefreshCw },
  thank_you: { label: 'Thank You', color: 'emerald', icon: Star },
  interview_prep: { label: 'Interview Prep', color: 'purple', icon: Briefcase },
  offer_negotiation: { label: 'Offer Negotiation', color: 'pink', icon: Sparkles }
}

interface EmailTemplateManagerProps {
  contacts: any[]
  applications: any[]
  onSendEmail?: (template: EmailTemplate, variables: Record<string, string>) => void
}

export function EmailTemplateManager({ contacts, applications, onSendEmail }: EmailTemplateManagerProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showComposer, setShowComposer] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleUseTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    // Pre-fill with smart defaults
    const defaults: Record<string, string> = { my_name: 'Your Name' }
    template.variables.forEach(v => {
      if (!defaults[v]) defaults[v] = ''
    })
    setVariableValues(defaults)
    setShowComposer(true)
  }

  const generatePreview = (template: EmailTemplate, values: Record<string, string>) => {
    let preview = template.body
    Object.entries(values).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`)
    })
    return preview
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-pink-400" />
            Email Templates
          </h2>
          <p className="text-slate-400 mt-1">Pre-written templates for every recruiting scenario</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-pink-500 hover:to-purple-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard 
          label="Total Templates" 
          value={templates.length} 
          icon={Mail} 
          color="pink"
        />
        <StatCard 
          label="Times Used" 
          value={templates.reduce((acc, t) => acc + t.usageCount, 0)} 
          icon={Send} 
          color="purple"
        />
        <StatCard 
          label="Categories" 
          value={Object.keys(CATEGORY_LABELS).length} 
          icon={Briefcase} 
          color="blue"
        />
        <StatCard 
          label="Most Used" 
          value={templates.sort((a, b) => b.usageCount - a.usageCount)[0]?.name || 'None'} 
          icon={Star} 
          color="amber"
          isText
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              categoryFilter === 'all'
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                categoryFilter === key
                  ? `bg-${config.color}-500/20 text-${config.color}-400 border border-${config.color}-500/30`
                  : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template, index) => {
          const category = CATEGORY_LABELS[template.category]
          const Icon = category.icon

          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-5 hover:border-pink-500/30 transition-all cursor-pointer group"
              onClick={() => handleUseTemplate(template)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${category.color}-500/10 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${category.color}-400`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-pink-400 transition-colors">
                      {template.name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-${category.color}-500/10 text-${category.color}-400`}>
                      {category.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Send className="w-3 h-3" />
                  {template.usageCount}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm text-slate-400 truncate">
                  <span className="text-slate-500">Subject:</span> {template.subject}
                </p>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {template.variables.map(v => (
                  <span key={v} className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {v}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  template.tone === 'professional' ? 'bg-blue-500/10 text-blue-400' :
                  template.tone === 'friendly' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-purple-500/10 text-purple-400'
                }`}>
                  {template.tone}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopy(template.body, template.id)
                  }}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {copiedId === template.id ? (
                    <><Check className="w-3 h-3" /> Copied</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copy</>
                  )}
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Composer Modal */}
      <AnimatePresence>
        {showComposer && selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowComposer(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-strong rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                      <Edit3 className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedTemplate.name}</h2>
                      <p className="text-sm text-slate-400">Fill in the variables to customize</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowComposer(false)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Variables Form */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                  <input
                    type="text"
                    value={generatePreview(selectedTemplate, variableValues).split('\n')[0]}
                    readOnly
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedTemplate.variables.map(variable => (
                    <div key={variable}>
                      <label className="block text-sm font-medium text-slate-300 mb-2 capitalize">
                        {variable.replace(/_/g, ' ')}
                      </label>
                      <input
                        type="text"
                        value={variableValues[variable] || ''}
                        onChange={(e) => setVariableValues(prev => ({ ...prev, [variable]: e.target.value }))}
                        placeholder={`Enter ${variable.replace(/_/g, ' ')}...`}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Preview</label>
                  <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">
                      {generatePreview(selectedTemplate, variableValues)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-700/50 flex justify-between">
                <button
                  onClick={() => handleCopy(generatePreview(selectedTemplate, variableValues), 'preview')}
                  className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  {copiedId === 'preview' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  Copy to Clipboard
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowComposer(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onSendEmail?.(selectedTemplate, variableValues)
                      setShowComposer(false)
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-medium hover:from-pink-500 hover:to-purple-500 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Use Template
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color, isText }: { 
  label: string
  value: string | number
  icon: any
  color: string
  isText?: boolean
}) {
  const colorClasses: Record<string, { bg: string; icon: string }> = {
    pink: { bg: 'bg-pink-500/10', icon: 'text-pink-400' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400' },
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400' },
    amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400' },
  }

  const colors = colorClasses[color]

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${colors.icon}`} />
        </div>
      </div>
      <div className={`${isText ? 'text-sm' : 'text-2xl'} font-bold text-white truncate`}>
        {value}
      </div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  )
}
