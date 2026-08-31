import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Cpu, Check, Loader2, Wifi, WifiOff } from 'lucide-react'
import { useI18n } from '../../context/i18n'
import { useSettingsStore } from '../../stores'

interface ModelInfo {
  id: string
  name: string
  providerID: string
  providerName: string
  context: number
  output: number
  isLocal?: boolean
}

// Hardcoded fallback models when server is unreachable
const FALLBACK_MODELS: ModelInfo[] = [
  { id: 'opencode-mimo/mimo-v2.5', name: 'MiMo V2.5', providerID: 'opencode-mimo', providerName: 'MiMo (Cloud)', context: 200000, output: 32000 },
  { id: 'opencode-mimo/mimo-v2.5-pro', name: 'MiMo V2.5 Pro', providerID: 'opencode-mimo', providerName: 'MiMo (Cloud)', context: 1000000, output: 64000 },
  { id: 'mimo-v2.5', name: 'MiMo V2.5 (Xiaomi)', providerID: 'xiaomi', providerName: 'Xiaomi', context: 200000, output: 32000 },
  { id: 'mimo-v2.5-pro', name: 'MiMo V2.5 Pro (Xiaomi)', providerID: 'xiaomi', providerName: 'Xiaomi', context: 1000000, output: 64000 },
  { id: 'mimo-v2.5-pro-ultraspeed', name: 'MiMo V2.5 UltraSpeed', providerID: 'xiaomi', providerName: 'Xiaomi', context: 200000, output: 32000 },
  { id: 'deepseek/deepseek-v4-flash', name: 'DeepSeek V4 Flash', providerID: 'hpc-ai', providerName: 'HPC-AI', context: 1048576, output: 128000 },
  { id: 'deepseek/deepseek-v4-pro', name: 'DeepSeek V4 Pro', providerID: 'hpc-ai', providerName: 'HPC-AI', context: 1048576, output: 128000 },
]

const LOCAL_LLM_URL = 'http://127.0.0.1:8081'

export function ModelSelector() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [models, setModels] = useState<ModelInfo[]>(FALLBACK_MODELS)
  const [search, setSearch] = useState('')
  const [localConnected, setLocalConnected] = useState<boolean | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { selectedModel, setSelectedModel, serverUrl } = useSettingsStore()

  // Probe local llama-server for available models
  useEffect(() => {
    let cancelled = false

    async function probeLocalLLM() {
      try {
        const res = await fetch(`${LOCAL_LLM_URL}/v1/models`, {
          signal: AbortSignal.timeout(3000),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (cancelled) return

        setLocalConnected(true)
        const localModels: ModelInfo[] = (data.data || []).map((m: any) => ({
          id: m.id,
          name: m.id,
          providerID: 'local-llm',
          providerName: 'Local LLM',
          context: 80000,
          output: 8192,
          isLocal: true,
        }))

        if (localModels.length > 0) {
          setModels(prev => {
            // Remove old local-llm models, add fresh ones
            const without = prev.filter(m => m.providerID !== 'local-llm')
            return [...localModels, ...without]
          })
        }
      } catch {
        if (!cancelled) setLocalConnected(false)
      }
    }

    probeLocalLLM()
    const interval = setInterval(probeLocalLLM, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  // Fetch models from MiMo Code server, fallback to hardcoded list
  useEffect(() => {
    let cancelled = false

    async function fetchModels() {
      setLoading(true)
      try {
        const base = serverUrl || 'http://localhost:4096'
        const res = await fetch(`${base}/provider`, {
          signal: AbortSignal.timeout(10000),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        const allModels: ModelInfo[] = []
        const providers = data.all || []

        for (const provider of providers) {
          if (provider.source === 'disabled') continue
          const providerModels = provider.models || {}
          for (const [modelId, model] of Object.entries(providerModels) as [string, any][]) {
            if (model.status === 'deprecated') continue
            if (model.capabilities?.output?.text === false) continue
            allModels.push({
              id: `${provider.id}/${modelId}`,
              name: model.name || modelId,
              providerID: provider.id,
              providerName: provider.name || provider.id,
              context: model.limit?.context || 0,
              output: model.limit?.output || 0,
            })
          }
        }

        if (!cancelled && allModels.length > 0) {
          // Merge: keep local-llm models, replace everything else
          setModels(prev => {
            const localOnly = prev.filter(m => m.providerID === 'local-llm')
            return [...localOnly, ...allModels]
          })
        }
      } catch {
        // Keep fallback + local models
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchModels()
    const interval = setInterval(fetchModels, 60000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [serverUrl])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Filter models
  const filtered = search
    ? models.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.id.toLowerCase().includes(search.toLowerCase()) ||
        m.providerName.toLowerCase().includes(search.toLowerCase())
      )
    : models

  // Group by provider
  const grouped = new Map<string, ModelInfo[]>()
  for (const m of filtered) {
    if (!grouped.has(m.providerName)) grouped.set(m.providerName, [])
    grouped.get(m.providerName)!.push(m)
  }

  const current = models.find(m => m.id === selectedModel)
  const displayName = current ? current.name : (selectedModel || t('model.select'))

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors max-w-[220px]"
        style={{
          background: open ? 'var(--surface-base-hover)' : 'transparent',
          color: 'var(--text-strong)',
          border: '1px solid var(--border-weak-base)',
        }}
      >
        <Cpu size={14} style={{ color: 'var(--icon-interactive-base)', flexShrink: 0 }} />
        <span className="truncate text-xs">{displayName}</span>
        {loading ? (
          <Loader2 size={12} className="animate-spin" style={{ color: 'var(--text-weaker)', flexShrink: 0 }} />
        ) : (
          <ChevronDown
            size={12}
            style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s',
              color: 'var(--text-weaker)',
              flexShrink: 0,
            }}
          />
        )}
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-80 max-h-[60vh] rounded-lg shadow-lg border z-50 overflow-hidden animate-fade-in"
          style={{
            background: 'var(--surface-strong)',
            borderColor: 'var(--border-base)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Search + local status */}
          <div className="p-2 border-b" style={{ borderColor: 'var(--border-weak-base)' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <input
                type="text"
                placeholder={t('model.search')}
                className="flex-1 px-2.5 py-1.5 rounded-md text-xs outline-none"
                style={{
                  background: 'var(--input-base)',
                  color: 'var(--text-strong)',
                  border: '1px solid var(--border-weak-base)',
                }}
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex items-center gap-1.5 px-1">
              {localConnected === null ? (
                <Loader2 size={10} className="animate-spin" style={{ color: 'var(--text-weaker)' }} />
              ) : localConnected ? (
                <Wifi size={10} style={{ color: '#22c55e' }} />
              ) : (
                <WifiOff size={10} style={{ color: 'var(--text-weaker)' }} />
              )}
              <span className="text-[10px]" style={{ color: 'var(--text-weaker)' }}>
                Local LLM: {localConnected === null ? 'Checking...' : localConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Model list */}
          <div className="overflow-y-auto max-h-[50vh]">
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-xs text-center" style={{ color: 'var(--text-weaker)' }}>
                {t('model.noModels')}
              </div>
            )}

            {Array.from(grouped.entries()).map(([provider, providerModels]) => (
              <div key={provider}>
                <div
                  className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider sticky top-0"
                  style={{ background: 'var(--surface-strong)', color: 'var(--text-weaker)' }}
                >
                  {provider}
                </div>
                {providerModels.map((model) => {
                  const isSelected = model.id === selectedModel
                  return (
                    <button
                      key={`${model.providerID}/${model.id}`}
                      onClick={() => {
                        setSelectedModel(model.id)
                        setOpen(false)
                        setSearch('')
                      }}
                      className="w-full flex items-start gap-2.5 px-3 py-2 text-left transition-colors"
                      style={{
                        background: isSelected ? 'var(--surface-interactive-base)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'var(--surface-base-hover)'
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <div className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-md"
                        style={{ background: 'var(--surface-base)' }}
                      >
                        {isSelected ? (
                          <Check size={12} style={{ color: 'var(--text-interactive-base)' }} />
                        ) : (
                          <Cpu size={12} style={{ color: model.isLocal ? '#22c55e' : 'var(--icon-base)' }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--text-strong)' }}>
                          {model.name}
                          {model.isLocal && (
                            <span className="ml-1.5 text-[10px] px-1 py-0.5 rounded" style={{ background: '#22c55e22', color: '#22c55e' }}>
                              LOCAL
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {model.context > 0 && (
                            <span className="text-[10px]" style={{ color: 'var(--text-weaker)' }}>
                              {model.context >= 1000000
                                ? `${(model.context / 1000000).toFixed(1)}M`
                                : model.context >= 1000
                                  ? `${Math.round(model.context / 1000)}K`
                                  : model.context} ctx
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
