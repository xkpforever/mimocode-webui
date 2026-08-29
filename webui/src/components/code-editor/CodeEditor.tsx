import { useState, useEffect, useCallback, useRef } from 'react'
import {
  X,
  Save,
  Download,
  Copy,
  FileCode,
  Settings,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { useI18n } from '../../context/i18n'
import { getBaseUrl } from '../../lib/api'

interface CodeEditorProps {
  filePath: string
  onClose?: () => void
  projectId?: string
}

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || ''
  const langMap: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java',
    c: 'c', cpp: 'cpp', h: 'c', hpp: 'cpp',
    html: 'html', htm: 'html', css: 'css', scss: 'scss', less: 'less',
    json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'toml',
    md: 'markdown', mdx: 'markdown', txt: 'text',
    sh: 'bash', bash: 'bash', zsh: 'bash',
    sql: 'sql', graphql: 'graphql',
    xml: 'xml', svg: 'xml',
  }
  return langMap[ext] || 'text'
}

export function CodeEditor({ filePath, onClose, projectId }: CodeEditorProps) {
  const { t } = useI18n()
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    fontSize: 14,
    wordWrap: true,
    showLineNumbers: true,
    tabSize: 2,
  })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const language = getLanguageFromPath(filePath)
  const isModified = content !== originalContent
  const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || filePath

  const fetchContent = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const base = getBaseUrl()
      const res = await fetch(`${base}/file/content?path=${encodeURIComponent(filePath)}`)
      if (res.ok) {
        const data = await res.json()
        const text = typeof data === 'string' ? data : data.content || ''
        setContent(text)
        setOriginalContent(text)
      } else {
        setError(t('codeEditor.loadError'))
      }
    } catch (err) {
      setError(t('codeEditor.loadError'))
    } finally {
      setLoading(false)
    }
  }, [filePath, t])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const base = getBaseUrl()
      const res = await fetch(`${base}/file`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content }),
      })
      if (res.ok) {
        setOriginalContent(content)
      } else {
        setError(t('codeEditor.saveError'))
      }
    } catch (err) {
      setError(t('codeEditor.saveError'))
    } finally {
      setSaving(false)
    }
  }, [filePath, content, t])

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }, [content, fileName])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content)
  }, [content])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault()
      handleSave()
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
      e.preventDefault()
      onClose?.()
    }
  }, [handleSave, onClose])

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [handleSave])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: 'var(--background-weak)' }}>
        <div className="text-xs" style={{ color: 'var(--text-weaker)' }}>{t('codeEditor.loading')}</div>
      </div>
    )
  }

  if (error && !content) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2" style={{ background: 'var(--background-weak)' }}>
        <p className="text-xs" style={{ color: 'var(--color-error, #ef4444)' }}>{error}</p>
        <button
          onClick={fetchContent}
          className="text-xs px-2 py-1 rounded hover:bg-[var(--surface-base-hover)]"
          style={{ color: 'var(--text-interactive-base)' }}
        >
          {t('codeEditor.retry')}
        </button>
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'}`}
      style={{ background: 'var(--background-weak)' }}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 border-b shrink-0"
        style={{ borderColor: 'var(--border-weak-base)' }}
      >
        <FileCode size={14} style={{ color: 'var(--text-weaker)' }} />
        <span className="text-xs font-medium truncate" style={{ color: 'var(--text-base)' }}>{fileName}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-strong)', color: 'var(--text-weaker)' }}>
          {language}
        </span>
        {isModified && (
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-warning, #f59e0b)' }} />
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 rounded hover:bg-[var(--surface-base-hover)] transition-colors"
            style={{ color: 'var(--text-weaker)' }}
            title={t('codeEditor.settings')}
          >
            <Settings size={12} />
          </button>
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-[var(--surface-base-hover)] transition-colors"
            style={{ color: 'var(--text-weaker)' }}
            title={t('codeEditor.copy')}
          >
            <Copy size={12} />
          </button>
          <button
            onClick={handleDownload}
            className="p-1 rounded hover:bg-[var(--surface-base-hover)] transition-colors"
            style={{ color: 'var(--text-weaker)' }}
            title={t('codeEditor.download')}
          >
            <Download size={12} />
          </button>
          <button
            onClick={handleSave}
            disabled={!isModified || saving}
            className="p-1 rounded hover:bg-[var(--surface-base-hover)] transition-colors disabled:opacity-30"
            style={{ color: isModified ? 'var(--color-success, #22c55e)' : 'var(--text-weaker)' }}
            title={`${t('codeEditor.save')} (Ctrl+S)`}
          >
            <Save size={12} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded hover:bg-[var(--surface-base-hover)] transition-colors"
            style={{ color: 'var(--text-weaker)' }}
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--surface-base-hover)] transition-colors"
            style={{ color: 'var(--text-weaker)' }}
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Settings Bar */}
      {showSettings && (
        <div
          className="flex items-center gap-4 px-3 py-1.5 border-b text-xs"
          style={{ borderColor: 'var(--border-weak-base)', background: 'var(--surface-base)' }}
        >
          <label className="flex items-center gap-1.5" style={{ color: 'var(--text-weaker)' }}>
            {t('codeEditor.fontSize')}
            <input
              type="number"
              min={10}
              max={24}
              value={settings.fontSize}
              onChange={(e) => setSettings(s => ({ ...s, fontSize: Number(e.target.value) }))}
              className="w-12 bg-transparent border rounded px-1 py-0.5 text-xs outline-none"
              style={{ borderColor: 'var(--border-weak-base)', color: 'var(--text-strong)' }}
            />
          </label>
          <label className="flex items-center gap-1.5" style={{ color: 'var(--text-weaker)' }}>
            {t('codeEditor.tabSize')}
            <select
              value={settings.tabSize}
              onChange={(e) => setSettings(s => ({ ...s, tabSize: Number(e.target.value) }))}
              className="bg-transparent border rounded px-1 py-0.5 text-xs outline-none"
              style={{ borderColor: 'var(--border-weak-base)', color: 'var(--text-strong)' }}
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5" style={{ color: 'var(--text-weaker)' }}>
            <input
              type="checkbox"
              checked={settings.wordWrap}
              onChange={(e) => setSettings(s => ({ ...s, wordWrap: e.target.checked }))}
            />
            {t('codeEditor.wordWrap')}
          </label>
          <label className="flex items-center gap-1.5" style={{ color: 'var(--text-weaker)' }}>
            <input
              type="checkbox"
              checked={settings.showLineNumbers}
              onChange={(e) => setSettings(s => ({ ...s, showLineNumbers: e.target.checked }))}
            />
            {t('codeEditor.lineNumbers')}
          </label>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 relative overflow-hidden">
        <textarea
          ref={textareaRef}
          className="w-full h-full resize-none outline-none p-4 font-mono code-editor-textarea"
          style={{
            background: 'var(--background-base)',
            color: 'var(--text-strong)',
            fontSize: `${settings.fontSize}px`,
            tabSize: settings.tabSize,
            whiteSpace: settings.wordWrap ? 'pre-wrap' : 'pre',
            overflowWrap: settings.wordWrap ? 'break-word' : 'normal',
            lineHeight: 1.6,
          }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
        />
        {settings.showLineNumbers && (
          <div
            className="absolute left-0 top-0 bottom-0 w-12 text-right pr-2 pt-4 pointer-events-none select-none overflow-hidden"
            style={{ background: 'var(--background-weak)' }}
          >
            {content.split('\n').map((_, i) => (
              <div
                key={i}
                className="text-[11px] leading-[1.6]"
                style={{ color: 'var(--text-weaker)', fontSize: `${settings.fontSize}px`, lineHeight: 1.6 }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        )}
        {settings.showLineNumbers && (
          <style>{`
            .code-editor-textarea { padding-left: 3.5rem !important; }
          `}</style>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center gap-3 px-3 py-1 border-t text-[10px]"
        style={{ borderColor: 'var(--border-weak-base)', color: 'var(--text-weaker)' }}
      >
        <span>{language}</span>
        <span>{content.split('\n').length} {t('codeEditor.lines')}</span>
        <span>{content.length} {t('codeEditor.chars')}</span>
        {isModified && <span style={{ color: 'var(--color-warning, #f59e0b)' }}>● {t('codeEditor.modified')}</span>}
      </div>
    </div>
  )
}
