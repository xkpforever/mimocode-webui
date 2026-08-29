import { useRef, useEffect, useState, useCallback } from 'react'
import type { Message } from '../../types/mimocode'
import { MessageBubble } from './MessageBubble'

interface MessageListProps {
  messages: Message[]
  sessionId?: string
  threshold?: number
}

const ITEM_HEIGHT_ESTIMATE = 100
const OVERSCAN = 5

export function MessageList({ messages, sessionId, threshold = 100 }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [useVirtualization, setUseVirtualization] = useState(false)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const prevSessionRef = useRef<string | undefined>()
  const prevCountRef = useRef(0)
  const initializedRef = useRef(false)

  useEffect(() => {
    setUseVirtualization(messages.length > threshold)
  }, [messages.length, threshold])

  // Resize + scroll listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => setScrollTop(container.scrollTop)
    const ro = new ResizeObserver(() => setContainerHeight(container.clientHeight))

    container.addEventListener('scroll', handleScroll, { passive: true })
    ro.observe(container)
    setContainerHeight(container.clientHeight)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      ro.disconnect()
    }
  }, [])

  // ── Session switch: scroll to bottom after DOM renders ──
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (prevSessionRef.current !== undefined && prevSessionRef.current !== sessionId) {
      // Session changed — wait for DOM to fully render, then scroll
      const timer = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
      }, 50)
    }
    prevSessionRef.current = sessionId
  }, [sessionId])

  // ── New messages: auto-scroll only if near bottom ──
  useEffect(() => {
    const container = containerRef.current
    if (!container || messages.length === 0) return

    const newCount = messages.length
    const prevCount = prevCountRef.current

    // Only when count increased AND user is near bottom
    if (newCount > prevCount) {
      // Wait for DOM to settle before checking scroll position
      const timer = setTimeout(() => {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200
        if (isNearBottom) {
          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
        }
      }, 50)
    }

    prevCountRef.current = newCount
  }, [messages.length])

  // ── Initial load: scroll to bottom ──
  useEffect(() => {
    const container = containerRef.current
    if (!container || messages.length === 0) return

    if (!initializedRef.current) {
      initializedRef.current = true
      const timer = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
      }, 50)
    }
  }, [messages.length > 0])

  const getVisibleRange = useCallback(() => {
    if (!useVirtualization) {
      return { start: 0, end: messages.length }
    }

    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT_ESTIMATE) - OVERSCAN)
    const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT_ESTIMATE) + OVERSCAN * 2
    const endIndex = Math.min(messages.length, startIndex + visibleCount)

    return { start: startIndex, end: endIndex }
  }, [scrollTop, containerHeight, messages.length, useVirtualization])

  const { start, end } = getVisibleRange()
  const visibleMessages = useVirtualization ? messages.slice(start, end) : messages
  const totalHeight = useVirtualization ? messages.length * ITEM_HEIGHT_ESTIMATE : 'auto'
  const offsetY = useVirtualization ? start * ITEM_HEIGHT_ESTIMATE : 0

  if (useVirtualization) {
    return (
      <div ref={containerRef} className="overflow-y-auto" style={{ willChange: 'transform', height: '100%' }}>
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleMessages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="overflow-y-auto" style={{ height: '100%' }}>
      <div className="space-y-4">
        {visibleMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>
    </div>
  )
}
