'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Settings,
  ToggleLeft,
  ToggleRight,
  Clock,
  ArrowLeftRight,
  Download,
  History,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { CalendarEvent } from '../types'

interface CalendarSyncManagerProps {
  events: CalendarEvent[]
  onSync?: () => void
  onImportGoogleEvents?: (events: Partial<CalendarEvent>[]) => void
}

interface SyncLog {
  id: string
  timestamp: string
  action: 'import' | 'export' | 'sync'
  status: 'success' | 'error' | 'conflict'
  details: string
  eventCount?: number
}

interface SyncSettings {
  twoWaySync: boolean
  autoSync: boolean
  syncInterval: number
  importPastEvents: boolean
  importWindowDays: number
  defaultCalendar: string
  conflictResolution: 'local' | 'google' | 'manual'
}

const MOCK_SYNC_LOGS: SyncLog[] = [
  {
    id: '1',
    timestamp: '2026-03-08T10:30:00Z',
    action: 'sync',
    status: 'success',
    details: 'Synced 5 events with Google Calendar',
    eventCount: 5
  },
  {
    id: '2',
    timestamp: '2026-03-07T14:15:00Z',
    action: 'import',
    status: 'success',
    details: 'Imported 3 events from Google Calendar',
    eventCount: 3
  },
  {
    id: '3',
    timestamp: '2026-03-06T09:00:00Z',
    action: 'sync',
    status: 'conflict',
    details: '2 conflicts detected - resolved using local data'
  }
]

export function CalendarSyncManager({ events, onSync, onImportGoogleEvents }: CalendarSyncManagerProps) {
  const [isConnected, setIsConnected] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [lastSync, setLastSync] = useState<Date>(new Date('2026-03-08T10:30:00Z'))
  const [settings, setSettings] = useState<SyncSettings>({
    twoWaySync: true,
    autoSync: true,
    syncInterval: 15,
    importPastEvents: false,
    importWindowDays: 30,
    defaultCalendar: 'primary',
    conflictResolution: 'manual'
  })

  const handleSync = async () => {
    setIsSyncing(true)
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLastSync(new Date())
    setIsSyncing(false)
    onSync?.()
  }

  const handleConnect = () => {
    setIsConnected(true)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
  }

  const stats = {
    localEvents: events.length,
    syncedEvents: events.filter(e => e.google_event_id).length,
    pendingSync: events.filter(e => !e.google_event_id).length,
    lastSyncAgo: Math.floor((new Date().getTime() - lastSync.getTime()) / 60000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Calendar className="w-7 h-7 text-blue-400" />
            Google Calendar Sync
          </h2>
          <p className="text-slate-400 mt-1">Keep your recruiting events in sync with Google Calendar</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSync}
            disabled={!isConnected || isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </motion.button>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`glass-card p-6 ${isConnected ? 'border-emerald-500/30' : 'border-amber-500/30'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isConnected ? 'bg-emerald-500/10' : 'bg-amber-500/10'
            }`}>
              {isConnected ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {isConnected ? 'Connected to Google Calendar' : 'Not Connected'}
              </h3>
              <p className="text-sm text-slate-400">
                {isConnected 
                  ? `Last synced ${stats.lastSyncAgo} minutes ago` 
                  : 'Connect to sync your events with Google Calendar'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <span className="flex items-center gap-2 text-sm text-emerald-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live sync active
                </span>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Connect Google Calendar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard 
          label="Local Events" 
          value={stats.localEvents} 
          icon={Calendar} 
          color="blue" 
        />
        <StatCard 
          label="Synced Events" 
          value={stats.syncedEvents} 
          icon={CheckCircle2} 
          color="emerald" 
        />
        <StatCard 
          label="Pending Sync" 
          value={stats.pendingSync} 
          icon={Clock} 
          color="amber" 
        />
        <StatCard 
          label="Sync Direction" 
          value={settings.twoWaySync ? 'Two-way' : 'One-way'} 
          icon={ArrowLeftRight} 
          color="purple" 
        />
      </div>

      {/* Quick Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Quick Settings</h3>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <History className="w-4 h-4" />
            View Sync History
            {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ToggleSetting
            label="Two-way Sync"
            description="Sync events both ways between RecruitTracker and Google Calendar"
            enabled={settings.twoWaySync}
            onChange={(enabled) => setSettings({ ...settings, twoWaySync: enabled })}
          />
          <ToggleSetting
            label="Auto Sync"
            description={`Automatically sync every ${settings.syncInterval} minutes`}
            enabled={settings.autoSync}
            onChange={(enabled) => setSettings({ ...settings, autoSync: enabled })}
          />
        </div>
      </div>

      {/* Sync History */}
      <AnimatePresence>
        {showLogs && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Sync History</h3>
              <div className="space-y-3">
                {MOCK_SYNC_LOGS.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        log.status === 'success' ? 'bg-emerald-500/10' :
                        log.status === 'error' ? 'bg-red-500/10' :
                        'bg-amber-500/10'
                      }`}>
                        {log.status === 'success' ? (
                          <CheckCircle2 className={`w-4 h-4 ${
                            log.action === 'import' ? 'text-blue-400' : 'text-emerald-400'
                          }`} />
                        ) : log.status === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm text-white capitalize">{log.action}</div>
                        <div className="text-xs text-slate-400">{log.details}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-300">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Section */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-400" />
          Import from Google Calendar
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Import existing events from your Google Calendar to RecruitTracker
        </p>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option value="primary">Primary Calendar</option>
            <option value="work">Work Calendar</option>
            <option value="personal">Personal Calendar</option>
          </select>
          <select className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All events</option>
          </select>
          <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium">
            Import Events
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Sync Settings</h3>
                    <p className="text-sm text-slate-400">Configure your calendar synchronization</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <ToggleSetting
                  label="Two-way Synchronization"
                  description="Sync events from RecruitTracker to Google Calendar and vice versa"
                  enabled={settings.twoWaySync}
                  onChange={(enabled) => setSettings({ ...settings, twoWaySync: enabled })}
                />

                <ToggleSetting
                  label="Automatic Sync"
                  description="Automatically sync events at regular intervals"
                  enabled={settings.autoSync}
                  onChange={(enabled) => setSettings({ ...settings, autoSync: enabled })}
                />

                {settings.autoSync && (
                  <div className="pl-4 border-l-2 border-slate-800">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Sync Interval (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.syncInterval}
                      onChange={(e) => setSettings({ ...settings, syncInterval: parseInt(e.target.value) || 15 })}
                      min="5"
                      max="60"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Conflict Resolution
                  </label>
                  <select
                    value={settings.conflictResolution}
                    onChange={(e) => setSettings({ ...settings, conflictResolution: e.target.value as any })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="manual">Manual (Ask me)</option>
                    <option value="local">Prefer RecruitTracker</option>
                    <option value="google">Prefer Google Calendar</option>
                  </select>
                </div>

                <ToggleSetting
                  label="Import Past Events"
                  description="Import historical events from Google Calendar"
                  enabled={settings.importPastEvents}
                  onChange={(enabled) => setSettings({ ...settings, importPastEvents: enabled })}
                />
              </div>

              <div className="p-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
}) {
  const colors: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    purple: 'text-purple-400 bg-purple-500/10'
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-xs text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  )
}

function ToggleSetting({ label, description, enabled, onChange }: {
  label: string
  description: string
  enabled: boolean
  onChange: (enabled: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between p-4 bg-slate-800/30 rounded-xl">
      <div>
        <div className="font-medium text-white">{label}</div>
        <div className="text-sm text-slate-400 mt-1">{description}</div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-blue-500' : 'bg-slate-700'
        }`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-7' : 'translate-x-1'
        }`} />
      </button>
    </div>
  )
}

export default CalendarSyncManager
