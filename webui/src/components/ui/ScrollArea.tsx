import { type ReactNode, useRef, useEffect, useState } from 'react'
import { cn } from '../../lib/utils'

interface ScrollAreaProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export function ScrollArea({ children, className, style }: ScrollAreaProps) {
  return (
    <div
      className={cn('overflow-y-auto', className)}
      style={{ scrollbarWidth: 'thin', ...style }}
    >
      {children}
    </div>
  )
}

interface TooltipProps {
  content: string
  children: ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md text-xs whitespace-nowrap z-50 pointer-events-none animate-fade-in"
          style={{
            background: 'var(--surface-float-base)',
            color: 'var(--text-strong)',
          }}
        >
          {content}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2"
            style={{
              background: 'var(--surface-float-base)',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            }}
          />
        </div>
      )}
    </div>
  )
}

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn('rounded-md animate-shimmer', className)}
      style={{
        background: 'linear-gradient(90deg, var(--surface-base) 25%, var(--surface-base-hover) 50%, var(--surface-base) 75%)',
        backgroundSize: '200% 100%',
        ...style,
      }}
    />
  )
}
