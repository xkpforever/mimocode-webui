import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { useChat } from '../../hooks/useChat'
import { useSessionMessages } from '../../hooks/useSessions'
import { useI18n } from '../../context/i18n'
import { useAgentInteraction } from '../../hooks/useAgentInteraction'
import { QuestionDialog, PermissionDialog } from './InteractionDialogs'
import { StopCircle, Loader2 } from 'lucide-react'
import type { Message, MessageImage } from '../../types/mimocode'

interface ChatViewProps {
  sessionId?: string
}

function convertServerMessage(serverMsg: { info: { id: string; role: string; time: { created: number } }; parts: Array<{ type: string; text?: string; mime?: string; url?: string; filename?: string; [key: string]: unknown }> }): Message {
  let content = ''
  const images: Array<{ id: string; name: string; dataUrl: string; size: number }> = []

  if (serverMsg.parts) {
    for (const part of serverMsg.parts) {
      if (part.type === 'text' && part.text) {
        content += part.text
      }
      // Extract image/file parts with base64 data URLs
      if ((part.type === 'file' || part.type === 'image') && part.url && part.url.startsWith('data:')) {
        images.push({
          id: `srv-${serverMsg.info.id}-${images.length}`,
          name: part.filename || 'image',
          dataUrl: part.url,
          size: 0,
        })
      }
    }
  }

  return {
    id: serverMsg.info.id,
    role: serverMsg.info.role as Message['role'],
    content,
    timestamp: serverMsg.info.time.created,
    images: images.length > 0 ? images : undefined,
  }
}

export function ChatView({ sessionId }: ChatViewProps) {
  const {
    messages: localMessages,
    streaming,
    streamingText,
    thinking,
    currentTool,
    sendMessage,
    sendInterrupt,
    sendQueue,
    pendingInsertMode,
    pendingInsertText,
    pendingInsertImages,
    setPendingInsertMode,
    cancelMessage,
  } = useChat(sessionId)
  const { messages: serverMessages, loading: loadingMessages, refresh: refreshMessages } = useSessionMessages(sessionId || null)
  const { t } = useI18n()
  const [input, setInput] = useState('')
  const [restoreImagesTrigger, setRestoreImagesTrigger] = useState<MessageImage[] | null>(null)

  const allMessages = useMemo(() => {
    if (serverMessages.length > 0) {
      const converted = serverMessages
        .map(convertServerMessage)
        .filter(m => m.content?.trim() || (m.images && m.images.length > 0)) // Keep messages with text OR images
      const serverIds = new Set(converted.map(m => m.id))
      const pendingLocal = localMessages.filter(m =>
        !serverIds.has(m.id) &&
        (m.status === 'pending' || m.status === 'error' || m.status === 'cancelled') &&
        (m.content?.trim() || m.status === 'pending'),
      )
      return [...converted, ...pendingLocal]
    }
    return localMessages.filter(m => m.content?.trim() || m.status === 'pending')
  }, [serverMessages, localMessages])

  const handleSend = useCallback((text: string, images: MessageImage[]) => {
    // Clear input immediately — don't wait for server response
    setInput('')
    // Fire-and-forget: send in background
    sendMessage(text, images)
  }, [sendMessage])

  const handleCancel = useCallback(() => {
    cancelMessage()
  }, [cancelMessage])

  const handleToggleTerminal = useCallback(() => {
    window.dispatchEvent(new CustomEvent('mimocode:toggle-terminal'))
  }, [])

  const {
    questions,
    permissions,
    answerQuestion,
    answerPermission,
  } = useAgentInteraction()

  // ─── Insert mode: interrupt vs queue ───
  const showInsertChoice = pendingInsertMode === 'pending'
  const handleInsertInterrupt = useCallback(() => {
    if (sendInterrupt && pendingInsertText) {
      sendInterrupt(pendingInsertText, pendingInsertImages)
    }
  }, [sendInterrupt, pendingInsertText, pendingInsertImages])
  const handleInsertQueue = useCallback(() => {
    if (sendQueue && pendingInsertText) {
      sendQueue(pendingInsertText, pendingInsertImages)
    }
  }, [sendQueue, pendingInsertText, pendingInsertImages])
  const handleInsertCancel = useCallback(() => {
    // Restore the text and images back to the input
    if (pendingInsertText) setInput(pendingInsertText)
    if (pendingInsertImages && pendingInsertImages.length > 0) {
      setRestoreImagesTrigger(pendingInsertImages)
    }
    setPendingInsertMode(null)
  }, [setPendingInsertMode, pendingInsertText, pendingInsertImages])

  const currentQuestion = questions.find(q => !sessionId || q.sessionID === sessionId)
  const currentPermission = permissions.find(p => !sessionId || p.sessionID === sessionId)

  const showStreaming = streaming || thinking || !!streamingText || !!currentTool

  return (
    <>
      {currentQuestion && (
        <QuestionDialog
          request={currentQuestion}
          onReply={answerQuestion}
          onClose={() => answerQuestion(currentQuestion.id, [])}
        />
      )}

      {currentPermission && (
        <PermissionDialog
          request={currentPermission}
          onReply={answerPermission}
          onClose={() => answerPermission(currentPermission.id, 'reject')}
        />
      )}

      {/* Blink animation */}
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0 px-4 py-4 overflow-hidden">
          {loadingMessages && allMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2" style={{ color: 'var(--text-weaker)' }}>
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">{t('chat.loadingMessages')}</span>
              </div>
            </div>
          ) : allMessages.length === 0 && !showStreaming ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3 max-w-md">
                <div className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-strong)' }}>
                  {sessionId ? t('chat.continueSession') : t('chat.startSession')}
                </div>
                <div className="text-sm leading-relaxed" style={{ color: 'var(--text-base)' }}>
                  {sessionId ? t('chat.continueDesc') : t('chat.startDesc')}
                </div>
              </div>
            </div>
          ) : (
            <MessageList messages={allMessages} sessionId={sessionId} />
          )}
        </div>

        {/* Insert mode chooser */}
      {showInsertChoice && (
        <div
          className="mx-4 mb-2 p-3 rounded-lg border"
          style={{
            background: 'var(--surface-strong)',
            borderColor: 'var(--border-base)',
          }}
        >
          <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-strong)' }}>
            MIMO Code 正在工作中，新消息要如何处理？
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleInsertInterrupt}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border"
              style={{
                background: '#fc533a',
                color: '#fff',
                borderColor: '#fc533a',
              }}
            >
              中断当前回复
            </button>
            <button
              onClick={handleInsertQueue}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border"
              style={{
                background: 'var(--surface-interactive-base)',
                color: 'var(--text-interactive-base)',
                borderColor: 'var(--border-selected)',
              }}
            >
              排队等待
            </button>
            <button
              onClick={handleInsertCancel}
              className="px-3 py-2 rounded-lg text-xs font-medium transition-all border"
              style={{
                background: 'transparent',
                color: 'var(--text-base)',
                borderColor: 'var(--border-weak-base)',
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border-weak-base)' }}>
          {/* Status bar */}
          {showStreaming && (
            <div className="flex items-center gap-2 mb-2 px-1">
              <Loader2 size={10} className="animate-spin" style={{ color: 'var(--icon-interactive-base)' }} />
              <span className="text-[10px]" style={{ color: 'var(--text-weaker)' }}>
                {currentTool ? t('stream.status.tool', { tool: currentTool }) : thinking && !streamingText ? t('stream.status.thinking') : t('stream.status.streaming')}
              </span>
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={handleSend}
                onToggleTerminal={handleToggleTerminal}
                disabled={false}
                restoreImages={restoreImagesTrigger}
              />
            </div>
            {streaming && (
              <button
                onClick={handleCancel}
                className="flex items-center justify-center w-10 h-10 rounded-lg transition-colors shrink-0"
                style={{
                  background: 'var(--surface-strong)',
                  border: '1px solid var(--border-weak-base)',
                  color: 'var(--icon-critical-base)',
                }}
                title="取消"
              >
                <StopCircle size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
