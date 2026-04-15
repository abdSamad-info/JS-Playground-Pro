import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, File } from '../types/index';

const DEFAULT_FILES: File[] = [
  {
    id: 'index-js',
    name: 'index.js',
    language: 'javascript',
    content: `// Welcome to JS Playground Pro!
// Try writing some code here.

const greeting = "Hello World!";
console.log(greeting);

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci(10):", fibonacci(10));

// Errors are also captured
// console.log(undefinedVariable);
`,
  }
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      files: DEFAULT_FILES,
      activeFileId: 'index-js',
      logs: [],
      theme: 'dark',
      isRunning: false,

      setFiles: (files) => set({ files }),
      updateFileContent: (id, content) =>
        set((state) => ({
          files: state.files.map((f) => (f.id === id ? { ...f, content } : f)),
        })),
      setActiveFileId: (id) => set({ activeFileId: id }),
      addLog: (log) =>
        set((state) => ({
          logs: [
            ...state.logs,
            { ...log, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() },
          ],
        })),
      clearLogs: () => set({ logs: [] }),
      setTheme: (theme) => set({ theme }),
      setIsRunning: (isRunning) => set({ isRunning }),
      addFile: (name, language) =>
        set((state) => {
          const newFile: File = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            language,
            content: '',
          };
          return {
            files: [...state.files, newFile],
            activeFileId: newFile.id,
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
      resetToDefault: () => set({ files: DEFAULT_FILES, activeFileId: 'index-js', logs: [] }),
    }),
    {
      name: 'js-playground-storage',
      partialize: (state) => ({
        files: state.files,
        activeFileId: state.activeFileId,
        theme: state.theme,
      }),
    }
  )
);
