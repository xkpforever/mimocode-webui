import { useState, useEffect, useCallback } from 'react'
import {
  Clock,
  GitCommit,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  FileText,
  RotateCcw,
} from 'lucide-react'
import { useI18n } from '../../context/i18n'
import { getBaseUrl } from '../../lib/api'

interface Checkpoint {
  id: string
  sessionId: string
  timestamp: number
  summary?: string
  messageCount: number
  taskCount?: number
  tokenUsage?: { input: number; output: number }
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - ts

  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}小时前`

  return d.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTokens(n?: number): string {
  if (!n) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function CheckpointCard({ checkpoint, isExpanded, onToggle }: {
  checkpoint: Checkpoint
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <div
      className="rounded-lg border overflow-hidden transition-all"
      style={{
        background: 'var(--surface-strong)',
        borderColor: isExpanded ? 'var(--border-strong-base)' : 'var(--border-weak-base)',
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-base-hover)]"
      >
        <div
          className="flex items-center justify-center w-7 h-7 rounded-full shrink-0"
          style={{ background: 'var(--surface-interactive-subtle)' }}
        >
          <GitCommit size={12} style={{ color: 'var(--icon-interactive-base)' }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono" style={{ color: 'var(--text-strong)' }}>
              {checkpoint.id.slice(0, 8)}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-weaker)' }}>
              {formatTime(checkpoint.timestamp)}
            </span>
          </div>
          {checkpoint.summary && (
            <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-base)' }}>
              {checkpoint.summary}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[10px] font-mono" style={{ color: 'var(--text-weaker)' }}>
              {checkpoint.messageCount} 消息
            </div>
            {checkpoint.tokenUsage && (
              <div className="text-[10px] font-mono" style={{ color: 'var(--text-weaker)' }}>
                {formatTokens(checkpoint.tokenUsage.input + checkpoint.tokenUsage.output)} tokens
              </div>
            )}
          </div>
          {isExpanded
            ? <ChevronDown size={12} style={{ color: 'var(--text-weaker)' }} />
            : <ChevronRight size={12} style={{ color: 'var(--text-weaker)' }} />
          }
        </div>
      </button>

      {isExpanded && (
        <div
          className="px-3 py-2 border-t space-y-2 animate-slide-in"
          style={{ borderColor: 'var(--border-weak-base)' }}
        >
          {checkpoint.summary && (
            <div>
              <div className="text-[10px] font-medium mb-1" style={{ color: 'var(--text-weaker)' }}>
                摘要
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-base)' }}>
                {checkpoint.summary}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <FileText size={10} style={{ color: 'var(--text-weaker)' }} />
              <span className="text-[10px]" style={{ color: 'var(--text-weaker)' }}>
                {checkpoint.messageCount} 条消息
              </span>
            </div>
            {checkpoint.taskCount != null && (
              <div className="flex items-center gap-1.5">
                <RotateCcw size={10} style={{ color: 'var(--text-weaker)' }} />
                <span className="text-[10px]" style={{ color: 'var(--text-weaker)' }}>
                  {checkpoint.taskCount} 个任务
                </span>
              </div>
            )}
          </div>

          <button
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-[var(--surface-base-hover)]"
            style={{
              border: '1px solid var(--border-weak-base)',
              color: 'var(--text-interactive-base)',
            }}
          >
            <RotateCcw size={10} />
            回溯到此检查点
          </button>
        </div>
      )}
    </div>
  )
}

export function CheckpointTimeline() {
  const { t } = useI18n()
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchCheckpoints = useCallback(async () => {
    setLoading(true)
    try {
      const base = getBaseUrl()
      const res = await fetch(`${base}/session`)
      if (res.ok) {
        const sessions = await res.json()
        // Convert sessions to checkpoint-like data
        const cps: Checkpoint[] = (Array.isArray(sessions) ? sessions : []).map((s: Record<string, unknown>) => ({
          id: String(s.id || 'unknown'),
          sessionId: String(s.id || ''),
          timestamp: Number((s.time as Record<string, number>)?.created) || Date.now(),
          summary: String(s.title || ''),
          messageCount: 0,
        }))
        setCheckpoints(cps.slice(0, 20))
      }
    } catch {
      // Ignore errors
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCheckpoints()
  }, [fetchCheckpoints])

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background-weak)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'var(--border-weak-base)' }}>
        <Clock size={14} style={{ color: 'var(--icon-info-base)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--text-strong)' }}>
          检查点时间线
        </span>
        <div className="flex-1" />
        <button
          onClick={fetchCheckpoints}
          className="p-1 rounded hover:bg-[var(--surface-base-hover)] transition-colors"
          style={{ color: 'var(--text-weaker)' }}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {loading && checkpoints.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw size={16} className="animate-spin" style={{ color: 'var(--text-weaker)' }} />
          </div>
        ) : checkpoints.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <Clock size={32} className="mx-auto opacity-20" style={{ color: 'var(--text-weaker)' }} />
            <p className="text-xs" style={{ color: 'var(--text-weaker)' }}>
              暂无检查点数据
            </p>
          </div>
        ) : (
          checkpoints.map((cp) => (
            <CheckpointCard
              key={cp.id}
              checkpoint={cp}
              isExpanded={expandedId === cp.id}
              onToggle={() => setExpandedId(expandedId === cp.id ? null : cp.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
