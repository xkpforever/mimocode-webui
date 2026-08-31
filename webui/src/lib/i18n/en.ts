/**
 * MIMO Code WebUI — English (en) translation dictionary
 */

export const dict: Record<string, string> = {
  /* ─── Layout: TopBar ─── */
  'topbar.toggleSidebar': 'Toggle sidebar',
  'topbar.toggleDark': 'Switch to light mode',
  'topbar.toggleLight': 'Switch to dark mode',
  'topbar.toggleTerminal': 'Toggle terminal',
  'topbar.settings': 'Settings',
  'topbar.switchLang': '中文',

  /* ─── Layout: Sidebar ─── */
  'sidebar.searchPlaceholder': 'Search sessions...',
  'sidebar.tab.sessions': 'Sessions',
  'sidebar.tab.memory': 'Memory',
  'sidebar.tab.tasks': 'Tasks',
  'sidebar.newSession': 'New Session',
  'sidebar.noSessions': 'No sessions yet',
  'sidebar.memoryLoading': 'Memory browser loading...',
  'sidebar.taskLoading': 'Task tree loading...',

  /* ─── Layout: StatusBar ─── */
  'statusbar.connected': 'Connected',
  'statusbar.disconnected': 'Disconnected',
  'statusbar.agent': 'Agent',
  'statusbar.tokens': 'Tokens',

  /* ─── HomePage ─── */
  'home.greeting': 'MIMO Code',
  'home.subtitle': 'An open-source AI coding agent with cross-session memory.\nStart a new session or pick up where you left off.',
  'home.newChat': 'New Chat',
  'home.newChatDesc': 'Start a conversation with the AI agent',
  'home.browseMemory': 'Browse Memory',
  'home.browseMemoryDesc': 'Search persistent project memory',
  'home.taskDashboard': 'Task Dashboard',
  'home.taskDashboardDesc': 'Track tree-shaped task progress',
  'home.keyFeatures': 'Key Features',
  'home.feature.multiAgent': 'Multi-Agent',
  'home.feature.multiAgentDesc': 'Switch between build/plan/compose agents',
  'home.feature.memory': 'Persistent Memory',
  'home.feature.memoryDesc': 'SQLite FTS5 cross-session memory',
  'home.feature.tasks': 'Task Tracking',
  'home.feature.tasksDesc': 'Tree‑shaped task hierarchy',
  'home.feature.subagent': 'Subagent System',
  'home.feature.subagentDesc': 'Parallel execution with lifecycle',
  'home.feature.goal': 'Goal Conditions',
  'home.feature.goalDesc': 'Auto‑stop with judge evaluation',
  'home.feature.dream': 'Dream & Distill',
  'home.feature.dreamDesc': 'Self‑improvement from traces',

  /* ─── Chat ─── */
  'chat.continueSession': '↻ Continue Session',
  'chat.startSession': '✦ Start a New Session',
  'chat.continueDesc': 'Messages will resume from where you left off.',
  'chat.startDesc': 'Send a message to begin working with MIMO Code. Use @ to switch agents, / for commands.',

  'chat.input.attach': 'Attach image',
  'chat.input.command': 'Insert /command',
  'chat.input.placeholder': 'Ask MIMO Code to do anything...',
  'chat.input.imagePlaceholder': 'Add a message for the image...',
  'chat.input.dropImage': 'Drop image here',

  /* ─── Agent ─── */
  'agent.build': 'Build',
  'agent.buildDesc': 'Full tool permissions for development',
  'agent.plan': 'Plan',
  'agent.planDesc': 'Read-only analysis for exploration & design',
  'agent.compose': 'Compose',
  'agent.composeDesc': 'Orchestration for specs-driven development',

  'agent.status.running': 'Running',
  'agent.status.completed': 'Done',
  'agent.status.failed': 'Failed',
  'agent.subagents': 'Subagents',
  'agent.active': 'active',

  /* ─── Memory ─── */
  'memory.title': 'Memory',
  'memory.searchPlaceholder': 'Search memory (FTS5)...',
  'memory.empty': 'Search memory to find relevant context from past sessions.',

  /* ─── Tasks ─── */
  'task.title': 'Tasks',
  'task.add': 'Add',
  'task.empty': 'No tasks yet. Tasks are created automatically by the agent.',

  /* ─── Workflow ─── */
  'workflow.title': 'Workflow',

  /* ─── Settings ─── */
  'settings.title': 'Settings',
  'settings.back': '← Back',
  'settings.serverConnection': 'Server Connection',
  'settings.serverUrl': 'MIMO Code Server URL',
  'settings.checking': 'Checking...',
  'settings.reconnect': 'Reconnect',
  'settings.appearance': 'Appearance',
  'settings.colorScheme': 'Color Scheme',
  'settings.dark': 'Dark',
  'settings.light': 'Light',
  'settings.system': 'System',
  'settings.theme': 'Theme',
  'settings.searchThemes': 'Search themes...',
  'settings.themeCount': '{{count}} of {{total}} themes',
  'settings.language': 'Language',

  /* ─── Compose ─── */
  'compose.title': 'Workflow',

  /* ─── File Explorer ─── */
  'fileExplorer.title': 'Files',
  'fileExplorer.search': 'Search files...',
  'fileExplorer.noFiles': 'No files found',
  'fileExplorer.noResults': 'No matching files',
  'fileExplorer.showHidden': 'Show hidden files',
  'fileExplorer.hideHidden': 'Hide hidden files',
  'fileExplorer.newFile': 'New File',
  'fileExplorer.newFolder': 'New Folder',
  'fileExplorer.rename': 'Rename',
  'fileExplorer.delete': 'Delete',
  'fileExplorer.confirmDelete': 'Are you sure you want to delete this?',

  /* ─── Git Explorer ─── */
  'git.title': 'Git',
  'git.changes': 'Changes',
  'git.history': 'History',
  'git.staged': 'Staged',
  'git.modified': 'Modified',
  'git.untracked': 'Untracked',
  'git.noChanges': 'Working tree clean',
  'git.noCommits': 'No commits yet',
  'git.commitMessage': 'Commit message...',
  'git.commit': 'Commit',
  'git.push': 'Push',
  'git.pull': 'Pull',
  'git.retry': 'Retry',
  'git.notAGitRepo': 'Not a git repository',
  'git.fetchError': 'Failed to fetch git status',
  'git.stageError': 'Failed to stage file',
  'git.unstageError': 'Failed to unstage file',
  'git.discardError': 'Failed to discard changes',
  'git.commitError': 'Failed to commit',
  'git.pushError': 'Failed to push',
  'git.pullError': 'Failed to pull',
  'git.confirmDiscard': 'Discard all changes? This cannot be undone.',

  /* ─── Code Editor ─── */
  'codeEditor.loading': 'Loading...',
  'codeEditor.loadError': 'Failed to load file',
  'codeEditor.saveError': 'Failed to save file',
  'codeEditor.retry': 'Retry',
  'codeEditor.save': 'Save',
  'codeEditor.copy': 'Copy',
  'codeEditor.download': 'Download',
  'codeEditor.settings': 'Settings',
  'codeEditor.fontSize': 'Font Size',
  'codeEditor.tabSize': 'Tab Size',
  'codeEditor.wordWrap': 'Word Wrap',
  'codeEditor.lineNumbers': 'Line Numbers',
  'codeEditor.lines': 'lines',
  'codeEditor.chars': 'chars',
  'codeEditor.modified': 'Modified',

  /* ─── Command Palette ─── */
  'commandPalette.placeholder': 'Type a command or search...',
  'commandPalette.noResults': 'No commands found',
  'commandPalette.navigate': 'Navigate',
  'commandPalette.select': 'Select',
  'commandPalette.close': 'Close',
  'commandPalette.category.navigation': 'Navigation',
  'commandPalette.category.view': 'View',
  'commandPalette.category.session': 'Session',
  'commandPalette.category.settings': 'Settings',

  /* ─── Panels ─── */
  'panel.files': 'Files',
  'panel.git': 'Git',
  'panel.editor': 'Editor',
  'panel.terminal': 'Terminal',

  /* ─── Project Switcher ─── */
  'project.switcher.noProject': 'No project selected',
  'project.switcher.search': 'Search projects...',
  'project.switcher.projectList': 'Projects',
  'project.switcher.refresh': 'Refresh',
  'project.switcher.noResults': 'No matching projects',
  'project.switcher.noProjects': 'No projects found',
  'project.switcher.openOther': 'Open other project',
  'project.switcher.enterPath': 'Enter project folder path:',
  'project.switcher.pathPlaceholder': 'e.g. D:\\MyProject or /home/user/project',
  'project.switcher.switchFailed': 'Failed to switch project. Please check the path.',

  /* ─── Streaming ─── */
  'stream.thinking': 'Thinking...',
  'stream.usingTool': 'Using {{tool}}...',
  'stream.output': 'Streaming...',
  'stream.status.thinking': 'AI is thinking...',
  'stream.status.tool': 'Executing: {{tool}}',
  'stream.status.streaming': 'Streaming response...',

  /* ─── Sidebar extras ─── */
  'sidebar.confirmDelete': 'Delete this session? This cannot be undone.',
  'sidebar.rename': 'Rename',
  'sidebar.renamePlaceholder': 'New name...',
  'sidebar.archive': 'Archive',
  'sidebar.refresh': 'Refresh',

  /* ─── Memory extras ─── */
  'memory.search': 'Search',
  'memory.timeline': 'Timeline',
  'memory.evolve': 'Evolve',
  'memory.graph': 'Graph',
  'memory.extracted': 'Extracted',
  'memory.pruned': 'Pruned',
  'memory.skills': 'Skills',

  /* ─── Settings extras ─── */
  'settings.mcp': 'MCP Server Management',
  'settings.notifications': 'Notification Settings',
  'settings.mcpAdd': 'Add MCP Server',
  'settings.mcpName': 'Name',
  'settings.mcpTransport': 'Transport',
  'settings.mcpCommand': 'Command',
  'settings.mcpArgs': 'Arguments (space separated)',
  'settings.mcpUrl': 'URL',
  'settings.mcpCancel': 'Cancel',
  'settings.mcpAddBtn': 'Add',
  'settings.mcpActive': '{{count}}/{{total}} active',
  'settings.mcpNoServers': 'No MCP servers configured',
  'settings.notifBrowser': 'Browser Notifications',
  'settings.notifEnable': 'Enable Notifications',
  'settings.notifEnabled': 'Notifications enabled',
  'settings.notifDenied': 'Notifications blocked — enable in browser settings',
  'settings.notifBlocked': 'Notifications blocked in browser settings',

  /* ─── Notifications ─── */
  'notif.titleComplete': '[Done]',

  /* ─── Tasks ─── */
  'task.progress': '{{completed}}/{{total}}',

  /* ─── MCP ─── */
  'mcp.title': 'MCP Servers',
  'mcp.delete': 'Delete',
  'mcp_stdio': 'stdio',
  'mcp_sse': 'SSE',
  'mcp_http': 'HTTP',
  'mcp_global': 'global',
  'mcp_project': 'project',

  /* ─── Message actions ─── */
  'message.copy': 'Copy',
  'message.copied': 'Copied',
  'message.copyAll': 'Copy message',
  'message.retry': 'Regenerate',
  'message.collapsed': 'Content collapsed...',
  'message.expand': 'Show full content',
  'message.collapse': 'Collapse',

  'model.select': 'Select Model',
  'model.search': 'Search models...',
  'model.noModels': 'No models available',
  'model.noModelsDesc': 'Check server connection or add providers in config',
}
