export type FileType = 'javascript' | 'html' | 'css' | 'json' | 'typescript';
export type ViewTab = 'editor' | 'console' | 'terminal' | 'preview' | 'tests';

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

export interface TestCaseResult {
  id: string;
  name: string;
  suiteName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: {
    message: string;
    expected?: any;
    received?: any;
    stack?: string;
  };
}

export interface TestSuiteResult {
  fileId: string;
  fileName: string;
  suiteName: string;
  status: 'passed' | 'failed' | 'running';
  duration: number;
  tests: TestCaseResult[];
}

export interface TestSummary {
  totalSuites: number;
  passedSuites: number;
  failedSuites: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  timestamp: number;
}

export type ThemePreset = 
  | 'vs-code' 
  | 'github-dark' 
  | 'dracula' 
  | 'monokai' 
  | 'nord' 
  | 'tokyo-night' 
  | 'one-dark-pro' 
  | 'cobalt' 
  | 'synthwave' 
  | 'solarized-dark' 
  | 'github-light' 
  | 'solarized-light';

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
  themePreset: ThemePreset;
  tabSize: number;
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
  
  // Test Runner State
  testResults: {
    suites: TestSuiteResult[];
    summary: TestSummary | null;
  };
  isTesting: boolean;

  // Command Palette State
  isCommandPaletteOpen: boolean;

  // Modals & Triggers
  isGitModalOpen: boolean;
  isExportModalOpen: boolean;
  isSettingsModalOpen: boolean;

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
  setThemePreset: (preset: ThemePreset) => void;
  setTabSize: (size: number) => void;
  setAutoFormat: (status: boolean) => void;
  setIsSaving: (status: boolean) => void;
  setIsRunning: (isRunning: boolean) => void;
  setServerRunning: (running: boolean, port?: number) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setConsoleVisible: (visible: boolean) => void;
  setAIPanelVisible: (visible: boolean) => void;
  setAiPrompt: (prompt: string | null) => void;
  addFile: (name: string, language: FileType, parentId?: string | null, content?: string) => boolean;
  addFolder: (name: string, parentId?: string | null) => boolean;
  moveFile: (id: string, newParentId: string | null) => void;
  moveFolder: (id: string, newParentId: string | null) => void;
  deleteFile: (id: string) => void;
  deleteFolder: (id: string) => void;
  renameFile: (id: string, name: string) => void;
  renameFolder: (id: string, name: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setGitModalOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  formatActiveFile: () => Promise<boolean>;
  runTests: (targetFileId?: string) => Promise<void>;
  createSampleTestFile: () => void;
  loadStarterTemplate: (templateId: string) => void;
  loadClonedWorkspace: (files: File[], folders: Folder[]) => void;
  setSharedState: (state: Partial<AppState>) => void;
  resetToDefault: () => void;
}
