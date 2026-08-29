import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, style, ...props }, ref) => {
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
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full rounded-md px-3 py-1.5 pr-8 text-sm outline-none appearance-none transition-colors',
              className
            )}
            style={{
              background: 'var(--input-base)',
              border: '1px solid var(--border-base)',
              color: 'var(--text-strong)',
              ...style,
            }}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-weaker)' }}
          />
        </div>
      </div>
    )
  }
)
Select.displayName = 'Select'
