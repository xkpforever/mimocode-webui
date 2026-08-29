import { getBaseUrl } from './api'

/* ─── Real server response types ─── */

export interface QuestionInfo {
  question: string          // Full question text
  header: string            // Short label (≤30 chars)
  options: Array<{
    label: string
    description: string     // Explanation of the choice
  }>
  multiple?: boolean
  custom?: boolean
  key?: string
  params?: Record<string, string>
}

export interface QuestionRequest {
  id: string
  sessionID: string
  questions: QuestionInfo[]
  tool?: {
    messageID: string
    callID: string
  }
}

export interface PermissionRequest {
  id: string
  sessionID: string
  permission: string         // e.g. "run.command", "edit.file"
  patterns: string[]         // File/command patterns the permission applies to
  metadata: Record<string, unknown>
  always: string[]
  tool?: {
    messageID: string
    callID: string
  }
}

/* ─── Fetch ─── */

export async function fetchPendingQuestions(): Promise<QuestionRequest[]> {
  const base = getBaseUrl()
  try {
    const res = await fetch(`${base}/question`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

/** Server expects `answers: string[][]` — each question gets an array of selected option labels */
export async function replyToQuestion(
  requestID: string,
  answers: string[][]
): Promise<boolean> {
  const base = getBaseUrl()
  try {
    const res = await fetch(`${base}/question/${requestID}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function fetchPendingPermissions(): Promise<PermissionRequest[]> {
  const base = getBaseUrl()
  try {
    const res = await fetch(`${base}/permission`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

/** Reply actions the server accepts: once / always / reject */
export async function replyToPermission(
  requestID: string,
  action: 'once' | 'always' | 'reject',
  message?: string,
): Promise<boolean> {
  const base = getBaseUrl()
  try {
    const res = await fetch(`${base}/permission/${requestID}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: action, message }),
    })
    return res.ok
  } catch {
    return false
  }
}
