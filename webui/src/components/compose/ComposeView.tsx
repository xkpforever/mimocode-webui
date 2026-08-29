import { CheckCircle, Circle, Play, AlertTriangle } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { useI18n } from '../../context/i18n'

interface WorkflowStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  description?: string
}

interface ComposeViewProps {
  steps: WorkflowStep[]
  title?: string
}

const STEP_STATUS = {
  pending: { icon: Circle, color: 'var(--text-weaker)' },
  running: { icon: Play, color: 'var(--icon-interactive-base)' },
  completed: { icon: CheckCircle, color: 'var(--icon-success-base)' },
  failed: { icon: AlertTriangle, color: 'var(--icon-critical-base)' },
}

export function ComposeView({ steps, title }: ComposeViewProps) {
  const { t } = useI18n()
  const titleText = title || t('compose.title')

  if (steps.length === 0) return null

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: 'var(--surface-strong)',
        borderColor: 'var(--border-weak-base)',
      }}
    >
      <div
        className="px-4 py-2.5 border-b flex items-center gap-2"
        style={{ borderColor: 'var(--border-weak-base)' }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
          {titleText}
        </span>
        <Badge>{steps.filter((s) => s.status === 'completed').length}/{steps.length}</Badge>
      </div>

      <div className="px-4 py-3 space-y-0">
        {steps.map((step, index) => {
          const cfg = STEP_STATUS[step.status]
          const Icon = cfg.icon
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-full"
                  style={{
                    background: step.status === 'completed'
                      ? 'var(--surface-success-base)'
                      : step.status === 'failed'
                        ? 'var(--surface-critical-base)'
                        : 'var(--surface-base)',
                  }}
                >
                  <Icon size={12} style={{ color: cfg.color }} />
                </div>
                {!isLast && (
                  <div
                    className="w-px flex-1 min-h-[24px]"
                    style={{
                      background: step.status === 'completed'
                        ? 'var(--icon-success-base)'
                        : 'var(--border-weak-base)',
                    }}
                  />
                )}
              </div>

              <div className="flex-1 pb-4">
                <div className="text-sm font-medium" style={{ color: 'var(--text-strong)' }}>
                  {step.name}
                </div>
                {step.description && (
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-base)' }}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
