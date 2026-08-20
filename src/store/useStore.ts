import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, File, FileType, Folder, TestSuiteResult, TestSummary, ThemePreset } from '../types/index';
import { formatCode } from '../lib/formatter';
import { runUnitTests } from '../lib/testRunner';
import { STARTER_TEMPLATES } from '../lib/gitService';

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
    id: 'index-test-js',
    name: 'index.test.js',
    language: 'javascript',
    parentId: null,
    content: `// Unit tests for index.js
// Run these using the "Tests" tab, Command Palette (Ctrl+Shift+P), or Terminal (npm test)

describe('Fibonacci Algorithm', () => {
  test('returns base case for n = 0', () => {
    expect(fibonacci(0)).toBe(0);
  });

  test('returns base case for n = 1', () => {
    expect(fibonacci(1)).toBe(1);
  });

  test('calculates 6th fibonacci number correctly', () => {
    expect(fibonacci(6)).toBe(8);
  });

  test('calculates 10th fibonacci number correctly', () => {
    expect(fibonacci(10)).toBe(55);
  });
});

describe('Workspace Data & Matchers', () => {
  test('greeting contains greeting word', () => {
    expect(greeting).toContain('Hello');
    expect(greeting).toHaveLength(12);
  });

  test('deep array equality checks pass', () => {
    const numbers = [1, 2, 3, 4, 5];
    const doubled = numbers.map(x => x * 2);
    expect(doubled).toEqual([2, 4, 6, 8, 10]);
  });

  test('handles asynchronous promises cleanly', async () => {
    const fetchUserData = async () => ({ id: 42, role: 'developer', active: true });
    const user = await fetchUserData();
    expect(user.id).toBe(42);
    expect(user.role).toBe('developer');
    expect(user.active).toBeTruthy();
  });
});
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
    (set, get) => ({
      files: DEFAULT_FILES,
      folders: [],
      activeFileId: 'index-js',
      activeView: 'editor',
      dirtyFileIds: {},
      savedFileContents: {
        'index-js': DEFAULT_FILES[0].content,
        'index-test-js': DEFAULT_FILES[1].content,
        'index-html': DEFAULT_FILES[2].content,
        'styles-css': DEFAULT_FILES[3].content,
      },
      logs: [],
      theme: 'dark',
      accentColor: '#007acc',
      fontSize: 14,
      fontFamily: 'JetBrains Mono',
      lineNumbers: 'on',
      wordWrap: 'on',
      minimap: false,
      themePreset: 'vs-code' as ThemePreset,
      tabSize: 2,
      autoFormat: false,
      isSaving: false,
      isRunning: false,
      isServerRunning: false,
      serverPort: 3000,
      isSidebarOpen: true,
      isConsoleVisible: false,
      isAIPanelVisible: false,
      aiPrompt: null,
      terminalLogs: [],
      testResults: {
        suites: [],
        summary: null,
      },
      isTesting: false,
      gitState: {
        initialized: false,
        remoteUrl: null,
        owner: null,
        repo: null,
        branch: 'main',
        staged: [],
        commits: [],
      },
      isCommandPaletteOpen: false,
      isGitModalOpen: false,
      isExportModalOpen: false,
      isSettingsModalOpen: false,

      setFiles: (files) => set({ files }),
      setFolders: (folders) => set({ folders }),
      setGitState: (gitState) => {
        try {
          localStorage.setItem('js-playground-git-state', JSON.stringify(gitState));
        } catch {}
        set({ gitState });
      },
      initializeGit: (remoteUrl, branch = 'main', owner, repo) => {
        const state = get();
        const initialCommit = {
          hash: Math.random().toString(16).substring(2, 9),
          message: remoteUrl ? `Initial commit from ${remoteUrl}` : 'Initial commit',
          author: owner ? `${owner} <${owner}@github.com>` : 'developer <dev@local>',
          timestamp: Date.now(),
          files: state.files.map(f => ({ name: f.name, content: f.content }))
        };

        const newGitState = {
          initialized: true,
          remoteUrl: remoteUrl || null,
          owner: owner || null,
          repo: repo || null,
          branch,
          staged: [],
          commits: [initialCommit]
        };

        try {
          localStorage.setItem('js-playground-git-state', JSON.stringify(newGitState));
        } catch {}

        set({ gitState: newGitState });
      },
      updateFileContent: (id, content) =>
        set((state) => {
          const savedContent = state.savedFileContents[id] ?? '';
          const isDirty = savedContent !== content;
          return {
            files: state.files.map((f) => (f.id === id ? { ...f, content } : f)),
            dirtyFileIds: {
              ...state.dirtyFileIds,
              [id]: isDirty,
            },
          };
        }),
      setActiveFileId: (id) => set({ activeFileId: id }),
      setActiveView: (activeView) => set({ activeView }),
      markFileDirty: (id, isDirty) =>
        set((state) => ({
          dirtyFileIds: {
            ...state.dirtyFileIds,
            [id]: isDirty,
          },
        })),
      saveFile: (id) =>
        set((state) => {
          const targetId = id || state.activeFileId;
          const targetFile = state.files.find((f) => f.id === targetId);
          if (!targetFile) return state;

          return {
            isSaving: false,
            dirtyFileIds: {
              ...state.dirtyFileIds,
              [targetId]: false,
            },
            savedFileContents: {
              ...state.savedFileContents,
              [targetId]: targetFile.content,
            },
          };
        }),
      saveAllFiles: () =>
        set((state) => {
          const newSavedContents: Record<string, string> = { ...state.savedFileContents };
          state.files.forEach((f) => {
            newSavedContents[f.id] = f.content;
          });
          return {
            isSaving: false,
            dirtyFileIds: {},
            savedFileContents: newSavedContents,
          };
        }),
      revertFileChanges: (id) =>
        set((state) => {
          const savedContent = state.savedFileContents[id];
          if (savedContent === undefined) return state;

          return {
            files: state.files.map((f) => (f.id === id ? { ...f, content: savedContent } : f)),
            dirtyFileIds: {
              ...state.dirtyFileIds,
              [id]: false,
            },
          };
        }),
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
      setTabSize: (tabSize) => set({ tabSize }),
      setAutoFormat: (autoFormat) => set({ autoFormat }),
      setIsSaving: (isSaving) => set({ isSaving }),
      setIsRunning: (isRunning) => set({ isRunning }),
      setServerRunning: (isServerRunning, serverPort = 3000) => set({ isServerRunning, serverPort }),
      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setConsoleVisible: (isConsoleVisible) => set({ isConsoleVisible }),
      setAIPanelVisible: (isAIPanelVisible) => set({ isAIPanelVisible }),
      setAiPrompt: (aiPrompt) => set({ aiPrompt }),
      setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
      setGitModalOpen: (isGitModalOpen) => set({ isGitModalOpen }),
      setExportModalOpen: (isExportModalOpen) => set({ isExportModalOpen }),
      setSettingsModalOpen: (isSettingsModalOpen) => set({ isSettingsModalOpen }),

      formatActiveFile: async () => {
        const state = get();
        const activeFile = state.files.find((f) => f.id === state.activeFileId);
        if (!activeFile) return false;

        const res = await formatCode(activeFile.content, activeFile.language, activeFile.name);
        if (res.changed) {
          state.updateFileContent(activeFile.id, res.formatted);
          return true;
        }
        return false;
      },

      runTests: async (targetFileId?: string) => {
        set({ isTesting: true });
        try {
          const state = get();
          const results = await runUnitTests(state.files, targetFileId);
          set({
            testResults: results,
            isTesting: false,
          });
        } catch (err) {
          console.error('Test run failed', err);
          set({ isTesting: false });
        }
      },

      createSampleTestFile: () => {
        const state = get();
        const testFileName = 'math.test.js';
        const exists = state.files.some(f => f.name === testFileName);
        if (exists) {
          const target = state.files.find(f => f.name === testFileName);
          if (target) state.setActiveFileId(target.id);
          return;
        }

        const sampleContent = `// Unit tests with Jest/Vitest style syntax

describe('Math Operations Suite', () => {
  test('addition of positive numbers', () => {
    expect(2 + 2).toBe(4);
    expect(10 + 20).toBe(30);
  });

  test('multiplication and floats with toBeCloseTo', () => {
    expect(0.1 + 0.2).toBeCloseTo(0.3, 2);
    expect(5 * 5).toBe(25);
  });

  test('truthy and falsy checks', () => {
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
  });
});

describe('Exception handling', () => {
  test('detects thrown errors', () => {
    const errorFn = () => {
      throw new Error('Invalid parameter supplied');
    };
    expect(errorFn).toThrow('Invalid parameter');
  });
});
`;
        state.addFile(testFileName, 'javascript', null, sampleContent);
      },

      addFile: (name, language, parentId = null, initialContent = '') => {
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
            content: initialContent,
          };
          success = true;
          return {
            files: [...state.files, newFile],
            activeFileId: newFile.id,
            savedFileContents: {
              ...state.savedFileContents,
              [newFile.id]: initialContent,
            },
            dirtyFileIds: {
              ...state.dirtyFileIds,
              [newFile.id]: false,
            },
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
          const newSaved = { ...state.savedFileContents };
          const newDirty = { ...state.dirtyFileIds };
          delete newSaved[id];
          delete newDirty[id];

          // If no files remain, create a clean default file so the editor never breaks
          if (newFiles.length === 0) {
            const fallbackFile: File = {
              id: 'file-' + Math.random().toString(36).substring(2, 9),
              name: 'index.js',
              language: 'javascript',
              parentId: null,
              content: '// JavaScript Playground\nconsole.log("Hello, world!");\n',
            };
            return {
              files: [fallbackFile],
              activeFileId: fallbackFile.id,
              savedFileContents: { [fallbackFile.id]: fallbackFile.content },
              dirtyFileIds: { [fallbackFile.id]: false },
            };
          }

          let newActiveId = state.activeFileId;
          if (state.activeFileId === id) {
            newActiveId = newFiles[0].id;
          }
          return {
            files: newFiles,
            activeFileId: newActiveId,
            savedFileContents: newSaved,
            dirtyFileIds: newDirty,
          };
        }),
      deleteFolder: (id) =>
        set((state) => {
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

          const newSaved = { ...state.savedFileContents };
          const newDirty = { ...state.dirtyFileIds };
          state.files.forEach(f => {
            if (folderIdsToDelete.includes(f.parentId || '')) {
              delete newSaved[f.id];
              delete newDirty[f.id];
            }
          });

          if (newFiles.length === 0) {
            const fallbackFile: File = {
              id: 'file-' + Math.random().toString(36).substring(2, 9),
              name: 'index.js',
              language: 'javascript',
              parentId: null,
              content: '// JavaScript Playground\nconsole.log("Hello, world!");\n',
            };
            return {
              folders: newFolders,
              files: [fallbackFile],
              activeFileId: fallbackFile.id,
              savedFileContents: { [fallbackFile.id]: fallbackFile.content },
              dirtyFileIds: { [fallbackFile.id]: false },
            };
          }

          let newActiveId = state.activeFileId;
          if (!newFiles.some(f => f.id === state.activeFileId)) {
            newActiveId = newFiles[0].id;
          }

          return {
            folders: newFolders,
            files: newFiles,
            activeFileId: newActiveId,
            savedFileContents: newSaved,
            dirtyFileIds: newDirty,
          };
        }),
      renameFile: (id, name) =>
        set((state) => {
          let detectedLang: FileType = 'javascript';
          if (name.endsWith('.ts') || name.endsWith('.tsx')) detectedLang = 'typescript';
          else if (name.endsWith('.html')) detectedLang = 'html';
          else if (name.endsWith('.css')) detectedLang = 'css';
          else if (name.endsWith('.json')) detectedLang = 'json';

          return {
            files: state.files.map(f => f.id === id ? { ...f, name, language: detectedLang } : f)
          };
        }),
      renameFolder: (id, name) =>
        set((state) => ({
          folders: state.folders.map(f => f.id === id ? { ...f, name } : f)
        })),
      loadStarterTemplate: (templateId: string) => {
        const template = STARTER_TEMPLATES.find(t => t.id === templateId);
        if (!template) return;

        const newFiles: File[] = template.files.map(tf => ({
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: tf.name,
          language: tf.language,
          parentId: null,
          content: tf.content
        }));

        const savedContents: Record<string, string> = {};
        newFiles.forEach(f => {
          savedContents[f.id] = f.content;
        });

        const activeId = newFiles.find(f => f.name.endsWith('.js'))?.id || newFiles[0]?.id || '';

        set({
          files: newFiles,
          folders: [],
          activeFileId: activeId,
          dirtyFileIds: {},
          savedFileContents: savedContents,
          logs: [],
          terminalLogs: [],
          testResults: { suites: [], summary: null },
          activeView: 'editor'
        });
      },

      loadClonedWorkspace: (importedFiles: File[], importedFolders: Folder[], gitInfo?: { remoteUrl: string; owner: string; repo: string; branch: string }) => {
        if (!importedFiles || importedFiles.length === 0) return;

        const savedContents: Record<string, string> = {};
        importedFiles.forEach(f => {
          savedContents[f.id] = f.content;
        });

        // Find primary entrypoint
        const activeId = 
          importedFiles.find(f => f.name === 'index.js' || f.name === 'index.ts' || f.name === 'main.js' || f.name === 'app.js' || f.name === 'index.html')?.id || 
          importedFiles.find(f => f.name.endsWith('.js') || f.name.endsWith('.ts'))?.id || 
          importedFiles[0]?.id || 
          '';

        const initialCommit = {
          hash: Math.random().toString(16).substring(2, 9),
          message: gitInfo ? `Clone repository from ${gitInfo.remoteUrl}` : 'Initial commit',
          author: gitInfo ? `${gitInfo.owner} <${gitInfo.owner}@github.com>` : 'developer <dev@local>',
          timestamp: Date.now(),
          files: importedFiles.map(f => ({ name: f.name, content: f.content }))
        };

        const newGitState = {
          initialized: true,
          remoteUrl: gitInfo?.remoteUrl || null,
          owner: gitInfo?.owner || null,
          repo: gitInfo?.repo || null,
          branch: gitInfo?.branch || 'main',
          staged: [],
          commits: [initialCommit]
        };

        try {
          localStorage.setItem('js-playground-git-state', JSON.stringify(newGitState));
        } catch {}

        const successLogs = [
          {
            type: 'output' as const,
            content: gitInfo 
              ? `\u001b[32m✔\u001b[0m Cloned repository \u001b[34m${gitInfo.owner}/${gitInfo.repo}\u001b[0m (${gitInfo.branch})\nInitial Git state created at HEAD -> ${initialCommit.hash}\n${importedFiles.length} files and ${importedFolders.length} folders populated into workspace file tree.`
              : `\u001b[32m✔\u001b[0m Workspace initialized with ${importedFiles.length} files and ${importedFolders.length} folders.`,
            timestamp: Date.now()
          }
        ];

        set({
          files: importedFiles,
          folders: importedFolders,
          activeFileId: activeId,
          dirtyFileIds: {},
          savedFileContents: savedContents,
          gitState: newGitState,
          logs: [],
          terminalLogs: successLogs,
          testResults: { suites: [], summary: null },
          activeView: 'editor'
        });
      },

      setSharedState: (sharedState) => set((state) => ({
        ...state,
        ...sharedState,
        isRunning: false,
        logs: [],
      })),
      resetToDefault: () => set({ 
        files: DEFAULT_FILES, 
        folders: [], 
        activeFileId: 'index-js', 
        activeView: 'editor',
        dirtyFileIds: {},
        savedFileContents: {
          'index-js': DEFAULT_FILES[0].content,
          'index-test-js': DEFAULT_FILES[1].content,
          'index-html': DEFAULT_FILES[2].content,
          'styles-css': DEFAULT_FILES[3].content,
        },
        logs: [], 
        isConsoleVisible: false,
        isServerRunning: false,
        testResults: { suites: [], summary: null },
      }),
    }),
    {
      name: 'js-playground-storage',
      partialize: (state) => ({
        files: state.files,
        folders: state.folders,
        activeFileId: state.activeFileId,
        savedFileContents: state.savedFileContents,
        theme: state.theme,
        accentColor: state.accentColor,
        fontSize: state.fontSize,
        fontFamily: state.fontFamily,
        lineNumbers: state.lineNumbers,
        wordWrap: state.wordWrap,
        minimap: state.minimap,
        themePreset: state.themePreset,
        autoFormat: state.autoFormat,
        gitState: state.gitState,
      }),
    }
  )
);

