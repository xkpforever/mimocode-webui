import { Server, Palette, Wifi, Languages, Puzzle, Bell } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { ThemePicker } from './ThemePicker'
import { useSettingsStore } from '../../stores'
import { applyTheme } from '../../lib/theme'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useI18n } from '../../context/i18n'
import { McpManager } from '../mcp/McpManager'
import { NotificationSettings } from '../../lib/notifications'

export function SettingsPanel() {
  const navigate = useNavigate()
  const { t, locale, setLocale } = useI18n()
  const { serverUrl, setServerUrl, colorScheme, setColorScheme } = useSettingsStore()

  const [themeSection, setThemeSection] = useState(true)
  const [connectionSection, setConnectionSection] = useState(true)
  const [langOpen, setLangOpen] = useState(true)
  const [mcpSection, setMcpSection] = useState(false)
  const [notifSection, setNotifSection] = useState(false)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-xl font-bold"
          style={{ color: 'var(--text-strong)' }}
        >
          {t('settings.title')}
        </h1>
        <Button variant="ghost" onClick={() => navigate('/')}>
          {t('settings.back')}
        </Button>
      </div>

      {/* Connection */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: 'var(--surface-strong)',
          borderColor: 'var(--border-weak-base)',
        }}
      >
        <button
          onClick={() => setConnectionSection(!connectionSection)}
          className="w-full flex items-center justify-between px-5 py-3.5"
        >
          <div className="flex items-center gap-2.5">
            <Server size={16} style={{ color: 'var(--icon-base)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
              {t('settings.serverConnection')}
            </span>
          </div>
        </button>

        {connectionSection && (
          <div className="px-5 pb-4 space-y-4">
            <Input
              label={t('settings.serverUrl')}
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://localhost:4096"
            />
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs"
                style={{
                  background: 'var(--surface-interactive-weak)',
                  color: 'var(--text-base)',
                }}
              >
                <Wifi size={12} style={{ color: 'var(--icon-success-base)' }} />
                {t('settings.checking')}
              </div>
              <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
                {t('settings.reconnect')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Language */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: 'var(--surface-strong)',
          borderColor: 'var(--border-weak-base)',
        }}
      >
        <button
          onClick={() => setLangOpen(!langOpen)}
          className="w-full flex items-center justify-between px-5 py-3.5"
        >
          <div className="flex items-center gap-2.5">
            <Languages size={16} style={{ color: 'var(--icon-base)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
              {t('settings.language')}
            </span>
          </div>
        </button>

        {langOpen && (
          <div className="px-5 pb-4">
            <div className="flex gap-2">
              {[
                { id: 'en' as const, label: 'English' },
                { id: 'zh' as const, label: '中文' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLocale(lang.id)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border"
                  style={{
                    background: locale === lang.id
                      ? 'var(--surface-interactive-base)'
                      : 'var(--surface-strong)',
                    borderColor: locale === lang.id
                      ? 'var(--border-selected)'
                      : 'var(--border-weak-base)',
                    color: 'var(--text-strong)',
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Theme */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: 'var(--surface-strong)',
          borderColor: 'var(--border-weak-base)',
        }}
      >
        <button
          onClick={() => setThemeSection(!themeSection)}
          className="w-full flex items-center justify-between px-5 py-3.5"
        >
          <div className="flex items-center gap-2.5">
            <Palette size={16} style={{ color: 'var(--icon-base)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
              {t('settings.appearance')}
            </span>
          </div>
        </button>

        {themeSection && (
          <div className="px-5 pb-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium" style={{ color: 'var(--text-base)' }}>
                {t('settings.colorScheme')}
              </label>
              <div className="flex gap-2">
                {(['dark', 'light', 'system'] as const).map((scheme) => (
                  <button
                    key={scheme}
                    onClick={() => {
                      setColorScheme(scheme)
                      const resolved = scheme === 'system'
                        ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                        : scheme
                      applyTheme(useSettingsStore.getState().theme, resolved)
                    }}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all border"
                    style={{
                      background: colorScheme === scheme ? 'var(--surface-interactive-base)' : 'var(--surface-strong)',
                      borderColor: colorScheme === scheme ? 'var(--border-selected)' : 'var(--border-weak-base)',
                      color: 'var(--text-strong)',
                    }}
                  >
                    {t(`settings.${scheme}`)}
                  </button>
                ))}
              </div>
            </div>
            <ThemePicker />
          </div>
        )}
      </div>

      {/* MCP Servers */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: 'var(--surface-strong)',
          borderColor: 'var(--border-weak-base)',
        }}
      >
        <button
          onClick={() => setMcpSection(!mcpSection)}
          className="w-full flex items-center justify-between px-5 py-3.5"
        >
          <div className="flex items-center gap-2.5">
            <Puzzle size={16} style={{ color: 'var(--icon-base)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
              {t('settings.mcp')}
            </span>
          </div>
        </button>

        {mcpSection && (
          <div className="px-5 pb-4">
            <McpManager />
          </div>
        )}
      </div>

      {/* Notifications */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: 'var(--surface-strong)',
          borderColor: 'var(--border-weak-base)',
        }}
      >
        <button
          onClick={() => setNotifSection(!notifSection)}
          className="w-full flex items-center justify-between px-5 py-3.5"
        >
          <div className="flex items-center gap-2.5">
            <Bell size={16} style={{ color: 'var(--icon-base)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
              {t('settings.notifications')}
            </span>
          </div>
        </button>

        {notifSection && (
          <div className="px-5 pb-4">
            <NotificationSettings />
          </div>
        )}
      </div>
    </div>
  )
}
