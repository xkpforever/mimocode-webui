import { useState, useEffect, useCallback } from 'react'
import {
  ListTree,
  CheckCircle,
  Circle,
  Loader2,
  AlertCircle,
  Plus,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useI18n } from '../../context/i18n'
import { getBaseUrl } from '../../lib/api'

interface Task {
  id: string
  label: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  children?: Task[]
  parentId?: string
}

const STATUS_CONFIG = {
  pending: { icon: Circle, color: 'var(--text-weaker)' },
  in_progress: { icon: Loader2, color: 'var(--icon-interactive-base)', spin: true },
  completed: { icon: CheckCircle, color: 'var(--icon-success-base)' },
  failed: { icon: AlertCircle, color: 'var(--icon-critical-base)' },
}

function TaskNodeItem({ node, depth = 0 }: { node: Task; depth?: number }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0
  const cfg = STATUS_CONFIG[node.status]
  const Icon = cfg.icon

  return (
    <div>
      <div
        className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors hover:bg-[var(--surface-base-hover)] cursor-pointer group"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded
            ? <ChevronDown size={10} style={{ color: 'var(--text-weaker)' }} />
            : <ChevronRight size={10} style={{ color: 'var(--text-weaker)' }} />
        ) : (
          <div className="w-3" />
        )}

        <Icon
          size={12}
          style={{
            color: cfg.color,
            animation: 'spin' in cfg && cfg.spin ? 'spin 1.5s linear infinite' : 'none',
          }}
        />

        <span
          className="text-xs truncate flex-1"
          style={{
            color: 'var(--text-strong)',
            textDecoration: node.status === 'completed' ? 'line-through' : 'none',
            opacity: node.status === 'completed' ? 0.6 : 1,
          }}
        >
          {node.label}
        </span>

        <span className="text-[9px] font-mono" style={{ color: 'var(--text-weaker)' }}>
          {node.id}
        </span>
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children!.map(child => (
            <TaskNodeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function countTasks(nodes: Task[]): { total: number; completed: number } {
  let total = 0
  let completed = 0
  for (const node of nodes) {
    total++
    if (node.status === 'completed') completed++
    if (node.children) {
      const sub = countTasks(node.children)
      total += sub.total
      completed += sub.completed
    }
  }
  return { total, completed }
}

export function TasksPanel() {
  const { t } = useI18n()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const base = getBaseUrl()
      const res = await fetch(`${base}/task`)
      if (res.ok) {
        const data = await res.json()
        // Handle different response formats
        if (Array.isArray(data)) {
          setTasks(data)
        } else if (data.tasks && Array.isArray(data.tasks)) {
          setTasks(data.tasks)
        } else {
          setTasks([])
        }
      } else if (res.status === 404) {
        // No task endpoint — show empty state
        setTasks([])
      } else {
        setError('Failed to fetch tasks')
      }
    } catch {
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const stats = countTasks(tasks)

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
            {t('task.title')}
          </span>
          {tasks.length > 0 && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--surface-base)', color: 'var(--text-weaker)' }}
            >
              {stats.completed}/{stats.total}
            </span>
          )}
        </div>
        <button
          onClick={fetchTasks}
          className="p-1 rounded hover:bg-[var(--surface-base-hover)]"
          style={{ color: 'var(--text-weaker)' }}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: 'var(--surface-base)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
              background: 'var(--color-success, #22c55e)',
            }}
          />
        </div>
      )}

      {/* Task List */}
      {loading && tasks.length === 0 ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-weaker)' }} />
        </div>
      ) : error ? (
        <div className="text-center py-6 text-[10px]" style={{ color: 'var(--color-error, #ef4444)' }}>
          {error}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-6 space-y-2">
          <ListTree size={24} className="mx-auto opacity-20" style={{ color: 'var(--text-weaker)' }} />
          <p className="text-[10px]" style={{ color: 'var(--text-weaker)' }}>
            {t('task.empty')}
          </p>
          <p className="text-[9px]" style={{ color: 'var(--text-weaker)' }}>
            代理会在工作过程中自动创建任务
          </p>
        </div>
      ) : (
        <div
          className="rounded-lg border divide-y overflow-hidden"
          style={{
            background: 'var(--surface-strong)',
            borderColor: 'var(--border-weak-base)',
          }}
        >
          {tasks.map(task => (
            <TaskNodeItem key={task.id} node={task} />
          ))}
        </div>
      )}
    </div>
  )
}
