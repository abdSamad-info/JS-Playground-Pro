export type FileType = 'javascript' | 'html' | 'css';

export interface File {
  id: string;
  name: string;
  content: string;
  language: FileType;
}

export interface LogEntry {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  content: string;
  timestamp: number;
}

export interface AppState {
  files: File[];
  activeFileId: string;
  logs: LogEntry[];
  theme: 'light' | 'dark';
  isRunning: boolean;
  
  // Actions
  setFiles: (files: File[]) => void;
  updateFileContent: (id: string, content: string) => void;
  setActiveFileId: (id: string) => void;
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setIsRunning: (isRunning: boolean) => void;
  addFile: (name: string, language: FileType) => void;
  deleteFile: (id: string) => void;
  resetToDefault: () => void;
}
