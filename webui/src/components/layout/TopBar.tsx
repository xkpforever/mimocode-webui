import { Link } from 'react-router-dom'
import {
  PanelLeft,
  Settings,
  Sun,
  Moon,
  Terminal,
  Languages,
  Search,
} from 'lucide-react'
import { AgentSelector } from '../agent/AgentSelector'
import { ModelSelector } from '../model/ModelSelector'
import { useSettingsStore } from '../../stores'
import { useI18n } from '../../context/i18n'

interface TopBarProps {
  onMenuClick: () => void
  onTerminalClick: () => void
  onCommandPalette?: () => void
  terminalOpen: boolean
}

export function TopBar({ onMenuClick, onTerminalClick, onCommandPalette, terminalOpen }: TopBarProps) {
  const { colorScheme, setColorScheme } = useSettingsStore()
  const { t, locale, setLocale } = useI18n()
  const dark = colorScheme === 'dark'

  return (
    <header
      className="glass"
      style={{
        height: 'var(--topbar-height)',
        borderBottom: '1px solid var(--border-weak-base)',
      }}
    >
      <div className="flex items-center h-full px-3 gap-2">
        {/* Menu toggle */}
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-[var(--button-ghost-hover)] text-[var(--icon-base)] hover:text-[var(--icon-hover)] transition-colors"
          title={t('topbar.toggleSidebar')}
        >
          <PanelLeft size={18} />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 px-2 no-underline">
          <span
            className="font-bold text-sm tracking-tight"
            style={{ color: 'var(--text-strong)' }}
          >
            MIMO
          </span>
          <span
            className="font-mono text-xs px-1.5 py-0.5 rounded"
            style={{
              background: 'var(--surface-interactive-base)',
              color: 'var(--text-interactive-base)',
            }}
          >
            Code
          </span>
        </Link>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--border-weak-base)' }} />

        <AgentSelector />

        <div className="w-px h-5 mx-1" style={{ background: 'var(--border-weak-base)' }} />

        <ModelSelector />

        {/* Command Palette trigger */}
        <button
          onClick={onCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors hover:bg-[var(--button-ghost-hover)]"
          style={{ color: 'var(--text-weaker)', border: '1px solid var(--border-weak-base)' }}
          title="⌘K"
        >
          <Search size={12} />
          <span className="hidden sm:inline">Search...</span>
          <kbd
            className="hidden sm:inline px-1 py-0.5 rounded text-[10px]"
            style={{ background: 'var(--surface-base)', color: 'var(--text-weaker)' }}
          >
            ⌘K
          </kbd>
        </button>

        <div className="flex-1" />

        {/* Language switch */}
        <button
          onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors hover:bg-[var(--button-ghost-hover)]"
          style={{ color: 'var(--text-base)' }}
          title={t('topbar.switchLang')}
        >
          <Languages size={14} />
          <span>{t('topbar.switchLang')}</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setColorScheme(dark ? 'light' : 'dark')}
          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-[var(--button-ghost-hover)] text-[var(--icon-base)] hover:text-[var(--icon-hover)] transition-colors"
          title={dark ? t('topbar.toggleDark') : t('topbar.toggleLight')}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Terminal */}
        <button
          onClick={onTerminalClick}
          className="flex items-center justify-center w-8 h-8 rounded-md transition-colors"
          style={{
            background: terminalOpen ? 'var(--surface-interactive-base)' : 'transparent',
            color: terminalOpen ? 'var(--icon-interactive-base)' : 'var(--icon-base)',
          }}
          title={t('topbar.toggleTerminal')}
        >
          <Terminal size={16} />
        </button>

        {/* Settings */}
        <Link
          to="/settings"
          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-[var(--button-ghost-hover)] text-[var(--icon-base)] hover:text-[var(--icon-hover)] transition-colors"
          title={t('topbar.settings')}
        >
          <Settings size={16} />
        </Link>
      </div>
    </header>
  )
}
