/**
 * SSE (Server-Sent Events) client for MIMO Code server event stream.
 * Connects to /global/events to receive real-time updates.
 * Singleton: only one connection per origin.
 */

import { getBaseUrl } from './api'

export type SSECallback = (event: ServerSentEvent) => void

export interface ServerSentEvent {
  type: string
  data: unknown
  raw: string
}

type State = 'idle' | 'connecting' | 'connected' | 'disconnected'

interface SSEInstance {
  subscribe: (cb: SSECallback) => () => void
  connect: () => void
  disconnect: () => void
  getState: () => State
  onStateChange: (cb: (state: State) => void) => () => void
}

let instance: SSEInstance | null = null

export function getSSEClient(): SSEInstance {
  if (!instance) {
    instance = createSingleton()
  }
  return instance
}

function createSingleton(): SSEInstance {
  let eventSource: EventSource | null = null
  let state: State = 'idle'
  let url = ''
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectAttempts = 0
  const MAX_RECONNECT_ATTEMPTS = 10
  const BASE_RECONNECT_DELAY = 1000

  const subscribers = new Set<SSECallback>()
  const stateWatchers = new Set<(state: State) => void>()

  function setState(s: State) {
    state = s
    stateWatchers.forEach((cb) => cb(s))
  }

  function getReconnectDelay(): number {
    const delay = Math.min(BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts), 30000)
    return delay + Math.random() * 1000
  }

  function scheduleReconnect() {
    if (reconnectTimer) return
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      setState('disconnected')
      return
    }

    const delay = getReconnectDelay()
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      reconnectAttempts++
      connect()
    }, delay)
  }

  function connect() {
    if (eventSource) return

    url = `${getBaseUrl()}/global/event`
    setState('connecting')

    eventSource = new EventSource(url)

    eventSource.onopen = () => {
      reconnectAttempts = 0
      setState('connected')
    }

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        const sseEvent: ServerSentEvent = {
          type: parsed.type || 'unknown',
          data: parsed.properties || parsed,
          raw: event.data,
        }
        subscribers.forEach((cb) => cb(sseEvent))
      } catch {
        subscribers.forEach((cb) =>
          cb({ type: 'raw', data: event.data, raw: event.data }),
        )
      }
    }

    eventSource.onerror = () => {
      if (eventSource?.readyState === EventSource.CLOSED) {
        eventSource = null
        scheduleReconnect()
      } else {
        eventSource?.close()
        eventSource = null
        scheduleReconnect()
      }
    }
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    reconnectAttempts = MAX_RECONNECT_ATTEMPTS
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    setState('idle')
  }

  function subscribe(cb: SSECallback): () => void {
    subscribers.add(cb)
    return () => {
      subscribers.delete(cb)
    }
  }

  function onStateChange(cb: (s: State) => void): () => void {
    stateWatchers.add(cb)
    // Immediately notify with current state
    cb(state)
    return () => {
      stateWatchers.delete(cb)
    }
  }

  function getState() {
    return state
  }

  return { subscribe, connect, disconnect, getState, onStateChange }
}
