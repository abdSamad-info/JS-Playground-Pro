import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, File, Folder } from '../types/index';

const DEFAULT_FILES: File[] = [
  {
    id: 'index-js',
    name: 'index.js',
    language: 'javascript',
    parentId: null,
    content: `// Welcome to JS Playground Pro!
// Try writing some code here.

const greeting = "Hello World!";
console.log(greeting);

// You can interact with the DOM too!
const root = document.getElementById('root');
if (root) {
  root.innerHTML = '<h1>' + greeting + '</h1><p>Edit index.js to change this.</p>';
}

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci(10):", fibonacci(10));
`,
  },
  {
    id: 'index-html',
    name: 'index.html',
    language: 'html',
    parentId: null,
    content: `<!DOCTYPE html>
<html>
<head>
  <title>JS Playground</title>
</head>
<body>
  <div id="root">
    <h1>Loading...</h1>
  </div>
</body>
</html>`,
  },
  {
    id: 'styles-css',
    name: 'styles.css',
    language: 'css',
    parentId: null,
    content: `body {
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #333;
}

h1 {
  color: #007acc;
  font-family: sans-serif;
}`,
  }
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      files: DEFAULT_FILES,
      folders: [],
      activeFileId: 'index-js',
      logs: [],
      theme: 'dark',
      accentColor: '#007acc',
      fontSize: 14,
      fontFamily: 'JetBrains Mono',
      lineNumbers: 'on',
      wordWrap: 'on',
      minimap: false,
      themePreset: 'vs-code',
      autoFormat: false,
      isSaving: false,
      isRunning: false,
      isConsoleVisible: false,
      isAIPanelVisible: false,
      aiPrompt: null,
      terminalLogs: [],

      setFiles: (files) => set({ files }),
      setFolders: (folders) => set({ folders }),
      updateFileContent: (id, content) =>
        set((state) => ({
          files: state.files.map((f) => (f.id === id ? { ...f, content } : f)),
        })),
      setActiveFileId: (id) => set({ activeFileId: id }),
      addLog: (log) =>
        set((state) => ({
          logs: [
            ...state.logs,
            { ...log, id: Math.random().toString(36).substring(2, 11), timestamp: Date.now() },
          ],
        })),
      clearLogs: () => set({ logs: [] }),
      addTerminalLog: (log) =>
        set((state) => ({
          terminalLogs: [
            ...state.terminalLogs,
            { ...log, timestamp: Date.now() },
          ],
        })),
      clearTerminalLogs: () => set({ terminalLogs: [] }),
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setFontSize: (fontSize) => set({ fontSize }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setLineNumbers: (lineNumbers) => set({ lineNumbers }),
      setWordWrap: (wordWrap) => set({ wordWrap }),
      setMinimap: (minimap) => set({ minimap }),
      setThemePreset: (themePreset) => set({ themePreset }),
      setAutoFormat: (autoFormat) => set({ autoFormat }),
      setIsSaving: (isSaving) => set({ isSaving }),
      setIsRunning: (isRunning) => set({ isRunning }),
      setConsoleVisible: (isConsoleVisible) => set({ isConsoleVisible }),
      setAIPanelVisible: (isAIPanelVisible) => set({ isAIPanelVisible }),
      setAiPrompt: (aiPrompt) => set({ aiPrompt }),
      addFile: (name, language, parentId = null) => {
        let success = false;
        set((state) => {
          // Check for duplicate name in the same parent
          const exists = state.files.some(f => f.name === name && f.parentId === parentId);
          if (exists) {
            success = false;
            return state;
          }

          const newFile: File = {
            id: Math.random().toString(36).substring(2, 11),
            name,
            language,
            parentId,
            content: '',
          };
          success = true;
          return {
            files: [...state.files, newFile],
            activeFileId: newFile.id,
          };
        });
        return success;
      },
      addFolder: (name, parentId = null) => {
        let success = false;
        set((state) => {
          // Check for duplicate folder name in the same parent
          const exists = state.folders.some(f => f.name === name && f.parentId === parentId);
          if (exists) {
            success = false;
            return state;
          }

          const newFolder: Folder = {
            id: Math.random().toString(36).substring(2, 11),
            name,
            parentId,
          };
          success = true;
          return {
            folders: [...state.folders, newFolder],
          };
        });
        return success;
      },
      moveFile: (id, newParentId) =>
        set((state) => ({
          files: state.files.map((f) => (f.id === id ? { ...f, parentId: newParentId } : f)),
        })),
      moveFolder: (id, newParentId) =>
        set((state) => {
          // Prevent moving a folder into itself or its children
          const getAllChildFolderIds = (folderId: string): string[] => {
            const children = state.folders.filter(f => f.parentId === folderId);
            return children.reduce((acc, child) => [...acc, child.id, ...getAllChildFolderIds(child.id)], [] as string[]);
          };

          const children = getAllChildFolderIds(id);
          if (newParentId === id || (newParentId && children.includes(newParentId))) {
            return state;
          }

          return {
            folders: state.folders.map((f) => (f.id === id ? { ...f, parentId: newParentId } : f)),
          };
        }),
      deleteFile: (id) =>
        set((state) => {
          const newFiles = state.files.filter((f) => f.id !== id);
          let newActiveId = state.activeFileId;
          if (state.activeFileId === id) {
            newActiveId = newFiles.length > 0 ? newFiles[0].id : '';
          }
          return {
            files: newFiles,
            activeFileId: newActiveId,
          };
        }),
      deleteFolder: (id) =>
        set((state) => {
          // Recursive delete would be better, but for now just delete the folder
          // and move children to root or delete them too? Let's delete children too.
          const deleteChildren = (folderId: string): string[] => {
            const childFolders = state.folders.filter(f => f.parentId === folderId);
            let ids = [folderId];
            childFolders.forEach(cf => {
              ids = [...ids, ...deleteChildren(cf.id)];
            });
            return ids;
          };

          const folderIdsToDelete = deleteChildren(id);
          const newFolders = state.folders.filter(f => !folderIdsToDelete.includes(f.id));
          const newFiles = state.files.filter(f => !folderIdsToDelete.includes(f.parentId || ''));

          let newActiveId = state.activeFileId;
          if (state.files.find(f => f.id === state.activeFileId && folderIdsToDelete.includes(f.parentId || ''))) {
            newActiveId = newFiles.length > 0 ? newFiles[0].id : '';
          }

          return {
            folders: newFolders,
            files: newFiles,
            activeFileId: newActiveId,
          };
        }),
      renameFile: (id, name) =>
        set((state) => ({
          files: state.files.map(f => f.id === id ? { ...f, name } : f)
        })),
      renameFolder: (id, name) =>
        set((state) => ({
          folders: state.folders.map(f => f.id === id ? { ...f, name } : f)
        })),
      setSharedState: (sharedState) => set((state) => ({
        ...state,
        ...sharedState,
        isRunning: false, // Reset running state when loading shared
        logs: [], // Clear logs
      })),
      resetToDefault: () => set({ files: DEFAULT_FILES, folders: [], activeFileId: 'index-js', logs: [], isConsoleVisible: false }),
    }),
    {
      name: 'js-playground-storage',
      partialize: (state) => ({
        files: state.files,
        folders: state.folders,
        activeFileId: state.activeFileId,
        theme: state.theme,
        accentColor: state.accentColor,
        fontSize: state.fontSize,
        fontFamily: state.fontFamily,
        lineNumbers: state.lineNumbers,
        wordWrap: state.wordWrap,
        minimap: state.minimap,
        themePreset: state.themePreset,
        autoFormat: state.autoFormat,
      }),
    }
  )
);
