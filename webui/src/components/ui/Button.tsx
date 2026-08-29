import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', style, ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      fontFamily: 'var(--font-family-sans)',
      fontWeight: 500,
      borderRadius: 'var(--radius-md)',
      transition: 'all 0.15s ease',
      ...style,
    }

    const sizeStyle: Record<string, React.CSSProperties> = {
      sm: { padding: '4px 10px', fontSize: '0.8125rem', height: '28px' },
      md: { padding: '6px 14px', fontSize: '0.875rem', height: '32px' },
      lg: { padding: '8px 18px', fontSize: '0.9375rem', height: '38px' },
    }

    const variantStyle: Record<string, React.CSSProperties> = {
      primary: {
        background: 'var(--button-primary-base)',
        color: 'var(--text-invert-strong)',
        border: 'none',
      },
      secondary: {
        background: 'var(--button-secondary-base)',
        color: 'var(--text-strong)',
        border: '1px solid var(--border-base)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--text-strong)',
        border: 'none',
      },
      danger: {
        background: 'var(--surface-critical-base)',
        color: 'var(--text-on-critical-base)',
        border: '1px solid var(--surface-critical-base)',
      },
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none',
          className
        )}
        style={{ ...baseStyle, ...sizeStyle[size], ...variantStyle[variant] }}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
