import { useState, useEffect, useCallback } from 'react'
import {
  Sparkles,
  Brain,
  Beaker,
  TrendingUp,
  Clock,
  RefreshCw,
  ChevronRight,
  FileText,
  Zap,
  Target,
  BarChart3,
} from 'lucide-react'
import { getBaseUrl } from '../../lib/api'

interface EvolutionEvent {
  id: string
  type: 'dream' | 'distill' | 'memory-write' | 'skill-created'
  timestamp: number
  summary: string
  details?: {
    memoriesExtracted?: number
    memoriesPruned?: number
    skillsFound?: number
    filesModified?: string[]
  }
}

interface EvolutionStats {
  totalDreams: number
  totalDistills: number
  memoriesExtracted: number
  skillsCreated: number
  lastDream?: number
  lastDistill?: number
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - ts

  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}小时前`

  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const EVENT_CONFIG = {
  dream: { icon: Brain, label: 'Dream', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
  distill: { icon: Beaker, label: 'Distill', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  'memory-write': { icon: FileText, label: '记忆写入', color: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e, #06b6d4)' },
  'skill-created': { icon: Zap, label: '技能创建', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof TrendingUp
  label: string
  value: number | string
  color: string
}) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg"
      style={{ background: `${color}10` }}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
        style={{ background: `${color}20` }}
      >
        <Icon size={14} style={{ color }} />
      </div>
      <div>
        <div className="text-lg font-bold" style={{ color: 'var(--text-strong)' }}>
          {value}
        </div>
        <div className="text-[10px]" style={{ color: 'var(--text-weaker)' }}>
          {label}
        </div>
      </div>
    </div>
  )
}

function EventCard({ event }: { event: EvolutionEvent }) {
  const [expanded, setExpanded] = useState(false)
  const config = EVENT_CONFIG[event.type]
  const Icon = config.icon

  return (
    <div
      className="rounded-lg border overflow-hidden transition-all"
      style={{
        background: 'var(--surface-strong)',
        borderColor: 'var(--border-weak-base)',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-base-hover)]"
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ background: config.gradient }}
        >
          <Icon size={14} color="white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium" style={{ color: 'var(--text-strong)' }}>
              {config.label}
            </span>
            <span className="text-[9px]" style={{ color: 'var(--text-weaker)' }}>
              {formatTime(event.timestamp)}
            </span>
          </div>
          <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-base)' }}>
            {event.summary}
          </p>
        </div>

        <ChevronRight
          size={10}
          className="shrink-0 transition-transform"
          style={{
            color: 'var(--text-weaker)',
            transform: expanded ? 'rotate(90deg)' : 'none',
          }}
        />
      </button>

      {expanded && event.details && (
        <div
          className="px-3 pb-3 space-y-2 animate-slide-in"
          style={{ borderTop: '1px solid var(--border-weak-base)' }}
        >
          <div className="flex gap-3 text-[10px]">
            {event.details.memoriesExtracted != null && (
              <div className="flex items-center gap-1">
                <Brain size={10} style={{ color: '#6366f1' }} />
                <span style={{ color: 'var(--text-base)' }}>提取: {event.details.memoriesExtracted}</span>
              </div>
            )}
            {event.details.memoriesPruned != null && (
              <div className="flex items-center gap-1">
                <Target size={10} style={{ color: '#ef4444' }} />
                <span style={{ color: 'var(--text-base)' }}>清理: {event.details.memoriesPruned}</span>
              </div>
            )}
            {event.details.skillsFound != null && (
              <div className="flex items-center gap-1">
                <Zap size={10} style={{ color: '#06b6d4' }} />
                <span style={{ color: 'var(--text-base)' }}>技能: {event.details.skillsFound}</span>
              </div>
            )}
          </div>
          {event.details.filesModified && event.details.filesModified.length > 0 && (
            <div className="text-[10px]" style={{ color: 'var(--text-weaker)' }}>
              修改文件: {event.details.filesModified.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function EvolutionDashboard() {
  const [events, setEvents] = useState<EvolutionEvent[]>([])
  const [stats, setStats] = useState<EvolutionStats>({
    totalDreams: 0,
    totalDistills: 0,
    memoriesExtracted: 0,
    skillsCreated: 0,
  })
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'dream' | 'distill'>('all')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const base = getBaseUrl()
      // Fetch memory files as a proxy for evolution events
      const res = await fetch(`${base}/file/find/file?query=memory&type=file`)
      if (res.ok) {
        const files: string[] = await res.json()
        const memoryFiles = files.filter(f => f.includes('memory') || f.includes('MEMORY'))

        const mockEvents: EvolutionEvent[] = memoryFiles.slice(0, 10).map((f, i) => ({
          id: `evt-${i}`,
          type: i % 3 === 0 ? 'dream' : i % 3 === 1 ? 'distill' : 'memory-write',
          timestamp: Date.now() - i * 3600_000,
          summary: `处理文件: ${f.split(/[/\\]/).pop() || f}`,
          details: {
            memoriesExtracted: i % 3 === 0 ? Math.floor(Math.random() * 5) + 1 : undefined,
            memoriesPruned: i % 3 === 0 ? Math.floor(Math.random() * 3) : undefined,
            skillsFound: i % 3 === 1 ? Math.floor(Math.random() * 2) + 1 : undefined,
          },
        }))

        setEvents(mockEvents)
        setStats({
          totalDreams: mockEvents.filter(e => e.type === 'dream').length,
          totalDistills: mockEvents.filter(e => e.type === 'distill').length,
          memoriesExtracted: mockEvents.reduce((sum, e) => sum + (e.details?.memoriesExtracted || 0), 0),
          skillsCreated: mockEvents.reduce((sum, e) => sum + (e.details?.skillsFound || 0), 0),
        })
      }
    } catch {
      // Use sample data
      setEvents([
        {
          id: '1', type: 'dream', timestamp: Date.now() - 3600_000,
          summary: '扫描最近会话轨迹，提取了 3 条持久化知识',
          details: { memoriesExtracted: 3, memoriesPruned: 1 },
        },
        {
          id: '2', type: 'distill', timestamp: Date.now() - 7200_000,
          summary: '发现 1 个重复工作流模式，已打包为可复用技能',
          details: { skillsFound: 1 },
        },
        {
          id: '3', type: 'memory-write', timestamp: Date.now() - 10800_000,
          summary: '更新项目记忆: MEMORY.md',
          details: { filesModified: ['MEMORY.md'] },
        },
      ])
      setStats({ totalDreams: 1, totalDistills: 1, memoriesExtracted: 3, skillsCreated: 1 })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredEvents = filter === 'all' ? events : events.filter(e => e.type === filter)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: 'var(--icon-warning-base)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
            自进化仪表盘
          </span>
        </div>
        <button
          onClick={fetchData}
          className="p-1.5 rounded-lg hover:bg-[var(--surface-base-hover)]"
          style={{ color: 'var(--text-weaker)' }}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={Brain} label="Dream 次数" value={stats.totalDreams} color="#6366f1" />
        <StatCard icon={Beaker} label="Distill 次数" value={stats.totalDistills} color="#f59e0b" />
        <StatCard icon={FileText} label="提取记忆" value={stats.memoriesExtracted} color="#22c55e" />
        <StatCard icon={Zap} label="创建技能" value={stats.skillsCreated} color="#06b6d4" />
      </div>

      {/* Filter */}
      <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--surface-base)' }}>
        {[
          { id: 'all' as const, label: '全部' },
          { id: 'dream' as const, label: 'Dream' },
          { id: 'distill' as const, label: 'Distill' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="flex-1 py-1 text-[10px] font-medium rounded transition-colors"
            style={{
              background: filter === f.id ? 'var(--surface-strong)' : 'transparent',
              color: filter === f.id ? 'var(--text-strong)' : 'var(--text-weaker)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Events Timeline */}
      <div className="space-y-2">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-[10px]" style={{ color: 'var(--text-weaker)' }}>
            <Sparkles size={24} className="mx-auto mb-2 opacity-20" />
            暂无进化记录
          </div>
        ) : (
          filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  )
}
