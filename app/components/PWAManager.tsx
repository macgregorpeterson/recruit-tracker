'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Smartphone, 
  Wifi,
  WifiOff,
  Download,
  Check,
  Bell,
  Shield,
  Zap,
  ChevronRight,
  RefreshCw,
  Battery,
  BatteryCharging,
  Cloud,
  CloudOff,
  Settings,
  X
  , 
  AlertTriangle
} from 'lucide-react'

interface PWAManagerProps {
  onInstall?: () => void
  isInstalled?: boolean
}

export function PWAManager({ onInstall, isInstalled: externalInstalled }: PWAManagerProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'pending'>('synced')
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [isCharging, setIsCharging] = useState(false)
  const [showOfflineBanner, setShowOfflineBanner] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineBanner(false)
      setSyncStatus('syncing')
      setTimeout(() => setSyncStatus('synced'), 1500)
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineBanner(true)
      setSyncStatus('pending')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
      // Show prompt after a delay
      setTimeout(() => setShowInstallPrompt(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      setShowInstallPrompt(false)
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    // Battery API (if available)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(battery.level * 100)
        setIsCharging(battery.charging)
        
        battery.addEventListener('levelchange', () => setBatteryLevel(battery.level * 100))
        battery.addEventListener('chargingchange', () => setIsCharging(battery.charging))
      })
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstalled(true)
      onInstall?.()
    }
    
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const requestNotifications = async () => {
    if (!('Notification' in window)) return
    
    const permission = await Notification.requestPermission()
    setNotificationsEnabled(permission === 'granted')
  }

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500/10 border-b border-amber-500/20 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">You're offline. Changes will sync when you reconnect.</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="text-xs text-amber-400/70">Waiting for connection...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Prompt Toast */}
      <AnimatePresence>
        {showInstallPrompt && canInstall && !isInstalled && !sessionStorage.getItem('pwa-prompt-dismissed') && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50 w-96"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Install RecruitTracker</h4>
                  <p className="text-sm text-slate-400 mt-1">
                    Add to your home screen for quick access and offline support.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={handleInstall}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      Install
                    </button>
                    <button
                      onClick={dismissInstallPrompt}
                      className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors"
                    >
                      Not now
                    </button>
                  </div>
                </div>
                <button
                  onClick={dismissInstallPrompt}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Settings Panel */}
      <div className="space-y-6">
        {/* Connection Status */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isOnline ? 'bg-emerald-500/10' : 'bg-amber-500/10'
              }`}>
                {isOnline ? (
                  <Wifi className="w-6 h-6 text-emerald-400" />
                ) : (
                  <WifiOff className="w-6 h-6 text-amber-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {isOnline ? 'Online' : 'Offline Mode'}
                </h3>
                <p className="text-sm text-slate-400">
                  {isOnline ? 'All features available' : 'Limited functionality - changes saved locally'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isOnline ? (
                <span className="flex items-center gap-2 text-sm text-emerald-400">
                  <Check className="w-4 h-4" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-2 text-sm text-amber-400">
                  <CloudOff className="w-4 h-4" />
                  Working Offline
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sync Status */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                syncStatus === 'synced' ? 'bg-emerald-500/10' : 
                syncStatus === 'syncing' ? 'bg-blue-500/10' : 'bg-amber-500/10'
              }`}>
                {syncStatus === 'syncing' ? (
                  <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                ) : syncStatus === 'synced' ? (
                  <Cloud className="w-6 h-6 text-emerald-400" />
                ) : (
                  <CloudOff className="w-6 h-6 text-amber-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white">Data Sync</h3>
                <p className="text-sm text-slate-400">
                  {syncStatus === 'synced' ? 'All data up to date' : 
                   syncStatus === 'syncing' ? 'Syncing your changes...' : 
                   'Changes pending - will sync when online'}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              syncStatus === 'synced' ? 'bg-emerald-500/20 text-emerald-400' :
              syncStatus === 'syncing' ? 'bg-blue-500/20 text-blue-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
              {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Installation Status */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isInstalled ? 'bg-emerald-500/10' : 'bg-blue-500/10'
              }`}>
                <Smartphone className={`w-6 h-6 ${isInstalled ? 'text-emerald-400' : 'text-blue-400'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {isInstalled ? 'App Installed' : 'Install App'}
                </h3>
                <p className="text-sm text-slate-400">
                  {isInstalled 
                    ? 'RecruitTracker is installed on your device' 
                    : 'Install for offline access and native experience'}
                </p>
              </div>
            </div>
            {!isInstalled && canInstall && (
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Install
              </button>
            )}
            {isInstalled && (
              <span className="flex items-center gap-2 text-sm text-emerald-400">
                <Check className="w-4 h-4" />
                Installed
              </span>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                notificationsEnabled ? 'bg-emerald-500/10' : 'bg-slate-700/50'
              }`}>
                <Bell className={`w-6 h-6 ${notificationsEnabled ? 'text-emerald-400' : 'text-slate-400'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Notifications</h3>
                <p className="text-sm text-slate-400">
                  {notificationsEnabled 
                    ? 'Push notifications enabled' 
                    : 'Enable for deadline and interview reminders'}
                </p>
              </div>
            </div>
            {!notificationsEnabled ? (
              <button
                onClick={requestNotifications}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg font-medium hover:bg-blue-500/30 transition-colors"
              >
                Enable
              </button>
            ) : (
              <span className="flex items-center gap-2 text-sm text-emerald-400">
                <Check className="w-4 h-4" />
                Enabled
              </span>
            )}
          </div>
        </div>

        {/* Battery Status (if available) */}
        {batteryLevel !== null && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  batteryLevel < 20 ? 'bg-red-500/10' : 'bg-emerald-500/10'
                }`}>
                  {isCharging ? (
                    <BatteryCharging className={`w-6 h-6 ${batteryLevel < 20 ? 'text-red-400' : 'text-emerald-400'}`} />
                  ) : (
                    <Battery className={`w-6 h-6 ${batteryLevel < 20 ? 'text-red-400' : 'text-emerald-400'}`} />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">Battery</h3>
                  <p className="text-sm text-slate-400">
                    {isCharging ? 'Charging' : `${Math.round(batteryLevel)}% remaining`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      batteryLevel < 20 ? 'bg-red-500' : 
                      batteryLevel < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${batteryLevel}%` }}
                  />
                </div>
                <span className={`text-sm font-medium ${
                  batteryLevel < 20 ? 'text-red-400' : 'text-slate-300'
                }`}>
                  {Math.round(batteryLevel)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Tips */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Mobile Tips
          </h3>
          <div className="space-y-3">
            <TipItem
              icon={Download}
              title="Install the app"
              description="Add RecruitTracker to your home screen for the best mobile experience"
            />
            <TipItem
              icon={Bell}
              title="Enable notifications"
              description="Get alerts for upcoming deadlines and interviews"
            />
            <TipItem
              icon={Shield}
              title="Offline support"
              description="Your data is saved locally - continue working even without internet"
            />
          </div>
        </div>
      </div>
    </>
  )
}

function TipItem({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
      <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div>
        <div className="text-sm font-medium text-white">{title}</div>
        <div className="text-xs text-slate-400">{description}</div>
      </div>
    </div>
  )
}

export default PWAManager
