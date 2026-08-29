import { useState, useEffect, useCallback, useRef } from 'react'
import { sessions, type SessionInfo, type SessionMessage } from '../lib/api'
import { useSessionStore } from '../stores'
import { getSSEClient } from '../lib/sse'

export function useSessions() {
  const [serverSessions, setServerSessions] = useState<SessionInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setSessions } = useSessionStore()

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await sessions.list()
      setServerSessions(list)
      setSessions(list.map((s) => ({
        id: s.id,
        title: s.title,
        agent: 'build' as const,
        createdAt: s.time?.created || Date.now(),
        updatedAt: s.time?.updated || Date.now(),
        messageCount: 0,
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions')
    } finally {
      setLoading(false)
    }
  }, [setSessions])

  useEffect(() => {
    fetchSessions()
    const interval = setInterval(fetchSessions, 5000)
    return () => clearInterval(interval)
  }, [fetchSessions])

  return { serverSessions, loading, error, refresh: fetchSessions }
}

export function useSessionMessages(sessionId: string | null) {
  const [messages, setMessages] = useState<SessionMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prevSessionRef = useRef<string | null>(null)
  const sessionIdRef = useRef(sessionId)
  sessionIdRef.current = sessionId

  // Clear messages immediately when session changes
  useEffect(() => {
    if (sessionId !== prevSessionRef.current) {
      prevSessionRef.current = sessionId
      setMessages([])
      setLoading(true)
    }
  }, [sessionId])

  const fetchMessages = useCallback(async () => {
    if (!sessionId) {
      setMessages([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const msgs = await sessions.messages(sessionId)
      setMessages(msgs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Listen for SSE events and refresh messages when relevant events arrive
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const unsub = getSSEClient().subscribe((event) => {
      // Refresh when session finishes (idle), message is saved, or session metadata changes
      // NOTE: message.updated is emitted via SyncEvent (DB), NOT Bus — so it won't appear in SSE.
      // session.idle IS emitted via Bus, so it DOES appear in SSE.
      const shouldRefresh =
        event.type === 'session.idle' ||
        event.type === 'session.updated'

      if (!shouldRefresh) return

      const payload = event.data as Record<string, unknown>
      const eventSessionId = payload.sessionID || payload.sessionId || payload.session_id || payload.id
      if (eventSessionId && String(eventSessionId) === sessionIdRef.current) {
        // Debounce: batch rapid events into one fetch
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          fetchMessages()
        }, 300)
      }
    })
    // Also listen for direct completion signal from useChat (backup for SSE)
    const handleComplete = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        fetchMessages()
      }, 300)
    }
    window.addEventListener('mimocode:message-completed', handleComplete)

    return () => {
      unsub()
      if (debounceTimer) clearTimeout(debounceTimer)
      window.removeEventListener('mimocode:message-completed', handleComplete)
    }
  }, [fetchMessages])

  return { messages, loading, error, refresh: fetchMessages }
}
