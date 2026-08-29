import { useState } from 'react'
import {
  ChevronRight,
  ChevronDown,
  FileCode,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Wrench,
  List,
  Target,
  MessageCircle,
} from 'lucide-react'

export interface ToolOutput {
  id: string
  type: 'diff' | 'todo' | 'plan' | 'question' | 'file-list' | 'text'
  name: string
  status: 'running' | 'completed' | 'failed'
  content: unknown
  timestamp?: number
}

// ---- Diff Viewer ----

function DiffViewer({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  const lines = content.split('\n')
  const added = lines.filter(l => l.startsWith('+') && !l.startsWith('+++')).length
  const removed = lines.filter(l => l.startsWith('-') && !l.startsWith('---')).length

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'var(--surface-strong)', borderBottom: '1px solid var(--border-weak-base)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-weaker)' }}>
            {added}+ {removed}-
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] hover:bg-[var(--surface-base-hover)]"
          style={{ color: 'var(--text-weaker)' }}
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>

      {/* Diff Content */}
      <pre
        className="overflow-x-auto text-[11px] font-mono leading-relaxed p-2"
        style={{ background: 'var(--background-weak)', color: 'var(--text-base)' }}
      >
        {lines.map((line, i) => {
          let bg = 'transparent'
          let color = 'var(--text-base)'
          if (line.startsWith('+') && !line.startsWith('+++')) {
            bg = 'rgba(34, 197, 94, 0.1)'
            color = 'var(--color-success, #22c55e)'
          } else if (line.startsWith('-') && !line.startsWith('---')) {
            bg = 'rgba(239, 68, 68, 0.1)'
            color = 'var(--color-error, #ef4444)'
          } else if (line.startsWith('@@')) {
            color = 'var(--icon-interactive-base)'
          }
          return (
            <div key={i} style={{ background: bg, color, paddingLeft: '2px' }}>
              {line}
            </div>
          )
        })}
      </pre>
    </div>
  )
}

// ---- Todo List ----

function TodoList({ content }: { content: Array<{ text: string; done: boolean }> }) {
  return (
    <div className="space-y-1">
      {content.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          {item.done ? (
            <CheckCircle size={12} style={{ color: 'var(--icon-success-base)' }} />
          ) : (
            <div
              className="w-3 h-3 rounded-full border"
              style={{ borderColor: 'var(--border-base)' }}
            />
          )}
          <span
            style={{
              color: item.done ? 'var(--text-weaker)' : 'var(--text-strong)',
              textDecoration: item.done ? 'line-through' : 'none',
            }}
          >
            {item.text}
          </span>
        </div>
      ))}
    </div>
  )
}

// ---- Plan Display ----

function PlanDisplay({ content }: { content: string[] }) {
  return (
    <div className="space-y-1.5">
      {content.map((step, i) => (
        <div key={i} className="flex items-start gap-2 text-xs">
          <div
            className="flex items-center justify-center w-4 h-4 rounded-full shrink-0 mt-0.5 text-[9px] font-bold"
            style={{ background: 'var(--surface-base)', color: 'var(--text-weaker)' }}
          >
            {i + 1}
          </div>
          <span style={{ color: 'var(--text-base)' }}>{step}</span>
        </div>
      ))}
    </div>
  )
}

// ---- Main Renderer ----

interface ToolOutputRendererProps {
  output: ToolOutput
}

export function ToolOutputRenderer({ output }: ToolOutputRendererProps) {
  const [expanded, setExpanded] = useState(output.status === 'running')

  const statusConfig = {
    running: { icon: Loader2, color: 'var(--icon-interactive-base)', animate: true },
    completed: { icon: CheckCircle, color: 'var(--icon-success-base)', animate: false },
    failed: { icon: AlertCircle, color: 'var(--icon-critical-base)', animate: false },
  }

  const cfg = statusConfig[output.status]
  const StatusIcon = cfg.icon

  const typeIcons: Record<string, typeof FileCode> = {
    diff: FileCode,
    todo: List,
    plan: Target,
    question: MessageCircle,
    'file-list': FileCode,
    text: FileCode,
  }
  const TypeIcon = typeIcons[output.type] || FileCode

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        background: 'var(--surface-strong)',
        borderColor: 'var(--border-weak-base)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[var(--surface-base-hover)]"
      >
        <StatusIcon
          size={12}
          style={{
            color: cfg.color,
            animation: cfg.animate ? 'spin 1.5s linear infinite' : 'none',
          }}
        />
        <TypeIcon size={10} style={{ color: 'var(--text-weaker)' }} />
        <span className="text-xs font-medium flex-1" style={{ color: 'var(--text-strong)' }}>
          {output.name}
        </span>
        {expanded
          ? <ChevronDown size={10} style={{ color: 'var(--text-weaker)' }} />
          : <ChevronRight size={10} style={{ color: 'var(--text-weaker)' }} />
        }
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-3 pb-2 animate-slide-in">
          {output.type === 'diff' && typeof output.content === 'string' && (
            <DiffViewer content={output.content} />
          )}
          {output.type === 'todo' && Array.isArray(output.content) && (
            <TodoList content={output.content as Array<{ text: string; done: boolean }>} />
          )}
          {output.type === 'plan' && Array.isArray(output.content) && (
            <PlanDisplay content={output.content as string[]} />
          )}
          {output.type === 'text' && typeof output.content === 'string' && (
            <pre
              className="text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto p-2 rounded"
              style={{ background: 'var(--background-weak)', color: 'var(--text-base)' }}
            >
              {output.content}
            </pre>
          )}
          {output.type === 'question' && typeof output.content === 'string' && (
            <div
              className="text-xs p-2 rounded"
              style={{ background: 'var(--surface-interactive-subtle)', color: 'var(--text-base)' }}
            >
              {output.content}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
