'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  FileText, 
  Copy, 
  Check, 
  RefreshCw,
  Building2,
  Target,
  User,
  Briefcase,
  Lightbulb,
  Star,
  Wand2,
  Download,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Palette,
  Type,
  Hash
} from 'lucide-react'
import { Application, Contact } from '../types'

interface AICoverLetterGeneratorProps {
  applications: Application[]
  contacts: Contact[]
  onSaveLetter?: (letter: SavedCoverLetter) => void
  savedLetters?: SavedCoverLetter[]
}

export interface SavedCoverLetter {
  id: string
  firm: string
  role: string
  content: string
  template: string
  tone: string
  createdAt: string
  isCustomized: boolean
}

interface Template {
  id: string
  name: string
  description: string
  structure: string[]
  icon: React.ElementType
}

const TEMPLATES: Template[] = [
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Traditional structure with clear value proposition',
    structure: ['Hook', 'Experience', 'Fit', 'Closing'],
    icon: FileText
  },
  {
    id: 'story',
    name: 'Story-Driven',
    description: 'Narrative approach highlighting your journey',
    structure: ['Opening Story', 'Skills Development', 'Why This Firm', 'Call to Action'],
    icon: Star
  },
  {
    id: 'technical',
    name: 'Technical Focus',
    description: 'Emphasizes analytical skills and deal experience',
    structure: ['Technical Hook', 'Deal Experience', 'Analysis Skills', 'Interest in Firm'],
    icon: Target
  },
  {
    id: 'networking',
    name: 'Networking Referral',
    description: 'Leverages existing connections at the firm',
    structure: ['Referral Mention', 'Background', 'Shared Values', 'Next Steps'],
    icon: User
  }
]

const TONES = [
  { id: 'professional', name: 'Professional', description: 'Formal and polished' },
  { id: 'enthusiastic', name: 'Enthusiastic', description: 'High energy and passionate' },
  { id: 'confident', name: 'Confident', description: 'Assertive and direct' },
  { id: 'humble', name: 'Humble & Curious', description: 'Eager to learn and grow' }
]

const FIRM_SPECIFIC_TIPS: Record<string, string[]> = {
  'Goldman Sachs': ['Emphasize teamwork and client service', 'Mention risk management awareness', 'Reference their 14 Business Principles'],
  'Morgan Stanley': ['Highlight technology focus', 'Mention commitment to diversity', 'Reference their "First Class Business" motto'],
  'JPMorgan': ['Emphasize global reach', 'Mention innovation mindset', 'Reference their "How We Do Business"'],
  'Evercore': ['Highlight independent advice focus', 'Mention founder-led culture', 'Reference their elite advisory model'],
  'Centerview': ['Emphasize quality over quantity', 'Mention long-term relationships', 'Reference their partnership culture'],
  'Lazard': ['Highlight financial advisory heritage', 'Mention global platform', 'Reference their independent structure'],
  'Blackstone': ['Emphasize intellectual curiosity', 'Mention long-term thinking', 'Reference their entrepreneurial culture'],
  'KKR': ['Highlight ownership mentality', 'Mention operational value-add', 'Reference their partnership model'],
  'Carlyle': ['Emphasize global network', 'Mention sector expertise', 'Reference their "One Carlyle" culture']
}

export function AICoverLetterGenerator({ 
  applications, 
  contacts,
  onSaveLetter,
  savedLetters = [] 
}: AICoverLetterGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('classic')
  const [selectedTone, setSelectedTone] = useState<string>('professional')
  const [selectedApplication, setSelectedApplication] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [userSchool, setUserSchool] = useState<string>('')
  const [keyExperience, setKeyExperience] = useState<string>('')
  const [whyThisFirm, setWhyThisFirm] = useState<string>('')
  const [generatedLetter, setGeneratedLetter] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'generate' | 'saved' | 'tips'>('generate')
  const [expandedFirm, setExpandedFirm] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [wordCount, setWordCount] = useState(0)

  const selectedApp = useMemo(() => 
    applications.find(a => a.id === selectedApplication),
    [applications, selectedApplication]
  )

  const firmContacts = useMemo(() =>
    contacts.filter(c => c.firm === selectedApp?.firm),
    [contacts, selectedApp]
  )

  const generateLetter = async () => {
    setIsGenerating(true)
    
    // Simulate AI generation with sophisticated template logic
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const template = TEMPLATES.find(t => t.id === selectedTemplate)
    const tone = TONES.find(t => t.id === selectedTone)
    const firm = selectedApp?.firm || '[Firm Name]'
    const role = selectedApp?.role || '[Position]'
    
    // Build personalized content based on inputs
    const letter = buildPersonalizedLetter({
      template: template!,
      tone: tone!,
      firm,
      role,
      userName: userName || '[Your Name]',
      userSchool: userSchool || '[Your School]',
      keyExperience: keyExperience || 'relevant experience',
      whyThisFirm: whyThisFirm || 'your outstanding reputation and track record',
      hasReferral: firmContacts.length > 0,
      referralName: firmContacts[0]?.name
    })
    
    setGeneratedLetter(letter)
    setEditedContent(letter)
    setWordCount(letter.split(/\s+/).length)
    setIsGenerating(false)
  }

  const buildPersonalizedLetter = (params: {
    template: Template
    tone: { id: string; name: string; description: string }
    firm: string
    role: string
    userName: string
    userSchool: string
    keyExperience: string
    whyThisFirm: string
    hasReferral: boolean
    referralName?: string
  }): string => {
    const { template, tone, firm, role, userName, userSchool, keyExperience, whyThisFirm, hasReferral, referralName } = params
    
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    
    // Tone modifiers
    const opening = tone.id === 'enthusiastic' 
      ? `I am thrilled to apply`
      : tone.id === 'confident'
      ? `I am writing to express my strong interest`
      : tone.id === 'humble'
      ? `I am excited to learn of the opportunity`
      : `I am writing to apply`
    
    const hook = template.id === 'networking' && hasReferral
      ? `${opening} for the ${role} position at ${firm}. ${referralName} spoke highly of the team's collaborative culture and suggested I would be a strong fit.`
      : template.id === 'story'
      ? `My passion for investment banking began during my sophomore year when I completed my first valuation model. ${opening} for the ${role} position at ${firm} to further develop this passion.`
      : template.id === 'technical'
      ? `${opening} for the ${role} position at ${firm}. My experience with ${keyExperience} has prepared me to contribute immediately to your team.`
      : `${opening} for the ${role} position at ${firm}. As a student at ${userSchool} with experience in ${keyExperience}, I am eager to contribute to your team.`
    
    const body = `Throughout my time at ${userSchool}, I have developed strong analytical and financial modeling skills through ${keyExperience}. I am particularly drawn to ${firm} because of ${whyThisFirm}. The opportunity to work alongside industry leaders while contributing to impactful transactions aligns perfectly with my career aspirations.`
    
    const closing = tone.id === 'confident'
      ? `I would welcome the opportunity to discuss how my skills can contribute to ${firm}'s continued success. Thank you for your consideration.`
      : tone.id === 'enthusiastic'
      ? `I am excited about the possibility of joining ${firm} and would welcome the opportunity to discuss my qualifications further. Thank you for your time and consideration.`
      : `I would appreciate the opportunity to discuss my qualifications further. Thank you for your time and consideration.`
    
    return `${date}

Hiring Committee
${firm}

Dear Hiring Committee,

${hook}

${body}

${closing}

Sincerely,
${userName}`
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(isEditing ? editedContent : generatedLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const saveLetter = () => {
    if (!selectedApp) return
    
    const letter: SavedCoverLetter = {
      id: Date.now().toString(),
      firm: selectedApp.firm,
      role: selectedApp.role,
      content: isEditing ? editedContent : generatedLetter,
      template: selectedTemplate,
      tone: selectedTone,
      createdAt: new Date().toISOString(),
      isCustomized: isEditing
    }
    
    onSaveLetter?.(letter)
  }

  const downloadLetter = () => {
    const content = isEditing ? editedContent : generatedLetter
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Cover_Letter_${selectedApp?.firm.replace(/\s+/g, '_')}_${selectedApp?.role.replace(/\s+/g, '_')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleEdit = () => {
    if (isEditing) {
      setGeneratedLetter(editedContent)
      setWordCount(editedContent.split(/\s+/).length)
    }
    setIsEditing(!isEditing)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-purple-400" />
            AI Cover Letter Generator
          </h2>
          <p className="text-slate-400 mt-1">Generate personalized, firm-specific cover letters in seconds</p>
        </div>
        <div className="flex items-center gap-2">
          {['generate', 'saved', 'tips'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'generate' && (
          <motion.div
            key="generate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Input Panel */}
            <div className="space-y-6">
              {/* Application Selection */}
              <div className="glass-card p-5">
                <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  Select Application
                </label>
                <select
                  value={selectedApplication}
                  onChange={(e) => setSelectedApplication(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="">Choose an application...</option>
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.firm} - {app.role}
                    </option>
                  ))}
                </select>
                {selectedApp && (
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-sm text-blue-300">
                      Generating for: <span className="font-semibold">{selectedApp.firm}</span>
                    </div>
                    {firmContacts.length > 0 && (
                      <div className="text-xs text-blue-400/70 mt-1">
                        💡 You have {firmContacts.length} contact(s) at this firm
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Template Selection */}
              <div className="glass-card p-5">
                <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-400" />
                  Choose Template
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.map(template => {
                    const Icon = template.icon
                    return (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedTemplate === template.id
                            ? 'bg-purple-500/10 border-purple-500/30'
                            : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${selectedTemplate === template.id ? 'text-purple-400' : 'text-slate-400'}`} />
                        <div className={`font-medium text-sm ${selectedTemplate === template.id ? 'text-white' : 'text-slate-300'}`}>
                          {template.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{template.description}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tone Selection */}
              <div className="glass-card p-5">
                <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <Type className="w-4 h-4 text-emerald-400" />
                  Select Tone
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TONES.map(tone => (
                    <button
                      key={tone.id}
                      onClick={() => setSelectedTone(tone.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedTone === tone.id
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className={`font-medium text-sm ${selectedTone === tone.id ? 'text-white' : 'text-slate-300'}`}>
                        {tone.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{tone.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Details */}
              <div className="glass-card p-5 space-y-4">
                <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  Your Information
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <input
                    type="text"
                    placeholder="Your School"
                    value={userSchool}
                    onChange={(e) => setUserSchool(e.target.value)}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <textarea
                  placeholder="Key experience (e.g., 'summer internship at boutique IB firm')"
                  value={keyExperience}
                  onChange={(e) => setKeyExperience(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                  rows={2}
                />
                <textarea
                  placeholder="Why this firm specifically?"
                  value={whyThisFirm}
                  onChange={(e) => setWhyThisFirm(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                  rows={2}
                />
              </div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateLetter}
                disabled={!selectedApplication || isGenerating}
                className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-xl font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Crafting your letter...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate Cover Letter
                  </>
                )}
              </motion.button>
            </div>

            {/* Preview Panel */}
            <div className="glass-card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <span className="font-medium text-white">Preview</span>
                  {wordCount > 0 && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {wordCount} words
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {generatedLetter && (
                    <>
                      <button
                        onClick={handleEdit}
                        className={`p-2 rounded-lg transition-colors ${
                          isEditing ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                        title={isEditing ? 'Save edits' : 'Edit letter'}
                      >
                        {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={copyToClipboard}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={downloadLetter}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Download as file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={saveLetter}
                        className="px-3 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 bg-slate-950/50 rounded-xl p-6 overflow-auto border border-slate-800">
                {generatedLetter ? (
                  isEditing ? (
                    <textarea
                      value={editedContent}
                      onChange={(e) => {
                        setEditedContent(e.target.value)
                        setWordCount(e.target.value.split(/\s+/).length)
                      }}
                      className="w-full h-full bg-transparent text-slate-300 font-mono text-sm resize-none focus:outline-none"
                      style={{ minHeight: '400px' }}
                    />
                  ) : (
                    <pre className="text-slate-300 font-mono text-sm whitespace-pre-wrap">
                      {generatedLetter}
                    </pre>
                  )
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <Sparkles className="w-12 h-12 mb-4 opacity-30" />
                    <p>Your AI-generated cover letter will appear here</p>
                    <p className="text-sm mt-2">Select an application and click Generate</p>
                  </div>
                )}
              </div>

              {generatedLetter && (
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Tip: Always personalize the generated letter before sending</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'saved' && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Saved Cover Letters</h3>
            {savedLetters.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No saved letters yet</p>
                <p className="text-sm mt-2">Generate and save your first cover letter</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedLetters.map(letter => (
                  <div
                    key={letter.id}
                    className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-white flex items-center gap-2">
                          {letter.firm}
                          {letter.isCustomized && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                              Edited
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-400">{letter.role}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(letter.createdAt).toLocaleDateString()} • {TONES.find(t => t.id === letter.tone)?.name} • {TEMPLATES.find(t => t.id === letter.template)?.name}
                        </div>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(letter.content)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'tips' && (
          <motion.div
            key="tips"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(FIRM_SPECIFIC_TIPS).map(([firm, tips]) => (
                <div
                  key={firm}
                  className="glass-card p-4 cursor-pointer"
                  onClick={() => setExpandedFirm(expandedFirm === firm ? null : firm)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-blue-400" />
                      <span className="font-medium text-white">{firm}</span>
                    </div>
                    {expandedFirm === firm ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <AnimatePresence>
                    {expandedFirm === firm && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <ul className="mt-3 space-y-2">
                          {tips.map((tip, i) => (
                            <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                              <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AICoverLetterGenerator
