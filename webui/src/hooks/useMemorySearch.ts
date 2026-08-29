import { useState, useCallback, useEffect } from 'react'
import { getBaseUrl } from '../lib/api'

export interface MemoryEntry {
  path: string
  snippet: string
  score: number
  scope: string
  scope_id: string
  type: string
}

export interface MemoryStats {
  global: number
  projects: number
  sessions: number
  total: number
  lastUpdated: string
}

interface MemorySearchResult {
  entries: MemoryEntry[]
  loading: boolean
  error: string | null
  search: (query: string, options?: { scope?: string; type?: string; limit?: number }) => void
  stats: MemoryStats
  refreshStats: () => void
}

/**
 * Hook for searching memory via the MIMO Code backend.
 * The memory search is exposed through the session message API
 * (agent uses the memory tool internally).
 */
export function useMemorySearch(): MemorySearchResult {
  const [entries, setEntries] = useState<MemoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<MemoryStats>({
    global: 0,
    projects: 0,
    sessions: 0,
    total: 0,
    lastUpdated: new Date().toISOString(),
  })

  const search = useCallback(async (
    query: string,
    options?: { scope?: string; type?: string; limit?: number },
  ) => {
    if (!query.trim()) {
      setEntries([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const base = getBaseUrl()
      // Use the file search API to find memory files
      const params = new URLSearchParams({ query })
      if (options?.scope) params.set('scope', options.scope)
      if (options?.type) params.set('type', options.type)
      if (options?.limit) params.set('limit', String(options.limit))

      // Try the file search endpoint first
      const res = await fetch(`${base}/file/find/file?${params}`)
      if (res.ok) {
        const files: string[] = await res.json()
        const memoryFiles = files.filter(f =>
          f.includes('memory') || f.includes('checkpoint') || f.includes('MEMORY'),
        )

        const results: MemoryEntry[] = memoryFiles.map(file => ({
          path: file,
          snippet: '',
          score: 0.5,
          scope: file.includes('/global/') ? 'global' : file.includes('/projects/') ? 'projects' : 'sessions',
          scope_id: '',
          type: file.includes('MEMORY') ? 'project-memory' : file.includes('checkpoint') ? 'checkpoint' : 'free',
        }))

        setEntries(results)
      } else {
        // Fallback: return empty
        setEntries([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshStats = useCallback(async () => {
    try {
      const base = getBaseUrl()
      // Count files in memory directories
      const scopes = ['global', 'projects', 'sessions'] as const
      let total = 0
      const counts: { [key: string]: number } = {}

      for (const scope of scopes) {
        try {
          const res = await fetch(`${base}/file/find/file?query=*&type=file`)
          if (res.ok) {
            const files: string[] = await res.json()
            const count = files.filter(f => f.includes(`/${scope}/`)).length
            counts[scope] = count
            total += count
          }
        } catch {
          counts[scope] = 0
        }
      }

      setStats({
        global: counts.global ?? 0,
        projects: counts.projects ?? 0,
        sessions: counts.sessions ?? 0,
        total,
        lastUpdated: new Date().toISOString(),
      })
    } catch {
      // Ignore stats refresh errors
    }
  }, [])

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  return { entries, loading, error, search, stats, refreshStats }
}
