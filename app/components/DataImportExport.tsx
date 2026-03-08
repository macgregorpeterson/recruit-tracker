'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, 
  Upload, 
  FileJson, 
  FileSpreadsheet,
  Check,
  AlertCircle,
  X,
  Database,
  RefreshCw,
  Trash2,
  Save,
  Calendar,
  Users,
  Briefcase,
  FileText
} from 'lucide-react'

interface DataImportExportProps {
  contacts: any[]
  applications: any[]
  events: any[]
  notes: any[]
  onImport: (data: any) => void
}

interface ImportPreview {
  contacts: number
  applications: number
  events: number
  notes: number
  conflicts: string[]
}

export function DataImportExport({ contacts, applications, events, notes, onImport }: DataImportExportProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export')
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json')
  const [selectedData, setSelectedData] = useState({
    contacts: true,
    applications: true,
    events: true,
    notes: true
  })
  const [isDragging, setIsDragging] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const exportData: any = {
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    if (selectedData.contacts) exportData.contacts = contacts
    if (selectedData.applications) exportData.applications = applications
    if (selectedData.events) exportData.events = events
    if (selectedData.notes) exportData.notes = notes

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recruittracker-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileSelect = (file: File) => {
    setImportFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        setImportPreview({
          contacts: data.contacts?.length || 0,
          applications: data.applications?.length || 0,
          events: data.events?.length || 0,
          notes: data.notes?.length || 0,
          conflicts: []
        })
      } catch (err) {
        alert('Invalid file format. Please upload a valid JSON export.')
        setImportFile(null)
      }
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/json') {
      handleFileSelect(file)
    } else {
      alert('Please upload a JSON file')
    }
  }

  const handleImport = () => {
    if (!importFile) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        onImport(data)
        setImportFile(null)
        setImportPreview(null)
        setShowConfirmation(true)
        setTimeout(() => setShowConfirmation(false), 3000)
      } catch (err) {
        alert('Error importing data')
      }
    }
    reader.readAsText(importFile)
  }

  const stats = {
    contacts: contacts.length,
    applications: applications.length,
    events: events.length,
    notes: notes.length
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Database className="w-6 h-6 text-indigo-400" />
          Data Management
        </h2>
        <p className="text-slate-400 mt-1">Export, import, and backup your recruiting data</p>
      </div>

      {/* Data Stats */}
      <div className="grid grid-cols-4 gap-4">
        <DataStatCard label="Contacts" value={stats.contacts} icon={Users} color="blue" />
        <DataStatCard label="Applications" value={stats.applications} icon={Briefcase} color="indigo" />
        <DataStatCard label="Events" value={stats.events} icon={Calendar} color="purple" />
        <DataStatCard label="Notes" value={stats.notes} icon={FileText} color="emerald" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'export'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'import'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4" />
          Import
        </button>
      </div>

      {/* Export Tab */}
      {activeTab === 'export' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="font-semibold text-white mb-4">Export Data</h3>
          
          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm text-slate-400 mb-3">Export Format</label>
            <div className="flex gap-3">
              <button
                onClick={() => setExportFormat('json')}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  exportFormat === 'json'
                    ? 'border-indigo-500/50 bg-indigo-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <FileJson className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-white">JSON</div>
                  <div className="text-xs text-slate-400">Complete data with all fields</div>
                </div>
              </button>
              
              <button
                onClick={() => setExportFormat('csv')}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  exportFormat === 'csv'
                    ? 'border-indigo-500/50 bg-indigo-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-white">CSV</div>
                  <div className="text-xs text-slate-400">Spreadsheet format</div>
                </div>
              </button>
            </div>
          </div>

          {/* Data Selection */}
          <div className="mb-6">
            <label className="block text-sm text-slate-400 mb-3">Select Data to Export</label>
            <div className="space-y-2">
              {Object.entries(selectedData).map(([key, value]) => (
                <label key={key} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 cursor-pointer hover:bg-slate-800/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setSelectedData(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500/50"
                  />
                  <span className="capitalize text-slate-200">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="ml-auto text-sm text-slate-500">
                    {stats[key as keyof typeof stats]} items
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={!Object.values(selectedData).some(Boolean)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Download Export
          </button>
        </motion.div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`glass-card p-8 text-center cursor-pointer transition-all ${
              isDragging ? 'border-indigo-500/50 bg-indigo-500/10' : ''
            } ${importFile ? 'border-emerald-500/50' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            
            {importFile ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <FileJson className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-white">{importFile.name}</div>
                  <div className="text-sm text-slate-400">{(importFile.size / 1024).toFixed(1)} KB</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setImportFile(null); setImportPreview(null) }}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-medium text-white mb-2">Drop your backup file here</h3>
                <p className="text-sm text-slate-400">or click to browse</p>
                <p className="text-xs text-slate-500 mt-2">Supports JSON exports from RecruitTracker</p>
              </>
            )}
          </div>

          {/* Import Preview */}
          <AnimatePresence>
            {importPreview && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card p-6"
              >
                <h3 className="font-semibold text-white mb-4">Import Preview</h3>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <PreviewStat label="Contacts" value={importPreview.contacts} icon={Users} color="blue" />
                  <PreviewStat label="Applications" value={importPreview.applications} icon={Briefcase} color="indigo" />
                  <PreviewStat label="Events" value={importPreview.events} icon={Calendar} color="purple" />
                  <PreviewStat label="Notes" value={importPreview.notes} icon={FileText} color="emerald" />
                </div>

                {importPreview.conflicts.length > 0 && (
                  <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Potential Conflicts</span>
                    </div>
                    <ul className="text-sm text-slate-300 space-y-1">
                      {importPreview.conflicts.map((conflict, i) => (
                        <li key={i}>• {conflict}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => { setImportFile(null); setImportPreview(null) }}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-medium hover:from-emerald-500 hover:to-green-500 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Import Data
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Success Message */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 right-6 glass-strong p-4 rounded-xl flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="font-medium text-white">Import Successful</div>
              <div className="text-sm text-slate-400">Your data has been imported</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DataStatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400' },
    indigo: { bg: 'bg-indigo-500/10', icon: 'text-indigo-400' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400' },
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400' },
  }

  const colors = colorClasses[color]

  return (
    <div className="glass-card p-4 text-center">
      <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center mx-auto mb-2`}>
        <Icon className={`w-5 h-5 ${colors.icon}`} />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  )
}

function PreviewStat({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-400',
    indigo: 'text-indigo-400',
    purple: 'text-purple-400',
    emerald: 'text-emerald-400',
  }

  return (
    <div className="text-center p-3 bg-slate-800/30 rounded-lg">
      <Icon className={`w-5 h-5 ${colorClasses[color]} mx-auto mb-1`} />
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  )
}
