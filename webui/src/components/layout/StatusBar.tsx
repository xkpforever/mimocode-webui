import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { useI18n } from '../../context/i18n'
import { useConnectionStore } from '../../stores'
import { TokenUsageBar } from '../token-usage/TokenUsageBar'

export function StatusBar() {
  const { t } = useI18n()
  const connected = useConnectionStore((s) => s.connected)

  return (
    <footer
      className="flex items-center px-3 text-xs"
      style={{
        height: 'var(--statusbar-height)',
        background: 'var(--background-weak)',
        borderTop: '1px solid var(--border-weak-base)',
        color: 'var(--text-base)',
      }}
    >
      <div className="flex items-center gap-2">
        {connected ? (
          <Wifi size={12} style={{ color: 'var(--icon-success-base)' }} />
        ) : (
          <WifiOff size={12} style={{ color: 'var(--icon-critical-base)' }} />
        )}
        <span>{connected ? t('statusbar.connected') : t('statusbar.disconnected')}</span>
        {!connected && (
          <button
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] hover:bg-[var(--surface-base-hover)]"
            style={{ color: 'var(--text-interactive-base)' }}
            title="重新连接"
          >
            <RefreshCw size={10} />
          </button>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <TokenUsageBar />
        <span className="text-[var(--text-weaker)]">v0.2.0</span>
      </div>
    </footer>
  )
}
