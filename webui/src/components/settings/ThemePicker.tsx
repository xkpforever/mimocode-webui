import { useSettingsStore } from '../../stores'
import { THEMES, applyTheme } from '../../lib/theme'
import { Check, Palette } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../../context/i18n'

interface ThemePickerProps {
  inDialog?: boolean
}

export function ThemePicker({ inDialog }: ThemePickerProps) {
  const { t } = useI18n()
  const { theme, setTheme } = useSettingsStore()
  const [search, setSearch] = useState('')

  const filtered = THEMES.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (id: string) => {
    setTheme(id)
    applyTheme(id)
  }

  return (
    <div className={inDialog ? '' : 'space-y-3'}>
      {!inDialog && (
        <div className="flex items-center gap-2">
          <Palette size={16} style={{ color: 'var(--icon-base)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
            {t('settings.theme')}
          </span>
        </div>
      )}

      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm"
        style={{
          background: 'var(--input-base)',
          border: '1px solid var(--border-weak-base)',
        }}
      >
        <input
          type="text"
          placeholder={t('settings.searchThemes')}
          className="flex-1 bg-transparent border-none outline-none text-sm"
          style={{ color: 'var(--text-strong)' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[320px] overflow-y-auto">
        {filtered.map((t) => {
          const isSelected = theme === t.id
          return (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all border text-sm"
              style={{
                background: isSelected ? 'var(--surface-interactive-base)' : 'var(--surface-strong)',
                borderColor: isSelected ? 'var(--border-selected)' : 'var(--border-weak-base)',
              }}
            >
              <div
                className="w-4 h-4 rounded-full border shrink-0"
                style={{
                  background: t.type === 'dark' ? '#1e1e1e' : '#f8f8f8',
                  borderColor: 'var(--border-weak-base)',
                }}
              />
              <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-strong)' }}>
                {t.name}
              </span>
              {isSelected && (
                <Check size={12} style={{ color: 'var(--icon-interactive-base)' }} />
              )}
            </button>
          )
        })}
      </div>

      <div className="text-xs text-center" style={{ color: 'var(--text-weaker)' }}>
        {t('settings.themeCount', { count: filtered.length, total: THEMES.length })}
      </div>
    </div>
  )
}
