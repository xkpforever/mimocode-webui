import { useState, useMemo, useEffect } from 'react'
import {
  Network,
  Globe,
  Folder,
  MessageSquare,
  FileText,
  ChevronRight,
  ChevronDown,
  RefreshCw,
} from 'lucide-react'
import { useMemorySearch, type MemoryEntry } from '../../hooks/useMemorySearch'

interface GraphNode {
  id: string
  label: string
  type: 'scope' | 'file' | 'snippet'
  count?: number
  children?: GraphNode[]
  color: string
}

function buildGraph(entries: MemoryEntry[]): GraphNode[] {
  const scopeMap = new Map<string, Map<string, MemoryEntry[]>>()

  for (const entry of entries) {
    if (!scopeMap.has(entry.scope)) {
      scopeMap.set(entry.scope, new Map())
    }
    const fileMap = scopeMap.get(entry.scope)!
    const fileKey = entry.path.split('/').pop() || entry.path
    if (!fileMap.has(fileKey)) {
      fileMap.set(fileKey, [])
    }
    fileMap.get(fileKey)!.push(entry)
  }

  const scopeColors: Record<string, string> = {
    global: '#6366f1',
    projects: '#22c55e',
    sessions: '#3b82f6',
    cc: '#f59e0b',
  }

  const scopeLabels: Record<string, string> = {
    global: 'Global Memory',
    projects: 'Project Memory',
    sessions: 'Session Memory',
    cc: 'CC Memory',
  }

  const scopeIcons: Record<string, typeof Globe> = {
    global: Globe,
    projects: Folder,
    sessions: MessageSquare,
    cc: Globe,
  }

  return Array.from(scopeMap.entries()).map(([scope, fileMap]) => ({
    id: scope,
    label: scopeLabels[scope] || scope,
    type: 'scope' as const,
    count: Array.from(fileMap.values()).reduce((sum, arr) => sum + arr.length, 0),
    color: scopeColors[scope] || '#6b7280',
    children: Array.from(fileMap.entries()).map(([file, snippets]) => ({
      id: `${scope}/${file}`,
      label: file,
      type: 'file' as const,
      count: snippets.length,
      color: scopeColors[scope] || '#6b7280',
      children: snippets.slice(0, 5).map((s, i) => ({
        id: `${scope}/${file}/${i}`,
        label: s.snippet.slice(0, 50) + (s.snippet.length > 50 ? '...' : ''),
        type: 'snippet' as const,
        color: scopeColors[scope] || '#6b7280',
      })),
    })),
  }))
}

function GraphNodeItem({ node, depth = 0 }: { node: GraphNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth === 0)
  const hasChildren = node.children && node.children.length > 0

  const icons: Record<string, typeof Globe> = {
    scope: Globe,
    file: FileText,
    snippet: FileText,
  }
  const Icon = icons[node.type] || FileText

  return (
    <div>
      <div
        className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors hover:bg-[var(--surface-base-hover)] cursor-pointer group"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          expanded
            ? <ChevronDown size={10} style={{ color: 'var(--text-weaker)' }} />
            : <ChevronRight size={10} style={{ color: 'var(--text-weaker)' }} />
        ) : (
          <div className="w-3" />
        )}

        {/* Color dot */}
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: node.color }}
        />

        {/* Icon */}
        <Icon size={10} style={{ color: node.color }} />

        {/* Label */}
        <span
          className="text-[11px] truncate flex-1"
          style={{ color: 'var(--text-strong)' }}
        >
          {node.label}
        </span>

        {/* Count */}
        {node.count != null && (
          <span
            className="text-[9px] font-mono px-1.5 py-0.5 rounded-full shrink-0"
            style={{ background: `${node.color}15`, color: node.color }}
          >
            {node.count}
          </span>
        )}
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {node.children!.map(child => (
            <GraphNodeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function MemoryGraph() {
  const { entries, loading, search } = useMemorySearch()

  // Load all entries on mount
  useEffect(() => {
    search('*', { limit: 100 })
  }, [])

  const graph = useMemo(() => buildGraph(entries), [entries])

  const totalNodes = graph.reduce((sum, scope) => {
    const fileCount = scope.children?.length || 0
    const snippetCount = scope.children?.reduce((s, f) => s + (f.children?.length || 0), 0) || 0
    return sum + fileCount + snippetCount
  }, 0)

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network size={14} style={{ color: 'var(--icon-info-base)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-strong)' }}>
            Memory Graph
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--surface-base)', color: 'var(--text-weaker)' }}>
            {graph.length} scopes · {totalNodes} nodes
          </span>
        </div>
      </div>

      {/* Graph Tree */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{
          background: 'var(--surface-strong)',
          borderColor: 'var(--border-weak-base)',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <RefreshCw size={14} className="animate-spin" style={{ color: 'var(--text-weaker)' }} />
          </div>
        ) : graph.length === 0 ? (
          <div className="text-center py-6 text-[10px]" style={{ color: 'var(--text-weaker)' }}>
            <Network size={24} className="mx-auto mb-2 opacity-20" />
            No memory data
          </div>
        ) : (
          <div className="py-1">
            {graph.map(scope => (
              <GraphNodeItem key={scope.id} node={scope} />
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[9px]">
        {[
          { color: '#6366f1', label: 'Global' },
          { color: '#22c55e', label: 'Project' },
          { color: '#3b82f6', label: 'Session' },
          { color: '#f59e0b', label: 'CC' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            <span style={{ color: 'var(--text-weaker)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
