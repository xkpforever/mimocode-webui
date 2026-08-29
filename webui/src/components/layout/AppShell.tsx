import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { StatusBar } from './StatusBar'
import { TerminalPanel } from '../terminal/TerminalPanel'
import { FileExplorer } from '../file-explorer/FileExplorer'
import { GitExplorer } from '../git-explorer/GitExplorer'
import { CodeEditor } from '../code-editor/CodeEditor'
import { CommandPalette, useCommandPalette } from '../command-palette/CommandPalette'
import { PermissionPanel } from '../permissions/PermissionPanel'
import { useState, useCallback, useEffect } from 'react'
import { useSSEConnection } from '../../hooks/useSSEConnection'
import { useI18n } from '../../context/i18n'
import {
  GitBranch,
  Terminal,
  FolderTree,
  X,
} from 'lucide-react'

type RightPanel = 'none' | 'files' | 'git' | 'editor'

export function AppShell() {
  const { t } = useI18n()
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [rightPanel, setRightPanel] = useState<RightPanel>('none')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const { isOpen: paletteOpen, toggle: togglePalette, close: closePalette } = useCommandPalette()

  // Establish global SSE connection
  useSSEConnection()

  // Auto-collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B — toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        setSidebarOpen(prev => !prev)
      }
      // Cmd/Ctrl + J — toggle terminal
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault()
        setTerminalOpen(prev => !prev)
      }
      // Escape — close right panel on mobile
      if (e.key === 'Escape') {
        if (rightPanel !== 'none') {
          setRightPanel('none')
        } else if (window.innerWidth <= 768 && sidebarOpen) {
          setSidebarOpen(false)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [rightPanel, sidebarOpen])

  // Listen for custom events from ChatView
  useEffect(() => {
    const handleToggleTerminal = () => setTerminalOpen(prev => !prev)
    const handleAttachFile = () => setRightPanel('files')

    window.addEventListener('mimocode:toggle-terminal', handleToggleTerminal)
    window.addEventListener('mimocode:attach-file', handleAttachFile)
    return () => {
      window.removeEventListener('mimocode:toggle-terminal', handleToggleTerminal)
      window.removeEventListener('mimocode:attach-file', handleAttachFile)
    }
  }, [])

  const togglePanel = useCallback((panel: RightPanel) => {
    setRightPanel(prev => prev === panel ? 'none' : panel)
  }, [])

  const openFile = useCallback((path: string) => {
    setSelectedFile(path)
    setRightPanel('editor')
  }, [])

  const commands = [
    { id: 'files', label: t('panel.files'), icon: FolderTree, category: t('commandPalette.category.view'), action: () => togglePanel('files') },
    { id: 'git', label: t('panel.git'), icon: GitBranch, category: t('commandPalette.category.view'), action: () => togglePanel('git') },
    { id: 'terminal', label: t('panel.terminal'), icon: Terminal, category: t('commandPalette.category.view'), action: () => setTerminalOpen(!terminalOpen) },
    { id: 'sidebar', label: t('topbar.toggleSidebar'), icon: FolderTree, category: t('commandPalette.category.view'), action: () => setSidebarOpen(!sidebarOpen) },
  ]

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <TopBar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onTerminalClick={() => setTerminalOpen(!terminalOpen)}
        onCommandPalette={togglePalette}
        terminalOpen={terminalOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--background-base)' }}>
          <main className="flex-1 overflow-hidden">
            <Outlet />
          </main>
          <TerminalPanel open={terminalOpen} onClose={() => setTerminalOpen(false)} />
        </div>

        {rightPanel !== 'none' && (
          <div
            className="flex flex-col border-l overflow-hidden shrink-0"
            style={{
              width: rightPanel === 'editor' ? '50%' : '320px',
              minWidth: rightPanel === 'editor' ? '400px' : '280px',
              maxWidth: rightPanel === 'editor' ? '70%' : '400px',
              borderColor: 'var(--border-weak-base)',
              background: 'var(--background-weak)',
            }}
          >
            <div
              className="flex items-center gap-2 px-3 py-2 border-b shrink-0"
              style={{ borderColor: 'var(--border-weak-base)' }}
            >
              <div className="flex gap-1">
                <button
                  onClick={() => togglePanel('files')}
                  className="flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors"
                  style={{
                    background: rightPanel === 'files' ? 'var(--surface-strong)' : 'transparent',
                    color: rightPanel === 'files' ? 'var(--text-strong)' : 'var(--text-weaker)',
                  }}
                >
                  <FolderTree size={12} />
                  {t('panel.files')}
                </button>
                <button
                  onClick={() => togglePanel('git')}
                  className="flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors"
                  style={{
                    background: rightPanel === 'git' ? 'var(--surface-strong)' : 'transparent',
                    color: rightPanel === 'git' ? 'var(--text-strong)' : 'var(--text-weaker)',
                  }}
                >
                  <GitBranch size={12} />
                  {t('panel.git')}
                </button>
              </div>
              <div className="flex-1" />
              <button
                onClick={() => setRightPanel('none')}
                className="p-1 rounded hover:bg-[var(--surface-base-hover)] transition-colors"
                style={{ color: 'var(--text-weaker)' }}
              >
                <X size={12} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {rightPanel === 'files' && <FileExplorer onFileSelect={openFile} />}
              {rightPanel === 'git' && <GitExplorer onFileSelect={openFile} />}
              {rightPanel === 'editor' && selectedFile && (
                <CodeEditor filePath={selectedFile} onClose={() => setRightPanel('none')} />
              )}
            </div>
          </div>
        )}
      </div>

      <StatusBar />

      {/* Panel Toggle Buttons */}
      <div className="fixed right-4 z-30 flex flex-col gap-1" style={{ bottom: terminalOpen ? '240px' : '128px' }}>
        <button
          onClick={() => togglePanel('files')}
          className="p-2 rounded-lg shadow-lg transition-all hover:scale-105"
          style={{
            background: rightPanel === 'files' ? 'var(--text-interactive-base)' : 'var(--surface-strong)',
            color: rightPanel === 'files' ? 'white' : 'var(--text-base)',
            border: '1px solid var(--border-weak-base)',
          }}
          title={t('panel.files')}
        >
          <FolderTree size={16} />
        </button>
        <button
          onClick={() => togglePanel('git')}
          className="p-2 rounded-lg shadow-lg transition-all hover:scale-105"
          style={{
            background: rightPanel === 'git' ? 'var(--text-interactive-base)' : 'var(--surface-strong)',
            color: rightPanel === 'git' ? 'white' : 'var(--text-base)',
            border: '1px solid var(--border-weak-base)',
          }}
          title={t('panel.git')}
        >
          <GitBranch size={16} />
        </button>
      </div>

      {/* Permission Panel (floating) */}
      <PermissionPanel />

      {/* Command Palette */}
      <CommandPalette isOpen={paletteOpen} onClose={closePalette} commands={commands} />
    </div>
  )
}
