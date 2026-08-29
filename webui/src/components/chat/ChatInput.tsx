import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Terminal, Paperclip, X, Image as ImageIcon } from 'lucide-react'
import { useI18n } from '../../context/i18n'
import { SlashCommandMenu } from './SlashCommandMenu'
import { ThinkingModeSelector, type ThinkingMode } from './ThinkingModeSelector'
import { useSettingsStore } from '../../stores'
import type { MessageImage } from '../../types/mimocode'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (text: string, images: MessageImage[]) => void
  onToggleTerminal?: () => void
  onCommand?: (command: string) => void
  disabled?: boolean
  restoreImages?: MessageImage[] | null
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_IMAGES = 5
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

function generateImageId(): string {
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function ChatInput({ value, onChange, onSend, onToggleTerminal, onCommand, disabled, restoreImages }: ChatInputProps) {
  const { t } = useI18n()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<MessageImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const thinkingMode = useSettingsStore((s) => s.thinkingMode)
  const setThinkingMode = useSettingsStore((s) => s.setThinkingMode)
  const [slashQuery, setSlashQuery] = useState('')
  const [showSlashMenu, setShowSlashMenu] = useState(false)

  // Restore images when parent requests it (e.g. after cancel in insert-mode)
  useEffect(() => {
    if (restoreImages && restoreImages.length > 0) {
      setImages(restoreImages)
    }
  }, [restoreImages])

  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 200) + 'px'
    }
  }, [value])

  const addImages = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => ACCEPTED_TYPES.includes(f.type))
    if (fileArray.length === 0) return

    const remaining = MAX_IMAGES - images.length
    const toProcess = fileArray.slice(0, remaining)

    const newImages: MessageImage[] = []
    for (const file of toProcess) {
      if (file.size > MAX_IMAGE_SIZE) continue
      try {
        const dataUrl = await readFileAsDataUrl(file)
        newImages.push({
          id: generateImageId(),
          name: file.name,
          dataUrl,
          size: file.size,
        })
      } catch {
        // skip failed files
      }
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages])
    }
  }, [images.length])

  const removeImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    onChange(val)

    // Detect slash commands
    if (val.startsWith('/') && !val.includes(' ')) {
      setSlashQuery(val.slice(1))
      setShowSlashMenu(true)
    } else {
      setShowSlashMenu(false)
    }
  }, [onChange])

  const handleSlashSelect = useCallback((command: { name: string }) => {
    onChange(command.name + ' ')
    setShowSlashMenu(false)
    textareaRef.current?.focus()
  }, [onChange])

  const handleSubmit = useCallback(() => {
    if ((!value.trim() && images.length === 0) || disabled) return
    onSend(value.trim(), images)
    setImages([])
  }, [value, images, disabled, onSend])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    const imageFiles: File[] = []
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) imageFiles.push(file)
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault()
      await addImages(imageFiles)
    }
  }, [addImages])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      await addImages(files)
    }
  }, [addImages])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await addImages(files)
    }
    e.target.value = ''
  }, [addImages])

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const canSend = value.trim() || images.length > 0

  return (
    <div
      className="rounded-xl border transition-colors"
      style={{
        background: isDragging ? 'var(--surface-interactive-base)' : 'var(--input-base)',
        borderColor: isDragging ? 'var(--text-interactive-base)' : 'var(--border-base)',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Image Previews */}
      {images.length > 0 && (
        <div
          className="flex gap-2 px-3 py-2 overflow-x-auto"
          style={{ borderBottom: '1px solid var(--border-weak-base)' }}
        >
          {images.map(img => (
            <div
              key={img.id}
              className="relative shrink-0 group rounded-lg overflow-hidden"
              style={{
                width: 64,
                height: 64,
                border: '1px solid var(--border-weak-base)',
              }}
            >
              <img
                src={img.dataUrl}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.5)' }}
              >
                <button
                  onClick={() => removeImage(img.id)}
                  className="p-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  <X size={12} color="white" />
                </button>
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-[8px] truncate"
                style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
              >
                {formatSize(img.size)}
              </div>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--surface-base-hover)]"
              style={{
                width: 64,
                height: 64,
                border: '1px dashed var(--border-base)',
                color: 'var(--text-weaker)',
              }}
            >
              <Paperclip size={16} />
            </button>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div
        className="flex items-center gap-1 px-2 pt-2 pb-1"
        style={{ borderBottom: images.length > 0 ? 'none' : '1px solid var(--border-weak-base)' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={handleFileSelect}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center w-7 h-7 rounded text-xs transition-colors hover:bg-[var(--surface-base-hover)]"
          style={{ color: images.length > 0 ? 'var(--text-interactive-base)' : 'var(--text-weaker)' }}
          title={`${t('chat.input.attach')} (${images.length}/${MAX_IMAGES})`}
        >
          <Paperclip size={14} />
        </button>
        <button
          onClick={onToggleTerminal}
          className="flex items-center justify-center w-7 h-7 rounded text-xs transition-colors hover:bg-[var(--surface-base-hover)]"
          style={{ color: 'var(--text-weaker)' }}
          title={t('chat.input.command')}
        >
          <Terminal size={14} />
        </button>
        <div className="flex-1" />
        <ThinkingModeSelector mode={thinkingMode} onModeChange={setThinkingMode} />
        <span
          className="text-[10px] px-1.5 py-0.5 rounded"
          style={{
            background: 'var(--surface-base)',
            color: 'var(--text-weaker)',
          }}
        >
          @build
        </span>
      </div>

      {/* Slash Command Menu */}
      <SlashCommandMenu
        isOpen={showSlashMenu}
        query={slashQuery}
        onSelect={handleSlashSelect}
        onClose={() => setShowSlashMenu(false)}
      />

      {/* Input Area */}
      <div className="flex items-end gap-2 px-3 py-2 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleChange(e)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={images.length > 0 ? t('chat.input.imagePlaceholder') : t('chat.input.placeholder')}
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none resize-none text-sm leading-relaxed max-h-[200px] placeholder:text-[var(--text-weaker)]"
          style={{ color: 'var(--text-strong)' }}
        />
        <button
          onClick={handleSubmit}
          disabled={!canSend || disabled}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-all shrink-0 disabled:opacity-40"
          style={{
            background: canSend ? 'var(--button-primary-base)' : 'transparent',
            color: canSend ? 'var(--text-invert-strong)' : 'var(--text-weaker)',
          }}
        >
          <Send size={14} />
        </button>
      </div>

      {/* Drag overlay */}
      {isDragging && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl z-10"
          style={{ background: 'var(--surface-interactive-subtle)', opacity: 0.9 }}
        >
          <div className="flex flex-col items-center gap-2">
            <ImageIcon size={32} style={{ color: 'var(--text-interactive-base)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-interactive-base)' }}>
              {t('chat.input.dropImage')}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
