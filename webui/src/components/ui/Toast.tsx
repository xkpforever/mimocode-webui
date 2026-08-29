import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

type ToastType = 'info' | 'success' | 'error' | 'warning'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 0

const TOAST_STYLES: Record<ToastType, string> = {
  info: 'bg-[var(--surface-base)] border-[var(--border-base)] text-[var(--text-strong)]',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200',
}

const TOAST_ICONS: Record<ToastType, string> = {
  info: 'ℹ️',
  success: '✓',
  error: '✕',
  warning: '⚠',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container — fixed bottom-right */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-lg border shadow-lg',
              'text-sm font-medium backdrop-blur-sm',
              'animate-in slide-in-from-right-5 fade-in duration-200',
              TOAST_STYLES[t.type]
            )}
            style={{
              animation: 'slideInRight 0.2s ease-out',
            }}
            onClick={() => dismiss(t.id)}
          >
            <span className="text-base leading-none">{TOAST_ICONS[t.type]}</span>
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
      {/* Inline keyframe for slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Graceful fallback: no-op if used outside provider
    return { toast: () => {} }
  }
  return ctx
}
