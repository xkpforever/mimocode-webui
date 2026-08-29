import { Badge } from '../ui/Badge'
import { useI18n } from '../../context/i18n'

interface AgentStatusBadgeProps {
  agent: 'build' | 'plan' | 'compose'
  busy?: boolean
}

const AGENT_VARIANTS = {
  build: 'info' as const,
  plan: 'warning' as const,
  compose: 'success' as const,
} as const

export function AgentStatusBadge({ agent, busy }: AgentStatusBadgeProps) {
  const { t } = useI18n()

  const nameMap: Record<string, string> = {
    build: t('agent.build'),
    plan: t('agent.plan'),
    compose: t('agent.compose'),
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: busy
            ? 'var(--icon-success-base)'
            : 'var(--text-weaker)',
          animation: busy ? 'pulse-soft 1.5s ease-in-out infinite' : 'none',
        }}
      />
      <Badge variant={AGENT_VARIANTS[agent]}>
        {nameMap[agent]}
      </Badge>
    </div>
  )
}
