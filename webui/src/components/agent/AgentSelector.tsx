import { useState } from 'react'
import { ChevronDown, Wrench, Eye, Layers } from 'lucide-react'
import { useI18n } from '../../context/i18n'

interface Agent {
  id: string
  nameKey: string
  descKey: string
  icon: typeof Wrench
  color: string
}

const AGENTS: Agent[] = [
  {
    id: 'build', nameKey: 'agent.build', descKey: 'agent.buildDesc',
    icon: Wrench, color: 'var(--icon-agent-build-base)',
  },
  {
    id: 'plan', nameKey: 'agent.plan', descKey: 'agent.planDesc',
    icon: Eye, color: 'var(--icon-agent-plan-base)',
  },
  {
    id: 'compose', nameKey: 'agent.compose', descKey: 'agent.composeDesc',
    icon: Layers, color: 'var(--icon-agent-docs-base)',
  },
]

export function AgentSelector() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(AGENTS[0])

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors"
        style={{
          background: open ? 'var(--surface-base-hover)' : 'transparent',
          color: 'var(--text-strong)',
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      >
        <selected.icon size={14} style={{ color: selected.color }} />
        <span>{t(selected.nameKey)}</span>
        <ChevronDown
          size={12}
          className="transition-transform"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'var(--text-weaker)',
          }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-56 rounded-lg shadow-lg border z-50 overflow-hidden animate-fade-in"
          style={{
            background: 'var(--surface-strong)',
            borderColor: 'var(--border-base)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {AGENTS.map((agent) => {
            const Icon = agent.icon
            const isSelected = selected.id === agent.id
            return (
              <button
                key={agent.id}
                onClick={() => {
                  setSelected(agent)
                  setOpen(false)
                }}
                className="w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors"
                style={{
                  background: isSelected
                    ? 'var(--surface-interactive-base)'
                    : 'transparent',
                }}
              >
                <div
                  className="mt-0.5 flex items-center justify-center w-7 h-7 rounded-md"
                  style={{ background: `${agent.color}15` }}
                >
                  <Icon size={14} style={{ color: agent.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-strong)' }}
                  >
                    {t(agent.nameKey)}
                  </div>
                  <div
                    className="text-xs mt-0.5 line-clamp-2"
                    style={{ color: 'var(--text-base)' }}
                  >
                    {t(agent.descKey)}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
