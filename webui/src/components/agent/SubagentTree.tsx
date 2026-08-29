import { useState } from 'react'
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight,
  ChevronDown,
  X,
  Clock,
  GitBranch,
} from 'lucide-react'
import { useI18n } from '../../context/i18n'

export interface SubagentNode {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  task?: string
  startTime?: number
  endTime?: number
  children?: SubagentNode[]
  depth?: number
}

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'var(--text-weaker)', bg: 'var(--surface-base)' },
  running: { icon: Loader2, color: 'var(--icon-interactive-base)', bg: 'var(--surface-interactive-subtle)' },
  completed: { icon: CheckCircle, color: 'var(--icon-success-base)', bg: 'var(--color-success, #22c55e)15' },
  failed: { icon: AlertCircle, color: 'var(--icon-critical-base)', bg: 'var(--color-error, #ef4444)15' },
  cancelled: { icon: XCircle, color: 'var(--text-weaker)', bg: 'var(--surface-base)' },
}

function formatDuration(start?: number, end?: number): string {
  if (!start) return ''
  const ms = (end || Date.now()) - start
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`
}

function SubagentTreeItem({ node, onCancel }: { node: SubagentNode; onCancel?: (id: string) => void }) {
  const [expanded, setExpanded] = useState(true)
  const cfg = STATUS_CONFIG[node.status]
  const Icon = cfg.icon
  const hasChildren = node.children && node.children.length > 0
  const depth = node.depth || 0

  return (
    <div>
      <div
        className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors group"
        style={{
          paddingLeft: `${8 + depth * 20}px`,
          background: node.status === 'running' ? `${cfg.color}08` : 'transparent',
        }}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 p-0.5 rounded hover:bg-[var(--surface-base-hover)]"
          >
            {expanded
              ? <ChevronDown size={10} style={{ color: 'var(--text-weaker)' }} />
              : <ChevronRight size={10} style={{ color: 'var(--text-weaker)' }} />
            }
          </button>
        ) : (
          <div className="w-4 shrink-0" />
        )}

        {/* Status Icon */}
        <Icon
          size={12}
          style={{
            color: cfg.color,
            animation: node.status === 'running' ? 'spin 1.5s linear infinite' : 'none',
          }}
        />

        {/* Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs font-medium truncate"
              style={{ color: 'var(--text-strong)' }}
            >
              {node.name}
            </span>
            <span className="text-[9px] font-mono" style={{ color: 'var(--text-weaker)' }}>
              {node.id.slice(0, 6)}
            </span>
          </div>
          {node.task && (
            <div className="text-[10px] truncate mt-0.5" style={{ color: 'var(--text-base)' }}>
              {node.task}
            </div>
          )}
        </div>

        {/* Duration */}
        {node.startTime && (
          <span className="text-[9px] font-mono shrink-0" style={{ color: 'var(--text-weaker)' }}>
            {formatDuration(node.startTime, node.endTime)}
          </span>
        )}

        {/* Cancel button */}
        {node.status === 'running' && onCancel && (
          <button
            onClick={() => onCancel(node.id)}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--surface-base-active)] transition-opacity"
            title="取消"
          >
            <X size={10} style={{ color: 'var(--color-error, #ef4444)' }} />
          </button>
        )}
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {node.children!.map(child => (
            <SubagentTreeItem
              key={child.id}
              node={{ ...child, depth: depth + 1 }}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface SubagentTreeProps {
  agents: SubagentNode[]
  onCancel?: (id: string) => void
  onClose?: () => void
}

export function SubagentTree({ agents, onCancel, onClose }: SubagentTreeProps) {
  const { t } = useI18n()

  if (agents.length === 0) return null

  const running = agents.filter(a => a.status === 'running').length
  const completed = agents.filter(a => a.status === 'completed').length
  const failed = agents.filter(a => a.status === 'failed').length

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: 'var(--surface-strong)',
        borderColor: 'var(--border-weak-base)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: 'var(--border-weak-base)' }}
      >
        <div className="flex items-center gap-2">
          <GitBranch size={12} style={{ color: 'var(--icon-interactive-base)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-strong)' }}>
            {t('agent.subagents')}
          </span>
          <div className="flex items-center gap-1.5">
            {running > 0 && (
              <span
                className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--surface-interactive-subtle)', color: 'var(--icon-interactive-base)' }}
              >
                <Loader2 size={8} className="animate-spin" />
                {running}
              </span>
            )}
            {completed > 0 && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--color-success, #22c55e)15', color: 'var(--color-success, #22c55e)' }}
              >
                {completed}
              </span>
            )}
            {failed > 0 && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--color-error, #ef4444)15', color: 'var(--color-error, #ef4444)' }}
              >
                {failed}
              </span>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--surface-base-hover)]"
            style={{ color: 'var(--text-weaker)' }}
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* Tree */}
      <div className="py-1 max-h-[300px] overflow-y-auto">
        {agents.map(agent => (
          <SubagentTreeItem key={agent.id} node={agent} onCancel={onCancel} />
        ))}
      </div>
    </div>
  )
}
