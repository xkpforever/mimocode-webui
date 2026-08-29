import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'

interface TerminalProps {
  className?: string
  serverUrl?: string
}

export function TerminalView({ className, serverUrl }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 13,
      fontFamily: 'var(--font-family-mono)',
      theme: {
        background: '#101010',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        selectionBackground: '#264f78',
        black: '#101010',
        red: '#fc533a',
        green: '#12c905',
        yellow: '#fcd53a',
        blue: '#9dbefe',
        magenta: '#edb2f1',
        cyan: '#56b6c2',
        white: '#d4d4d4',
        brightBlack: '#505050',
        brightRed: '#fc533a',
        brightGreen: '#12c905',
        brightYellow: '#fcd53a',
        brightBlue: '#9dbefe',
        brightMagenta: '#edb2f1',
        brightCyan: '#56b6c2',
        brightWhite: '#ffffff',
      },
      allowProposedApi: true,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(new WebLinksAddon())
    termRef.current = term
    fitAddonRef.current = fitAddon

    term.open(containerRef.current)
    fitAddon.fit()

    // Write welcome message
    term.writeln('\x1b[90m╔══════════════════════════════════════╗\x1b[0m')
    term.writeln('\x1b[90m║  \x1b[36mMIMO Code Terminal\x1b[90m                ║\x1b[0m')
    term.writeln('\x1b[90m║  \x1b[90mDisconnected. Server not running.\x1b[90m    ║\x1b[0m')
    term.writeln('\x1b[90m╚══════════════════════════════════════╝\x1b[0m')
    term.writeln('')

    term.onData((data) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(data)
      }
    })

    // Try connecting to PTY WebSocket
    const baseUrl = serverUrl || 'http://localhost:4096'
    const wsUrl = baseUrl.replace(/^http/, 'ws') + '/pty'
    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        term.clear()
        term.writeln('\x1b[32mConnected to MIMO Code PTY\x1b[0m')
      }

      ws.onmessage = (event) => {
        term.write(event.data)
      }

      ws.onclose = () => {
        term.writeln('\x1b[31m\n[Disconnected]\x1b[0m')
      }

      ws.onerror = () => {
        // Silent — already handled by onclose
      }
    } catch {
      term.writeln('\x1b[33mPTY WebSocket not available\x1b[0m')
    }

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit()
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      wsRef.current?.close()
      term.dispose()
    }
  }, [serverUrl])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height: '200px',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    />
  )
}
