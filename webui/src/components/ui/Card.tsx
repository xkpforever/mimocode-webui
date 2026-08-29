import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  hover?: boolean
}

export function Card({ children, className, style, hover }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border transition-all',
        hover && 'hover:border-[var(--border-hover)]',
        className
      )}
      style={{
        background: 'var(--surface-strong)',
        borderColor: 'var(--border-weak-base)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn('px-4 py-3 border-b', className)}
      style={{ borderColor: 'var(--border-weak-base)' }}
    >
      {children}
    </div>
  )
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-4 py-3', className)}>{children}</div>
}
