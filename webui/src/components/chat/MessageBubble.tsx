import { useState, memo, useMemo } from 'react'
import { Bot, User, Loader2, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp, CopyIcon, Check } from 'lucide-react'
import type { Message, MessageImage } from '../../types/mimocode'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const LONG_CONTENT_THRESHOLD = 5000

const STATUS_CONFIG: Record<string, { icon: typeof Loader2; color: string; spin?: boolean }> = {
  pending: { icon: Loader2, color: 'var(--icon-interactive-base)', spin: true },
  completed: { icon: CheckCircle, color: 'var(--icon-success-base)' },
  error: { icon: AlertCircle, color: 'var(--icon-critical-base)' },
  cancelled: { icon: XCircle, color: 'var(--text-weaker)' },
}

/* ─── Copy entire message button ─── */
function CopyMsgBtn({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)
  if (!content) return null
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="p-1 rounded hover:bg-[var(--surface-base-active)] transition-opacity"
      style={{ color: 'var(--text-weaker)' }}
      title="复制消息"
    >
      {copied ? <Check size={11} style={{ color: 'var(--icon-success-base)' }} /> : <CopyIcon size={11} />}
    </button>
  )
}

/* ─── Copy code block button ─── */
function CopyCodeBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors opacity-0 group-hover:opacity-100 hover:bg-[var(--surface-base-hover)]"
      style={{ color: 'var(--text-weaker)' }}
    >
      {copied ? <Check size={12} /> : <CopyIcon size={12} />}
      {copied ? '已复制' : '复制'}
    </button>
  )
}

/* ─── Syntax highlighting ─── */
function highlightCode(code: string, language?: string): string {
  let html = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const kw = language === 'python'
    ? 'def|class|import|from|return|if|elif|else|for|while|try|except|finally|with|as|in|not|and|or|True|False|None'
    : 'const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|import|export|from|default|new|this|try|catch|finally|throw|async|await|yield|typeof|true|false|null|undefined'
  html = html.replace(new RegExp(`\\b(${kw})\\b`, 'g'), '<span class="syn-kw">$1</span>')
  html = html.replace(/(\/\/.*$)/gm, '<span class="syn-cmt">$1</span>')
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="syn-num">$1</span>')
  return html
}

/* ─── Code block ─── */
function CodeBlock({ language, children }: { language?: string; children: string }) {
  const highlighted = highlightCode(children, language)
  return (
    <div className="relative group rounded-lg overflow-hidden my-2 border" style={{ borderColor: 'var(--border-weak-base)' }}>
      <div className="flex items-center justify-between px-3 py-1.5 text-xs" style={{ background: 'var(--surface-strong)', borderBottom: '1px solid var(--border-weak-base)' }}>
        <span style={{ color: 'var(--text-weaker)' }}>{language || 'code'}</span>
        <CopyCodeBtn text={children} />
      </div>
      <pre className="overflow-x-auto p-3 text-sm leading-relaxed" style={{ background: 'var(--surface-inset-base)', color: 'var(--text-strong)', fontFamily: 'var(--font-family-mono)', fontSize: '0.8125rem', lineHeight: 1.6 }}>
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  )
}

/* ─── Message content with markdown and collapse ─── */
function MessageContent({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false)
  const shouldCollapse = content.length > LONG_CONTENT_THRESHOLD
  const displayText = shouldCollapse && !expanded
    ? content.slice(0, LONG_CONTENT_THRESHOLD) + '\n\n*[内容过长已折叠，点击展开查看完整内容]*'
    : content

  const rendered = useMemo(() => (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const text = String(children).replace(/\n$/, '')
            if (match) return <CodeBlock language={match[1]}>{text}</CodeBlock>
            if (text.includes('\n')) return <CodeBlock>{text}</CodeBlock>
            return <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: 'var(--surface-base)', color: 'var(--text-interactive-base)', fontSize: '0.8125em' }} {...props}>{children}</code>
          },
          pre({ children }) { return <>{children}</> },
        }}
      >{displayText}</ReactMarkdown>
    </div>
  ), [displayText])

  return (
    <>
      {rendered}
      {shouldCollapse && (
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 mt-1 text-xs font-medium transition-colors hover:opacity-80" style={{ color: 'var(--text-interactive-base)' }}>
          {expanded ? <><ChevronUp size={12} /> 收起</> : <><ChevronDown size={12} /> 展开完整内容（共 {content.length} 字）</>}
        </button>
      )}
    </>
  )
}

/* ─── MessageBubble ─── */
export const MessageBubble = memo(function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const status = message.status ? STATUS_CONFIG[message.status] : null
  const StatusIcon = status?.icon

  return (
    <div className={`flex gap-3 animate-slide-in group ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 mt-0.5" style={{ background: isUser ? 'var(--surface-interactive-base)' : 'var(--surface-strong)', border: '1px solid var(--border-weak-base)' }}>
        {isUser ? <User size={14} style={{ color: 'var(--icon-interactive-base)' }} /> : <Bot size={14} style={{ color: 'var(--icon-agent-build-base)' }} />}
      </div>
      <div className={`max-w-[75%] min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="px-4 py-2.5 rounded-xl text-sm leading-relaxed" style={{ background: isUser ? 'var(--surface-interactive-base)' : 'var(--surface-strong)', border: isUser ? '1px solid var(--surface-interactive-hover)' : '1px solid var(--border-weak-base)', color: 'var(--text-strong)' }}>
          {isUser ? (
            <div>
              {message.images && message.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {message.images.map((img: MessageImage) => (
                    <div key={img.id} className="relative rounded-lg overflow-hidden" style={{ maxWidth: 240, border: '1px solid var(--border-weak-base)' }}>
                      <img src={img.dataUrl} alt={img.name} className="max-w-full h-auto block" style={{ maxHeight: 180 }} />
                    </div>
                  ))}
                </div>
              )}
              {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
            </div>
          ) : message.status === 'pending' && !message.content ? (
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" style={{ color: 'var(--icon-interactive-base)' }} />
              <span style={{ color: 'var(--text-weaker)' }}>Thinking...</span>
            </div>
          ) : (
            <div>
              {message.images && message.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {message.images.map((img: MessageImage) => (
                    <div key={img.id} className="relative rounded-lg overflow-hidden" style={{ maxWidth: 240, border: '1px solid var(--border-weak-base)' }}>
                      <img src={img.dataUrl} alt={img.name} className="max-w-full h-auto block" style={{ maxHeight: 180 }} />
                    </div>
                  ))}
                </div>
              )}
              {message.content && <MessageContent content={message.content} />}
            </div>
          )}
        </div>
        <div className={`flex items-center gap-2 text-xs mt-1 px-1 ${isUser ? 'justify-end' : ''}`} style={{ color: 'var(--text-weaker)' }}>
          {StatusIcon && <StatusIcon size={12} className={status?.spin ? 'animate-spin' : ''} style={{ color: status?.color }} />}
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          <CopyMsgBtn content={message.content} />
        </div>
      </div>
    </div>
  )
})
