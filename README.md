# MiMo-Code WebUI

A professional web interface for [MiMo-Code](https://github.com/XiaomiMiMo/MiMo-Code) AI coding assistant.

<p align="center">
  <img src="webui/public/favicon.svg" alt="MiMo-Code WebUI" width="80">
</p>

## Features

- **Real-time Chat** — SSE-based streaming responses with MiMo-Code server
- **File Explorer** — Browse, create, delete project files
- **Git Management** — Stage, commit, push, pull, diff — all from the UI
- **Memory Browser** — View and search cross-session memory
- **Code Editor** — Monaco-based editor with syntax highlighting
- **Terminal** — Built-in xterm.js terminal with PTY support
- **Task Tracking** — Monitor agent tasks and subagents
- **Project Switcher** — Switch between different project directories
- **Dark/Light Theme** — Toggle with system preference detection
- **Internationalization** — Chinese and English

## Architecture

```
webui/src/
├── components/          # React components
│   ├── chat/            # Chat interface (messages, input, streaming)
│   ├── file-explorer/   # File tree browser
│   ├── git-explorer/    # Git status, staging, commits
│   ├── memory/          # Memory browser and graph
│   ├── terminal/        # xterm.js terminal emulator
│   ├── settings/        # Settings panel and theme picker
│   └── ui/              # Reusable UI primitives (Button, Dialog, Toast, etc.)
├── hooks/               # Custom React hooks
├── lib/                 # Utilities (API client, i18n, SSE, theme)
├── stores/              # Zustand state management
└── pages/               # Route pages (Home, Chat, Settings)
```

## Prerequisites

- [MiMo-Code](https://github.com/XiaomiMiMo/MiMo-Code) v0.1.13+ running on `localhost:4096`
- Node.js 18+
- npm or bun

## Quick Start

```bash
# Clone the repo
git clone https://github.com/xkpforever/mimocode-webui.git
cd mimocode-webui/webui

# Install dependencies
npm install

# Start dev server (proxies API to MiMo-Code server)
npm run dev

# Open http://localhost:3333
```

## Build

```bash
npm run build    # Output: webui/dist/
npm run preview  # Preview the production build
```

## Server Compatibility

The WebUI communicates with MiMo-Code's Hono-based server API:

| Endpoint | Purpose |
|----------|---------|
| `/global/health` | Server health check |
| `/global/event` | SSE event stream |
| `/session/*` | Session CRUD, messages |
| `/project/*` | Project info, switching |
| `/git/*` | Git operations |
| `/config/*` | Provider configuration |

### Backend Patches

This repo includes patches to `packages/opencode/` to support WebUI-specific API routes:

- `git/index.ts` — Added `add`, `commit`, `push`, `pull`, `log`, `remotes` operations
- `instance/project.ts` — Added `POST /project/switch` endpoint
- `instance/git.ts` — Git API route handler

## Windows Quick Start

Double-click `start-mimo-all.bat` to start both the MiMo-Code server and WebUI dev server.

## Tech Stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS 3.4
- Zustand (state management)
- xterm.js (terminal)
- Monaco Editor (code editor)

## License

MIT — based on [MiMo-Code](https://github.com/XiaomiMiMo/MiMo-Code) by Xiaomi.
