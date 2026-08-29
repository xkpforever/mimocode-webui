import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantStyle: Record<string, React.CSSProperties> = {
    default: {
      background: 'var(--surface-base)',
      color: 'var(--text-base)',
    },
    success: {
      background: 'var(--surface-success-base)',
      color: 'var(--text-on-success-base)',
    },
    warning: {
      background: 'var(--surface-warning-base)',
      color: 'var(--text-on-warning-base)',
    },
    danger: {
      background: 'var(--surface-critical-base)',
      color: 'var(--text-on-critical-base)',
    },
    info: {
      background: 'var(--surface-info-base)',
      color: 'var(--text-on-info-base)',
    },
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium rounded',
        className
      )}
      style={variantStyle[variant]}
    >
      {children}
    </span>
  )
}
