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
  isRunning: boolean;
  isConsoleVisible: boolean;
  isAIPanelVisible: boolean;
  
  // Actions
  setFiles: (files: File[]) => void;
  setFolders: (folders: Folder[]) => void;
  updateFileContent: (id: string, content: string) => void;
  setActiveFileId: (id: string) => void;
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setIsRunning: (isRunning: boolean) => void;
  setConsoleVisible: (visible: boolean) => void;
  setAIPanelVisible: (visible: boolean) => void;
  addFile: (name: string, language: FileType, parentId?: string | null) => void;
  addFolder: (name: string, parentId?: string | null) => void;
  deleteFile: (id: string) => void;
  deleteFolder: (id: string) => void;
  renameFile: (id: string, name: string) => void;
  renameFolder: (id: string, name: string) => void;
  resetToDefault: () => void;
}
