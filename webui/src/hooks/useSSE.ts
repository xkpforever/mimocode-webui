import { useEffect, useRef, useCallback } from 'react'
import { getSSEClient, type ServerSentEvent } from '../lib/sse'
import { useSettingsStore, useConnectionStore } from '../stores'
import { setBaseUrl } from '../lib/api'

type EventHandler = (event: ServerSentEvent) => void

export function useSSE(onEvent?: EventHandler) {
  const serverUrl = useSettingsStore((s) => s.serverUrl)
  const setConnected = useConnectionStore((s) => s.setConnected)
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  // Update base URL when settings change
  useEffect(() => {
    setBaseUrl(serverUrl)
  }, [serverUrl])

  // Subscribe to events + connection state — runs once
  useEffect(() => {
    const client = getSSEClient()

    // Subscribe to SSE events
    const unsubEvent = onEvent
      ? client.subscribe((event) => onEventRef.current?.(event))
      : () => {}

    // Subscribe to connection state changes
    const unsubState = client.onStateChange((state) => {
      setConnected(state === 'connected')
    })

    // Make sure the client is connected (idempotent)
    client.connect()

    return () => {
      unsubEvent()
      unsubState()
      // Don't disconnect — other consumers may still need it
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUrl, setConnected])

  const disconnect = useCallback(() => {
    getSSEClient().disconnect()
    setConnected(false)
  }, [setConnected])

  const reconnect = useCallback(() => {
    getSSEClient().disconnect()
    getSSEClient().connect()
  }, [])

  return { disconnect, reconnect }
}
