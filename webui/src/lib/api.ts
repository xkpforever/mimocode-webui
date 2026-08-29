/**
 * MIMO Code Server API Client
 * Communicates with the Hono-based MIMO Code server.
 */

// Default: empty string = use Vite proxy (same origin)
// In production, set to the actual server URL.
let baseUrl = ''

export function setBaseUrl(url: string) {
  baseUrl = url.replace(/\/+$/, '')
}

export function getBaseUrl() {
  return baseUrl
}

// ---- Generic fetch wrapper ----

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${baseUrl}${path}`
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(body ? {} : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new Error(`API error ${res.status}: ${text}`)
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T

  return res.json()
}

// ---- Session API ----

export interface SessionInfo {
  id: string
  slug?: string
  title: string
  version?: string
  projectID?: string
  directory?: string
  parentID?: string
  summary?: {
    additions: number
    deletions: number
    files: number
  }
  time?: {
    created: number
    updated: number
  }
}

export interface SessionMessage {
  info: {
    id: string
    role: 'user' | 'assistant' | 'system' | 'tool'
    sessionID: string
    agentID?: string
    agent?: string
    time: {
      created: number
    }
  }
  parts: Array<{
    id: string
    type: string
    text?: string
    sessionID: string
    messageID: string
    [key: string]: unknown
  }>
}

export const sessions = {
  list: (): Promise<SessionInfo[]> =>
    request<SessionInfo[]>('GET', '/session'),

  get: (id: string): Promise<SessionInfo> =>
    request<SessionInfo>('GET', `/session/${id}`),

  create: (): Promise<SessionInfo> =>
    request<SessionInfo>('POST', '/session'),

  delete: (id: string): Promise<void> =>
    request<void>('DELETE', `/session/${id}`),

  messages: (sessionId: string): Promise<SessionMessage[]> =>
    request<SessionMessage[]>('GET', `/session/${sessionId}/message`),

  status: (): Promise<Record<string, { type: string; attempt?: number; message?: string }>> =>
    request('GET', '/session/status'),
}

// ---- Project API ----

export interface ProjectInfo {
  directory: string
  name?: string
}

export const projects = {
  current: (): Promise<ProjectInfo> =>
    request<ProjectInfo>('GET', '/project/current'),
}

// ---- Config API ----

export interface ProviderConfig {
  id: string
  name: string
  model?: string
  apiKey?: string
}

export const config = {
  providers: (): Promise<ProviderConfig[]> =>
    request<ProviderConfig[]>('GET', '/config/providers'),
}

// ---- Health check ----
// Use the MIMO server's /global/health endpoint (returns 200 when alive).

export async function checkServerAlive(): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/global/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })
    // SSE returns 200 with content-type text/event-stream
    return res.ok || res.status === 200
  } catch {
    return false
  }
}

// ---- Git API ----

export interface GitFileChange {
  path: string
  status: string
  staged: boolean
}

export interface GitCommitInfo {
  hash: string
  message: string
  author: string
  date: string
}

export interface GitStatus {
  currentBranch: string | null
  branches: string[]
  staged: GitFileChange[]
  unstaged: GitFileChange[]
  untracked: GitFileChange[]
  commits: GitCommitInfo[]
  remoteUrl?: string
}

export const git = {
  status: (): Promise<GitStatus> =>
    request<GitStatus>('GET', '/git/status'),

  stage: (path: string): Promise<{ ok: boolean }> =>
    request<{ ok: boolean }>('POST', '/git/stage', { path }),

  unstage: (path: string): Promise<{ ok: boolean }> =>
    request<{ ok: boolean }>('POST', '/git/unstage', { path }),

  discard: (path: string): Promise<{ ok: boolean }> =>
    request<{ ok: boolean }>('POST', '/git/discard', { path }),

  commit: (message: string): Promise<{ hash: string }> =>
    request<{ hash: string }>('POST', '/git/commit', { message }),

  push: (): Promise<{ ok: boolean }> =>
    request<{ ok: boolean }>('POST', '/git/push'),

  pull: (): Promise<{ ok: boolean }> =>
    request<{ ok: boolean }>('POST', '/git/pull'),
}
