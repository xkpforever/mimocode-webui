import { Component, type ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          className="flex flex-col items-center justify-center h-full p-8 text-center"
          style={{ background: 'var(--background-base)' }}
        >
          <div
            className="flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: 'var(--surface-strong)' }}
          >
            <AlertCircle size={32} style={{ color: 'var(--icon-critical-base)' }} />
          </div>
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text-strong)' }}
          >
            Something went wrong
          </h2>
          <p
            className="text-sm mb-4 max-w-md"
            style={{ color: 'var(--text-base)' }}
          >
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              background: 'var(--button-primary-base)',
              color: 'var(--text-invert-strong)',
            }}
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
