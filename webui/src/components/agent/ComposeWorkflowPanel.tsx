import {
  Layers,
  FileText,
  Code,
  Eye,
  GitMerge,
  Check,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import { useI18n } from '../../context/i18n'

export interface ComposeStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  icon?: typeof FileText
}

const DEFAULT_STEPS: ComposeStep[] = [
  { id: 'spec', name: '规格定义', status: 'pending', icon: FileText },
  { id: 'plan', name: '方案设计', status: 'pending', icon: Eye },
  { id: 'execute', name: '代码实现', status: 'pending', icon: Code },
  { id: 'review', name: '代码审查', status: 'pending', icon: Eye },
  { id: 'merge', name: '合并部署', status: 'pending', icon: GitMerge },
]

interface ComposeWorkflowPanelProps {
  steps?: ComposeStep[]
  currentStep?: string
}

export function ComposeWorkflowPanel({ steps = DEFAULT_STEPS, currentStep }: ComposeWorkflowPanelProps) {
  const { t } = useI18n()

  const completedCount = steps.filter(s => s.status === 'completed').length
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0

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
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: 'var(--border-weak-base)' }}
      >
        <Layers size={12} style={{ color: 'var(--icon-success-base)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--text-strong)' }}>
          Compose 工作流
        </span>
        <div className="flex-1" />
        <span className="text-[10px] font-mono" style={{ color: 'var(--text-weaker)' }}>
          {completedCount}/{steps.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="px-3 py-2">
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: 'var(--surface-base)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--icon-success-base), #06b6d4)',
            }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="px-2 pb-2 space-y-0.5">
        {steps.map((step, index) => {
          const StepIcon = step.icon || FileText
          const isActive = step.id === currentStep || step.status === 'running'
          const isCompleted = step.status === 'completed'

          const statusColors: Record<string, string> = {
            pending: 'var(--text-weaker)',
            running: 'var(--icon-interactive-base)',
            completed: 'var(--icon-success-base)',
            failed: 'var(--icon-critical-base)',
            skipped: 'var(--text-weaker)',
          }

          const color = statusColors[step.status] || 'var(--text-weaker)'

          return (
            <div
              key={step.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors"
              style={{
                background: isActive ? `${color}08` : 'transparent',
              }}
            >
              {/* Step Number */}
              <div
                className="flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold shrink-0"
                style={{
                  background: isCompleted ? color : isActive ? `${color}20` : 'var(--surface-base)',
                  color: isCompleted ? 'white' : color,
                }}
              >
                {isCompleted ? (
                  <Check size={10} />
                ) : step.status === 'running' ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : (
                  index + 1
                )}
              </div>

              {/* Step Name */}
              <span
                className="text-xs flex-1"
                style={{
                  color: isCompleted ? 'var(--text-base)' : isActive ? 'var(--text-strong)' : 'var(--text-weaker)',
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  opacity: isCompleted ? 0.6 : 1,
                }}
              >
                {step.name}
              </span>

              {/* Status Indicator */}
              {step.status === 'failed' && (
                <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: `${color}20`, color }}>
                  失败
                </span>
              )}
              {step.status === 'skipped' && (
                <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: 'var(--surface-base)', color }}>
                  跳过
                </span>
              )}
              {isActive && step.status !== 'running' && (
                <ChevronRight size={10} style={{ color }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
