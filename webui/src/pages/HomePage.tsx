import { useNavigate } from 'react-router-dom'
import { MessageSquare, BrainCircuit, ListTree, ArrowRight } from 'lucide-react'
import { useI18n } from '../context/i18n'

export function HomePage() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Greeting */}
        <div className="text-center space-y-4">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: 'var(--text-strong)' }}
          >
            {t('home.greeting')}
          </h1>
          <p
            className="text-base max-w-md mx-auto whitespace-pre-line"
            style={{ color: 'var(--text-base)' }}
          >
            {t('home.subtitle')}
          </p>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/chat')}
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border transition-all"
            style={{
              background: 'var(--surface-strong)',
              borderColor: 'var(--border-weak-base)',
            }}
          >
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl"
              style={{ background: 'var(--surface-interactive-base)' }}
            >
              <MessageSquare
                size={24}
                style={{ color: 'var(--icon-interactive-base)' }}
              />
            </div>
            <div className="text-center">
              <div
                className="text-sm font-semibold"
                style={{ color: 'var(--text-strong)' }}
              >
                {t('home.newChat')}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: 'var(--text-base)' }}
              >
                {t('home.newChatDesc')}
              </div>
            </div>
            <ArrowRight
              size={16}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--text-interactive-base)' }}
            />
          </button>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('mimocode:switch-tab', { detail: { tab: 'memory' } }))}
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border transition-all"
            style={{
              background: 'var(--surface-strong)',
              borderColor: 'var(--border-weak-base)',
            }}
          >
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl"
              style={{ background: 'var(--surface-success-weak)' }}
            >
              <BrainCircuit
                size={24}
                style={{ color: 'var(--icon-success-base)' }}
              />
            </div>
            <div className="text-center">
              <div
                className="text-sm font-semibold"
                style={{ color: 'var(--text-strong)' }}
              >
                {t('home.browseMemory')}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: 'var(--text-base)' }}
              >
                {t('home.browseMemoryDesc')}
              </div>
            </div>
            <ArrowRight
              size={16}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--icon-success-base)' }}
            />
          </button>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('mimocode:switch-tab', { detail: { tab: 'tasks' } }))}
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border transition-all"
            style={{
              background: 'var(--surface-strong)',
              borderColor: 'var(--border-weak-base)',
            }}
          >
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl"
              style={{
                background: 'var(--surface-interactive-weak)',
              }}
            >
              <ListTree
                size={24}
                style={{ color: 'var(--icon-agent-plan-base)' }}
              />
            </div>
            <div className="text-center">
              <div
                className="text-sm font-semibold"
                style={{ color: 'var(--text-strong)' }}
              >
                {t('home.taskDashboard')}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: 'var(--text-base)' }}
              >
                {t('home.taskDashboardDesc')}
              </div>
            </div>
            <ArrowRight
              size={16}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--icon-agent-plan-base)' }}
            />
          </button>
        </div>

        {/* Feature highlights */}
        <div
          className="rounded-xl border p-6 space-y-4"
          style={{
            background: 'var(--surface-strong)',
            borderColor: 'var(--border-weak-base)',
          }}
        >
          <h2
            className="text-sm font-semibold"
            style={{ color: 'var(--text-strong)' }}
          >
            {t('home.keyFeatures')}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['home.feature.multiAgent', 'home.feature.multiAgentDesc'],
              ['home.feature.memory', 'home.feature.memoryDesc'],
              ['home.feature.tasks', 'home.feature.tasksDesc'],
              ['home.feature.subagent', 'home.feature.subagentDesc'],
              ['home.feature.goal', 'home.feature.goalDesc'],
              ['home.feature.dream', 'home.feature.dreamDesc'],
            ].map(([title, desc]) => (
              <div key={title} className="space-y-1">
                <div
                  className="text-xs font-medium"
                  style={{ color: 'var(--text-strong)' }}
                >
                  {t(title)}
                </div>
                <div
                  className="text-xs"
                  style={{ color: 'var(--text-base)' }}
                >
                  {t(desc)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
