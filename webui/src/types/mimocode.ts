export type AgentType = 'build' | 'plan' | 'compose'

export interface Agent {
  id: AgentType
  name: string
  description: string
}

export interface MessageImage {
  id: string
  name: string
  dataUrl: string // base64 data URL
  size: number
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  timestamp: number
  images?: MessageImage[]
  toolCalls?: ToolCall[]
  toolResults?: ToolResult[]
  status?: 'pending' | 'completed' | 'error' | 'cancelled'
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
  status: 'pending' | 'running' | 'completed' | 'failed'
}

export interface ToolResult {
  id: string
  name: string
  result: string
  status: 'success' | 'error'
}

export interface Session {
  id: string
  title: string
  agent: AgentType
  createdAt: number
  updatedAt: number
  messageCount: number
}

export interface ServerSession {
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

export interface MemoryEntry {
  id: string
  path: string
  snippet: string
  score: number
  scope: string
  scope_id: string
  type: string
}

export interface TaskNode {
  id: string
  label: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  children: TaskNode[]
  parentId?: string
}

export interface Theme {
  id: string
  name: string
  type: 'light' | 'dark' | 'both'
}

export interface ServerEvent {
  type: string
  payload: Record<string, unknown>
}
