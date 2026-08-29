import { cn } from '../../lib/utils'

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  tabs: { value: string; label: string }[]
  className?: string
}

export function Tabs({ value, onValueChange, tabs, className }: TabsProps) {
  return (
    <div
      className={cn('inline-flex rounded-lg p-0.5 gap-0.5', className)}
      style={{ background: 'var(--surface-base)' }}
    >
      {tabs.map((tab) => {
        const isActive = value === tab.value
        return (
          <button
            key={tab.value}
            onClick={() => onValueChange(tab.value)}
            className="px-3 py-1.5 text-xs font-medium rounded transition-all"
            style={{
              background: isActive ? 'var(--surface-strong)' : 'transparent',
              color: isActive ? 'var(--text-strong)' : 'var(--text-base)',
              boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
}

export function Switch({ checked, onCheckedChange, disabled, label }: SwitchProps) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className="relative w-9 h-5 rounded-full transition-colors disabled:opacity-40"
        style={{
          background: checked
            ? 'var(--icon-interactive-base)'
            : 'var(--surface-weaker)',
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </button>
      {label && (
        <span className="text-xs" style={{ color: 'var(--text-base)' }}>
          {label}
        </span>
      )}
    </label>
  )
}
