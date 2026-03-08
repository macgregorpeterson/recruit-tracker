'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Network,
  Users,
  Building2,
  Briefcase,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  X,
  Info,
  Share2,
  GitGraph
} from 'lucide-react'
import { Contact, Application } from '../types'

interface Node {
  id: string
  type: 'contact' | 'firm' | 'application'
  label: string
  subtitle?: string
  x: number
  y: number
  size: number
  color: string
  metadata?: Record<string, any>
}

interface Edge {
  id: string
  source: string
  target: string
  type: 'works_at' | 'applied_to' | 'connected' | 'referred'
  strength: number
}

interface RelationshipGraphProps {
  contacts: Contact[]
  applications: Application[]
  onNodeClick?: (type: string, id: string) => void
  onNavigate?: (tab: string) => void
}

export function RelationshipGraph({
  contacts,
  applications,
  onNodeClick,
  onNavigate
}: RelationshipGraphProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [filter, setFilter] = useState<'all' | 'contacts' | 'firms' | 'applications'>('all')
  const [showLabels, setShowLabels] = useState(true)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Build graph data
  const { nodes, edges, stats } = useMemo(() => {
    const nodeMap = new Map<string, Node>()
    const edgeList: Edge[] = []
    
    // Add firm nodes
    const firms = new Set(contacts.map(c => c.firm))
    applications.forEach(a => firms.add(a.firm))
    
    const centerX = 400
    const centerY = 300
    const firmRadius = 200
    
    Array.from(firms).forEach((firm, i) => {
      const angle = (i / firms.size) * 2 * Math.PI - Math.PI / 2
      nodeMap.set(`firm:${firm}`, {
        id: `firm:${firm}`,
        type: 'firm',
        label: firm,
        x: centerX + Math.cos(angle) * firmRadius,
        y: centerY + Math.sin(angle) * firmRadius,
        size: 35,
        color: '#8b5cf6',
        metadata: { applications: applications.filter(a => a.firm === firm).length }
      })
    })

    // Add contact nodes
    contacts.forEach((contact, i) => {
      const firmNode = nodeMap.get(`firm:${contact.firm}`)
      const baseAngle = firmNode 
        ? Math.atan2(firmNode.y - centerY, firmNode.x - centerX)
        : (i / contacts.length) * 2 * Math.PI
      
      const contactsAtFirm = contacts.filter(c => c.firm === contact.firm).length
      const contactIndex = contacts.filter(c => c.firm === contact.firm).indexOf(contact)
      const spreadAngle = (Math.PI / 4) / Math.max(contactsAtFirm, 1)
      const angle = baseAngle + (contactIndex - contactsAtFirm / 2) * spreadAngle
      
      nodeMap.set(`contact:${contact.id}`, {
        id: `contact:${contact.id}`,
        type: 'contact',
        label: contact.name,
        subtitle: contact.title,
        x: firmNode ? firmNode.x + Math.cos(angle) * 80 : centerX + Math.cos(angle) * 280,
        y: firmNode ? firmNode.y + Math.sin(angle) * 80 : centerY + Math.sin(angle) * 280,
        size: 20,
        color: '#3b82f6',
        metadata: { title: contact.title, tags: contact.tags }
      })

      // Edge: contact works at firm
      if (firmNode) {
        edgeList.push({
          id: `edge:${contact.id}-${contact.firm}`,
          source: `contact:${contact.id}`,
          target: `firm:${contact.firm}`,
          type: 'works_at',
          strength: 2
        })
      }
    })

    // Add application nodes
    applications.forEach((app, i) => {
      const firmNode = nodeMap.get(`firm:${app.firm}`)
      const baseAngle = firmNode
        ? Math.atan2(firmNode.y - centerY, firmNode.x - centerX) + Math.PI
        : (i / applications.length) * 2 * Math.PI
      
      const angle = baseAngle + (Math.random() - 0.5) * 0.3
      
      nodeMap.set(`app:${app.id}`, {
        id: `app:${app.id}`,
        type: 'application',
        label: app.role,
        subtitle: app.status,
        x: firmNode ? firmNode.x + Math.cos(angle) * 60 : centerX + Math.cos(angle) * 250,
        y: firmNode ? firmNode.y + Math.sin(angle) * 60 : centerY + Math.sin(angle) * 250,
        size: 18,
        color: app.status === 'offer' ? '#10b981' : 
               app.status === 'rejected' ? '#ef4444' : '#f59e0b',
        metadata: { status: app.status, location: app.location }
      })

      // Edge: application to firm
      if (firmNode) {
        edgeList.push({
          id: `edge:${app.id}-firm`,
          source: `app:${app.id}`,
          target: `firm:${app.firm}`,
          type: 'applied_to',
          strength: 1.5
        })
      }
    })

    // Add connections between contacts at same firm
    contacts.forEach((c1, i) => {
      contacts.slice(i + 1).forEach(c2 => {
        if (c1.firm === c2.firm && Math.random() > 0.7) {
          edgeList.push({
            id: `edge:conn-${c1.id}-${c2.id}`,
            source: `contact:${c1.id}`,
            target: `contact:${c2.id}`,
            type: 'connected',
            strength: 0.5
          })
        }
      })
    })

    const stats = {
      totalNodes: nodeMap.size,
      totalEdges: edgeList.length,
      firms: firms.size,
      contacts: contacts.length,
      applications: applications.length,
      density: nodeMap.size > 1 ? (edgeList.length / (nodeMap.size * (nodeMap.size - 1) / 2) * 100).toFixed(1) : '0'
    }

    return { nodes: Array.from(nodeMap.values()), edges: edgeList, stats }
  }, [contacts, applications])

  // Filter nodes
  const filteredNodes = useMemo(() => {
    if (filter === 'all') return nodes
    return nodes.filter(n => n.type === filter.slice(0, -1))
  }, [nodes, filter])

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(n => n.id))
    return edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
  }, [edges, filteredNodes])

  // Handle mouse events for pan/zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as HTMLElement).tagName === 'rect') {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(z => Math.max(0.3, Math.min(3, z * delta)))
  }

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'contact': return '👤'
      case 'firm': return '🏢'
      case 'application': return '📋'
      default: return '•'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.totalNodes}</div>
          <div className="text-xs text-slate-500">Total Nodes</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.totalEdges}</div>
          <div className="text-xs text-slate-500">Connections</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.firms}</div>
          <div className="text-xs text-slate-500">Firms</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{stats.density}%</div>
          <div className="text-xs text-slate-500">Network Density</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{stats.contacts}</div>
          <div className="text-xs text-slate-500">Contacts</div>
        </div>
      </div>

      {/* Main Graph Container */}
      <div 
        ref={containerRef}
        className="relative glass-card overflow-hidden"
        style={{ height: '600px' }}
      >
        {/* Toolbar */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <div className="glass-strong rounded-xl p-2 flex flex-col gap-2">
            <button
              onClick={() => setZoom(z => Math.min(3, z * 1.2))}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-5 h-5 text-slate-300" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(0.3, z * 0.8))}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-5 h-5 text-slate-300" />
            </button>
            <button
              onClick={resetView}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Reset view"
            >
              <Maximize2 className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="absolute top-4 right-4 z-10">
          <div className="glass-strong rounded-xl p-3">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">Filter</span>
            </div>
            <div className="flex flex-col gap-1">
              {(['all', 'contacts', 'firms', 'applications'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-left ${
                    filter === f
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-700"
                />
                <span className="text-xs text-slate-400">Show Labels</span>
              </label>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="glass-strong rounded-xl p-3">
            <div className="text-xs font-medium text-slate-400 mb-2">Legend</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-xs text-slate-300">Firm</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-slate-300">Contact</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-xs text-slate-300">Application</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-300">Offer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Zoom Level */}
        <div className="absolute bottom-4 right-4 z-10">
          <div className="glass-strong rounded-xl px-3 py-1.5">
            <span className="text-xs text-slate-400">{Math.round(zoom * 100)}%</span>
          </div>
        </div>

        {/* SVG Graph */}
        <svg
          ref={svgRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
            </marker>
          </defs>
          
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Grid */}
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(71, 85, 105, 0.2)" strokeWidth="1" />
            </pattern>
            <rect width="2000" height="2000" fill="url(#grid)" x="-500" y="-500" />

            {/* Edges */}
            {filteredEdges.map((edge) => {
              const source = filteredNodes.find(n => n.id === edge.source)
              const target = filteredNodes.find(n => n.id === edge.target)
              if (!source || !target) return null
              
              const isHighlighted = hoveredNode === edge.source || hoveredNode === edge.target
              
              return (
                <motion.line
                  key={edge.id}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: isHighlighted ? 1 : 0.4 }}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={isHighlighted ? '#60a5fa' : '#475569'}
                  strokeWidth={edge.strength * (isHighlighted ? 2 : 1)}
                  strokeDasharray={edge.type === 'connected' ? '5,5' : 'none'}
                />
              )
            })}

            {/* Nodes */}
            {filteredNodes.map((node, index) => {
              const isHovered = hoveredNode === node.id
              const isSelected = selectedNode?.id === node.id
              
              return (
                <motion.g
                  key={node.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: isHovered || isSelected ? 1.2 : 1,
                    opacity: 1
                  }}
                  transition={{ delay: index * 0.01 }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNode(node)
                    const [type, id] = node.id.split(':')
                    onNodeClick?.(type, id)
                  }}
                  className="cursor-pointer"
                >
                  {/* Glow effect */}
                  {(isHovered || isSelected) && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.size + 8}
                      fill={node.color}
                      opacity={0.2}
                    />
                  )}
                  
                  {/* Main circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size}
                    fill={node.color}
                    stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.1)'}
                    strokeWidth={isSelected ? 3 : 1}
                    className="transition-all"
                  />
                  
                  {/* Icon/Label */}
                  {showLabels && (
                    <text
                      x={node.x}
                      y={node.y + node.size + 15}
                      textAnchor="middle"
                      fill="#cbd5e1"
                      fontSize="10"
                      fontWeight="500"
                      className="pointer-events-none"
                    >
                      {node.label.length > 12 ? node.label.slice(0, 12) + '...' : node.label}
                    </text>
                  )}
                </motion.g>
              )
            })}
          </g>
        </svg>

        {/* Selected Node Details Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute right-4 top-20 bottom-20 w-72 glass-strong rounded-xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedNode.type === 'contact' && <Users className="w-5 h-5 text-blue-400" />}
                  {selectedNode.type === 'firm' && <Building2 className="w-5 h-5 text-purple-400" />}
                  {selectedNode.type === 'application' && <Briefcase className="w-5 h-5 text-amber-400" />}
                  <span className="font-medium text-white capitalize">{selectedNode.type}</span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                <h3 className="text-lg font-semibold text-white mb-1">{selectedNode.label}</h3>
                {selectedNode.subtitle && (
                  <p className="text-sm text-slate-400 mb-4">{selectedNode.subtitle}</p>
                )}
                
                {selectedNode.metadata && (
                  <div className="space-y-3">
                    {Object.entries(selectedNode.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-xs text-slate-500 capitalize">{key.replace('_', ' ')}</span>
                        <span className="text-xs text-slate-300">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Connected nodes */}
                <div className="mt-6">
                  <h4 className="text-xs font-medium text-slate-400 uppercase mb-2">Connections</h4>
                  <div className="space-y-2">
                    {edges
                      .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                      .map((edge, i) => {
                        const otherId = edge.source === selectedNode.id ? edge.target : edge.source
                        const otherNode = nodes.find(n => n.id === otherId)
                        if (!otherNode) return null
                        
                        return (
                          <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: otherNode.color }}
                            />
                            <span className="text-sm text-slate-300 truncate">{otherNode.label}</span>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-700">
                <button
                  onClick={() => {
                    const [type, id] = selectedNode.id.split(':')
                    if (type === 'contact') onNavigate?.('coverage')
                    else if (type === 'firm') onNavigate?.('research')
                    else if (type === 'app') onNavigate?.('pipeline')
                  }}
                  className="w-full py-2 px-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-colors"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tips */}
      <div className="glass-card p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-slate-400">
          <span className="text-slate-300 font-medium">Pro tip:</span> Use the relationship graph to identify networking gaps. 
          Look for firms with many applications but few contacts — these are opportunities to expand your network. 
          Click on any node to see details and connections.
        </div>
      </div>
    </div>
  )
}

export default RelationshipGraph
