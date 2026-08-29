import { useCallback, useState, useRef, useEffect } from 'react'
import { useChatStore, useSettingsStore } from '../stores'
import { useSSE } from './useSSE'
import { getSSEClient } from '../lib/sse'
import type { Message, MessageImage } from '../types/mimocode'
import { getBaseUrl } from '../lib/api'
import type { ThinkingMode } from '../stores'

// Map thinking mode to modelRef string the server understands
function modeToModelRef(mode: ThinkingMode): string | undefined {
  if (mode === 'think') return 'standard'
  if (mode === 'think-hard') return 'ultra'
  return undefined // fast = default (no modelRef)
}

type InsertMode = 'pending' | 'interrupt' | 'queue' | null

interface AssistantResponse {
  info: { id: string; role: string; content?: string }
  parts: Array<{ type: string; text?: string; [key: string]: unknown }>
}

function generateId(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const LONG_TIMEOUT = 300_000

export function useChat(existingSessionId?: string) {
  const {
    messages,
    streaming,
    addMessage,
    updateMessage,
    setStreaming,
    setCurrentSession,
  } = useChatStore()

  const [sessionId, setSessionId] = useState<string | undefined>(existingSessionId)
  const [streamingText, setStreamingText] = useState('')
  const [thinking, setThinking] = useState(false)
  const [currentTool, setCurrentTool] = useState<string | null>(null)
  const [pendingInsertMode, setPendingInsertMode] = useState<InsertMode>(null)
  const [pendingInsertText, setPendingInsertText] = useState('')
  const [pendingInsertImages, setPendingInsertImages] = useState<MessageImage[]>([])
  const sendingRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const pendingIdRef = useRef<string | null>(null)
  const streamBufferRef = useRef('')
  const queueRef = useRef<Array<{ text: string; images: MessageImage[] }>>([])

  useSSE()

  // Scope messages to current session
  useEffect(() => {
    if (sessionId) {
      setCurrentSession(sessionId)
    }
  }, [sessionId, setCurrentSession])

  // Listen for SSE streaming events
  useEffect(() => {
    const unsub = getSSEClient().subscribe((event) => {
      const payload = event.data as Record<string, unknown>

      // Only process events for the current session
      const eventSessionId = payload.sessionID || payload.sessionId
      if (eventSessionId && String(eventSessionId) !== sessionId) return

      switch (event.type) {
        case 'session.status': {
          // Always process status events to clear thinking state
          const status = payload.status as string
          if (status === 'running') {
            if (sendingRef.current) setThinking(true)
          } else if (status === 'idle') {
            setThinking(false)
            setCurrentTool(null)
          }
          break
        }

        // Only process streaming events if currently sending
        case 'message.part.delta': {
          if (!sendingRef.current) return
          const delta = payload.delta as string
          const field = payload.field as string
          if (field === 'text' && delta) {
            streamBufferRef.current += delta
            setStreamingText(streamBufferRef.current)
            // Update the pending message content in real-time
            const pendingId = pendingIdRef.current
            if (pendingId) {
              updateMessage(pendingId, { content: streamBufferRef.current })
            }
          }
          break
        }
        case 'tool.call': {
          if (!sendingRef.current) return
          const toolName = payload.tool as string || payload.name as string
          if (toolName) {
            setCurrentTool(toolName)
          }
          break
        }
        case 'tool.result': {
          if (!sendingRef.current) return
          setCurrentTool(null)
          break
        }
      }
    })
    return unsub
  }, [sessionId])

  const ensureSession = useCallback(async (): Promise<string> => {
    if (sessionId) return sessionId
    const base = getBaseUrl()
    const res = await fetch(`${base}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) throw new Error(`Failed to create session (${res.status})`)
    const data = await res.json()
    setSessionId(data.id)
    setCurrentSession(data.id)
    return data.id as string
  }, [sessionId, setCurrentSession])

  const cancelMessage = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  const sendMessage = useCallback(
    async (text: string, images: MessageImage[] = []) => {
      if (sendingRef.current) return
      sendingRef.current = true

      let displayContent = text
      if (images.length > 0) {
        const imageRefs = images.map(img => `[Image: ${img.name}]`).join(' ')
        displayContent = text ? `${text}\n${imageRefs}` : imageRefs
      }

      const userMsg: Message = {
        id: generateId(), role: 'user', content: displayContent, timestamp: Date.now(),
        images: images.length > 0 ? images : undefined,
      }
      addMessage(userMsg)

      const pendingId = generateId()
      pendingIdRef.current = pendingId
      addMessage({
        id: pendingId, role: 'assistant', content: '', timestamp: Date.now(), status: 'pending',
      })

      // Reset streaming state
      streamBufferRef.current = ''
      setStreamingText('')
      setThinking(true)
      setStreaming(true)

      try {
        const sid = await ensureSession()
        const base = getBaseUrl()
        const controller = new AbortController()
        abortRef.current = controller

        const timeoutId = setTimeout(() => controller.abort(), LONG_TIMEOUT)

        const parts: Array<Record<string, unknown>> = []
        if (text) {
          parts.push({ type: 'text', text })
        }
        for (const img of images) {
          const ext = img.name?.split('.').pop()?.toLowerCase() || 'png'
          const mime = `image/${ext === 'jpg' ? 'jpeg' : ext}`
          parts.push({
            type: 'file',
            mime,
            filename: img.name || `image.${ext}`,
            url: img.dataUrl,
          })
        }
        if (parts.length === 0) {
          parts.push({ type: 'text', text: '' })
        }

        let res: Response
        try {
          res = await fetch(`${base}/session/${sid}/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              parts,
              modelRef: modeToModelRef(useSettingsStore.getState().thinkingMode),
            }),
            signal: controller.signal,
          })
        } finally {
          clearTimeout(timeoutId)
        }

        if (!res.ok) {
          const body = await res.text().catch(() => '')
          if (res.status === 409) {
            updateMessage(pendingId, {
              content: '⚠️ Session is busy processing a previous request. Please wait and try again.',
              status: 'error',
            })
          } else {
            throw new Error(`Server error ${res.status}: ${body.slice(0, 200)}`)
          }
          return
        }

        const data: AssistantResponse = await res.json()

        let replyText = ''
        if (data.parts) {
          for (const part of data.parts) {
            if (part.type === 'text' && part.text) replyText += part.text
          }
        }
        if (!replyText && data.info?.content) replyText = data.info.content
        if (!replyText) replyText = '(no text response)'

        updateMessage(pendingId, { content: replyText, status: 'completed' })
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          if (abortRef.current === null) {
            updateMessage(pendingId, { content: '(cancelled)', status: 'cancelled' })
          }
          return
        }
        const msg = err instanceof Error ? err.message : String(err)
        updateMessage(pendingId, {
          content: `⚠️ Error: ${msg}\n\nMake sure \`mimo web\` is running.`,
          status: 'error',
        })
      } finally {
        setStreaming(false)
        setThinking(false)
        setCurrentTool(null)
        setStreamingText('')
        streamBufferRef.current = ''
        pendingIdRef.current = null
        sendingRef.current = false
        abortRef.current = null
        // Signal to useSessionMessages that a response completed — triggers server message refresh
        window.dispatchEvent(new CustomEvent('mimocode:message-completed', { detail: { sessionId } }))
      }
    },
    [ensureSession, addMessage, updateMessage, setStreaming],
  )

  // Process queue: send next queued message when current finishes
  const processQueue = useCallback(() => {
    const next = queueRef.current.shift()
    if (next) {
      sendMessage(next.text, next.images)
    }
  }, [sendMessage])

  // Interrupt: cancel current, send immediately
  const sendInterrupt = useCallback(
    async (text: string, images: MessageImage[] = []) => {
      cancelMessage()
      setPendingInsertMode(null)
      setPendingInsertText('')
      setPendingInsertImages([])
      // Small delay for server to cancel
      await new Promise(r => setTimeout(r, 300))
      await sendMessage(text, images)
    },
    [cancelMessage, sendMessage],
  )

  // Queue: store message, auto-send when current finishes
  const sendQueue = useCallback(
    (text: string, images: MessageImage[] = []) => {
      queueRef.current.push({ text, images })
      setPendingInsertMode(null)
      setPendingInsertText('')
      setPendingInsertImages([])
    },
    [],
  )

  // After streaming completes, process queue
  const origSendMessage = sendMessage
  const wrappedSendMessage = useCallback(
    async (text: string, images: MessageImage[] = []) => {
      // Use sendingRef (immediate) instead of streaming (async state) to avoid race
      if (sendingRef.current || streaming) {
        setPendingInsertText(text)
        setPendingInsertImages(images || [])
        setPendingInsertMode('pending')
        return
      }
      return origSendMessage(text, images)
    },
    [streaming, origSendMessage],
  )

  // When streaming finishes, check queue
  useEffect(() => {
    if (!streaming && queueRef.current.length > 0) {
      processQueue()
    }
  }, [streaming, processQueue])

  return {
    messages,
    streaming,
    streamingText,
    thinking,
    currentTool,
    sessionId,
    sendMessage: wrappedSendMessage,
    sendInterrupt,
    sendQueue,
    pendingInsertMode,
    pendingInsertText,
    pendingInsertImages,
    setPendingInsertMode,
    cancelMessage,
    processQueue,
    clearMessages: () => {},
  }
}
