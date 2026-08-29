import { useState } from 'react'
import { X, Terminal } from 'lucide-react'
import { TerminalView } from './TerminalTab'
import { useSettingsStore } from '../../stores'

interface TerminalPanelProps {
  open: boolean
  onClose: () => void
}

export function TerminalPanel({ open, onClose }: TerminalPanelProps) {
  const serverUrl = useSettingsStore((s) => s.serverUrl)

  if (!open) return null

  return (
    <div
      className="flex flex-col border-t"
      style={{
        height: '250px',
        background: 'var(--background-base)',
        borderColor: 'var(--border-weak-base)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{
          background: 'var(--surface-strong)',
          borderBottom: '1px solid var(--border-weak-base)',
        }}
      >
        <div className="flex items-center gap-2">
          <Terminal size={14} style={{ color: 'var(--text-weaker)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-base)' }}>
            Terminal
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-5 h-5 rounded hover:bg-[var(--surface-base-hover)] transition-colors"
          style={{ color: 'var(--text-weaker)' }}
        >
          <X size={12} />
        </button>
      </div>

      {/* Terminal content */}
      <div className="flex-1 overflow-hidden">
        <TerminalView
          className="w-full h-full"
          serverUrl={serverUrl || 'http://localhost:4096'}
        />
      </div>
    </div>
  )
}
