import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell, BellOff, X, Check } from 'lucide-react'

interface NotificationManagerProps {
  onPermissionChange?: (granted: boolean) => void
}

interface NotificationPayload {
  title: string
  body?: string
  icon?: string
  tag?: string
  url?: string
}

class NotificationManager {
  private permission: NotificationPermission = 'default'
  private originalTitle: string = ''
  private titleTimer: ReturnType<typeof setTimeout> | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.originalTitle = document.title
      this.permission = Notification.permission
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false

    const result = await Notification.requestPermission()
    this.permission = result
    return result === 'granted'
  }

  getPermission(): NotificationPermission {
    return this.permission
  }

  send(payload: NotificationPayload) {
    // Browser notification
    if (this.permission === 'granted') {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon,
        tag: payload.tag,
      })

      notification.onclick = () => {
        window.focus()
        if (payload.url) {
          window.location.href = payload.url
        }
        notification.close()
      }

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000)
    }

    // Page title indicator
    this.showTitleIndicator(payload.title)

    // Play sound
    this.playNotificationSound()
  }

  showTitleIndicator(message: string) {
    if (this.titleTimer) clearTimeout(this.titleTimer)

    document.title = `[完成] ${this.originalTitle}`

    this.titleTimer = setTimeout(() => {
      document.title = this.originalTitle
    }, 5000)
  }

  playNotificationSound() {
    try {
      const audioContext = new AudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch {
      // Ignore audio errors
    }
  }
}

// Singleton
let manager: NotificationManager | null = null

export function getNotificationManager(): NotificationManager {
  if (!manager) {
    manager = new NotificationManager()
  }
  return manager
}

export function NotificationSettings({ onPermissionChange }: NotificationManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [enabled, setEnabled] = useState(true)
  const managerRef = useRef(getNotificationManager())

  useEffect(() => {
    setPermission(managerRef.current.getPermission())
  }, [])

  const handleRequestPermission = useCallback(async () => {
    const granted = await managerRef.current.requestPermission()
    setPermission(granted ? 'granted' : 'denied')
    onPermissionChange?.(granted)
  }, [onPermissionChange])

  const handleToggle = useCallback(() => {
    setEnabled(prev => !prev)
  }, [])

  return (
    <div
      className="rounded-lg border p-3 space-y-2"
      style={{
        background: 'var(--surface-strong)',
        borderColor: 'var(--border-weak-base)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {enabled ? (
            <Bell size={12} style={{ color: 'var(--icon-interactive-base)' }} />
          ) : (
            <BellOff size={12} style={{ color: 'var(--text-weaker)' }} />
          )}
          <span className="text-xs font-medium" style={{ color: 'var(--text-strong)' }}>
            浏览器通知
          </span>
        </div>

        <button
          onClick={handleToggle}
          className="relative w-8 h-4 rounded-full transition-colors"
          style={{
            background: enabled ? 'var(--color-success, #22c55e)' : 'var(--surface-base)',
          }}
        >
          <div
            className="absolute top-0.5 w-3 h-3 rounded-full transition-transform bg-white"
            style={{ left: enabled ? '16px' : '2px' }}
          />
        </button>
      </div>

      {enabled && permission === 'default' && (
        <button
          onClick={handleRequestPermission}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors"
          style={{
            background: 'var(--button-primary-base)',
            color: 'var(--text-invert-strong)',
          }}
        >
          <Bell size={10} />
          启用通知
        </button>
      )}

      {permission === 'granted' && (
        <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--color-success, #22c55e)' }}>
          <Check size={10} />
          通知已启用
        </div>
      )}

      {permission === 'denied' && (
        <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--color-error, #ef4444)' }}>
          <X size={10} />
          通知被拒绝，请在浏览器设置中允许
        </div>
      )}
    </div>
  )
}

export function useNotifications() {
  const managerRef = useRef(getNotificationManager())
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    setPermission(managerRef.current.getPermission())
  }, [])

  const requestPermission = useCallback(async () => {
    const granted = await managerRef.current.requestPermission()
    setPermission(granted ? 'granted' : 'denied')
    return granted
  }, [])

  const send = useCallback((payload: NotificationPayload) => {
    managerRef.current.send(payload)
  }, [])

  return { permission, requestPermission, send }
}
