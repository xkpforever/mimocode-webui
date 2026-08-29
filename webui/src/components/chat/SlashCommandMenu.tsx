import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  Command,
  Terminal,
  FileText,
  GitBranch,
  Settings,
  Brain,
  Target,
  Sparkles,
  Beaker,
  HelpCircle,
  DollarSign,
  BarChart3,
  Search,
} from 'lucide-react'

interface SlashCommand {
  id: string
  name: string
  description: string
  icon: typeof Command
  category: string
}

const COMMANDS: SlashCommand[] = [
  { id: 'help', name: '/help', description: '显示帮助信息', icon: HelpCircle, category: '通用' },
  { id: 'cost', name: '/cost', description: '查看 Token 用量和费用', icon: DollarSign, category: '通用' },
  { id: 'stats', name: '/stats', description: '查看使用统计', icon: BarChart3, category: '通用' },
  { id: 'clear', name: '/clear', description: '清除当前对话', icon: Terminal, category: '通用' },
  { id: 'goal', name: '/goal', description: '设置目标停止条件', icon: Target, category: 'Agent' },
  { id: 'dream', name: '/dream', description: '扫描轨迹，提取持久记忆', icon: Brain, category: '记忆' },
  { id: 'distill', name: '/distill', description: '发现重复工作流，打包技能', icon: Beaker, category: '记忆' },
  { id: 'compact', name: '/compact', description: '压缩上下文窗口', icon: FileText, category: 'Agent' },
  { id: 'git', name: '/git', description: '执行 Git 操作', icon: GitBranch, category: '工具' },
  { id: 'config', name: '/config', description: '查看/修改配置', icon: Settings, category: '工具' },
  { id: 'skill', name: '/skill', description: '调用已注册的技能', icon: Sparkles, category: '工具' },
]

interface SlashCommandMenuProps {
  isOpen: boolean
  query: string
  onSelect: (command: SlashCommand) => void
  onClose: () => void
}

export function SlashCommandMenu({ isOpen, query, onSelect, onClose }: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const filteredCommands = useMemo(() => {
    if (!query) return COMMANDS
    const lower = query.toLowerCase()
    return COMMANDS.filter(cmd =>
      cmd.name.toLowerCase().includes(lower) ||
      cmd.description.toLowerCase().includes(lower) ||
      cmd.category.toLowerCase().includes(lower),
    )
  }, [query])

  const groupedCommands = useMemo(() => {
    const groups: Record<string, SlashCommand[]> = {}
    for (const cmd of filteredCommands) {
      if (!groups[cmd.category]) groups[cmd.category] = []
      groups[cmd.category].push(cmd)
    }
    return groups
  }, [filteredCommands])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const children = listRef.current?.children
    if (!children) return
    const selected = children[selectedIndex] as HTMLElement
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCommands[selectedIndex]) {
        onSelect(filteredCommands[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [filteredCommands, selectedIndex, onSelect, onClose])

  if (!isOpen || filteredCommands.length === 0) return null

  let flatIndex = 0

  return (
    <div
      className="absolute bottom-full left-0 right-0 mb-2 rounded-xl shadow-xl overflow-hidden z-50 animate-slide-in"
      style={{
        background: 'var(--surface-strong)',
        border: '1px solid var(--border-weak-base)',
        maxHeight: '320px',
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Search hint */}
      {query && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 border-b text-[10px]"
          style={{ borderColor: 'var(--border-weak-base)', color: 'var(--text-weaker)' }}
        >
          <Search size={10} />
          搜索: {query}
        </div>
      )}

      {/* Commands List */}
      <div ref={listRef} className="overflow-y-auto py-1">
        {Object.entries(groupedCommands).map(([category, cmds]) => (
          <div key={category}>
            <div
              className="px-3 py-1 text-[9px] font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-weaker)' }}
            >
              {category}
            </div>
            {cmds.map(cmd => {
              const idx = flatIndex++
              const isSelected = idx === selectedIndex
              return (
                <button
                  key={cmd.id}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors"
                  style={{
                    background: isSelected ? 'var(--surface-base-hover)' : 'transparent',
                  }}
                  onClick={() => onSelect(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <cmd.icon size={12} style={{ color: 'var(--text-weaker)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono" style={{ color: 'var(--text-strong)' }}>
                      {cmd.name}
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--text-weaker)' }}>
                      {cmd.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center gap-3 px-3 py-1.5 border-t text-[9px]"
        style={{ borderColor: 'var(--border-weak-base)', color: 'var(--text-weaker)' }}
      >
        <span>↑↓ 导航</span>
        <span>↵ 选择</span>
        <span>ESC 关闭</span>
      </div>
    </div>
  )
}
