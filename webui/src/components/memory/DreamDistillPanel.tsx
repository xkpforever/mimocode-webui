import { useState, useCallback } from 'react'
import {
  Sparkles,
  Brain,
  Beaker,
  Loader2,
  Check,
  AlertCircle,
  ChevronRight,
  FileText,
  Wand2,
} from 'lucide-react'
import { useI18n } from '../../context/i18n'
import { getBaseUrl } from '../../lib/api'

interface DreamDistillState {
  dreamRunning: boolean
  distillRunning: boolean
  dreamResult: string | null
  distillResult: string | null
  dreamError: string | null
  distillError: string | null
}

async function sendCommand(command: string): Promise<string> {
  const base = getBaseUrl()
  // Create a temporary session and send the command
  const sessionRes = await fetch(`${base}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
    signal: AbortSignal.timeout(10_000),
  })
  if (!sessionRes.ok) throw new Error('Failed to create session')
  const session = await sessionRes.json()

  // Send the command as a message
  const msgRes = await fetch(`${base}/session/${session.id}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parts: [{ type: 'text', text: command }] }),
    signal: AbortSignal.timeout(120_000),
  })
  if (!msgRes.ok) throw new Error(`Command failed (${msgRes.status})`)

  const data = await msgRes.json()
  let reply = ''
  if (data.parts) {
    for (const part of data.parts) {
      if (part.type === 'text' && part.text) reply += part.text
    }
  }
  return reply || '(no response)'
}

export function DreamDistillPanel() {
  const { t } = useI18n()
  const [state, setState] = useState<DreamDistillState>({
    dreamRunning: false,
    distillRunning: false,
    dreamResult: null,
    distillResult: null,
    dreamError: null,
    distillError: null,
  })
  const [expanded, setExpanded] = useState<'dream' | 'distill' | null>(null)

  const triggerDream = useCallback(async () => {
    setState(s => ({ ...s, dreamRunning: true, dreamResult: null, dreamError: null }))
    try {
      const result = await sendCommand('/dream')
      setState(s => ({ ...s, dreamRunning: false, dreamResult: result }))
    } catch (err) {
      setState(s => ({
        ...s,
        dreamRunning: false,
        dreamError: err instanceof Error ? err.message : 'Dream failed',
      }))
    }
  }, [])

  const triggerDistill = useCallback(async () => {
    setState(s => ({ ...s, distillRunning: true, distillResult: null, distillError: null }))
    try {
      const result = await sendCommand('/distill')
      setState(s => ({ ...s, distillRunning: false, distillResult: result }))
    } catch (err) {
      setState(s => ({
        ...s,
        distillRunning: false,
        distillError: err instanceof Error ? err.message : 'Distill failed',
      }))
    }
  }, [])

  return (
    <div className="space-y-3">
      {/* Dream Card */}
      <div
        className="rounded-xl border overflow-hidden transition-all"
        style={{
          background: 'var(--surface-strong)',
          borderColor: expanded === 'dream' ? 'var(--border-strong-base)' : 'var(--border-weak-base)',
        }}
      >
        <button
          onClick={() => setExpanded(expanded === 'dream' ? null : 'dream')}
          className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-base-hover)]"
        >
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Brain size={18} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
                Dream
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--surface-base)', color: 'var(--text-weaker)' }}>
                Memory Extraction
              </span>
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-weaker)' }}>
              Scan traces, extract persistent knowledge, prune stale memories
            </p>
          </div>
          <ChevronRight
            size={14}
            className="shrink-0 transition-transform"
            style={{
              color: 'var(--text-weaker)',
              transform: expanded === 'dream' ? 'rotate(90deg)' : 'none',
            }}
          />
        </button>

        {expanded === 'dream' && (
          <div className="px-4 pb-4 space-y-3 animate-slide-in">
            {/* Features */}
            <div className="space-y-1.5">
              {[
                'Scan recent session traces',
                'Extract persistent knowledge to project memory',
                'Prune stale or duplicate entries',
                'Update MEMORY.md files',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-base)' }}>
                  <Wand2 size={10} style={{ color: 'var(--icon-info-base)' }} />
                  {feature}
                </div>
              ))}
            </div>

            {/* Trigger Button */}
            <button
              onClick={triggerDream}
              disabled={state.dreamRunning}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
              }}
            >
              {state.dreamRunning ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Run Dream
                </>
              )}
            </button>

            {/* Result */}
            {state.dreamResult && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg text-xs"
                style={{ background: 'var(--color-success, #22c55e)15', color: 'var(--color-success, #22c55e)' }}
              >
                <Check size={14} className="shrink-0 mt-0.5" />
                <span>{state.dreamResult}</span>
              </div>
            )}
            {state.dreamError && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg text-xs"
                style={{ background: 'var(--color-error, #ef4444)15', color: 'var(--color-error, #ef4444)' }}
              >
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{state.dreamError}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Distill Card */}
      <div
        className="rounded-xl border overflow-hidden transition-all"
        style={{
          background: 'var(--surface-strong)',
          borderColor: expanded === 'distill' ? 'var(--border-strong-base)' : 'var(--border-weak-base)',
        }}
      >
        <button
          onClick={() => setExpanded(expanded === 'distill' ? null : 'distill')}
          className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-base-hover)]"
        >
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
          >
            <Beaker size={18} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
                Distill
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--surface-base)', color: 'var(--text-weaker)' }}>
                Skill Discovery
              </span>
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-weaker)' }}>
              Discover repeat workflows, package as reusable skills
            </p>
          </div>
          <ChevronRight
            size={14}
            className="shrink-0 transition-transform"
            style={{
              color: 'var(--text-weaker)',
              transform: expanded === 'distill' ? 'rotate(90deg)' : 'none',
            }}
          />
        </button>

        {expanded === 'distill' && (
          <div className="px-4 pb-4 space-y-3 animate-slide-in">
            <div className="space-y-1.5">
              {[
                'Analyze recent work patterns',
                'Identify duplicate manual workflows',
                'Generate high-confidence skill candidates',
                'Package as reusable Skill/Subagent',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-base)' }}>
                  <FileText size={10} style={{ color: 'var(--icon-warning-base)' }} />
                  {feature}
                </div>
              ))}
            </div>

            <button
              onClick={triggerDistill}
              disabled={state.distillRunning}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                color: 'white',
              }}
            >
              {state.distillRunning ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Beaker size={14} />
                  Run Distill
                </>
              )}
            </button>

            {state.distillResult && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg text-xs"
                style={{ background: 'var(--color-success, #22c55e)15', color: 'var(--color-success, #22c55e)' }}
              >
                <Check size={14} className="shrink-0 mt-0.5" />
                <span>{state.distillResult}</span>
              </div>
            )}
            {state.distillError && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg text-xs"
                style={{ background: 'var(--color-error, #ef4444)15', color: 'var(--color-error, #ef4444)' }}
              >
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{state.distillError}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
