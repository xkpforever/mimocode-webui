import { useState, useEffect, useCallback } from 'react'
import {
  Puzzle,
  Plus,
  Trash2,
  RefreshCw,
  Server,
  Globe,
  Terminal,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Loader2,
  Copy,
} from 'lucide-react'

interface MCPServer {
  name: string
  transport: 'stdio' | 'sse' | 'http'
  command?: string
  args?: string[]
  url?: string
  env?: Record<string, string>
  enabled: boolean
  scope: 'global' | 'project'
}

interface McpManagerProps {
  onAddServer?: (server: MCPServer) => void
  onRemoveServer?: (name: string) => void
  onToggleServer?: (name: string) => void
}

const TRANSPORT_CONFIG = {
  stdio: { icon: Terminal, label: 'stdio', color: 'var(--icon-interactive-base)' },
  sse: { icon: Globe, label: 'SSE', color: 'var(--icon-success-base)' },
  http: { icon: Server, label: 'HTTP', color: 'var(--icon-warning-base)' },
}

function McpServerCard({ server, onToggle, onRemove }: {
  server: MCPServer
  onToggle: () => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const transport = TRANSPORT_CONFIG[server.transport]
  const TransportIcon = transport.icon

  return (
    <div
      className="rounded-lg border overflow-hidden transition-all"
      style={{
        background: 'var(--surface-strong)',
        borderColor: server.enabled ? 'var(--border-weak-base)' : 'var(--border-weak-base)',
        opacity: server.enabled ? 1 : 0.6,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-base-hover)]"
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ background: `${transport.color}15` }}
        >
          <TransportIcon size={14} style={{ color: transport.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium" style={{ color: 'var(--text-strong)' }}>
              {server.name}
            </span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full"
              style={{ background: `${transport.color}15`, color: transport.color }}
            >
              {transport.label}
            </span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--surface-base)', color: 'var(--text-weaker)' }}
            >
              {server.scope}
            </span>
          </div>
          {server.command && (
            <div className="text-[10px] font-mono mt-0.5 truncate" style={{ color: 'var(--text-weaker)' }}>
              {server.command} {(server.args || []).join(' ')}
            </div>
          )}
          {server.url && (
            <div className="text-[10px] font-mono mt-0.5 truncate" style={{ color: 'var(--text-weaker)' }}>
              {server.url}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Enable/Disable toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggle() }}
            className="relative w-8 h-4 rounded-full transition-colors"
            style={{
              background: server.enabled ? 'var(--color-success, #22c55e)' : 'var(--surface-base)',
            }}
          >
            <div
              className="absolute top-0.5 w-3 h-3 rounded-full transition-transform bg-white"
              style={{
                left: server.enabled ? '16px' : '2px',
              }}
            />
          </button>

          {expanded
            ? <ChevronDown size={10} style={{ color: 'var(--text-weaker)' }} />
            : <ChevronRight size={10} style={{ color: 'var(--text-weaker)' }} />
          }
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2 animate-slide-in">
          <div
            className="rounded-lg p-2 text-[10px] font-mono space-y-1"
            style={{ background: 'var(--background-weak)', color: 'var(--text-base)' }}
          >
            {server.command && (
              <div>
                <span style={{ color: 'var(--text-weaker)' }}>Command: </span>
                {server.command}
              </div>
            )}
            {server.args && server.args.length > 0 && (
              <div>
                <span style={{ color: 'var(--text-weaker)' }}>Args: </span>
                {server.args.join(' ')}
              </div>
            )}
            {server.url && (
              <div>
                <span style={{ color: 'var(--text-weaker)' }}>URL: </span>
                {server.url}
              </div>
            )}
            {server.env && Object.keys(server.env).length > 0 && (
              <div>
                <span style={{ color: 'var(--text-weaker)' }}>Env: </span>
                {Object.entries(server.env).map(([k, v]) => `${k}=${v}`).join(', ')}
              </div>
            )}
          </div>

          <div className="flex gap-1">
            <button
              onClick={onRemove}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors hover:bg-[var(--surface-base-hover)]"
              style={{
                border: '1px solid var(--border-weak-base)',
                color: 'var(--color-error, #ef4444)',
              }}
            >
              <Trash2 size={10} />
              删除
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AddServerModal({ onAdd, onClose }: { onAdd: (server: MCPServer) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [transport, setTransport] = useState<'stdio' | 'sse' | 'http'>('stdio')
  const [command, setCommand] = useState('')
  const [args, setArgs] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) return
    onAdd({
      name: name.trim(),
      transport,
      command: transport === 'stdio' ? command : undefined,
      args: transport === 'stdio' ? args.split(' ').filter(Boolean) : undefined,
      url: transport !== 'stdio' ? url : undefined,
      enabled: true,
      scope: 'project',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="w-[400px] rounded-xl shadow-xl overflow-hidden animate-slide-in"
        style={{
          background: 'var(--surface-strong)',
          border: '1px solid var(--border-weak-base)',
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--border-weak-base)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
            添加 MCP 服务器
          </span>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--surface-base-hover)]">
            <X size={14} style={{ color: 'var(--text-weaker)' }} />
          </button>
        </div>

        <div className="px-4 py-3 space-y-3">
          {/* Name */}
          <div>
            <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--text-weaker)' }}>
              名称
            </label>
            <input
              type="text"
              className="w-full px-2.5 py-1.5 rounded-lg text-xs border outline-none"
              style={{
                background: 'var(--input-base)',
                borderColor: 'var(--border-weak-base)',
                color: 'var(--text-strong)',
              }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-mcp-server"
            />
          </div>

          {/* Transport */}
          <div>
            <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--text-weaker)' }}>
              传输方式
            </label>
            <div className="flex gap-1">
              {(['stdio', 'sse', 'http'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTransport(t)}
                  className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors"
                  style={{
                    background: transport === t ? `${TRANSPORT_CONFIG[t].color}15` : 'var(--surface-base)',
                    color: transport === t ? TRANSPORT_CONFIG[t].color : 'var(--text-weaker)',
                    border: transport === t ? `1px solid ${TRANSPORT_CONFIG[t].color}30` : '1px solid transparent',
                  }}
                >
                  {TRANSPORT_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Command (stdio) */}
          {transport === 'stdio' && (
            <>
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--text-weaker)' }}>
                  命令
                </label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border outline-none"
                  style={{
                    background: 'var(--input-base)',
                    borderColor: 'var(--border-weak-base)',
                    color: 'var(--text-strong)',
                  }}
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="npx"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--text-weaker)' }}>
                  参数（空格分隔）
                </label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border outline-none"
                  style={{
                    background: 'var(--input-base)',
                    borderColor: 'var(--border-weak-base)',
                    color: 'var(--text-strong)',
                  }}
                  value={args}
                  onChange={(e) => setArgs(e.target.value)}
                  placeholder="-y @modelcontextprotocol/server-everything"
                />
              </div>
            </>
          )}

          {/* URL (sse/http) */}
          {transport !== 'stdio' && (
            <div>
              <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--text-weaker)' }}>
                URL
              </label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border outline-none"
                style={{
                  background: 'var(--input-base)',
                  borderColor: 'var(--border-weak-base)',
                  color: 'var(--text-strong)',
                }}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:3001/sse"
              />
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-end gap-2 px-4 py-3 border-t"
          style={{ borderColor: 'var(--border-weak-base)' }}
        >
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-[var(--surface-base-hover)]"
            style={{ color: 'var(--text-weaker)' }}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            style={{
              background: 'var(--button-primary-base)',
              color: 'var(--text-invert-strong)',
            }}
          >
            <Check size={10} />
            添加
          </button>
        </div>
      </div>
    </div>
  )
}

export function McpManager({ onAddServer, onRemoveServer, onToggleServer }: McpManagerProps) {
  const [servers, setServers] = useState<MCPServer[]>([
    { name: 'filesystem', transport: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '.'], enabled: true, scope: 'global' },
    { name: 'github', transport: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'], enabled: false, scope: 'project' },
  ])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAdd = useCallback((server: MCPServer) => {
    setServers(prev => [...prev.filter(s => s.name !== server.name), server])
    onAddServer?.(server)
  }, [onAddServer])

  const handleRemove = useCallback((name: string) => {
    setServers(prev => prev.filter(s => s.name !== name))
    onRemoveServer?.(name)
  }, [onRemoveServer])

  const handleToggle = useCallback((name: string) => {
    setServers(prev => prev.map(s => s.name === name ? { ...s, enabled: !s.enabled } : s))
    onToggleServer?.(name)
  }, [onToggleServer])

  const enabledCount = servers.filter(s => s.enabled).length

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: 'var(--surface-strong)',
        borderColor: 'var(--border-weak-base)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: 'var(--border-weak-base)' }}
      >
        <div className="flex items-center gap-2">
          <Puzzle size={12} style={{ color: 'var(--icon-interactive-base)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-strong)' }}>
            MCP 服务器
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--surface-base)', color: 'var(--text-weaker)' }}>
            {enabledCount}/{servers.length} 活跃
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLoading(!loading)}
            className="p-1 rounded hover:bg-[var(--surface-base-hover)]"
            style={{ color: 'var(--text-weaker)' }}
          >
            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-1 rounded hover:bg-[var(--surface-base-hover)]"
            style={{ color: 'var(--text-interactive-base)' }}
          >
            <Plus size={10} />
          </button>
        </div>
      </div>

      {/* Server List */}
      <div className="p-2 space-y-1.5">
        {servers.length === 0 ? (
          <div className="text-center py-6 text-[10px]" style={{ color: 'var(--text-weaker)' }}>
            <Puzzle size={24} className="mx-auto mb-2 opacity-20" />
            暂无 MCP 服务器
          </div>
        ) : (
          servers.map(server => (
            <McpServerCard
              key={server.name}
              server={server}
              onToggle={() => handleToggle(server.name)}
              onRemove={() => handleRemove(server.name)}
            />
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddServerModal onAdd={handleAdd} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}
