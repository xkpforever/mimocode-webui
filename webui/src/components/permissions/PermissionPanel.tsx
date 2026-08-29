import { useCallback } from 'react'
import {
  Shield,
  Check,
  X,
  Clock,
  Terminal,
  FileCode,
  Globe,
  Database,
  Zap,
} from 'lucide-react'
import { usePermissionStore, type PermissionRequest } from '../../stores'
import { useI18n } from '../../context/i18n'
import { getBaseUrl } from '../../lib/api'

const TOOL_ICONS: Record<string, typeof Terminal> = {
  bash: Terminal,
  write: FileCode,
  edit: FileCode,
  read: FileCode,
  webfetch: Globe,
  websearch: Globe,
  database: Database,
}

function getToolIcon(toolName: string): typeof Terminal {
  const key = toolName.toLowerCase()
  for (const [pattern, icon] of Object.entries(TOOL_ICONS)) {
    if (key.includes(pattern)) return icon
  }
  return Zap
}

function formatToolInput(input: unknown): string {
  if (!input) return ''
  if (typeof input === 'string') return input
  try {
    const str = JSON.stringify(input, null, 2)
    return str.length > 200 ? str.slice(0, 200) + '...' : str
  } catch {
    return String(input)
  }
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.floor(minutes / 60)}h ago`
}

interface PermissionCardProps {
  request: PermissionRequest
  onApprove: (id: string, remember?: boolean) => void
  onDeny: (id: string) => void
}

function PermissionCard({ request, onApprove, onDeny }: PermissionCardProps) {
  const Icon = getToolIcon(request.toolName)
  const inputStr = formatToolInput(request.input)

  return (
    <div
      className="rounded-xl border overflow-hidden animate-slide-in"
      style={{
        background: 'var(--surface-strong)',
        borderColor: 'var(--border-weak-base)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-weak-base)' }}
      >
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{ background: 'var(--surface-interactive-subtle)' }}
        >
          <Icon size={18} style={{ color: 'var(--icon-interactive-base)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
              {request.toolName}
            </span>
            <span
              className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--surface-base)', color: 'var(--text-weaker)' }}
            >
              <Clock size={8} />
              {timeAgo(request.timestamp)}
            </span>
          </div>
          {request.message && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-base)' }}>
              {request.message}
            </p>
          )}
        </div>
      </div>

      {/* Tool Input Preview */}
      {inputStr && (
        <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border-weak-base)' }}>
          <pre
            className="text-xs font-mono whitespace-pre-wrap max-h-24 overflow-y-auto rounded-lg p-2"
            style={{
              background: 'var(--background-weak)',
              color: 'var(--text-base)',
            }}
          >
            {inputStr}
          </pre>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          onClick={() => onDeny(request.id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'var(--surface-base)',
            border: '1px solid var(--border-weak-base)',
            color: 'var(--text-base)',
          }}
        >
          <X size={14} />
          Deny
        </button>
        <button
          onClick={() => onApprove(request.id, false)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'var(--button-primary-base)',
            color: 'var(--text-invert-strong)',
          }}
        >
          <Check size={14} />
          Allow
        </button>
        <button
          onClick={() => onApprove(request.id, true)}
          className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'var(--color-success, #22c55e)',
            color: 'white',
          }}
          title="Allow and remember this tool's permission"
        >
          <Shield size={12} />
          Remember
        </button>
      </div>
    </div>
  )
}

export function PermissionPanel() {
  const { t } = useI18n()
  const pending = usePermissionStore((s) => s.pending)
  const removePermission = usePermissionStore((s) => s.removePermission)

  const handleApprove = useCallback(async (id: string, remember?: boolean) => {
    try {
      const base = getBaseUrl()
      await fetch(`${base}/permission/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: remember ? 'always' : 'once' }),
      })
      removePermission(id)
    } catch (err) {
      console.error('Failed to approve permission:', err)
    }
  }, [removePermission])

  const handleDeny = useCallback(async (id: string) => {
    try {
      const base = getBaseUrl()
      await fetch(`${base}/permission/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: 'reject' }),
      })
      removePermission(id)
    } catch (err) {
      console.error('Failed to deny permission:', err)
    }
  }, [removePermission])

  if (pending.length === 0) return null

  return (
    <div className="fixed bottom-20 right-4 z-40 w-[380px] max-h-[60vh] overflow-y-auto space-y-3">
      {pending.map((req) => (
        <PermissionCard
          key={req.id}
          request={req}
          onApprove={handleApprove}
          onDeny={handleDeny}
        />
      ))}
    </div>
  )
}
