import { useState } from 'react'
import { Activity, ChevronUp, ChevronDown } from 'lucide-react'
import { useTokenStore } from '../../stores'

function formatTokens(n: number): string {
  if (n === 0) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function formatCost(cost?: number): string {
  if (cost == null || cost === 0) return ''
  if (cost < 0.01) return '<$0.01'
  return `$${cost.toFixed(2)}`
}

export function TokenUsageBar() {
  const [expanded, setExpanded] = useState(false)
  const usage = useTokenStore((s) => s.usage)

  const totalTokens = usage.inputTokens + usage.outputTokens + usage.cacheReadTokens + usage.cacheWriteTokens
  const costStr = formatCost(usage.totalCost)

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors hover:bg-[var(--surface-base-hover)]"
        style={{ color: totalTokens > 0 ? 'var(--text-base)' : 'var(--text-weaker)' }}
      >
        <Activity size={12} />
        <span className="text-[11px] font-mono">{formatTokens(totalTokens)}</span>
        {costStr && (
          <span className="text-[10px]" style={{ color: 'var(--color-success, #22c55e)' }}>
            {costStr}
          </span>
        )}
        {totalTokens > 0 && (
          expanded ? <ChevronDown size={10} /> : <ChevronUp size={10} />
        )}
      </button>

      {expanded && totalTokens > 0 && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setExpanded(false)} />
          <div
            className="absolute bottom-full right-0 mb-2 w-56 rounded-xl shadow-xl overflow-hidden z-40 animate-slide-in"
            style={{
              background: 'var(--surface-strong)',
              border: '1px solid var(--border-weak-base)',
            }}
          >
            <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border-weak-base)' }}>
              <div className="flex items-center gap-2">
                <Activity size={12} style={{ color: 'var(--icon-interactive-base)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-strong)' }}>
                  Token 用量
                </span>
              </div>
              {usage.model && (
                <div className="text-[10px] mt-1 font-mono" style={{ color: 'var(--text-weaker)' }}>
                  {usage.model}
                </div>
              )}
            </div>

            <div className="px-3 py-2 space-y-2">
              {/* Input Tokens */}
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: 'var(--text-base)' }}>输入</span>
                <span className="text-[11px] font-mono" style={{ color: 'var(--text-strong)' }}>
                  {formatTokens(usage.inputTokens)}
                </span>
              </div>

              {/* Output Tokens */}
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: 'var(--text-base)' }}>输出</span>
                <span className="text-[11px] font-mono" style={{ color: 'var(--text-strong)' }}>
                  {formatTokens(usage.outputTokens)}
                </span>
              </div>

              {/* Cache Read */}
              {usage.cacheReadTokens > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: 'var(--text-base)' }}>缓存读取</span>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--text-strong)' }}>
                    {formatTokens(usage.cacheReadTokens)}
                  </span>
                </div>
              )}

              {/* Cache Write */}
              {usage.cacheWriteTokens > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: 'var(--text-base)' }}>缓存写入</span>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--text-strong)' }}>
                    {formatTokens(usage.cacheWriteTokens)}
                  </span>
                </div>
              )}

              {/* Divider */}
              <div className="border-t" style={{ borderColor: 'var(--border-weak-base)' }} />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold" style={{ color: 'var(--text-strong)' }}>总计</span>
                <span className="text-[11px] font-mono font-semibold" style={{ color: 'var(--text-strong)' }}>
                  {formatTokens(totalTokens)}
                </span>
              </div>

              {/* Cost */}
              {costStr && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: 'var(--text-base)' }}>费用</span>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--color-success, #22c55e)' }}>
                    {costStr}
                  </span>
                </div>
              )}
            </div>

            {/* Usage Bar */}
            <div className="px-3 pb-2">
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--surface-base)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, totalTokens > 0 ? (usage.inputTokens + usage.outputTokens) / totalTokens * 100 : 0)}%`,
                    background: 'var(--button-primary-base)',
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
