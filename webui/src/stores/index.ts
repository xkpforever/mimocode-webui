import { create } from 'zustand'
import type { Message, Session } from '../types/mimocode'

/* ─── Connection ─── */

interface ConnectionState {
  connected: boolean
  setConnected: (connected: boolean) => void
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),
}))

/* ─── Permissions ─── */

export interface PermissionRequest {
  id: string
  toolName: string
  input?: unknown
  sessionId: string
  message?: string
  timestamp: number
}

interface PermissionState {
  pending: PermissionRequest[]
  addPermission: (req: PermissionRequest) => void
  removePermission: (id: string) => void
  clearPermissions: () => void
}

export const usePermissionStore = create<PermissionState>((set) => ({
  pending: [],
  addPermission: (req) =>
    set((state) => ({
      pending: [...state.pending.filter(p => p.id !== req.id), req],
    })),
  removePermission: (id) =>
    set((state) => ({
      pending: state.pending.filter(p => p.id !== id),
    })),
  clearPermissions: () => set({ pending: [] }),
}))

/* ─── Token Usage ─── */

interface TokenUsage {
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  totalCost?: number
  model?: string
}

interface TokenState {
  usage: TokenUsage
  setUsage: (usage: Partial<TokenUsage>) => void
  resetUsage: () => void
}

const DEFAULT_USAGE: TokenUsage = {
  inputTokens: 0,
  outputTokens: 0,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
}

export const useTokenStore = create<TokenState>((set) => ({
  usage: { ...DEFAULT_USAGE },
  setUsage: (partial) =>
    set((state) => ({ usage: { ...state.usage, ...partial } })),
  resetUsage: () => set({ usage: { ...DEFAULT_USAGE } }),
}))

/* ─── Chat ─── */

interface ChatMessage {
  message: Message
  sessionId: string
}

interface ChatState {
  /** Session-scoped messages: only shows messages for currentSessionId */
  messages: Message[]
  /** Raw message store keyed by sessionId */
  messageMap: Map<string, Message[]>
  currentSessionId: string | null
  streaming: boolean
  streamingContent: string
  setCurrentSession: (id: string | null) => void
  addMessage: (message: Message, sessionId?: string) => void
  updateMessage: (id: string, updates: Partial<Message>, sessionId?: string) => void
  updateStreamingContent: (content: string) => void
  setStreaming: (streaming: boolean) => void
  appendStreamingContent: (chunk: string) => void
  finalizeStreaming: () => void
  clearMessages: () => void
  /** Get messages for a specific session */
  getMessages: (sessionId: string) => Message[]
}

function getMessagesForSession(messageMap: Map<string, Message[]>, sessionId: string | null): Message[] {
  if (!sessionId) return []
  return messageMap.get(sessionId) || []
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  messageMap: new Map(),
  currentSessionId: null,
  streaming: false,
  streamingContent: '',

  setCurrentSession: (id) => {
    const state = get()
    const msgs = getMessagesForSession(state.messageMap, id)
    set({ currentSessionId: id, messages: msgs })
  },

  addMessage: (message, sessionId) => {
    const state = get()
    const sid = sessionId || state.currentSessionId || 'default'
    const newMap = new Map(state.messageMap)
    const existing = newMap.get(sid) || []
    newMap.set(sid, [...existing, message])
    set({
      messageMap: newMap,
      messages: state.currentSessionId === sid ? [...existing, message] : state.messages,
    })
  },

  updateMessage: (id, updates, sessionId) => {
    const state = get()
    const sid = sessionId || state.currentSessionId || 'default'
    const newMap = new Map(state.messageMap)
    const existing = newMap.get(sid) || []
    const updated = existing.map(m => m.id === id ? { ...m, ...updates } : m)
    newMap.set(sid, updated)
    set({
      messageMap: newMap,
      messages: state.currentSessionId === sid ? updated : state.messages,
    })
  },

  updateStreamingContent: (content) => set({ streamingContent: content }),

  setStreaming: (streaming) => set({ streaming }),

  appendStreamingContent: (chunk) =>
    set((state) => ({ streamingContent: state.streamingContent + chunk })),

  finalizeStreaming: () => {
    const { streamingContent, currentSessionId } = get()
    if (streamingContent && currentSessionId) {
      const finalMsg: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: streamingContent,
        timestamp: Date.now(),
      }
      const state = get()
      const newMap = new Map(state.messageMap)
      const existing = newMap.get(currentSessionId) || []
      newMap.set(currentSessionId, [...existing, finalMsg])
      set({
        messageMap: newMap,
        messages: [...existing, finalMsg],
        streamingContent: '',
        streaming: false,
      })
    } else {
      set({ streaming: false })
    }
  },

  clearMessages: () => {
    const { currentSessionId } = get()
    if (currentSessionId) {
      const newMap = new Map(get().messageMap)
      newMap.delete(currentSessionId)
      set({ messageMap: newMap, messages: [], streamingContent: '', streaming: false })
    } else {
      set({ messages: [], streamingContent: '', streaming: false })
    }
  },

  getMessages: (sessionId) => {
    return getMessagesForSession(get().messageMap, sessionId)
  },
}))

/* ─── Sessions ─── */

interface SessionState {
  sessions: Session[]
  currentSessionId: string | null
  setSessions: (sessions: Session[]) => void
  setCurrentSession: (id: string | null) => void
  addSession: (session: Session) => void
  removeSession: (id: string) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  currentSessionId: null,
  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (id) => set({ currentSessionId: id }),
  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),
  removeSession: (id) =>
    set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) })),
}))

/* ─── Settings ─── */

export type ThinkingMode = 'fast' | 'think' | 'think-hard'

interface SettingsState {
  serverUrl: string
  theme: string
  colorScheme: 'light' | 'dark' | 'system'
  thinkingMode: ThinkingMode
  setServerUrl: (url: string) => void
  setTheme: (theme: string) => void
  setColorScheme: (scheme: 'light' | 'dark' | 'system') => void
  setThinkingMode: (mode: ThinkingMode) => void
}

function getInitialServerUrl(): string {
  const stored = localStorage.getItem('mimocode-server-url')
  // Default to direct connection. MIMO server has CORS enabled for localhost.
  if (!stored) {
    return 'http://localhost:4096'
  }
  return stored
}

export const useSettingsStore = create<SettingsState>((set) => ({
  serverUrl: getInitialServerUrl(),
  theme: localStorage.getItem('mimocode-theme-id') || 'oc-2',
  colorScheme: (localStorage.getItem('mimocode-color-scheme') as 'light' | 'dark' | 'system') || 'dark',
  thinkingMode: (localStorage.getItem('mimocode-thinking-mode') as ThinkingMode) || 'fast',

  setServerUrl: (url) => {
    localStorage.setItem('mimocode-server-url', url)
    set({ serverUrl: url })
  },
  setTheme: (theme) => {
    localStorage.setItem('mimocode-theme-id', theme)
    document.documentElement.dataset.theme = theme
    set({ theme })
  },
  setColorScheme: (scheme) => {
    localStorage.setItem('mimocode-color-scheme', scheme)
    const resolved = scheme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : scheme
    document.documentElement.dataset.colorScheme = resolved
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(resolved)
    set({ colorScheme: scheme })
  },
  setThinkingMode: (mode) => {
    localStorage.setItem('mimocode-thinking-mode', mode)
    set({ thinkingMode: mode })
  },
}))

/* ─── Archive ─── */

function loadArchived(): string[] {
  try {
    return JSON.parse(localStorage.getItem('mimocode-archived') || '[]')
  } catch {
    return []
  }
}

function saveArchived(ids: string[]) {
  localStorage.setItem('mimocode-archived', JSON.stringify(ids))
}

interface ArchiveState {
  archivedIds: string[]
  toggleArchive: (id: string) => void
  isArchived: (id: string) => boolean
}

export const useArchiveStore = create<ArchiveState>((set, get) => ({
  archivedIds: loadArchived(),

  toggleArchive: (id) => {
    const { archivedIds } = get()
    const next = archivedIds.includes(id)
      ? archivedIds.filter((a) => a !== id)
      : [...archivedIds, id]
    saveArchived(next)
    set({ archivedIds: next })
  },

  isArchived: (id) => get().archivedIds.includes(id),
}))
