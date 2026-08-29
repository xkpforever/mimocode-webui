import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { useI18n } from '../../context/i18n'

export interface Subagent {
  id: string
  name: string
  status: 'running' | 'completed' | 'failed'
  task?: string
}

interface SubagentPanelProps {
  subagents: Subagent[]
  onClose?: () => void
}

export function SubagentPanel({ subagents, onClose }: SubagentPanelProps) {
  const { t } = useI18n()

  if (subagents.length === 0) return null

  const statusConfig = {
    running: {
      icon: Loader2, color: 'var(--icon-interactive-base)', label: t('agent.status.running'), animate: true,
    },
    completed: {
      icon: CheckCircle, color: 'var(--icon-success-base)', label: t('agent.status.completed'), animate: false,
    },
    failed: {
      icon: AlertCircle, color: 'var(--icon-critical-base)', label: t('agent.status.failed'), animate: false,
    },
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: 'var(--surface-strong)',
        borderColor: 'var(--border-weak-base)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: 'var(--border-weak-base)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--text-strong)' }}
          >
            {t('agent.subagents')}
          </span>
          <Badge>{subagents.length} {t('agent.active')}</Badge>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6 rounded hover:bg-[var(--button-ghost-hover)]"
            style={{ color: 'var(--icon-base)' }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--border-weak-base)' }}>
        {subagents.map((agent) => {
          const cfg = statusConfig[agent.status]
          const Icon = cfg.icon
          return (
            <div key={agent.id} className="flex items-center gap-3 px-4 py-2.5">
              <Icon
                size={14}
                style={{
                  color: cfg.color,
                  animation: cfg.animate ? 'spin 1.5s linear infinite' : 'none',
                }}
              />
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-medium truncate"
                  style={{ color: 'var(--text-strong)' }}
                >
                  {agent.name}
                </div>
                {agent.task && (
                  <div
                    className="text-xs truncate mt-0.5"
                    style={{ color: 'var(--text-base)' }}
                  >
                    {agent.task}
                  </div>
                )}
              </div>
              <Badge
                variant={
                  agent.status === 'completed'
                    ? 'success'
                    : agent.status === 'failed'
                      ? 'danger'
                      : 'default'
                }
              >
                {cfg.label}
              </Badge>
            </div>
          )
        })}
      </div>
    </div>
  )
}
