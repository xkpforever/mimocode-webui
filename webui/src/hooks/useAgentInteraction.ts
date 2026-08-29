import { useState, useEffect, useCallback } from 'react'
import {
  fetchPendingQuestions,
  fetchPendingPermissions,
  replyToQuestion,
  replyToPermission,
  type QuestionRequest,
  type PermissionRequest,
} from '../lib/interaction'

const POLL_INTERVAL = 2000

export function useAgentInteraction() {
  const [questions, setQuestions] = useState<QuestionRequest[]>([])
  const [permissions, setPermissions] = useState<PermissionRequest[]>([])

  const poll = useCallback(async () => {
    try {
      const [qs, ps] = await Promise.all([
        fetchPendingQuestions(),
        fetchPendingPermissions(),
      ])
      setQuestions(qs)
      setPermissions(ps)
    } catch {
      // network or runtime error — keep current state
    }
  }, [])

  useEffect(() => {
    poll()
    const timer = setInterval(poll, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [poll])

  const answerQuestion = useCallback(
    async (requestID: string, answers: string[][]) => {
      const ok = await replyToQuestion(requestID, answers)
      if (ok) poll()
      return ok
    },
    [poll],
  )

  const answerPermission = useCallback(
    async (requestID: string, action: 'once' | 'always' | 'reject') => {
      const ok = await replyToPermission(requestID, action)
      if (ok) poll()
      return ok
    },
    [poll],
  )

  return { questions, permissions, answerQuestion, answerPermission, refresh: poll }
}
