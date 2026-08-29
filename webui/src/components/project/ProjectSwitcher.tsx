import { useState, useEffect, useCallback } from 'react'
import {
  FolderOpen,
  ChevronDown,
  Check,
  Plus,
  RefreshCw,
  Folder,
  HardDrive,
  X,
  Search,
  ArrowRight,
} from 'lucide-react'
import { getBaseUrl } from '../../lib/api'
import { useI18n } from '../../context/i18n'

interface Project {
  directory: string
  name?: string
}

interface ProjectSwitcherProps {
  currentProject?: Project | null
  onProjectChange: (project: Project) => void
}

function getProjectName(dir: string): string {
  return dir.split(/[/\\]/).filter(Boolean).pop() || dir
}

function getPathIcon(dir: string): typeof Folder {
  if (dir.includes('node_modules') || dir.includes('.cache')) return HardDrive
  return Folder
}

export function ProjectSwitcher({ currentProject, onProjectChange }: ProjectSwitcherProps) {
  const { t } = useI18n()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewPath, setShowNewPath] = useState(false)
  const [newPath, setNewPath] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const base = getBaseUrl()
      // Try project list endpoint
      const listRes = await fetch(`${base}/project`)
      if (listRes.ok) {
        const list = await listRes.json()
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((p: Record<string, unknown>) => ({
            directory: String(p.worktree || p.directory || p.path || ''),
            name: p.name as string | undefined,
          })).filter((p: Project) => p.directory)
          setProjects(mapped)
          if (!currentProject && mapped.length > 0) {
            onProjectChange(mapped[0])
          }
          return
        }
      }
      // Fallback: get current project
      const curRes = await fetch(`${base}/project/current`)
      if (curRes.ok) {
        const data = await curRes.json()
        const current = { directory: data.worktree || data.directory || '', name: data.name }
        setProjects([current])
        if (!currentProject) {
          onProjectChange(current)
        }
      }
    } catch {
      // Ignore errors
    } finally {
      setLoading(false)
    }
  }, [currentProject, onProjectChange])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const currentName = currentProject ? getProjectName(currentProject.directory) : t('project.switcher.noProject')
  const Icon = currentProject ? getPathIcon(currentProject.directory) : Folder

  const filteredProjects = searchQuery
    ? projects.filter(p =>
        p.directory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getProjectName(p.directory).toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : projects

  const handleOpenNewPath = async () => {
    if (!newPath.trim()) return
    const dir = newPath.trim()
    setLoading(true)
    setError(null)
    try {
      const base = getBaseUrl()
      const res = await fetch(`${base}/project/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directory: dir }),
      })
      if (res.ok) {
        const project = await res.json()
        const projDir = project.worktree || project.directory || dir
        onProjectChange({ directory: projDir, name: project.name })
        setNewPath('')
        setShowNewPath(false)
        fetchProjects()
      } else {
        const err = await res.text().catch(() => '')
        setError(err || t('project.switcher.switchFailed'))
      }
    } catch {
      setError(t('project.switcher.switchFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all hover:bg-[var(--surface-base-hover)]"
        style={{
          background: expanded ? 'var(--surface-base)' : 'var(--surface-strong)',
          border: '1px solid var(--border-weak-base)',
        }}
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ background: 'var(--surface-interactive-subtle)' }}
        >
          <Icon size={16} style={{ color: 'var(--icon-interactive-base)' }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-strong)' }}>
            {currentName}
          </div>
          {currentProject?.directory && (
            <div className="text-[10px] truncate font-mono mt-0.5" style={{ color: 'var(--text-weaker)' }}>
              {currentProject.directory.length > 35
                ? '...' + currentProject.directory.slice(-32)
                : currentProject.directory
              }
            </div>
          )}
        </div>

        <ChevronDown
          size={14}
          className="shrink-0 transition-transform"
          style={{
            color: 'var(--text-weaker)',
            transform: expanded ? 'rotate(180deg)' : 'none',
          }}
        />
      </button>

      {/* Dropdown */}
      {expanded && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setExpanded(false); setShowNewPath(false) }} />
          <div
            className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-2xl overflow-hidden z-50 animate-slide-in"
            style={{
              background: 'var(--surface-strong)',
              border: '1px solid var(--border-weak-base)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            {/* Search */}
            {projects.length > 1 && (
              <div className="px-3 pt-2 pb-1">
                <div
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs"
                  style={{
                    background: 'var(--input-base)',
                    border: '1px solid var(--border-weak-base)',
                  }}
                >
                  <Search size={12} style={{ color: 'var(--text-weaker)' }} />
                  <input
                    type="text"
                    placeholder={t('project.switcher.search')}
                    className="flex-1 bg-transparent border-none outline-none text-xs"
                    style={{ color: 'var(--text-strong)' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Header */}
            <div
              className="flex items-center justify-between px-3 py-2 border-b"
              style={{ borderColor: 'var(--border-weak-base)' }}
            >
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-weaker)' }}>
                {t('project.switcher.projectList')}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); fetchProjects() }}
                className="p-1 rounded hover:bg-[var(--surface-base-hover)] transition-colors"
                style={{ color: 'var(--text-weaker)' }}
                title={t('project.switcher.refresh')}
              >
                <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Project List */}
            <div className="py-1 max-h-[200px] overflow-y-auto">
              {filteredProjects.length === 0 ? (
                <div className="px-3 py-6 text-center">
                  <Folder size={20} className="mx-auto mb-2 opacity-20" style={{ color: 'var(--text-weaker)' }} />
                  <p className="text-[10px]" style={{ color: 'var(--text-weaker)' }}>
                    {searchQuery ? t('project.switcher.noResults') : t('project.switcher.noProjects')}
                  </p>
                </div>
              ) : (
                filteredProjects.map((project) => {
                  const name = getProjectName(project.directory)
                  const isSelected = project.directory === currentProject?.directory
                  const ProjectIcon = getPathIcon(project.directory)
                  return (
                    <button
                      key={project.directory}
                      onClick={() => {
                        onProjectChange(project)
                        setExpanded(false)
                        setSearchQuery('')
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-base-hover)]"
                      style={{
                        background: isSelected ? 'var(--surface-interactive-subtle)' : 'transparent',
                      }}
                    >
                      <ProjectIcon size={14} style={{ color: isSelected ? 'var(--icon-interactive-base)' : 'var(--text-weaker)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate" style={{ color: 'var(--text-strong)' }}>
                          {name}
                        </div>
                        <div className="text-[10px] truncate font-mono mt-0.5" style={{ color: 'var(--text-weaker)' }}>
                          {project.directory}
                        </div>
                      </div>
                      {isSelected && (
                        <Check size={12} style={{ color: 'var(--icon-success-base)' }} />
                      )}
                    </button>
                  )
                })
              )}
            </div>

            {/* New Path Input */}
            {showNewPath && (
              <div className="px-3 py-2 border-t" style={{ borderColor: 'var(--border-weak-base)' }}>
                <div className="text-[10px] mb-1.5" style={{ color: 'var(--text-weaker)' }}>
                  {t('project.switcher.enterPath')}
                </div>
                {error && (
                  <div className="text-[10px] mb-1.5 px-2 py-1 rounded" style={{ color: 'var(--color-error, #ef4444)', background: 'var(--surface-base)' }}>
                    {error}
                  </div>
                )}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    className="flex-1 px-2 py-1.5 rounded-md text-xs border outline-none"
                    style={{
                      background: 'var(--input-base)',
                      borderColor: 'var(--border-weak-base)',
                      color: 'var(--text-strong)',
                    }}
                    placeholder={t('project.switcher.pathPlaceholder')}
                    value={newPath}
                    onChange={(e) => setNewPath(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleOpenNewPath()}
                    autoFocus
                  />
                  <button
                    onClick={handleOpenNewPath}
                    disabled={!newPath.trim() || loading}
                    className="px-2 py-1.5 rounded-md text-[10px] font-medium transition-colors disabled:opacity-50"
                    style={{
                      background: 'var(--button-primary-base)',
                      color: 'var(--text-invert-strong)',
                    }}
                  >
                    {loading ? <RefreshCw size={10} className="animate-spin" /> : <ArrowRight size={10} />}
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div
              className="px-3 py-2 border-t"
              style={{ borderColor: 'var(--border-weak-base)' }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowNewPath(!showNewPath)
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-medium transition-colors hover:bg-[var(--surface-base-hover)]"
                style={{
                  border: '1px dashed var(--border-base)',
                  color: 'var(--text-weaker)',
                }}
              >
                <Plus size={10} />
                {t('project.switcher.openOther')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
