import { useState, useCallback, useEffect } from 'react'
import {
  Wrench,
  Eye,
  Layers,
  ChevronDown,
  Zap,
  Clock,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { useI18n } from '../../context/i18n'

export type AgentType = 'build' | 'plan' | 'compose'

interface AgentConfig {
  id: AgentType
  name: string
  desc: string
  icon: typeof Wrench
  color: string
  gradient: string
}

const AGENTS: AgentConfig[] = [
  {
    id: 'build',
    name: 'Build',
    desc: '完全工具权限，用于开发',
    icon: Wrench,
    color: 'var(--icon-agent-build-base)',
    gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
  },
  {
    id: 'plan',
    name: 'Plan',
    desc: '只读分析，用于探索与设计',
    icon: Eye,
    color: 'var(--icon-agent-plan-base)',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  },
  {
    id: 'compose',
    name: 'Compose',
    desc: '基于规格驱动开发的工作流编排',
    icon: Layers,
    color: 'var(--icon-agent-docs-base)',
    gradient: 'linear-gradient(135deg, #22c55e, #06b6d4)',
  },
]

interface AgentStatusPanelProps {
  currentAgent: AgentType
  onAgentChange: (agent: AgentType) => void
  isRunning?: boolean
  goal?: string
}

export function AgentStatusPanel({ currentAgent, onAgentChange, isRunning, goal }: AgentStatusPanelProps) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)
  const current = AGENTS.find(a => a.id === currentAgent) || AGENTS[0]
  const Icon = current.icon

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all"
      style={{
        background: 'var(--surface-strong)',
        borderColor: expanded ? 'var(--border-strong-base)' : 'var(--border-weak-base)',
      }}
    >
      {/* Current Agent Display */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-base-hover)]"
      >
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
          style={{ background: current.gradient }}
        >
          <Icon size={20} color="white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
              {current.name}
            </span>
            {isRunning && (
              <div className="flex items-center gap-1">
                <Loader2 size={10} className="animate-spin" style={{ color: current.color }} />
                <span className="text-[10px]" style={{ color: current.color }}>运行中</span>
              </div>
            )}
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-weaker)' }}>
            {current.desc}
          </p>
          {goal && (
            <div
              className="flex items-center gap-1 mt-1 text-[10px] px-2 py-0.5 rounded-full w-fit"
              style={{ background: 'var(--surface-base)', color: 'var(--text-weaker)' }}
            >
              <Zap size={8} />
              Goal: {goal.length > 30 ? goal.slice(0, 30) + '...' : goal}
            </div>
          )}
        </div>

        <ChevronDown
          size={14}
          className="shrink-0 transition-transform"
          style={{
            color: 'var(--text-weaker)',
            transform: expanded ? 'rotate(180deg)' : 'none',
          }}
        />
      </button>

      {/* Agent Selector */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2 animate-slide-in">
          {AGENTS.map((agent) => {
            const AgentIcon = agent.icon
            const isSelected = agent.id === currentAgent
            return (
              <button
                key={agent.id}
                onClick={() => {
                  onAgentChange(agent.id)
                  setExpanded(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                style={{
                  background: isSelected ? `${agent.color}15` : 'transparent',
                  border: isSelected ? `1px solid ${agent.color}30` : '1px solid transparent',
                }}
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                  style={{ background: agent.gradient }}
                >
                  <AgentIcon size={14} color="white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium" style={{ color: 'var(--text-strong)' }}>
                    {agent.id === 'build' ? t('agent.build') : agent.id === 'plan' ? t('agent.plan') : t('agent.compose')}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-weaker)' }}>
                    {agent.desc}
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle size={14} style={{ color: agent.color }} />
                )}
              </button>
            )
          })}

          {/* Keyboard hint */}
          <div
            className="text-center text-[10px] pt-1"
            style={{ color: 'var(--text-weaker)' }}
          >
            按 <kbd className="px-1 py-0.5 rounded" style={{ background: 'var(--surface-base)' }}>Tab</kbd> 切换 Agent
          </div>
        </div>
      )}
    </div>
  )
}
