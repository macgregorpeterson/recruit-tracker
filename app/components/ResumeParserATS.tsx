'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  RefreshCw,
  Download,
  Target,
  Zap,
  Search,
  Copy,
  Check,
  FileCheck,
  BarChart3,
  Lightbulb,
  Wand2,
  X
} from 'lucide-react'

interface ParsedResume {
  name: string
  email: string
  phone: string
  linkedin?: string
  skills: string[]
  experience: Experience[]
  education: Education[]
  atsScore: number
  issues: ATSIssue[]
  suggestions: string[]
}

interface Experience {
  company: string
  title: string
  duration: string
  bullets: string[]
}

interface Education {
  school: string
  degree: string
  year: string
}

interface ATSIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  fix?: string
}

interface JobMatch {
  score: number
  matched: string[]
  missing: string[]
}

export function ResumeParserATS() {
  const [isDragging, setIsDragging] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [jobMatch, setJobMatch] = useState<JobMatch | null>(null)
  const [activeTab, setActiveTab] = useState<'parse' | 'optimize' | 'match'>('parse')
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [])

  const handleFileUpload = (file: File) => {
    setIsParsing(true)
    // Simulate parsing with a delay
    setTimeout(() => {
      setParsedResume(generateMockParsedResume())
      setIsParsing(false)
    }, 2000)
  }

  const generateMockParsedResume = (): ParsedResume => ({
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '(555) 123-4567',
    linkedin: 'linkedin.com/in/alexjohnson',
    skills: ['Financial Modeling', 'Valuation', 'Excel', 'Python', 'SQL', 'PowerPoint', 'DCF Analysis', 'M&A', 'LBO Modeling'],
    experience: [
      {
        company: 'Investment Bank ABC',
        title: 'Summer Analyst',
        duration: 'Jun 2024 - Aug 2024',
        bullets: [
          'Built comprehensive financial models including DCF, LBO, and M&A analyses',
          'Prepared pitch books and client presentations for 5+ live deals',
          'Conducted due diligence on target companies across TMT sector'
        ]
      },
      {
        company: 'University Investment Club',
        title: 'Portfolio Manager',
        duration: 'Sep 2023 - Present',
        bullets: [
          'Managed $500K portfolio with 12% annual returns',
          'Led team of 8 analysts covering technology sector',
          'Presented investment theses to alumni investors'
        ]
      }
    ],
    education: [
      {
        school: 'University of Pennsylvania',
        degree: 'B.S. Economics, Concentration in Finance',
        year: '2022 - 2026'
      }
    ],
    atsScore: 78,
    issues: [
      { type: 'error', message: 'Missing graduation date', fix: 'Add expected graduation date' },
      { type: 'warning', message: 'Tables detected - may cause parsing issues', fix: 'Use simple formatting' },
      { type: 'warning', message: 'Small font size detected', fix: 'Use 10-12pt font' },
      { type: 'info', message: 'Consider adding more quantifiable achievements' }
    ],
    suggestions: [
      'Add measurable results (%, $, #) to bullet points',
      'Include relevant coursework for entry-level positions',
      'Add technical skills section with proficiency levels',
      'Remove graphics and charts that ATS cannot read'
    ]
  })

  const analyzeJobMatch = () => {
    if (!jobDescription || !parsedResume) return
    
    const keywords = jobDescription.toLowerCase().match(/\b\w{4,}\b/g) || []
    const resumeText = parsedResume.skills.join(' ').toLowerCase()
    
    const matched = keywords.filter(k => resumeText.includes(k)).slice(0, 8)
    const missing = ['Financial Modeling', 'Valuation', 'Excel', 'Due Diligence', 'Client Relations']
      .filter(k => !resumeText.includes(k.toLowerCase()))
    
    setJobMatch({
      score: Math.round((matched.length / (matched.length + missing.length)) * 100),
      matched: [...new Set(matched)].slice(0, 5),
      missing: missing.slice(0, 5)
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30'
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30'
    return 'bg-red-500/20 border-red-500/30'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <FileCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Resume Parser & ATS Optimizer</h2>
            <p className="text-slate-400">AI-powered resume analysis and ATS compatibility scoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-sm text-violet-300">AI Powered</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50">
        {[
          { id: 'parse', label: 'Parse Resume', icon: FileText },
          { id: 'optimize', label: 'ATS Score', icon: Target },
          { id: 'match', label: 'Job Match', icon: Search },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-slate-700 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Parse Tab */}
      {activeTab === 'parse' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {!parsedResume ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                isDragging
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
              />
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
                  isDragging ? 'bg-violet-500/20' : 'bg-slate-700/50'
                }`}>
                  {isParsing ? (
                    <RefreshCw className="w-8 h-8 text-violet-400 animate-spin" />
                  ) : (
                    <Upload className={`w-8 h-8 ${isDragging ? 'text-violet-400' : 'text-slate-400'}`} />
                  )}
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {isParsing ? 'Parsing Resume...' : 'Drop your resume here'}
                </h3>
                <p className="text-sm text-slate-400">
                  {isParsing ? 'Extracting skills, experience, and formatting...' : 'Support PDF, DOC, DOCX, or TXT files'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Parsed Data */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Extracted Information</h3>
                    <button
                      onClick={() => setParsedResume(null)}
                      className="text-sm text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Parse Another
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="p-4 bg-slate-700/30 rounded-xl">
                      <h4 className="text-sm font-medium text-slate-400 mb-3">Contact Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-slate-500">Name</span>
                          <p className="text-white font-medium">{parsedResume.name}</p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">Email</span>
                          <p className="text-white">{parsedResume.email}</p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">Phone</span>
                          <p className="text-white">{parsedResume.phone}</p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">LinkedIn</span>
                          <p className="text-blue-400">{parsedResume.linkedin}</p>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-3">Extracted Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {parsedResume.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-sm text-violet-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Experience */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-3">Experience</h4>
                      <div className="space-y-4">
                        {parsedResume.experience.map((exp, i) => (
                          <div key={i} className="p-4 bg-slate-700/30 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-white">{exp.title}</span>
                              <span className="text-sm text-slate-400">{exp.duration}</span>
                            </div>
                            <p className="text-slate-300 text-sm mb-2">{exp.company}</p>
                            <ul className="space-y-1">
                              {exp.bullets.map((bullet, j) => (
                                <li key={j} className="text-sm text-slate-400 flex items-start gap-2">
                                  <span className="text-violet-400 mt-1">•</span>
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-6">
                  <div className="text-center mb-6">
                    <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center border-4 ${getScoreBg(parsedResume.atsScore)}`}>
                      <span className={`text-3xl font-bold ${getScoreColor(parsedResume.atsScore)}`}>
                        {parsedResume.atsScore}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-white">ATS Score</h4>
                    <p className="text-sm text-slate-400">
                      {parsedResume.atsScore >= 80 ? 'Excellent!' : parsedResume.atsScore >= 60 ? 'Good, but improvable' : 'Needs optimization'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveTab('optimize')}
                      className="w-full py-3 px-4 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-xl text-violet-300 font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <Wand2 className="w-4 h-4" />
                      View Optimization Tips
                    </button>
                    <button className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-slate-300 font-medium transition-all flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Export Parsed Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Optimize Tab */}
      {activeTab === 'optimize' && parsedResume && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Issues List */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              Issues Found
            </h3>
            <div className="space-y-4">
              {parsedResume.issues.map((issue, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${
                    issue.type === 'error' 
                      ? 'bg-red-500/10 border-red-500/20' 
                      : issue.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/20'
                      : 'bg-blue-500/10 border-blue-500/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {issue.type === 'error' ? (
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    ) : issue.type === 'warning' ? (
                      <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${
                        issue.type === 'error' ? 'text-red-300' : issue.type === 'warning' ? 'text-amber-300' : 'text-blue-300'
                      }`}>
                        {issue.message}
                      </p>
                      {issue.fix && (
                        <p className="text-sm text-slate-400 mt-1">{issue.fix}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              AI Suggestions
            </h3>
            <div className="space-y-4">
              {parsedResume.suggestions.map((suggestion, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-xl"
                >
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-violet-400">{i + 1}</span>
                  </div>
                  <p className="text-slate-300">{suggestion}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="font-medium text-emerald-300">Quick Tip</p>
                  <p className="text-sm text-emerald-400/80">
                    Use standard section headers like "Experience" and "Education" for better ATS parsing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Job Match Tab */}
      {activeTab === 'match' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Job Description Analysis</h3>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to analyze keyword matching..."
              className="w-full h-48 px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
            />
            <button
              onClick={analyzeJobMatch}
              disabled={!jobDescription}
              className="mt-4 px-6 py-3 bg-violet-500 hover:bg-violet-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-medium transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Analyze Match
            </button>
          </div>

          {jobMatch && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Match Score */}
              <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-6 text-center">
                <h4 className="text-sm font-medium text-slate-400 mb-4">Keyword Match Score</h4>
                <div className={`w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center border-4 ${getScoreBg(jobMatch.score)}`}>
                  <span className={`text-4xl font-bold ${getScoreColor(jobMatch.score)}`}>
                    {jobMatch.score}%
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  {jobMatch.score >= 80 ? 'Strong match!' : jobMatch.score >= 60 ? 'Good match, room to improve' : 'Consider tailoring your resume'}
                </p>
              </div>

              {/* Matched Keywords */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                <h4 className="text-sm font-medium text-emerald-400 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Matched Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {jobMatch.matched.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-300"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Keywords */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                <h4 className="text-sm font-medium text-amber-400 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Missing Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {jobMatch.missing.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-sm text-amber-300"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-4">
                  Consider adding these skills to your resume if you have experience with them
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
