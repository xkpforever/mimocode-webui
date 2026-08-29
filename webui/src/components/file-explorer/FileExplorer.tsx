import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Pencil,
  FileCode,
  FileText,
  FileJson,
  FileImage,
  Settings,
  Package,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useI18n } from '../../context/i18n'
import { getBaseUrl } from '../../lib/api'

interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
  size?: number
  modified?: number
  gitStatus?: string
}

interface FileExplorerProps {
  onFileSelect?: (path: string) => void
}

const HIDDEN_DIRS = new Set(['.git', 'node_modules', '__pycache__', '.next', '.nuxt', 'dist', '.cache'])
const FILE_ICONS: Record<string, typeof File> = {
  ts: FileCode, tsx: FileCode, js: FileCode, jsx: FileCode,
  py: FileCode, go: FileCode, rs: FileCode, java: FileCode,
  md: FileText, txt: FileText, log: FileText,
  json: FileJson, yaml: FileJson, yml: FileJson, toml: FileJson,
  png: FileImage, jpg: FileImage, gif: FileImage, svg: FileImage,
  css: Settings, scss: Settings, less: Settings,
  lock: Lock, env: Lock,
  package: Package,
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (name === 'package.json') return Package
  if (name === 'Cargo.toml' || name === 'go.mod') return Package
  if (name.startsWith('.')) return Settings
  return FILE_ICONS[ext] || File
}

function getGitStatusColor(status?: string) {
  if (!status) return undefined
  if (status.includes('M')) return 'var(--color-warning, #f59e0b)'
  if (status.includes('A')) return 'var(--color-success, #22c55e)'
  if (status.includes('D')) return 'var(--color-error, #ef4444)'
  if (status.includes('?')) return 'var(--text-weaker)'
  return undefined
}

export function FileExplorer({ onFileSelect }: FileExplorerProps) {
  const { t } = useI18n()
  const [files, setFiles] = useState<FileNode[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [showHidden, setShowHidden] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string; type: string } | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [creating, setCreating] = useState<{ parent: string; type: 'file' | 'directory' } | null>(null)
  const [newName, setNewName] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchFiles = useCallback(async (path: string = '.') => {
    setLoading(true)
    try {
      const base = getBaseUrl()
      const res = await fetch(`${base}/file?path=${encodeURIComponent(path)}`)
      if (res.ok) {
        const data = await res.json()
        setFiles(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Failed to fetch files:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const toggleDir = useCallback((path: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent, path: string, type: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, path, type })
  }, [])

  const handleFileClick = useCallback((path: string, type: string) => {
    if (type === 'directory') {
      toggleDir(path)
    } else {
      onFileSelect?.(path)
    }
  }, [toggleDir, onFileSelect])

  const handleDelete = useCallback(async (path: string) => {
    if (!confirm(t('fileExplorer.confirmDelete'))) return
    try {
      const base = getBaseUrl()
      await fetch(`${base}/file?path=${encodeURIComponent(path)}`, { method: 'DELETE' })
      fetchFiles()
    } catch (err) {
      console.error('Failed to delete:', err)
    }
    setContextMenu(null)
  }, [fetchFiles, t])

  const handleRename = useCallback(async (oldPath: string, newName: string) => {
    const sep = oldPath.includes('\\') ? '\\' : '/'
    if (!newName || newName === oldPath.split(sep).pop()) {
      setRenaming(null)
      return
    }
    const dir = oldPath.substring(0, oldPath.lastIndexOf(sep))
    const newPath = dir ? `${dir}${sep}${newName}` : newName
    const base = getBaseUrl()
    try {
      await fetch(`${base}/file`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPath, newPath }),
      })
      fetchFiles()
    } catch (err) {
      console.error('Failed to rename:', err)
    }
    setRenaming(null)
  }, [fetchFiles])

  const handleCreate = useCallback(async (parentPath: string, type: 'file' | 'directory', name: string) => {
    if (!name) {
      setCreating(null)
      return
    }
    const fullPath = parentPath ? `${parentPath}/${name}` : name
    const base = getBaseUrl()
    try {
      await fetch(`${base}/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: fullPath, type }),
      })
      fetchFiles()
    } catch (err) {
      console.error('Failed to create:', err)
    }
    setCreating(null)
  }, [fetchFiles])

  const filterFiles = useCallback((nodes: FileNode[], query: string): FileNode[] => {
    if (!query) return nodes
    return nodes.filter(node => {
      if (node.name.toLowerCase().includes(query.toLowerCase())) return true
      if (node.type === 'directory' && node.children) {
        return filterFiles(node.children, query).length > 0
      }
      return false
    })
  }, [])

  const visibleFiles = showHidden ? files : files.filter(f => !HIDDEN_DIRS.has(f.name))
  const filteredFiles = searchQuery ? filterFiles(visibleFiles, searchQuery) : visibleFiles

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isDir = node.type === 'directory'
    const isExpanded = expandedDirs.has(node.path)
    const Icon = isDir ? (isExpanded ? FolderOpen : Folder) : getFileIcon(node.name)
    const gitColor = getGitStatusColor(node.gitStatus)
    const isRenaming = renaming === node.path
    const isCreatingChild = creating?.parent === node.path

    return (
      <div key={node.path}>
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 text-sm cursor-pointer hover:bg-[var(--surface-base-hover)] rounded group"
          style={{ paddingLeft: `${depth * 16 + 8}px`, color: 'var(--text-base)' }}
          onClick={() => handleFileClick(node.path, node.type)}
          onContextMenu={(e) => handleContextMenu(e, node.path, node.type)}
        >
          {isDir && (
            <span className="shrink-0 w-4 h-4 flex items-center justify-center">
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </span>
          )}
          {!isDir && <span className="w-4" />}
          <Icon size={14} style={{ color: gitColor || 'var(--text-weaker)' }} className="shrink-0" />
          {isRenaming ? (
            <input
              autoFocus
              className="flex-1 bg-transparent border outline-none text-sm px-1 rounded"
              style={{ borderColor: 'var(--border-strong-base)', color: 'var(--text-strong)' }}
              defaultValue={node.name}
              onBlur={(e) => handleRename(node.path, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(node.path, (e.target as HTMLInputElement).value)
                if (e.key === 'Escape') setRenaming(null)
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 truncate text-sm">{node.name}</span>
          )}
          {node.gitStatus && (
            <span className="text-[10px] font-mono" style={{ color: gitColor }}>{node.gitStatus}</span>
          )}
          <button
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--surface-base-active)] transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              setRenaming(node.path)
            }}
          >
            <Pencil size={10} style={{ color: 'var(--text-weaker)' }} />
          </button>
        </div>
        {isCreatingChild && (
          <div className="flex items-center gap-1.5 px-2 py-0.5" style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}>
            <input
              autoFocus
              className="flex-1 bg-transparent border outline-none text-sm px-1 rounded"
              style={{ borderColor: 'var(--border-strong-base)', color: 'var(--text-strong)' }}
              placeholder={creating.type === 'file' ? 'filename.ext' : 'folder-name'}
              onBlur={(e) => handleCreate(node.path, creating.type, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate(node.path, creating.type, (e.target as HTMLInputElement).value)
                if (e.key === 'Escape') setCreating(null)
              }}
            />
          </div>
        )}
        {isDir && isExpanded && node.children && (
          <div>
            {node.children
              .filter(child => showHidden || !HIDDEN_DIRS.has(child.name))
              .sort((a, b) => {
                if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
                return a.name.localeCompare(b.name)
              })
              .map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex flex-col h-full" style={{ background: 'var(--background-weak)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'var(--border-weak-base)' }}>
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-weaker)' }}>
          {t('fileExplorer.title')}
        </span>
        <div className="flex-1" />
        <button
          onClick={() => setShowHidden(!showHidden)}
          className="p-1 rounded hover:bg-[var(--surface-base-hover)] transition-colors"
          style={{ color: 'var(--text-weaker)' }}
          title={showHidden ? t('fileExplorer.hideHidden') : t('fileExplorer.showHidden')}
        >
          {showHidden ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
        <button
          onClick={() => fetchFiles()}
          className="p-1 rounded hover:bg-[var(--surface-base-hover)] transition-colors"
          style={{ color: 'var(--text-weaker)' }}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-1.5">
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs"
          style={{ background: 'var(--input-base)', border: '1px solid var(--border-weak-base)' }}
        >
          <Search size={12} style={{ color: 'var(--text-weaker)' }} />
          <input
            type="text"
            placeholder={t('fileExplorer.search')}
            className="flex-1 bg-transparent border-none outline-none text-xs"
            style={{ color: 'var(--text-strong)' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {loading && files.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw size={16} className="animate-spin" style={{ color: 'var(--text-weaker)' }} />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-xs" style={{ color: 'var(--text-weaker)' }}>
            {searchQuery ? t('fileExplorer.noResults') : t('fileExplorer.noFiles')}
          </div>
        ) : (
          <div className="py-1">
            {filteredFiles
              .sort((a, b) => {
                if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
                return a.name.localeCompare(b.name)
              })
              .map(node => renderNode(node))}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 rounded-lg shadow-lg py-1 min-w-[160px]"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              background: 'var(--surface-strong)',
              border: '1px solid var(--border-weak-base)',
            }}
          >
            {contextMenu.type === 'directory' && (
              <>
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[var(--surface-base-hover)]"
                  style={{ color: 'var(--text-base)' }}
                  onClick={() => {
                    setCreating({ parent: contextMenu.path, type: 'file' })
                    setContextMenu(null)
                  }}
                >
                  <Plus size={12} /> {t('fileExplorer.newFile')}
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[var(--surface-base-hover)]"
                  style={{ color: 'var(--text-base)' }}
                  onClick={() => {
                    setCreating({ parent: contextMenu.path, type: 'directory' })
                    setContextMenu(null)
                  }}
                >
                  <Folder size={12} /> {t('fileExplorer.newFolder')}
                </button>
                <div className="my-1 border-t" style={{ borderColor: 'var(--border-weak-base)' }} />
              </>
            )}
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[var(--surface-base-hover)]"
              style={{ color: 'var(--text-base)' }}
              onClick={() => {
                setRenaming(contextMenu.path)
                setContextMenu(null)
              }}
            >
              <Pencil size={12} /> {t('fileExplorer.rename')}
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[var(--surface-base-hover)]"
              style={{ color: 'var(--color-error, #ef4444)' }}
              onClick={() => handleDelete(contextMenu.path)}
            >
              <Trash2 size={12} /> {t('fileExplorer.delete')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
