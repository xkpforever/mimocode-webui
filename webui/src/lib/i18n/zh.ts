/**
 * MIMO Code WebUI — Chinese (zh) translation dictionary
 * High-quality Chinese localization using MIMO Code's existing terminology.
 */

export const dict: Record<string, string> = {
  /* ─── Layout: TopBar ─── */
  'topbar.toggleSidebar': '切换侧边栏',
  'topbar.toggleDark': '切换至浅色模式',
  'topbar.toggleLight': '切换至深色模式',
  'topbar.toggleTerminal': '切换终端',
  'topbar.settings': '设置',
  'topbar.switchLang': 'English',

  /* ─── Layout: Sidebar ─── */
  'sidebar.searchPlaceholder': '搜索会话...',
  'sidebar.tab.sessions': '会话',
  'sidebar.tab.memory': '记忆',
  'sidebar.tab.tasks': '任务',
  'sidebar.newSession': '新建会话',
  'sidebar.noSessions': '暂无会话',
  'sidebar.memoryLoading': '记忆浏览器加载中...',
  'sidebar.taskLoading': '任务树加载中...',

  /* ─── Layout: StatusBar ─── */
  'statusbar.connected': '已连接',
  'statusbar.disconnected': '未连接',
  'statusbar.agent': '代理',
  'statusbar.tokens': 'Token',

  /* ─── HomePage ─── */
  'home.greeting': 'MIMO Code',
  'home.subtitle': '一款具备跨会话记忆能力的开源 AI 编程助手。\n开始新会话，或从上次中断处继续。',
  'home.newChat': '新建对话',
  'home.newChatDesc': '与 AI 代理开始对话',
  'home.browseMemory': '浏览记忆',
  'home.browseMemoryDesc': '搜索持久化项目记忆',
  'home.taskDashboard': '任务面板',
  'home.taskDashboardDesc': '追踪树形任务进度',
  'home.keyFeatures': '核心功能',
  'home.feature.multiAgent': '多 Agent',
  'home.feature.multiAgentDesc': '在 build/plan/compose 代理间切换',
  'home.feature.memory': '持久化记忆',
  'home.feature.memoryDesc': '基于 SQLite FTS5 的跨会话记忆',
  'home.feature.tasks': '任务追踪',
  'home.feature.tasksDesc': '树形任务层级结构',
  'home.feature.subagent': '子代理系统',
  'home.feature.subagentDesc': '带生命周期的并行执行',
  'home.feature.goal': '目标条件',
  'home.feature.goalDesc': '裁判模型评估自动停止',
  'home.feature.dream': 'Dream & Distill',
  'home.feature.dreamDesc': '从轨迹中自我改进',

  /* ─── Chat ─── */
  'chat.continueSession': '↻ 继续会话',
  'chat.startSession': '✦ 开始新会话',
  'chat.continueDesc': '消息将从你离开的地方继续。',
  'chat.startDesc': '发送消息开始使用 MIMO Code。使用 @ 切换代理，/ 输入命令。',

  'chat.input.attach': '附加图片',
  'chat.input.command': '插入 /command',
  'chat.input.placeholder': '让 MIMO Code 做任何事...',
  'chat.input.imagePlaceholder': '为图片添加说明...',
  'chat.input.dropImage': '拖放图片到这里',

  /* ─── Agent ─── */
  'agent.build': '构建',
  'agent.buildDesc': '完全工具权限，用于开发',
  'agent.plan': '规划',
  'agent.planDesc': '只读分析，用于探索与设计',
  'agent.compose': '编排',
  'agent.composeDesc': '基于规格驱动开发的工作流编排',

  'agent.status.running': '运行中',
  'agent.status.completed': '已完成',
  'agent.status.failed': '已失败',
  'agent.subagents': '子代理',
  'agent.active': '活跃',

  /* ─── Memory ─── */
  'memory.title': '记忆',
  'memory.searchPlaceholder': '搜索记忆（FTS5）...',
  'memory.empty': '搜索记忆以从过往会话中获取相关上下文。',

  /* ─── Tasks ─── */
  'task.title': '任务',
  'task.add': '添加',
  'task.empty': '暂无任务。代理会自动创建任务。',

  /* ─── Workflow ─── */
  'workflow.title': '工作流',

  /* ─── Settings ─── */
  'settings.title': '设置',
  'settings.back': '← 返回',
  'settings.serverConnection': '服务器连接',
  'settings.serverUrl': 'MIMO Code 服务器地址',
  'settings.checking': '检查中...',
  'settings.reconnect': '重新连接',
  'settings.appearance': '外观',
  'settings.colorScheme': '配色方案',
  'settings.dark': '深色',
  'settings.light': '浅色',
  'settings.system': '跟随系统',
  'settings.theme': '主题',
  'settings.searchThemes': '搜索主题...',
  'settings.themeCount': '共 {{count}} 个主题',
  'settings.language': '语言',

  /* ─── Compose ─── */
  'compose.title': '工作流',

  /* ─── File Explorer ─── */
  'fileExplorer.title': '文件',
  'fileExplorer.search': '搜索文件...',
  'fileExplorer.noFiles': '未找到文件',
  'fileExplorer.noResults': '无匹配文件',
  'fileExplorer.showHidden': '显示隐藏文件',
  'fileExplorer.hideHidden': '隐藏隐藏文件',
  'fileExplorer.newFile': '新建文件',
  'fileExplorer.newFolder': '新建文件夹',
  'fileExplorer.rename': '重命名',
  'fileExplorer.delete': '删除',
  'fileExplorer.confirmDelete': '确定要删除吗？此操作不可撤销。',

  /* ─── Git Explorer ─── */
  'git.title': 'Git',
  'git.changes': '变更',
  'git.history': '历史',
  'git.staged': '已暂存',
  'git.modified': '已修改',
  'git.untracked': '未追踪',
  'git.noChanges': '工作区干净',
  'git.noCommits': '暂无提交',
  'git.commitMessage': '提交信息...',
  'git.commit': '提交',
  'git.push': '推送',
  'git.pull': '拉取',
  'git.retry': '重试',
  'git.notAGitRepo': '不是 Git 仓库',
  'git.fetchError': '获取 Git 状态失败',
  'git.stageError': '暂存文件失败',
  'git.unstageError': '取消暂存失败',
  'git.discardError': '丢弃更改失败',
  'git.commitError': '提交失败',
  'git.pushError': '推送失败',
  'git.pullError': '拉取失败',
  'git.confirmDiscard': '丢弃所有更改？此操作不可撤销。',

  /* ─── Code Editor ─── */
  'codeEditor.loading': '加载中...',
  'codeEditor.loadError': '加载文件失败',
  'codeEditor.saveError': '保存文件失败',
  'codeEditor.retry': '重试',
  'codeEditor.save': '保存',
  'codeEditor.copy': '复制',
  'codeEditor.download': '下载',
  'codeEditor.settings': '设置',
  'codeEditor.fontSize': '字号',
  'codeEditor.tabSize': '制表符宽度',
  'codeEditor.wordWrap': '自动换行',
  'codeEditor.lineNumbers': '行号',
  'codeEditor.lines': '行',
  'codeEditor.chars': '字符',
  'codeEditor.modified': '已修改',

  /* ─── Command Palette ─── */
  'commandPalette.placeholder': '输入命令或搜索...',
  'commandPalette.noResults': '未找到命令',
  'commandPalette.navigate': '导航',
  'commandPalette.select': '选择',
  'commandPalette.close': '关闭',
  'commandPalette.category.navigation': '导航',
  'commandPalette.category.view': '视图',
  'commandPalette.category.session': '会话',
  'commandPalette.category.settings': '设置',

  /* ─── Panels ─── */
  'panel.files': '文件',
  'panel.git': 'Git',
  'panel.editor': '编辑器',
  'panel.terminal': '终端',

  /* ─── Project Switcher ─── */
  'project.switcher.noProject': '未选择项目',
  'project.switcher.search': '搜索项目...',
  'project.switcher.projectList': '项目列表',
  'project.switcher.refresh': '刷新',
  'project.switcher.noResults': '无匹配项目',
  'project.switcher.noProjects': '暂无项目',
  'project.switcher.openOther': '打开其他项目',
  'project.switcher.enterPath': '输入要打开的项目文件夹路径：',
  'project.switcher.pathPlaceholder': '例如：D:\\MyProject 或 /home/user/project',
  'project.switcher.switchFailed': '切换项目失败，请检查路径是否正确',

  /* ─── Streaming ─── */
  'stream.thinking': '思考中...',
  'stream.usingTool': '正在使用 {{tool}}...',
  'stream.output': '流式输出中...',
  'stream.status.thinking': 'AI 思考中...',
  'stream.status.tool': '正在执行: {{tool}}',
  'stream.status.streaming': '流式输出中...',

  /* ─── Sidebar extras ─── */
  'sidebar.confirmDelete': '确定删除此会话？此操作不可撤销。',
  'sidebar.rename': '重命名',
  'sidebar.renamePlaceholder': '新名称...',
  'sidebar.archive': '归档',
  'sidebar.refresh': '刷新',

  /* ─── Memory extras ─── */
  'memory.search': '搜索',
  'memory.timeline': '时间线',
  'memory.evolve': '进化',
  'memory.graph': '图谱',
  'memory.extracted': '提取',
  'memory.pruned': '清理',
  'memory.skills': '技能',

  /* ─── Settings extras ─── */
  'settings.mcp': 'MCP 服务器管理',
  'settings.notifications': '通知设置',
  'settings.mcpAdd': '添加 MCP 服务器',
  'settings.mcpName': '名称',
  'settings.mcpTransport': '传输方式',
  'settings.mcpCommand': '命令',
  'settings.mcpArgs': '参数（空格分隔）',
  'settings.mcpUrl': 'URL',
  'settings.mcpCancel': '取消',
  'settings.mcpAddBtn': '添加',
  'settings.mcpActive': '{{count}}/{{total}} 活跃',
  'settings.mcpNoServers': '暂无 MCP 服务器',
  'settings.notifBrowser': '浏览器通知',
  'settings.notifEnable': '启用通知',
  'settings.notifEnabled': '通知已启用',
  'settings.notifDenied': '通知被拒绝，请在浏览器设置中允许',
  'settings.notifBlocked': '浏览器已阻止通知',

  /* ─── Notifications ─── */
  'notif.titleComplete': '[完成]',

  /* ─── Tasks ─── */
  'task.progress': '{{completed}}/{{total}}',

  /* ─── MCP ─── */
  'mcp.title': 'MCP 服务器',
  'mcp.delete': '删除',
  'mcp_stdio': 'stdio',
  'mcp_sse': 'SSE',
  'mcp_http': 'HTTP',
  'mcp_global': '全局',
  'mcp_project': '项目',

  /* ─── Message actions ─── */
  'message.copy': '复制',
  'message.copied': '已复制',
  'message.copyAll': '复制消息',
  'message.retry': '重新生成',
  'message.collapsed': '内容过长已折叠...',
  'message.expand': '展开完整内容...',
  'message.collapse': '收起',

  'model.select': '选择模型',
  'model.search': '搜索模型...',
  'model.noModels': '暂无可用模型',
  'model.noModelsDesc': '请检查服务器连接或在配置中添加 Provider',
}
