import { useState } from 'react'
import { Brain, Zap, Lightbulb, ChevronDown } from 'lucide-react'

export type ThinkingMode = 'fast' | 'think' | 'think-hard'

interface ThinkingModeConfig {
  id: ThinkingMode
  name: string
  desc: string
  icon: typeof Brain
  color: string
  gradient: string
}

const MODES: ThinkingModeConfig[] = [
  {
    id: 'fast',
    name: 'Fast',
    desc: '快速响应，最少推理',
    icon: Zap,
    color: 'var(--icon-success-base)',
    gradient: 'linear-gradient(135deg, #22c55e, #06b6d4)',
  },
  {
    id: 'think',
    name: 'Think',
    desc: '标准推理深度',
    icon: Brain,
    color: 'var(--icon-interactive-base)',
    gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
  },
  {
    id: 'think-hard',
    name: 'Think Hard',
    desc: '深度推理，复杂问题',
    icon: Lightbulb,
    color: 'var(--icon-warning-base)',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  },
]

interface ThinkingModeSelectorProps {
  mode: ThinkingMode
  onModeChange: (mode: ThinkingMode) => void
}

export function ThinkingModeSelector({ mode, onModeChange }: ThinkingModeSelectorProps) {
  const [open, setOpen] = useState(false)
  const current = MODES.find(m => m.id === mode) || MODES[0]
  const CurrentIcon = current.icon

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-all"
        style={{
          background: `${current.color}15`,
          color: current.color,
          border: `1px solid ${current.color}30`,
        }}
      >
        <CurrentIcon size={10} />
        <span>{current.name}</span>
        <ChevronDown
          size={8}
          className="transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute bottom-full left-0 mb-1 w-48 rounded-lg shadow-lg overflow-hidden z-50 animate-slide-in"
            style={{
              background: 'var(--surface-strong)',
              border: '1px solid var(--border-weak-base)',
            }}
          >
            {MODES.map(m => {
              const Icon = m.icon
              const isSelected = m.id === mode
              return (
                <button
                  key={m.id}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[var(--surface-base-hover)]"
                  onClick={() => {
                    onModeChange(m.id)
                    setOpen(false)
                  }}
                >
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded-md shrink-0"
                    style={{ background: m.gradient }}
                  >
                    <Icon size={12} color="white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium" style={{ color: 'var(--text-strong)' }}>
                      {m.name}
                    </div>
                    <div className="text-[9px]" style={{ color: 'var(--text-weaker)' }}>
                      {m.desc}
                    </div>
                  </div>
                  {isSelected && (
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: m.color }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
