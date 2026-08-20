export type FileType = 'javascript' | 'html' | 'css' | 'json' | 'typescript';
export type ViewTab = 'editor' | 'console' | 'terminal' | 'preview';

export interface File {
  id: string;
  name: string;
  content: string;
  language: FileType;
  parentId: string | null;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

export interface LogEntry {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  content: string;
  timestamp: number;
}

export interface AppState {
  files: File[];
  folders: Folder[];
  activeFileId: string;
  activeView: ViewTab;
  dirtyFileIds: Record<string, boolean>;
  savedFileContents: Record<string, string>;
  logs: LogEntry[];
  theme: 'light' | 'dark';
  accentColor: string;
  fontSize: number;
  fontFamily: string;
  lineNumbers: 'on' | 'off';
  wordWrap: 'on' | 'off';
  minimap: boolean;
  themePreset: 'vs-code' | 'monokai' | 'cobalt' | 'github-light' | 'dracula' | 'solarized-dark' | 'material';
  autoFormat: boolean;
  isSaving: boolean;
  isRunning: boolean;
  isServerRunning: boolean;
  serverPort: number;
  isSidebarOpen: boolean;
  isConsoleVisible: boolean;
  isAIPanelVisible: boolean;
  aiPrompt: string | null;
  terminalLogs: { type: 'input' | 'output'; content: string; timestamp: number; language?: string }[];
  
  // Actions
  setFiles: (files: File[]) => void;
  setFolders: (folders: Folder[]) => void;
  updateFileContent: (id: string, content: string) => void;
  setActiveFileId: (id: string) => void;
  setActiveView: (view: ViewTab) => void;
  markFileDirty: (id: string, isDirty: boolean) => void;
  saveFile: (id?: string) => void;
  saveAllFiles: () => void;
  revertFileChanges: (id: string) => void;
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  addTerminalLog: (log: { type: 'input' | 'output'; content: string; language?: string }) => void;
  clearTerminalLogs: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setAccentColor: (color: string) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setLineNumbers: (status: 'on' | 'off') => void;
  setWordWrap: (status: 'on' | 'off') => void;
  setMinimap: (status: boolean) => void;
  setThemePreset: (preset: 'vs-code' | 'monokai' | 'cobalt' | 'github-light' | 'dracula' | 'solarized-dark' | 'material') => void;
  setAutoFormat: (status: boolean) => void;
  setIsSaving: (status: boolean) => void;
  setIsRunning: (isRunning: boolean) => void;
  setServerRunning: (running: boolean, port?: number) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setConsoleVisible: (visible: boolean) => void;
  setAIPanelVisible: (visible: boolean) => void;
  setAiPrompt: (prompt: string | null) => void;
  addFile: (name: string, language: FileType, parentId?: string | null) => boolean;
  addFolder: (name: string, parentId?: string | null) => boolean;
  moveFile: (id: string, newParentId: string | null) => void;
  moveFolder: (id: string, newParentId: string | null) => void;
  deleteFile: (id: string) => void;
  deleteFolder: (id: string) => void;
  renameFile: (id: string, name: string) => void;
  renameFolder: (id: string, name: string) => void;
  setSharedState: (state: Partial<AppState>) => void;
  resetToDefault: () => void;
}
