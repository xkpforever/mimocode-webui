import { useState, useCallback } from 'react'
import {
  Target,
  Check,
  X,
  Loader2,
  Shield,
  Zap,
} from 'lucide-react'
import { useI18n } from '../../context/i18n'

interface GoalConditionProps {
  goal?: string
  onSetGoal: (goal: string) => void
  onClearGoal: () => void
  judgeStatus?: 'idle' | 'evaluating' | 'satisfied' | 'not-satisfied'
}

export function GoalCondition({ goal, onSetGoal, onClearGoal, judgeStatus = 'idle' }: GoalConditionProps) {
  const { t } = useI18n()
  const [input, setInput] = useState(goal || '')
  const [isEditing, setIsEditing] = useState(!goal)

  const handleSubmit = useCallback(() => {
    if (input.trim()) {
      onSetGoal(input.trim())
      setIsEditing(false)
    }
  }, [input, onSetGoal])

  const handleClear = useCallback(() => {
    onClearGoal()
    setInput('')
    setIsEditing(true)
  }, [onClearGoal])

  const judgeConfig = {
    idle: { icon: Shield, color: 'var(--text-weaker)', label: '等待评估' },
    evaluating: { icon: Loader2, color: 'var(--icon-interactive-base)', label: '评估中...' },
    satisfied: { icon: Check, color: 'var(--icon-success-base)', label: '已满足' },
    'not-satisfied': { icon: X, color: 'var(--icon-critical-base)', label: '未满足' },
  }

  const judge = judgeConfig[judgeStatus]
  const JudgeIcon = judge.icon

  // Don't show if no goal and not editing
  if (!goal && !isEditing) return null

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: 'var(--surface-strong)',
        borderColor: goal ? 'var(--border-strong-base)' : 'var(--border-weak-base)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: 'var(--border-weak-base)' }}
      >
        <Target size={12} style={{ color: 'var(--icon-interactive-base)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--text-strong)' }}>
          目标条件
        </span>
        {goal && (
          <div className="flex items-center gap-1 ml-auto">
            <JudgeIcon
              size={10}
              style={{
                color: judge.color,
                animation: judgeStatus === 'evaluating' ? 'spin 1.5s linear infinite' : 'none',
              }}
            />
            <span className="text-[10px]" style={{ color: judge.color }}>
              {judge.label}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-3 py-2">
        {isEditing ? (
          <div className="space-y-2">
            <div
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: 'var(--input-base)',
                border: '1px solid var(--border-weak-base)',
              }}
            >
              <Zap size={12} style={{ color: 'var(--icon-interactive-base)' }} />
              <input
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-xs"
                style={{ color: 'var(--text-strong)' }}
                placeholder="设置停止条件（如：完成所有测试）"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                autoFocus
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50"
                style={{
                  background: 'var(--button-primary-base)',
                  color: 'var(--text-invert-strong)',
                }}
              >
                <Check size={10} />
                设置目标
              </button>
              {goal && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1.5 rounded-lg text-[11px] transition-colors"
                  style={{ color: 'var(--text-weaker)' }}
                >
                  取消
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="flex-1 text-xs px-2.5 py-1.5 rounded-lg"
              style={{
                background: 'var(--surface-base)',
                color: 'var(--text-strong)',
              }}
            >
              {goal}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 rounded hover:bg-[var(--surface-base-hover)]"
              style={{ color: 'var(--text-weaker)' }}
              title="编辑"
            >
              <Target size={10} />
            </button>
            <button
              onClick={handleClear}
              className="p-1 rounded hover:bg-[var(--surface-base-hover)]"
              style={{ color: 'var(--color-error, #ef4444)' }}
              title="清除"
            >
              <X size={10} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
