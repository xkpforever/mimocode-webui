import { useEffect, useCallback } from 'react'
import { getSSEClient, type ServerSentEvent } from '../lib/sse'
import { useConnectionStore, usePermissionStore, useTokenStore } from '../stores'
import { setBaseUrl } from '../lib/api'

type MessageHandler = (event: ServerSentEvent) => void

/**
 * Global SSE connection hook.
 * Manages connection lifecycle, routes messages to stores.
 * Uses SSE (not WebSocket) — MiMoCode backend exposes /global/event SSE endpoint.
 */
export function useSSEConnection() {
  const setConnected = useConnectionStore((s) => s.setConnected)
  const addPermission = usePermissionStore((s) => s.addPermission)
  const setTokenUsage = useTokenStore((s) => s.setUsage)

  // Update base URL from settings
  useEffect(() => {
    const stored = localStorage.getItem('mimocode-server-url')
    if (stored) setBaseUrl(stored)
  }, [])

  // Connect via SSE and route events
  useEffect(() => {
    const client = getSSEClient()

    const unsubState = client.onStateChange((state) => {
      setConnected(state === 'connected')
    })

    const unsubEvent = client.subscribe((event) => {
      switch (event.type) {
        case 'permission.asked': {
          const payload = event.data as Record<string, unknown>
          addPermission({
            id: String(payload.id || ''),
            toolName: String(payload.permission || ''),
            input: payload.metadata,
            sessionId: String(payload.sessionID || payload.sessionId || ''),
            message: payload.message as string | undefined,
            timestamp: Date.now(),
          })
          break
        }
        case 'permission.request': {
          const payload = event.data as Record<string, unknown>
          addPermission({
            id: String(payload.id || ''),
            toolName: String(payload.toolName || ''),
            input: payload.input,
            sessionId: String(payload.sessionID || payload.sessionId || ''),
            message: payload.message as string | undefined,
            timestamp: Date.now(),
          })
          break
        }
        case 'token.usage': {
          const payload = event.data as Record<string, unknown>
          setTokenUsage({
            inputTokens: Number(payload.inputTokens) || 0,
            outputTokens: Number(payload.outputTokens) || 0,
            cacheReadTokens: Number(payload.cacheReadTokens) || 0,
            cacheWriteTokens: Number(payload.cacheWriteTokens) || 0,
            totalCost: Number(payload.totalCost) || undefined,
            model: payload.model as string | undefined,
          })
          break
        }
        // Add more event handlers as needed
      }
    })

    // Ensure SSE is connected
    client.connect()

    return () => {
      unsubState()
      unsubEvent()
    }
  }, [setConnected, addPermission, setTokenUsage])

  /** Register a custom message handler */
  const onMessage = useCallback((handler: MessageHandler) => {
    return getSSEClient().subscribe(handler)
  }, [])

  /** Send a message via SSE (fire-and-forget) */
  const send = useCallback((_type: string, _payload?: unknown) => {
    // SSE is unidirectional — for sending, use the REST API
    // This is a no-op placeholder for API compatibility
  }, [])

  return { onMessage, send }
}
