import { useState, useCallback, useMemo } from 'react'
import {
  Search,
  BrainCircuit,
  FileText,
  Hash,
  Filter,
  RefreshCw,
  BarChart3,
  Globe,
  Folder,
  MessageSquare,
  Pin,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { useI18n } from '../../context/i18n'
import { useMemorySearch, type MemoryEntry, type MemoryStats } from '../../hooks/useMemorySearch'
import { safeHighlight } from '../../lib/safeHtml'

const SCOPE_CONFIG = {
  global: { icon: Globe, label: '全局', color: 'var(--icon-info-base)' },
  projects: { icon: Folder, label: '项目', color: 'var(--icon-success-base)' },
  sessions: { icon: MessageSquare, label: '会话', color: 'var(--icon-interactive-base)' },
  cc: { icon: BrainCircuit, label: 'CC', color: 'var(--icon-warning-base)' },
}

const TYPE_CONFIG: Record<string, { icon: typeof Pin; label: string; color: string }> = {
  'project-memory': { icon: Pin, label: '项目记忆', color: 'var(--icon-success-base)' },
  checkpoint: { icon: Clock, label: '检查点', color: 'var(--icon-info-base)' },
  'task-progress': { icon: TrendingUp, label: '任务进度', color: 'var(--icon-interactive-base)' },
  free: { icon: FileText, label: '笔记', color: 'var(--text-weaker)' },
  learning: { icon: BrainCircuit, label: '学习', color: 'var(--icon-warning-base)' },
  pinned: { icon: Pin, label: '置顶', color: 'var(--color-error, #ef4444)' },
}

function MemoryStatsBar({ stats }: { stats: MemoryStats }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      {Object.entries(SCOPE_CONFIG).map(([scope, config]) => {
        const count = stats[scope as keyof MemoryStats] as number || 0
        if (count === 0) return null
        const Icon = config.icon
        return (
          <div key={scope} className="flex items-center gap-1.5">
            <Icon size={10} style={{ color: config.color }} />
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-weaker)' }}>
              {config.label}: {count}
            </span>
          </div>
        )
      })}
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        <BarChart3 size={10} style={{ color: 'var(--text-weaker)' }} />
        <span className="text-[10px] font-mono" style={{ color: 'var(--text-weaker)' }}>
          {stats.total} 条
        </span>
      </div>
    </div>
  )
}

function MemoryCard({ entry, query, onClick }: { entry: MemoryEntry; query: string; onClick?: () => void }) {
  const scopeConfig = SCOPE_CONFIG[entry.scope as keyof typeof SCOPE_CONFIG] || SCOPE_CONFIG.global
  const typeConfig = TYPE_CONFIG[entry.type] || TYPE_CONFIG.free
  const ScopeIcon = scopeConfig.icon
  const TypeIcon = typeConfig.icon
  return (
    <div
      className="rounded-lg border p-3 transition-all hover:border-[var(--border-hover)] cursor-pointer group"
      style={{
        background: 'var(--surface-strong)',
        borderColor: 'var(--border-weak-base)',
      }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <ScopeIcon size={12} className="mt-0.5 shrink-0" style={{ color: scopeConfig.color }} />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-mono truncate" style={{ color: 'var(--text-base)' }}>
            {entry.path}
          </div>
        </div>
        {entry.score > 0 && (
          <div
            className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
            style={{ background: 'var(--surface-base)', color: 'var(--text-weaker)' }}
          >
            <Hash size={8} />
            {Math.round(entry.score * 100)}%
          </div>
        )}
      </div>

      {/* Snippet */}
      {entry.snippet && (
        <p
          className="text-xs leading-relaxed line-clamp-3 mb-2"
          style={{ color: 'var(--text-strong)' }}
          dangerouslySetInnerHTML={{ __html: safeHighlight(entry.snippet || entry.path, query) }}
        />
      )}

      {/* Tags */}
      <div className="flex items-center gap-1.5">
        <div
          className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full"
          style={{ background: `${scopeConfig.color}15`, color: scopeConfig.color }}
        >
          <ScopeIcon size={8} />
          {scopeConfig.label}
        </div>
        <div
          className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full"
          style={{ background: `${typeConfig.color}15`, color: typeConfig.color }}
        >
          <TypeIcon size={8} />
          {typeConfig.label}
        </div>
      </div>
    </div>
  )
}

export function MemoryBrowser() {
  const { t } = useI18n()
  const { entries, loading, error, search, stats, refreshStats } = useMemorySearch()
  const [query, setQuery] = useState('')
  const [scopeFilter, setScopeFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = useCallback(() => {
    if (!query.trim()) return
    search(query, {
      scope: scopeFilter === 'all' ? undefined : scopeFilter,
      type: typeFilter === 'all' ? undefined : typeFilter,
    })
  }, [query, scopeFilter, typeFilter, search])

  const filteredEntries = useMemo(() => {
    if (scopeFilter === 'all' && typeFilter === 'all') return entries
    return entries.filter(e => {
      if (scopeFilter !== 'all' && e.scope !== scopeFilter) return false
      if (typeFilter !== 'all' && e.type !== typeFilter) return false
      return true
    })
  }, [entries, scopeFilter, typeFilter])

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background-weak)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'var(--border-weak-base)' }}>
        <BrainCircuit size={14} style={{ color: 'var(--icon-info-base)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--text-strong)' }}>
          {t('memory.title')}
        </span>
        <div className="flex-1" />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-1 rounded hover:bg-[var(--surface-base-hover)] transition-colors"
          style={{ color: showFilters ? 'var(--icon-interactive-base)' : 'var(--text-weaker)' }}
        >
          <Filter size={12} />
        </button>
        <button
          onClick={refreshStats}
          className="p-1 rounded hover:bg-[var(--surface-base-hover)] transition-colors"
          style={{ color: 'var(--text-weaker)' }}
        >
          <RefreshCw size={12} />
        </button>
      </div>

      {/* Stats */}
      <MemoryStatsBar stats={stats} />

      {/* Search */}
      <div className="px-3 pb-2">
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors"
          style={{
            background: 'var(--input-base)',
            border: '1px solid var(--border-weak-base)',
          }}
        >
          <Search size={14} style={{ color: 'var(--text-weaker)' }} />
          <input
            type="text"
            placeholder={t('memory.searchPlaceholder')}
            className="flex-1 bg-transparent border-none outline-none text-xs"
            style={{ color: 'var(--text-strong)' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); search('') }}
              className="text-[10px] px-1.5 py-0.5 rounded hover:bg-[var(--surface-base-hover)]"
              style={{ color: 'var(--text-weaker)' }}
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div
          className="flex gap-2 px-3 pb-2 animate-slide-in"
          style={{ borderBottom: '1px solid var(--border-weak-base)' }}
        >
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="flex-1 px-2 py-1 rounded text-xs border outline-none"
            style={{
              background: 'var(--surface-strong)',
              borderColor: 'var(--border-weak-base)',
              color: 'var(--text-base)',
            }}
          >
            <option value="all">全部范围</option>
            <option value="global">全局</option>
            <option value="projects">项目</option>
            <option value="sessions">会话</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex-1 px-2 py-1 rounded text-xs border outline-none"
            style={{
              background: 'var(--surface-strong)',
              borderColor: 'var(--border-weak-base)',
              color: 'var(--text-base)',
            }}
          >
            <option value="all">全部类型</option>
            <option value="project-memory">项目记忆</option>
            <option value="checkpoint">检查点</option>
            <option value="task-progress">任务进度</option>
            <option value="free">笔记</option>
          </select>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {loading && entries.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw size={16} className="animate-spin" style={{ color: 'var(--text-weaker)' }} />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-xs" style={{ color: 'var(--color-error, #ef4444)' }}>
            {error}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <BrainCircuit size={32} className="mx-auto opacity-20" style={{ color: 'var(--text-weaker)' }} />
            <p className="text-xs" style={{ color: 'var(--text-weaker)' }}>
              {query ? '未找到匹配的记忆' : '输入关键词搜索跨会话记忆'}
            </p>
          </div>
        ) : (
          filteredEntries.map((entry, i) => (
            <MemoryCard
              key={`${entry.path}-${i}`}
              entry={entry}
              query={query}
            />
          ))
        )}
      </div>
    </div>
  )
}
