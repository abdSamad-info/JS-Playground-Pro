export type FileType = 'javascript' | 'html' | 'css' | 'json' | 'typescript';

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
  logs: LogEntry[];
  theme: 'light' | 'dark';
  accentColor: string;
  fontSize: number;
  fontFamily: string;
  lineNumbers: 'on' | 'off';
  wordWrap: 'on' | 'off';
  minimap: boolean;
  themePreset: 'vs-code' | 'monokai' | 'cobalt' | 'github-light';
  isSaving: boolean;
  isRunning: boolean;
  isConsoleVisible: boolean;
  isAIPanelVisible: boolean;
  aiPrompt: string | null;
  
  // Actions
  setFiles: (files: File[]) => void;
  setFolders: (folders: Folder[]) => void;
  updateFileContent: (id: string, content: string) => void;
  setActiveFileId: (id: string) => void;
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setAccentColor: (color: string) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setLineNumbers: (status: 'on' | 'off') => void;
  setWordWrap: (status: 'on' | 'off') => void;
  setMinimap: (status: boolean) => void;
  setThemePreset: (preset: 'vs-code' | 'monokai' | 'cobalt' | 'github-light') => void;
  setIsSaving: (status: boolean) => void;
  setIsRunning: (isRunning: boolean) => void;
  setConsoleVisible: (visible: boolean) => void;
  setAIPanelVisible: (visible: boolean) => void;
  setAiPrompt: (prompt: string | null) => void;
  addFile: (name: string, language: FileType, parentId?: string | null) => void;
  addFolder: (name: string, parentId?: string | null) => void;
  deleteFile: (id: string) => void;
  deleteFolder: (id: string) => void;
  renameFile: (id: string, name: string) => void;
  renameFolder: (id: string, name: string) => void;
  setSharedState: (state: Partial<AppState>) => void;
  resetToDefault: () => void;
}
