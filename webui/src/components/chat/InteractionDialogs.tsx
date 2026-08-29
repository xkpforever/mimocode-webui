import { useState, useCallback } from 'react'
import { Dialog } from '../ui/Dialog'
import type { QuestionRequest, PermissionRequest } from '../../lib/interaction'

/* ─── Shared action button ─── */

function Btn({ onClick, label, primary, danger }: {
  onClick: () => void
  label: string
  primary?: boolean
  danger?: boolean
}) {
  let bg: string
  let textColor: string
  if (danger) { bg = '#d32f2f'; textColor = '#ffffff' }
  else if (primary) { bg = '#1976d2'; textColor = '#ffffff' }
  else { bg = 'transparent'; textColor = 'var(--text-base)' }

  return (
    <button
      onClick={onClick}
      type="button"
      className="px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer select-none"
      style={{ background: bg, color: textColor, borderColor: bg }}
    >
      {label}
    </button>
  )
}

/* ─── Question Dialog ─── */

interface QuestionDialogProps {
  request: QuestionRequest
  onReply: (requestID: string, answers: string[][]) => void
  onClose: () => void
}

export function QuestionDialog({ request, onReply, onClose }: QuestionDialogProps) {
  const [selections, setSelections] = useState<Record<number, string>>({})

  const handleSubmit = useCallback(() => {
    // Server expects: answers[][] — each question gets array of selected labels
    const answers = request.questions.map((_, i) =>
      selections[i] ? [selections[i]] : []
    )
    onReply(request.id, answers)
  }, [request, selections, onReply])

  if (!request.questions || request.questions.length === 0) return null

  return (
    <Dialog open={true} onClose={onClose} title={request.questions[0]?.header || 'MIMO Code 提问'}>
      <div className="space-y-4">
        {request.questions.map((q, qi) => (
          <div key={qi} className="space-y-2">
            <p className="text-sm" style={{ color: 'var(--text-base)' }}>
              {q.question}
            </p>
            {q.options && q.options.length > 0 ? (
              <div className="space-y-1">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => setSelections((prev) => ({ ...prev, [qi]: opt.label }))}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all border"
                    style={{
                      background: selections[qi] === opt.label
                        ? 'var(--surface-interactive-base)'
                        : 'var(--surface-strong)',
                      borderColor: selections[qi] === opt.label
                        ? 'var(--border-selected)'
                        : 'var(--border-weak-base)',
                      color: 'var(--text-strong)',
                    }}
                  >
                    <div className="font-medium">{opt.label}</div>
                    {opt.description && (
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-weaker)' }}>
                        {opt.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={onClose} label="取消" />
          <Btn onClick={handleSubmit} label="提交" primary />
        </div>
      </div>
    </Dialog>
  )
}

/* ─── Permission Dialog ─── */

interface PermissionDialogProps {
  request: PermissionRequest
  onReply: (requestID: string, action: 'once' | 'always' | 'reject') => void
  onClose: () => void
}

export function PermissionDialog({ request, onReply, onClose }: PermissionDialogProps) {
  if (!request) return null

  // Build a human-readable description from the server data
  const description = request.patterns?.length
    ? `${request.permission}: ${request.patterns.join(', ')}`
    : request.permission

  const metadataEntries = request.metadata
    ? Object.entries(request.metadata).filter(([k, v]) => !['sessionID', 'toolCallID'].includes(k))
    : []

  return (
    <Dialog open={true} onClose={onClose} title="权限请求">
      <div className="space-y-4">
        {/* Tool action */}
        <div
          className="rounded-lg px-3 py-2 text-sm font-mono break-all"
          style={{ background: 'var(--surface-base)', color: 'var(--text-strong)' }}
        >
          {description}
        </div>

        {/* Metadata details */}
        {metadataEntries.length > 0 && (
          <div
            className="rounded-lg p-3 text-xs font-mono overflow-auto max-h-32"
            style={{
              background: 'var(--surface-inset-base)',
              color: 'var(--text-base)',
              border: '1px solid var(--border-weak-base)',
            }}
          >
            {metadataEntries.map(([k, v]) => (
              <div key={k} className="mb-1">
                <span style={{ color: 'var(--text-weaker)' }}>{k}: </span>
                {typeof v === 'string' ? v : JSON.stringify(v)}
              </div>
            ))}
          </div>
        )}

        {/* Buttons — server expects: once / always / reject */}
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={onClose} label="关闭" />
          <Btn onClick={() => onReply(request.id, 'reject')} label="拒绝" danger />
          <Btn onClick={() => onReply(request.id, 'once')} label="允许" primary />
          <Btn onClick={() => onReply(request.id, 'always')} label="始终允许" primary />
        </div>
      </div>
    </Dialog>
  )
}
