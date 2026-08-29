import { useState, useEffect, useCallback } from 'react'
import {
  GitBranch,
  GitCommit,
  RefreshCw,
  Plus,
  Trash2,
  Upload,
  Download,
  Check,
  X,
  FileCode,
  AlertCircle,
} from 'lucide-react'
import { useI18n } from '../../context/i18n'
import { git, type GitStatus, type GitFileChange } from '../../lib/api'

interface GitExplorerProps {
  projectId?: string
  onFileSelect?: (path: string) => void
}

export function GitExplorer({ projectId, onFileSelect }: GitExplorerProps) {
  const { t } = useI18n()
  const [status, setStatus] = useState<GitStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [commitMessage, setCommitMessage] = useState('')
  const [isCommitting, setIsCommitting] = useState(false)
  const [isPushing, setIsPushing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'changes' | 'history'>('changes')

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await git.status()
      setStatus(data)
    } catch (err) {
      setError(t('git.fetchError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const stageFile = useCallback(async (path: string) => {
    try {
      await git.stage(path)
      fetchStatus()
    } catch (err) {
      setError(t('git.stageError'))
    }
  }, [fetchStatus, t])

  const unstageFile = useCallback(async (path: string) => {
    try {
      await git.unstage(path)
      fetchStatus()
    } catch (err) {
      setError(t('git.unstageError'))
    }
  }, [fetchStatus, t])

  const discardChanges = useCallback(async (path: string) => {
    if (!confirm(t('git.confirmDiscard'))) return
    try {
      await git.discard(path)
      fetchStatus()
    } catch (err) {
      setError(t('git.discardError'))
    }
  }, [fetchStatus, t])

  const commit = useCallback(async () => {
    if (!commitMessage.trim()) return
    setIsCommitting(true)
    setError(null)
    try {
      await git.commit(commitMessage)
      setCommitMessage('')
      fetchStatus()
    } catch (err) {
      setError(t('git.commitError'))
    } finally {
      setIsCommitting(false)
    }
  }, [commitMessage, fetchStatus, t])

  const push = useCallback(async () => {
    setIsPushing(true)
    setError(null)
    try {
      await git.push()
      fetchStatus()
    } catch (err) {
      setError(t('git.pushError'))
    } finally {
      setIsPushing(false)
    }
  }, [fetchStatus, t])

  const pull = useCallback(async () => {
    setIsPulling(true)
    setError(null)
    try {
      await git.pull()
      fetchStatus()
    } catch (err) {
      setError(t('git.pullError'))
    } finally {
      setIsPulling(false)
    }
  }, [fetchStatus, t])

  const getStatusColor = (status: string) => {
    if (status.includes('M')) return 'var(--color-warning, #f59e0b)'
    if (status.includes('A')) return 'var(--color-success, #22c55e)'
    if (status.includes('D')) return 'var(--color-error, #ef4444)'
    if (status.includes('?')) return 'var(--text-weaker)'
    return 'var(--text-base)'
  }

  if (!status && !error) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw size={16} className="animate-spin" style={{ color: 'var(--text-weaker)' }} />
      </div>
    )
  }

  if (error && !status) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2 text-center px-4">
        <AlertCircle size={24} style={{ color: 'var(--text-weaker)' }} />
        <p className="text-xs" style={{ color: 'var(--text-weaker)' }}>{error}</p>
        <button
          onClick={fetchStatus}
          className="text-xs px-2 py-1 rounded hover:bg-[var(--surface-base-hover)]"
          style={{ color: 'var(--text-interactive-base)' }}
        >
          {t('git.retry')}
        </button>
      </div>
    )
  }

  const totalChanges = (status?.staged.length || 0) + (status?.unstaged.length || 0) + (status?.untracked.length || 0)

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background-weak)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'var(--border-weak-base)' }}>
        <GitBranch size={14} style={{ color: 'var(--text-weaker)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-base)' }}>
          {status?.currentBranch || 'main'}
        </span>
        <div className="flex-1" />
        <button
          onClick={fetchStatus}
          className="p-1 rounded hover:bg-[var(--surface-base-hover)] transition-colors"
          style={{ color: 'var(--text-weaker)' }}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--border-weak-base)' }}>
        <button
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors"
          style={{
            color: activeTab === 'changes' ? 'var(--text-strong)' : 'var(--text-weaker)',
            borderBottom: activeTab === 'changes' ? '2px solid var(--text-interactive-base)' : '2px solid transparent',
          }}
          onClick={() => setActiveTab('changes')}
        >
          {t('git.changes')}
          {totalChanges > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: 'var(--surface-strong)', color: 'var(--text-strong)' }}
            >
              {totalChanges}
            </span>
          )}
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors"
          style={{
            color: activeTab === 'history' ? 'var(--text-strong)' : 'var(--text-weaker)',
            borderBottom: activeTab === 'history' ? '2px solid var(--text-interactive-base)' : '2px solid transparent',
          }}
          onClick={() => setActiveTab('history')}
        >
          <GitCommit size={12} />
          {t('git.history')}
        </button>
      </div>

      {/* Changes Tab */}
      {activeTab === 'changes' && (
        <div className="flex-1 overflow-y-auto">
          {/* Commit Input */}
          {status && status.staged.length > 0 && (
            <div className="p-2 border-b" style={{ borderColor: 'var(--border-weak-base)' }}>
              <textarea
                className="w-full bg-transparent border rounded px-2 py-1.5 text-xs resize-none outline-none"
                style={{
                  borderColor: 'var(--border-weak-base)',
                  color: 'var(--text-strong)',
                }}
                placeholder={t('git.commitMessage')}
                rows={2}
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) commit()
                }}
              />
              <div className="flex gap-1 mt-1.5">
                <button
                  onClick={commit}
                  disabled={isCommitting || !commitMessage.trim()}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50"
                  style={{
                    background: 'var(--color-success, #22c55e)',
                    color: 'white',
                  }}
                >
                  {isCommitting ? <RefreshCw size={10} className="animate-spin" /> : <Check size={10} />}
                  {t('git.commit')}
                </button>
                <button
                  onClick={push}
                  disabled={isPushing}
                  className="flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50"
                  style={{ background: 'var(--surface-strong)', color: 'var(--text-base)' }}
                >
                  {isPushing ? <RefreshCw size={10} className="animate-spin" /> : <Upload size={10} />}
                  {t('git.push')}
                </button>
                <button
                  onClick={pull}
                  disabled={isPulling}
                  className="flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50"
                  style={{ background: 'var(--surface-strong)', color: 'var(--text-base)' }}
                >
                  {isPulling ? <RefreshCw size={10} className="animate-spin" /> : <Download size={10} />}
                  {t('git.pull')}
                </button>
              </div>
            </div>
          )}

          {/* Staged Files */}
          {status && status.staged.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-weaker)' }}>
                <Check size={10} />
                {t('git.staged')} ({status.staged.length})
              </div>
              {status.staged.map(file => (
                <FileChangeItem
                  key={file.path}
                  file={file}
                  statusColor={getStatusColor(file.status)}
                  onUnstage={() => unstageFile(file.path)}
                  onDiscard={() => discardChanges(file.path)}
                  onClick={() => onFileSelect?.(file.path)}
                  isStaged
                />
              ))}
            </div>
          )}

          {/* Unstaged Files */}
          {status && status.unstaged.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-weaker)' }}>
                <FileCode size={10} />
                {t('git.modified')} ({status.unstaged.length})
              </div>
              {status.unstaged.map(file => (
                <FileChangeItem
                  key={file.path}
                  file={file}
                  statusColor={getStatusColor(file.status)}
                  onStage={() => stageFile(file.path)}
                  onDiscard={() => discardChanges(file.path)}
                  onClick={() => onFileSelect?.(file.path)}
                />
              ))}
            </div>
          )}

          {/* Untracked Files */}
          {status && status.untracked.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-weaker)' }}>
                <Plus size={10} />
                {t('git.untracked')} ({status.untracked.length})
              </div>
              {status.untracked.map(file => (
                <FileChangeItem
                  key={file.path}
                  file={file}
                  statusColor={getStatusColor(file.status)}
                  onStage={() => stageFile(file.path)}
                  onClick={() => onFileSelect?.(file.path)}
                />
              ))}
            </div>
          )}

          {totalChanges === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Check size={24} style={{ color: 'var(--color-success, #22c55e)' }} className="mb-2 opacity-50" />
              <p className="text-xs" style={{ color: 'var(--text-weaker)' }}>{t('git.noChanges')}</p>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="flex-1 overflow-y-auto">
          {status?.commits && status.commits.length > 0 ? (
            status.commits.map(commit => (
              <div
                key={commit.hash}
                className="px-3 py-2 border-b hover:bg-[var(--surface-base-hover)]"
                style={{ borderColor: 'var(--border-weak-base)' }}
              >
                <div className="flex items-start gap-2">
                  <GitCommit size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--text-weaker)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate" style={{ color: 'var(--text-base)' }}>{commit.message}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-weaker)' }}>
                      {commit.author} · {commit.date}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono shrink-0" style={{ color: 'var(--text-weaker)' }}>
                    {commit.hash.slice(0, 7)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <GitCommit size={24} style={{ color: 'var(--text-weaker)' }} className="mb-2 opacity-50" />
              <p className="text-xs" style={{ color: 'var(--text-weaker)' }}>{t('git.noCommits')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FileChangeItem({
  file,
  statusColor,
  onStage,
  onUnstage,
  onDiscard,
  onClick,
  isStaged,
}: {
  file: GitFileChange
  statusColor: string
  onStage?: () => void
  onUnstage?: () => void
  onDiscard?: () => void
  onClick?: () => void
  isStaged?: boolean
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1 hover:bg-[var(--surface-base-hover)] group cursor-pointer"
      onClick={onClick}
    >
      <span className="text-[10px] font-mono w-4 text-center" style={{ color: statusColor }}>
        {file.status}
      </span>
      <span className="flex-1 text-xs truncate" style={{ color: 'var(--text-base)' }}>{file.path}</span>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isStaged && onStage && (
          <button
            onClick={(e) => { e.stopPropagation(); onStage() }}
            className="p-0.5 rounded hover:bg-[var(--surface-base-active)]"
            title="Stage"
          >
            <Check size={10} style={{ color: 'var(--color-success, #22c55e)' }} />
          </button>
        )}
        {isStaged && onUnstage && (
          <button
            onClick={(e) => { e.stopPropagation(); onUnstage() }}
            className="p-0.5 rounded hover:bg-[var(--surface-base-active)]"
            title="Unstage"
          >
            <X size={10} style={{ color: 'var(--color-warning, #f59e0b)' }} />
          </button>
        )}
        {onDiscard && (
          <button
            onClick={(e) => { e.stopPropagation(); onDiscard() }}
            className="p-0.5 rounded hover:bg-[var(--surface-base-active)]"
            title="Discard"
          >
            <Trash2 size={10} style={{ color: 'var(--color-error, #ef4444)' }} />
          </button>
        )}
      </div>
    </div>
  )
}
