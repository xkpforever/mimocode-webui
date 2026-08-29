import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, MessageSquare, X, Loader2 } from 'lucide-react'
import { getBaseUrl } from '../../lib/api'
import { safeHighlight } from '../../lib/safeHtml'

interface SearchResult {
  sessionId: string
  sessionTitle: string
  snippet: string
  timestamp: number
  score: number
}

interface SessionSearchProps {
  onSelectSession: (sessionId: string) => void
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - ts

  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}小时前`

  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export function SessionSearch({ onSelectSession }: SessionSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setSearched(false)
      return
    }

    setLoading(true)
    setSearched(true)

    try {
      const base = getBaseUrl()
      // Use session list as a basic search fallback
      const res = await fetch(`${base}/session`)
      if (res.ok) {
        const sessions = await res.json()
        const lower = q.toLowerCase()

        const matched: SearchResult[] = (Array.isArray(sessions) ? sessions : [])
          .filter((s: Record<string, unknown>) => {
            const title = String(s.title || '').toLowerCase()
            return title.includes(lower)
          })
          .map((s: Record<string, unknown>) => ({
            sessionId: String(s.id || ''),
            sessionTitle: String(s.title || ''),
            snippet: `匹配关键词: ${q}`,
            timestamp: Number((s.time as Record<string, number>)?.created) || Date.now(),
            score: 0.8,
          }))

        setResults(matched.slice(0, 10))
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }, [search])

  const handleClear = useCallback(() => {
    setQuery('')
    setResults([])
    setSearched(false)
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div className="space-y-2">
      {/* Search Input */}
      <div
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors"
        style={{
          background: 'var(--input-base)',
          border: '1px solid var(--border-weak-base)',
        }}
      >
        <Search size={14} style={{ color: 'var(--text-weaker)' }} />
        <input
          ref={inputRef}
          type="text"
          placeholder="搜索会话..."
          className="flex-1 bg-transparent border-none outline-none text-xs"
          style={{ color: 'var(--text-strong)' }}
          value={query}
          onChange={handleInputChange}
        />
        {query && (
          <button
            onClick={handleClear}
            className="p-0.5 rounded hover:bg-[var(--surface-base-hover)]"
            style={{ color: 'var(--text-weaker)' }}
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-1">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-weaker)' }} />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-4 text-[10px]" style={{ color: 'var(--text-weaker)' }}>
              未找到匹配的会话
            </div>
          ) : (
            results.map((result) => (
              <button
                key={result.sessionId}
                onClick={() => onSelectSession(result.sessionId)}
                className="w-full flex items-start gap-2 px-2.5 py-2 rounded-md text-left transition-colors hover:bg-[var(--surface-base-hover)]"
              >
                <MessageSquare size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--text-weaker)' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-xs font-medium truncate"
                      style={{ color: 'var(--text-strong)' }}
                      dangerouslySetInnerHTML={{ __html: safeHighlight(result.sessionTitle, query) }}
                    />
                    <span className="text-[9px] shrink-0" style={{ color: 'var(--text-weaker)' }}>
                      {formatTime(result.timestamp)}
                    </span>
                  </div>
                  <p
                    className="text-[10px] mt-0.5 truncate"
                    style={{ color: 'var(--text-base)' }}
                    dangerouslySetInnerHTML={{ __html: safeHighlight(result.snippet, query) }}
                  />
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
