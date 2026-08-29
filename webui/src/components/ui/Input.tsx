import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, style, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            className="text-xs font-medium"
            style={{ color: 'var(--text-base)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-md px-3 py-1.5 text-sm outline-none transition-colors placeholder:text-[var(--text-weaker)]',
            className
          )}
          style={{
            background: 'var(--input-base)',
            border: `1px solid ${error ? 'var(--surface-critical-strong)' : 'var(--border-base)'}`,
            color: 'var(--text-strong)',
            ...style,
          }}
          {...props}
        />
        {error && (
          <p
            className="text-xs"
            style={{ color: 'var(--text-on-critical-base)' }}
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
