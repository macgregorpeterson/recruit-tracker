'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FolderOpen,
  FileText,
  Upload,
  Trash2,
  Download,
  Search,
  Plus,
  File,
  FileSpreadsheet,
  FileImage,
  FileCode,
  MoreVertical,
  Folder,
  ChevronRight,
  ChevronDown,
  X,
  Clock,
  Eye,
  Star,
  Filter,
  Grid3X3,
  List,
  Copy
} from 'lucide-react'

interface Document {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'docx' | 'xlsx' | 'image' | 'other'
  size: number
  folderId: string | null
  url: string
  createdAt: string
  updatedAt: string
  isFavorite: boolean
  tags: string[]
  description?: string
}

interface Folder {
  id: string
  name: string
  parentId: string | null
  color: string
  createdAt: string
}

interface DocumentVaultProps {
  onDocumentSelect?: (doc: Document) => void
}

const DEFAULT_FOLDERS: Folder[] = [
  { id: 'resumes', name: 'Resumes', parentId: null, color: 'blue', createdAt: new Date().toISOString() },
  { id: 'cover-letters', name: 'Cover Letters', parentId: null, color: 'purple', createdAt: new Date().toISOString() },
  { id: 'transcripts', name: 'Transcripts', parentId: null, color: 'emerald', createdAt: new Date().toISOString() },
  { id: 'recommendations', name: 'Recommendations', parentId: null, color: 'amber', createdAt: new Date().toISOString() },
  { id: 'offers', name: 'Offer Letters', parentId: null, color: 'pink', createdAt: new Date().toISOString() },
  { id: 'research', name: 'Firm Research', parentId: null, color: 'cyan', createdAt: new Date().toISOString() },
]

const FOLDER_COLORS: Record<string, string> = {
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

export function DocumentVault({ onDocumentSelect }: DocumentVaultProps) {
  const [folders, setFolders] = useState<Folder[]>(DEFAULT_FOLDERS)
  const [documents, setDocuments] = useState<Document[]>([])
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState('blue')
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'recent'>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFolder = currentFolder === null || doc.folderId === currentFolder
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'favorites' && doc.isFavorite) ||
                         (filterType === 'recent' && new Date(doc.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    return matchesSearch && matchesFolder && matchesFilter
  })

  // Get current folder name
  const currentFolderName = currentFolder 
    ? folders.find(f => f.id === currentFolder)?.name || 'Unknown'
    : 'All Documents'

  // Create new folder
  const createFolder = () => {
    if (!newFolderName.trim()) return
    
    const newFolder: Folder = {
      id: `folder_${Date.now()}`,
      name: newFolderName,
      parentId: currentFolder,
      color: newFolderColor,
      createdAt: new Date().toISOString()
    }
    
    setFolders(prev => [...prev, newFolder])
    setNewFolderName('')
    setShowNewFolderModal(false)
  }

  // Handle file upload (simulated)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const newDoc: Document = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: getFileType(file.name),
        size: file.size,
        folderId: currentFolder,
        url: URL.createObjectURL(file),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: false,
        tags: [],
        description: ''
      }
      setDocuments(prev => [newDoc, ...prev])
    })
    
    setShowUploadModal(false)
  }

  // Get file type from extension
  const getFileType = (filename: string): Document['type'] => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (['pdf'].includes(ext || '')) return 'pdf'
    if (['doc', 'docx'].includes(ext || '')) return 'doc'
    if (['xlsx', 'xls', 'csv'].includes(ext || '')) return 'xlsx'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image'
    return 'other'
  }

  // Delete document
  const deleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId))
    if (selectedDocument?.id === docId) {
      setSelectedDocument(null)
    }
  }

  // Toggle favorite
  const toggleFavorite = (docId: string) => {
    setDocuments(prev => prev.map(d => 
      d.id === docId ? { ...d, isFavorite: !d.isFavorite } : d
    ))
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Get file icon
  const FileIcon = ({ type, className = 'w-6 h-6' }: { type: Document['type']; className?: string }) => {
    switch (type) {
      case 'pdf':
        return <FileText className={`${className} text-red-400`} />
      case 'doc':
      case 'docx':
        return <FileText className={`${className} text-blue-400`} />
      case 'xlsx':
        return <FileSpreadsheet className={`${className} text-emerald-400`} />
      case 'image':
        return <FileImage className={`${className} text-purple-400`} />
      default:
        return <File className={`${className} text-slate-400`} />
    }
  }

  // Get document count for folder
  const getDocumentCount = (folderId: string) => {
    return documents.filter(d => d.folderId === folderId).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-amber-400" />
            Document Vault
          </h2>
          <p className="text-slate-400 mt-1">
            {documents.length} document{documents.length !== 1 ? 's' : ''} • {folders.length} folder{folders.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 w-64"
            />
          </div>
          
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            <Folder className="w-4 h-4" />
            New Folder
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar - Folders */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {/* Quick Filters */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Quick Access</h3>
            <div className="space-y-1">
              <button
                onClick={() => { setCurrentFolder(null); setFilterType('all') }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentFolder === null && filterType === 'all' 
                    ? 'bg-amber-500/20 text-amber-400' 
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                All Documents
                <span className="ml-auto text-xs text-slate-500">{documents.length}</span>
              </button>
              <button
                onClick={() => setFilterType('favorites')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  filterType === 'favorites' 
                    ? 'bg-amber-500/20 text-amber-400' 
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <Star className="w-4 h-4" />
                Favorites
                <span className="ml-auto text-xs text-slate-500">
                  {documents.filter(d => d.isFavorite).length}
                </span>
              </button>
              <button
                onClick={() => setFilterType('recent')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  filterType === 'recent' 
                    ? 'bg-amber-500/20 text-amber-400' 
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <Clock className="w-4 h-4" />
                Recent
                <span className="ml-auto text-xs text-slate-500">
                  {documents.filter(d => new Date(d.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </span>
              </button>
            </div>
          </div>

          {/* Folders */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Folders</h3>
            <div className="space-y-1">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => { setCurrentFolder(folder.id); setFilterType('all') }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentFolder === folder.id 
                      ? FOLDER_COLORS[folder.color] 
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  <span className="truncate">{folder.name}</span>
                  <span className="ml-auto text-xs opacity-60">{getDocumentCount(folder.id)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-9">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4 text-sm">
            <button 
              onClick={() => setCurrentFolder(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Documents
            </button>
            {currentFolder && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <span className="text-white">{currentFolderName}</span>
              </>
            )}
          </div>

          {/* Documents */}
          {filteredDocuments.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? 'No documents found' : 'No documents yet'}
              </h3>
              <p className="text-slate-400 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search terms or filters'
                  : 'Upload your resumes, cover letters, transcripts, and other recruiting documents to keep them organized.'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-4 group cursor-pointer hover:border-amber-500/30 transition-all"
                  onClick={() => setSelectedDocument(doc)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <FileIcon type={doc.type} className="w-10 h-10" />
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(doc.id) }}
                      className={`p-1 rounded transition-colors ${doc.isFavorite ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}`}
                    >
                      <Star className={`w-4 h-4 ${doc.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  <h4 className="font-medium text-white truncate mb-1" title={doc.name}>
                    {doc.name}
                  </h4>
                  <p className="text-xs text-slate-500 mb-3">
                    {formatFileSize(doc.size)} • {new Date(doc.updatedAt).toLocaleDateString()}
                  </p>
                  
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400">
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 2 && (
                        <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400">
                          +{doc.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Type</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Size</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Modified</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map(doc => (
                    <tr 
                      key={doc.id} 
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <FileIcon type={doc.type} className="w-5 h-5" />
                          <div>
                            <div className="font-medium text-white">{doc.name}</div>
                            {doc.isFavorite && <Star className="w-3 h-3 text-amber-400 inline ml-2 fill-current" />}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-400 uppercase">{doc.type}</td>
                      <td className="py-3 px-4 text-sm text-slate-400">{formatFileSize(doc.size)}</td>
                      <td className="py-3 px-4 text-sm text-slate-400">
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(doc.id) }}
                            className="p-1 text-slate-400 hover:text-amber-400"
                          >
                            <Star className={`w-4 h-4 ${doc.isFavorite ? 'fill-current text-amber-400' : ''}`} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteDocument(doc.id) }}
                            className="p-1 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Folder Modal */}
      <AnimatePresence>
        {showNewFolderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewFolderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Create New Folder</h3>
              <input
                type="text"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 mb-4"
                autoFocus
              />
              <div className="mb-4">
                <label className="text-sm text-slate-400 mb-2 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(FOLDER_COLORS).map(color => (
                    <button
                      key={color}
                      onClick={() => setNewFolderColor(color)}
                      className={`w-8 h-8 rounded-lg ${FOLDER_COLORS[color].split(' ')[0]} ${
                        newFolderColor === color ? 'ring-2 ring-white' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={createFolder}
                  className="flex-1 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDocument(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <FileIcon type={selectedDocument.type} className="w-12 h-12" />
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedDocument.name}</h3>
                    <p className="text-sm text-slate-400">
                      {formatFileSize(selectedDocument.size)} • {new Date(selectedDocument.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="p-2 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preview placeholder */}
              <div className="bg-slate-800/50 rounded-lg p-8 text-center mb-6">
                <FileIcon type={selectedDocument.type} className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400">Preview not available for this file type</p>
                <p className="text-sm text-slate-500 mt-1">Download to view the full document</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => toggleFavorite(selectedDocument.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    selectedDocument.isFavorite 
                      ? 'bg-amber-500/20 text-amber-400' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Star className={`w-4 h-4 ${selectedDocument.isFavorite ? 'fill-current' : ''}`} />
                  {selectedDocument.isFavorite ? 'Favorited' : 'Add to Favorites'}
                </button>
                <a
                  href={selectedDocument.url}
                  download={selectedDocument.name}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                <button
                  onClick={() => deleteDocument(selectedDocument.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
