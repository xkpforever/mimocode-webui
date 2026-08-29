import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  Search,
  Terminal,
  FileCode,
  GitBranch,
  Settings,
  MessageSquare,
  BrainCircuit,
  ListTree,
  RefreshCw,
  Moon,
  Sun,
  Keyboard,
} from 'lucide-react'
import { useI18n } from '../../context/i18n'

interface Command {
  id: string
  label: string
  description?: string
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties } | any>
  category: string
  action: () => void
  shortcut?: string
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  commands: Command[]
}

export function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filteredCommands = useMemo(() => {
    if (!query) return commands
    const lower = query.toLowerCase()
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(lower) ||
      cmd.description?.toLowerCase().includes(lower) ||
      cmd.category.toLowerCase().includes(lower)
    )
  }, [commands, query])

  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {}
    for (const cmd of filteredCommands) {
      if (!groups[cmd.category]) groups[cmd.category] = []
      groups[cmd.category].push(cmd)
    }
    return groups
  }, [filteredCommands])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const executeCommand = useCallback((cmd: Command) => {
    cmd.action()
    onClose()
  }, [onClose])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [filteredCommands, selectedIndex, executeCommand, onClose])

  useEffect(() => {
    const children = listRef.current?.children
    if (!children) return
    if (selectedIndex >= children.length) {
      listRef.current?.lastElementChild?.scrollIntoView({ block: 'nearest' })
    }
    const selected = children[selectedIndex]
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  if (!isOpen) return null

  let flatIndex = 0

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="fixed z-50 top-[15%] left-1/2 -translate-x-1/2 w-full max-w-[520px] rounded-xl shadow-2xl overflow-hidden"
        style={{
          background: 'var(--surface-strong)',
          border: '1px solid var(--border-weak-base)',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border-weak-base)' }}>
          <Search size={16} style={{ color: 'var(--text-weaker)' }} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: 'var(--text-strong)' }}
            placeholder={t('commandPalette.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd
            className="px-1.5 py-0.5 rounded text-[10px]"
            style={{ background: 'var(--surface-base)', color: 'var(--text-weaker)' }}
          >
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-1">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs" style={{ color: 'var(--text-weaker)' }}>
              {t('commandPalette.noResults')}
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category}>
                <div
                  className="px-4 py-1.5 text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-weaker)' }}
                >
                  {category}
                </div>
                {cmds.map(cmd => {
                  const idx = flatIndex++
                  const isSelected = idx === selectedIndex
                  return (
                    <button
                      key={cmd.id}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                      style={{
                        background: isSelected ? 'var(--surface-base-hover)' : 'transparent',
                        color: 'var(--text-base)',
                      }}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <cmd.icon size={16} style={{ color: 'var(--text-weaker)' }} />
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-[11px] truncate" style={{ color: 'var(--text-weaker)' }}>
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd
                          className="px-1.5 py-0.5 rounded text-[10px] shrink-0"
                          style={{ background: 'var(--surface-base)', color: 'var(--text-weaker)' }}
                        >
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-4 px-4 py-2 border-t text-[10px]"
          style={{ borderColor: 'var(--border-weak-base)', color: 'var(--text-weaker)' }}
        >
          <span>↑↓ {t('commandPalette.navigate')}</span>
          <span>↵ {t('commandPalette.select')}</span>
          <span>ESC {t('commandPalette.close')}</span>
        </div>
      </div>
    </>
  )
}

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggle])

  return { isOpen, toggle, close: () => setIsOpen(false) }
}
