'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  X, 
  Download, 
  Users, 
  Building2, 
  Mail,
  Phone,
  Linkedin,
  Calendar,
  Tag,
  ChevronRight,
  CheckCircle2,
  Loader2,
  FileSpreadsheet,
  Briefcase
} from 'lucide-react'
import { Contact, Application } from '../types'

interface CoverageBookExportProps {
  contacts: Contact[]
  applications: Application[]
  isOpen: boolean
  onClose: () => void
}

type ExportFormat = 'pdf' | 'csv' | 'markdown'
type ExportSection = 'contacts' | 'applications' | 'summary' | 'stats'

export function CoverageBookExport({ 
  contacts, 
  applications,
  isOpen, 
  onClose 
}: CoverageBookExportProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf')
  const [selectedSections, setSelectedSections] = useState<ExportSection[]>(['contacts', 'applications', 'summary'])
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)
  const [title, setTitle] = useState('My Coverage Book')

  const toggleSection = (section: ExportSection) => {
    setSelectedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const generateCSV = () => {
    let csv = ''
    
    if (selectedSections.includes('contacts')) {
      csv += 'Contacts\n'
      csv += 'Name,Firm,Title,Email,Phone,Tags\n'
      contacts.forEach(c => {
        csv += `"${c.name}","${c.firm}","${c.title}","${c.email}","${c.phone || ''}","${c.tags?.join(', ') || ''}"\n`
      })
      csv += '\n'
    }

    if (selectedSections.includes('applications')) {
      csv += 'Applications\n'
      csv += 'Firm,Role,Status,Applied Date,Deadline\n'
      applications.forEach(a => {
        csv += `"${a.firm}","${a.role}","${a.status}","${a.applied_date || ''}","${a.deadline_date || ''}"\n`
      })
    }

    return csv
  }

  const generateMarkdown = () => {
    let md = `# ${title}\n\n`
    md += `Generated on ${new Date().toLocaleDateString()}\n\n`
    md += `---\n\n`

    if (selectedSections.includes('summary')) {
      md += `## Summary\n\n`
      md += `- **Total Contacts:** ${contacts.length}\n`
      md += `- **Total Applications:** ${applications.length}\n`
      md += `- **Active Applications:** ${applications.filter(a => !['rejected', 'withdrawn', 'accepted'].includes(a.status)).length}\n`
      md += `- **Offers Received:** ${applications.filter(a => a.status === 'offer').length}\n\n`
    }

    if (selectedSections.includes('contacts')) {
      md += `## Contacts (${contacts.length})\n\n`
      const firms = Array.from(new Set(contacts.map(c => c.firm))).sort()
      
      firms.forEach(firm => {
        const firmContacts = contacts.filter(c => c.firm === firm)
        md += `### ${firm}\n\n`
        firmContacts.forEach(c => {
          md += `- **${c.name}** - ${c.title}\n`
          md += `  - Email: ${c.email}\n`
          if (c.phone) md += `  - Phone: ${c.phone}\n`
          if (c.linkedin_url) md += `  - LinkedIn: ${c.linkedin_url}\n`
          if (c.tags?.length) md += `  - Tags: ${c.tags.join(', ')}\n`
          md += `\n`
        })
      })
    }

    if (selectedSections.includes('applications')) {
      md += `## Applications (${applications.length})\n\n`
      const statusOrder = ['offer', 'superday', 'second-round', 'first-round', 'phone-screen', 'applied', 'rejected', 'withdrawn']
      
      statusOrder.forEach(status => {
        const apps = applications.filter(a => a.status === status)
        if (apps.length > 0) {
          md += `### ${status.replace('-', ' ').toUpperCase()} (${apps.length})\n\n`
          apps.forEach(a => {
            md += `- **${a.firm}** - ${a.role}\n`
            if (a.applied_date) md += `  - Applied: ${a.applied_date}\n`
            if (a.deadline_date) md += `  - Deadline: ${a.deadline_date}\n`
            if (a.location) md += `  - Location: ${a.location}\n`
            md += `\n`
          })
        }
      })
    }

    if (selectedSections.includes('stats')) {
      md += `## Statistics\n\n`
      const firmCounts: Record<string, number> = {}
      contacts.forEach(c => {
        firmCounts[c.firm] = (firmCounts[c.firm] || 0) + 1
      })
      
      md += `### Contacts by Firm\n\n`
      Object.entries(firmCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([firm, count]) => {
          md += `- ${firm}: ${count} contact${count !== 1 ? 's' : ''}\n`
        })
    }

    return md
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    let content = ''
    let filename = ''
    let mimeType = ''

    switch (format) {
      case 'csv':
        content = generateCSV()
        filename = `${title.replace(/\s+/g, '_')}.csv`
        mimeType = 'text/csv'
        break
      case 'markdown':
        content = generateMarkdown()
        filename = `${title.replace(/\s+/g, '_')}.md`
        mimeType = 'text/markdown'
        break
      case 'pdf':
        // For PDF, we'll generate HTML and print
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(generatePrintableHTML())
          printWindow.document.close()
          printWindow.print()
        }
        setIsExporting(false)
        setExportComplete(true)
        setTimeout(() => {
          setExportComplete(false)
          onClose()
        }, 1000)
        return
    }

    // Download file
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setIsExporting(false)
    setExportComplete(true)
    setTimeout(() => {
      setExportComplete(false)
      onClose()
    }, 1000)
  }

  const generatePrintableHTML = () => {
    const statusColors: Record<string, string> = {
      'offer': '#10b981',
      'superday': '#8b5cf6',
      'second-round': '#f97316',
      'first-round': '#eab308',
      'phone-screen': '#3b82f6',
      'applied': '#64748b',
      'rejected': '#ef4444',
      'withdrawn': '#6b7280'
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #1e293b; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px;
          }
          h1 { color: #0f172a; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px; }
          h2 { color: #1e293b; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
          h3 { color: #334155; margin-top: 20px; margin-bottom: 10px; }
          .summary-box { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
          .summary-item { text-align: center; padding: 15px; background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .summary-number { font-size: 24px; font-weight: bold; color: #3b82f6; }
          .contact-card { background: #f8fafc; padding: 15px; margin-bottom: 10px; border-radius: 6px; border-left: 4px solid #3b82f6; }
          .contact-name { font-weight: 600; color: #0f172a; }
          .contact-title { color: #64748b; font-size: 14px; }
          .contact-meta { color: #94a3b8; font-size: 13px; margin-top: 5px; }
          .application-card { padding: 12px 15px; margin-bottom: 8px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
          .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; color: white; }
          .tag { display: inline-block; padding: 2px 8px; background: #e2e8f0; border-radius: 4px; font-size: 12px; margin-right: 5px; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p style="color: #64748b; margin-bottom: 30px;">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        ${selectedSections.includes('summary') ? `
        <div class="summary-box">
          <h2 style="margin-top: 0;">Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-number">${contacts.length}</div>
              <div style="color: #64748b; font-size: 14px;">Total Contacts</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${applications.length}</div>
              <div style="color: #64748b; font-size: 14px;">Applications</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${applications.filter(a => !['rejected', 'withdrawn', 'accepted'].includes(a.status)).length}</div>
              <div style="color: #64748b; font-size: 14px;">Active Pipeline</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${applications.filter(a => a.status === 'offer').length}</div>
              <div style="color: #64748b; font-size: 14px;">Offers</div>
            </div>
          </div>
        </div>
        ` : ''}
        
        ${selectedSections.includes('contacts') ? `
        <h2>Contacts (${contacts.length})</h2>
        ${contacts.map(c => `
          <div class="contact-card">
            <div>
              <div class="contact-name">${c.name}</div>
              <div class="contact-title">${c.title} at ${c.firm}</div>
              <div class="contact-meta">
                ${c.email} ${c.phone ? '• ' + c.phone : ''}
              </div>
              ${c.tags?.length ? `<div style="margin-top: 8px;">${c.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
            </div>
          </div>
        `).join('')}
        ` : ''}
        
        ${selectedSections.includes('applications') ? `
        <h2>Applications (${applications.length})</h2>
        ${applications.map(a => `
          <div class="application-card" style="background: ${statusColors[a.status] + '15' || '#f1f5f9'};">
            <div>
              <div style="font-weight: 600;">${a.firm}</div>
              <div style="font-size: 14px; color: #64748b;">${a.role}</div>
            </div>
            <span class="status-badge" style="background: ${statusColors[a.status] || '#64748b'};">
              ${a.status.replace('-', ' ')}
            </span>
          </div>
        `).join('')}
        ` : ''}
        
        ${selectedSections.includes('stats') ? `
        <h2>Statistics</h2>
        <h3>Top Firms by Contacts</h3>
        ${Object.entries(contacts.reduce((acc, c) => {
          acc[c.firm] = (acc[c.firm] || 0) + 1
          return acc
        }, {} as Record<string, number>))
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([firm, count]) => `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
              <span>${firm}</span>
              <span style="font-weight: 600;">${count}</span>
            </div>
          `).join('')}
        ` : ''}
      </body>
      </html>
    `
  }

  const sections = [
    { id: 'summary' as ExportSection, label: 'Summary Statistics', icon: FileSpreadsheet, description: 'Overview of your recruiting activity' },
    { id: 'contacts' as ExportSection, label: 'Contacts', icon: Users, description: `${contacts.length} contacts` },
    { id: 'applications' as ExportSection, label: 'Applications', icon: Briefcase, description: `${applications.length} applications` },
    { id: 'stats' as ExportSection, label: 'Detailed Statistics', icon: FileText, description: 'Breakdowns and analytics' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Export Coverage Book</h3>
                  <p className="text-sm text-slate-400">Generate a professional export of your recruiting data</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Export Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="My Coverage Book"
                />
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['pdf', 'csv', 'markdown'] as ExportFormat[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        format === f
                          ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {format === 'pdf' && 'Best for printing and sharing. Opens print dialog.'}
                  {format === 'csv' && 'Best for spreadsheets. Opens in Excel/Google Sheets.'}
                  {format === 'markdown' && 'Best for documentation. Editable text format.'}
                </p>
              </div>

              {/* Sections Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Include Sections
                </label>
                <div className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon
                    const isSelected = selectedSections.includes(section.id)
                    return (
                      <button
                        key={section.id}
                        onClick={() => toggleSection(section.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                          isSelected
                            ? 'bg-blue-500/5 border-blue-500/30'
                            : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-blue-500/20' : 'bg-slate-700/50'
                        }`}>
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {section.label}
                          </div>
                          <div className="text-sm text-slate-500">{section.description}</div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-slate-600'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Preview Stats */}
              <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Export Preview</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {selectedSections.includes('contacts') ? contacts.length : 0}
                    </div>
                    <div className="text-xs text-slate-500">Contacts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {selectedSections.includes('applications') ? applications.length : 0}
                    </div>
                    <div className="text-xs text-slate-500">Applications</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{selectedSections.length}</div>
                    <div className="text-xs text-slate-500">Sections</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || selectedSections.length === 0}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : exportComplete ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Complete!
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export {format.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default CoverageBookExport
