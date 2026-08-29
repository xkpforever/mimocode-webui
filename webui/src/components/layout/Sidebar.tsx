import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageSquare,
  BrainCircuit,

  ListTree,
  Search,
  Plus,
  History,
  Trash2,
  RefreshCw,
  Clock,
  Sparkles,
  Network,
} from 'lucide-react'
import { useI18n } from '../../context/i18n'
import { useSessionStore, useChatStore, useArchiveStore } from '../../stores'
import { useSessions } from '../../hooks/useSessions'
import { getBaseUrl } from '../../lib/api'
import { MemoryBrowser } from '../memory/MemoryBrowser'
import { CheckpointTimeline } from '../memory/CheckpointTimeline'
import { DreamDistillPanel } from '../memory/DreamDistillPanel'
import { EvolutionDashboard } from '../memory/EvolutionDashboard'
import { MemoryGraph } from '../memory/MemoryGraph'
import { TasksPanel } from '../task/TasksPanel'
import { ProjectSwitcher } from '../project/ProjectSwitcher'
import { SessionSearch } from '../session/SessionSearch'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

type Tab = 'sessions' | 'memory' | 'tasks'
type MemorySubTab = 'search' | 'checkpoints' | 'evolve' | 'graph'

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return date.toLocaleDateString()
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<Tab>('sessions')
  const [memorySubTab, setMemorySubTab] = useState<MemorySubTab>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSessionSearch, setShowSessionSearch] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [currentProject, setCurrentProject] = useState<{ directory: string; name?: string } | null>(null)
  const { toggleArchive, isArchived } = useArchiveStore()
  const { addSession, removeSession, setCurrentSession: setSessionStoreCurrent } = useSessionStore()
  const { setCurrentSession: setChatCurrentSession } = useChatStore()

  // Listen for tab switch events from HomePage
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.tab === 'memory') setActiveTab('memory')
      else if (e.detail?.tab === 'tasks') setActiveTab('tasks')
    }
    window.addEventListener('mimocode:switch-tab', handler as EventListener)
    return () => window.removeEventListener('mimocode:switch-tab', handler as EventListener)
  }, [])
  const { serverSessions, loading, refresh } = useSessions()

  const tabs = [
    { id: 'sessions' as Tab, label: t('sidebar.tab.sessions'), icon: MessageSquare },
    { id: 'memory' as Tab, label: t('sidebar.tab.memory'), icon: BrainCircuit },
    { id: 'tasks' as Tab, label: t('sidebar.tab.tasks'), icon: ListTree },
  ]

  const memorySubTabs = [
    { id: 'search' as MemorySubTab, label: t('memory.search'), icon: Search },
    { id: 'checkpoints' as MemorySubTab, label: t('memory.timeline'), icon: Clock },
    { id: 'evolve' as MemorySubTab, label: t('memory.evolve'), icon: Sparkles },
    { id: 'graph' as MemorySubTab, label: t('memory.graph'), icon: Network },
  ]

  const handleNewSession = async () => {
    const tempId = `temp-${Date.now()}`
    const tempSession = {
      id: tempId,
      title: `会话 ${serverSessions.length + 1}`,
      agent: 'build' as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 0,
    }
    addSession(tempSession)
    setSessionStoreCurrent(tempId)
    setChatCurrentSession(tempId)
    navigate(`/chat/${tempId}`)

    try {
      const base = getBaseUrl()
      const res = await fetch(`${base}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      if (res.ok) {
        const newSession = await res.json()
        removeSession(tempId)
        addSession({
          id: newSession.id,
          title: newSession.title || tempSession.title,
          agent: 'build',
          createdAt: newSession.time?.created || Date.now(),
          updatedAt: newSession.time?.updated || Date.now(),
          messageCount: 0,
        })
        setSessionStoreCurrent(newSession.id)
        setChatCurrentSession(newSession.id)
        navigate(`/chat/${newSession.id}`, { replace: true })
      }
    } catch (err) {
      console.error('Failed to create session:', err)
      removeSession(tempId)
      navigate('/')
    }
  }

  const handleSelectSession = (sessionId: string) => {
    setSessionStoreCurrent(sessionId)
    setChatCurrentSession(sessionId)
    navigate(`/chat/${sessionId}`)
  }

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    try {
      const base = getBaseUrl()
      await fetch(`${base}/session/${sessionId}`, { method: 'DELETE' })
      removeSession(sessionId)
      refresh()
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

  const filteredSessions = serverSessions
    .filter((s) => {
      if (s.title?.startsWith('checkpoint') || s.title?.startsWith('subagent')) return false
      const matchesSearch = searchQuery ? s.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
      const archiveMatch = showArchived ? isArchived(s.id) : !isArchived(s.id)
      return matchesSearch && archiveMatch
    })
    .sort((a, b) => (b.time?.updated || 0) - (a.time?.updated || 0))

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className="flex flex-col border-r transition-all duration-200 ease-out overflow-hidden"
        style={{
          width: open ? 'var(--sidebar-width)' : '0px',
          minWidth: open ? 'var(--sidebar-width)' : '0px',
          borderColor: 'var(--border-weak-base)',
          background: 'var(--background-weak)',
        }}
      >
        {/* Hover show action buttons */}
        <style>{`.session-row:hover .sidebar-action-btn { display: inline-flex !important; }`}</style>
        {/* Project Switcher */}
        <div className="px-2 pt-2 pb-1">
          <ProjectSwitcher
            currentProject={currentProject}
            onProjectChange={setCurrentProject}
          />
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors"
            style={{
              background: 'var(--input-base)',
              border: '1px solid var(--border-weak-base)',
              color: 'var(--text-base)',
            }}
          >
            <Search size={14} className="shrink-0" />
            <input
              type="text"
              placeholder={searchQuery ? t('sidebar.searchPlaceholder') : t('sidebar.searchPlaceholder')}
              className="flex-1 bg-transparent border-none outline-none text-sm"
              style={{ color: 'var(--text-strong)' }}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (showSessionSearch) setShowSessionSearch(false)
              }}
              onFocus={() => {
                if (!searchQuery) setShowSessionSearch(true)
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setShowSessionSearch(false)
                }}
                className="text-[10px] px-1 py-0.5 rounded hover:bg-[var(--surface-base-hover)]"
                style={{ color: 'var(--text-weaker)' }}
              >
                清除
              </button>
            )}
          </div>
        </div>

        {/* Main Tabs */}
        <div
          className="flex mx-3 mb-2 rounded-md p-0.5 gap-0.5"
          style={{ background: 'var(--surface-base)' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded font-medium transition-all"
                style={{
                  background: isActive ? 'var(--surface-strong)' : 'transparent',
                  color: isActive ? 'var(--text-strong)' : 'var(--text-base)',
                  boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                }}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'sessions' && (
            <div className="overflow-y-auto h-full px-3">
              {/* Session Search (when searching) */}
              {showSessionSearch && searchQuery ? (
                <SessionSearch onSelectSession={handleSelectSession} />
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleNewSession}
                      className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-md text-sm transition-colors hover:bg-[var(--surface-base-hover)]"
                      style={{ color: 'var(--text-interactive-base)' }}
                    >
                      <Plus size={14} />
                      {t('sidebar.newSession')}
                    </button>
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs transition-colors hover:bg-[var(--surface-base-hover)]"
                      style={{
                        color: showArchived ? 'var(--text-interactive-base)' : 'var(--text-weaker)',
                        background: showArchived ? 'var(--surface-interactive-base)' : 'transparent',
                      }}
                      title={showArchived ? '查看活跃会话' : '查看已归档'}
                    >
                      <History size={12} />
                      {showArchived ? '活跃' : '归档'}
                    </button>
                    <button
                      onClick={refresh}
                      className="flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-[var(--surface-base-hover)]"
                      style={{ color: 'var(--text-weaker)' }}
                      title="刷新"
                    >
                      <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                  </div>

                  {filteredSessions.length === 0 ? (
                    <div
                      className="px-2.5 py-3 rounded-md text-xs text-center"
                      style={{ color: 'var(--text-weaker)' }}
                    >
                      <History size={24} className="mx-auto mb-2 opacity-40" />
                      {loading ? '加载中...' : showArchived ? '没有已归档的会话' : t('sidebar.noSessions')}
                    </div>
                  ) : (
                    filteredSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => handleSelectSession(session.id)}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm transition-colors hover:bg-[var(--surface-base-hover)] group cursor-pointer session-row"
                        style={{ color: 'var(--text-base)' }}
                      >
                        <MessageSquare size={14} style={{ color: 'var(--text-weaker)' }} />
                        <div className="flex-1 text-left min-w-0">
                          <div className="truncate">{session.title}</div>
                          <div className="text-[10px] truncate" style={{ color: 'var(--text-weaker)' }}>
                            {session.time?.updated ? formatTime(session.time.updated) : ''}
                          </div>
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleArchive(session.id)
                          }}
                          className="p-1 rounded hover:bg-[var(--surface-base-active)] transition-opacity cursor-pointer sidebar-action-btn"
                          style={{ color: 'var(--text-weaker)', display: 'none' }}
                          title={isArchived(session.id) ? '取消归档' : '归档'}
                        >
                          <History size={12} />
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSession(e, session.id)
                          }}
                          className="p-1 rounded hover:bg-[var(--surface-base-active)] transition-opacity cursor-pointer sidebar-action-btn"
                          style={{ color: '#fc533a', display: 'none' }}
                          title="删除"
                        >
                          <Trash2 size={12} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'memory' && (
            <div className="flex flex-col h-full">
              {/* Memory Sub-tabs */}
              <div
                className="flex mx-3 mb-1 rounded p-0.5 gap-0.5"
                style={{ background: 'var(--surface-base)' }}
              >
                {memorySubTabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = memorySubTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setMemorySubTab(tab.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1 text-[10px] rounded font-medium transition-all"
                      style={{
                        background: isActive ? 'var(--surface-strong)' : 'transparent',
                        color: isActive ? 'var(--text-strong)' : 'var(--text-weaker)',
                      }}
                    >
                      <Icon size={10} />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Memory Content */}
              <div className="flex-1 overflow-hidden">
                {memorySubTab === 'search' && <MemoryBrowser />}
                {memorySubTab === 'checkpoints' && <CheckpointTimeline />}
                {memorySubTab === 'evolve' && (
                  <div className="overflow-y-auto h-full px-3 py-2 space-y-4">
                    <DreamDistillPanel />
                    <EvolutionDashboard />
                  </div>
                )}
                {memorySubTab === 'graph' && (
                  <div className="overflow-y-auto h-full px-3 py-2">
                    <MemoryGraph />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="overflow-y-auto h-full px-3 py-2">
              <TasksPanel />
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
