import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Search, 
  Play, 
  Sparkles, 
  Save, 
  FilePlus, 
  FolderPlus, 
  Code, 
  Terminal, 
  Tv, 
  ListOrdered, 
  CheckSquare, 
  FileText, 
  Settings, 
  Trash2, 
  Download, 
  Copy, 
  Bot, 
  Layers, 
  X, 
  Server, 
  Check, 
  ArrowRight,
  Eye,
  FolderGit2,
  FileArchive,
  Palette,
  Eraser
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface CommandItem {
  id: string;
  category: 'Execution' | 'Editor' | 'Views' | 'Files' | 'Testing' | 'Settings';
  title: string;
  subtitle?: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setCommandPaletteOpen,
    activeFileId,
    files,
    setActiveView,
    setIsRunning,
    formatActiveFile,
    saveFile,
    saveAllFiles,
    runTests,
    createSampleTestFile,
    isSidebarOpen,
    setSidebarOpen,
    isConsoleVisible,
    setConsoleVisible,
    isAIPanelVisible,
    setAIPanelVisible,
    minimap,
    setMinimap,
    wordWrap,
    setWordWrap,
    lineNumbers,
    setLineNumbers,
    autoFormat,
    setAutoFormat,
    clearLogs,
    clearTerminalLogs,
    isServerRunning,
    setServerRunning,
    addFile,
    addFolder,
    resetToDefault,
    setGitModalOpen,
    setExportModalOpen,
    setSettingsModalOpen,
    loadStarterTemplate
  } = useStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const activeFile = files.find(f => f.id === activeFileId);

  // Focus input on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Command Palette definitions
  const commands: CommandItem[] = useMemo(() => {
    return [
      // Testing Commands
      {
        id: 'run-all-tests',
        category: 'Testing',
        title: 'Run All Unit Tests',
        subtitle: 'Execute full test suite across all workspace files',
        shortcut: 'Ctrl+Shift+T',
        icon: <CheckSquare size={16} className="text-emerald-400" />,
        keywords: ['test', 'jest', 'vitest', 'unit', 'assert', 'expect', 'run tests'],
        action: async () => {
          setActiveView('tests');
          toast.info('Running all unit tests...');
          await runTests();
        }
      },
      {
        id: 'run-active-test',
        category: 'Testing',
        title: 'Run Active Test File',
        subtitle: `Execute tests in ${activeFile?.name || 'current file'}`,
        icon: <Play size={16} className="text-emerald-300" />,
        keywords: ['test', 'active', 'file', 'spec'],
        action: async () => {
          setActiveView('tests');
          if (activeFileId) {
            toast.info(`Running tests for ${activeFile?.name}...`);
            await runTests(activeFileId);
          }
        }
      },
      {
        id: 'create-sample-test',
        category: 'Testing',
        title: 'Create Sample Test File',
        subtitle: 'Generate math.test.js with test suites and assertions',
        icon: <FilePlus size={16} className="text-emerald-400" />,
        keywords: ['new test', 'sample', 'math.test.js', 'spec', 'jest'],
        action: () => {
          createSampleTestFile();
          setActiveView('editor');
          toast.success('Created sample unit test file');
        }
      },

      // Execution Commands
      {
        id: 'run-code',
        category: 'Execution',
        title: 'Run Code in Sandbox',
        subtitle: 'Execute current JavaScript in preview sandbox',
        shortcut: 'Ctrl+Enter',
        icon: <Play size={16} className="text-emerald-400" />,
        keywords: ['run', 'exec', 'execute', 'start', 'play', 'evaluate'],
        action: () => {
          setIsRunning(true);
          saveFile();
          toast.success('Running JavaScript code...');
        }
      },
      {
        id: 'toggle-server',
        category: 'Execution',
        title: isServerRunning ? 'Stop Simulated Server' : 'Start Simulated Node.js Server',
        subtitle: isServerRunning ? 'Terminate port 3000 server instance' : 'Launch local express mock server on port 3000',
        icon: <Server size={16} className="text-blue-400" />,
        keywords: ['server', 'port', 'express', 'node', 'start', 'stop'],
        action: () => {
          setServerRunning(!isServerRunning, 3000);
          toast.success(isServerRunning ? 'Server stopped' : 'Server started on port 3000');
        }
      },

      // Editor & Formatting Commands
      {
        id: 'format-document',
        category: 'Editor',
        title: 'Format Document (Prettier)',
        subtitle: 'Beautify and auto-indent code in active editor tab',
        shortcut: 'Shift+Alt+F',
        icon: <Sparkles size={16} className="text-amber-400" />,
        keywords: ['format', 'prettier', 'beautify', 'indent', 'clean', 'style'],
        action: async () => {
          const formatted = await formatActiveFile();
          if (formatted) {
            toast.success(`Formatted ${activeFile?.name || 'document'}`);
          } else {
            toast.info('Document is already cleanly formatted');
          }
        }
      },
      {
        id: 'save-active-file',
        category: 'Editor',
        title: 'Save Active File',
        subtitle: `Persist changes in ${activeFile?.name || 'current file'}`,
        shortcut: 'Ctrl+S',
        icon: <Save size={16} className="text-blue-400" />,
        keywords: ['save', 'disk', 'persist'],
        action: () => {
          saveFile();
          toast.success(`Saved ${activeFile?.name || 'file'}`);
        }
      },
      {
        id: 'save-all-files',
        category: 'Editor',
        title: 'Save All Files',
        subtitle: 'Persist changes across all workspace files',
        shortcut: 'Ctrl+Alt+S',
        icon: <Save size={16} className="text-cyan-400" />,
        keywords: ['save all', 'bulk save'],
        action: () => {
          saveAllFiles();
          toast.success('Saved all workspace files');
        }
      },
      {
        id: 'toggle-minimap',
        category: 'Editor',
        title: minimap ? 'Disable Editor Minimap' : 'Enable Editor Minimap',
        subtitle: 'Toggle code overview thumbnail strip',
        icon: <Eye size={16} className="text-purple-400" />,
        keywords: ['minimap', 'map', 'scroll', 'overview'],
        action: () => {
          setMinimap(!minimap);
          toast.info(`Minimap ${!minimap ? 'enabled' : 'disabled'}`);
        }
      },
      {
        id: 'toggle-wordwrap',
        category: 'Editor',
        title: wordWrap === 'on' ? 'Disable Word Wrap' : 'Enable Word Wrap',
        subtitle: 'Soft wrap long code lines without horizontal scrolling',
        icon: <FileText size={16} className="text-sky-400" />,
        keywords: ['wrap', 'wordwrap', 'lines', 'scroll'],
        action: () => {
          const next = wordWrap === 'on' ? 'off' : 'on';
          setWordWrap(next);
          toast.info(`Word wrap ${next === 'on' ? 'enabled' : 'disabled'}`);
        }
      },
      {
        id: 'toggle-linenumbers',
        category: 'Editor',
        title: lineNumbers === 'on' ? 'Hide Line Numbers' : 'Show Line Numbers',
        subtitle: 'Toggle gutter line numbers in Monaco editor',
        icon: <ListOrdered size={16} className="text-zinc-400" />,
        keywords: ['line', 'numbers', 'gutter'],
        action: () => {
          const next = lineNumbers === 'on' ? 'off' : 'on';
          setLineNumbers(next);
          toast.info(`Line numbers ${next === 'on' ? 'visible' : 'hidden'}`);
        }
      },
      {
        id: 'toggle-autoformat',
        category: 'Editor',
        title: autoFormat ? 'Disable Auto-Format on Save' : 'Enable Auto-Format on Save',
        subtitle: 'Automatically format files whenever saved',
        icon: <Sparkles size={16} className="text-amber-400" />,
        keywords: ['autoformat', 'prettier', 'format on save'],
        action: () => {
          setAutoFormat(!autoFormat);
          toast.info(`Auto-format ${!autoFormat ? 'enabled' : 'disabled'}`);
        }
      },

      // View Navigation
      {
        id: 'view-editor',
        category: 'Views',
        title: 'Switch to Code Editor',
        subtitle: 'View Monaco editor with file tabs',
        icon: <Code size={16} className="text-blue-400" />,
        keywords: ['editor', 'code', 'tab', 'monaco', 'write'],
        action: () => setActiveView('editor')
      },
      {
        id: 'view-tests',
        category: 'Views',
        title: 'Switch to Unit Test Runner',
        subtitle: 'Inspect test suites, assertions, and pass/fail metrics',
        icon: <CheckSquare size={16} className="text-emerald-400" />,
        keywords: ['tests', 'vitest', 'jest', 'unit', 'runner'],
        action: () => setActiveView('tests')
      },
      {
        id: 'view-console',
        category: 'Views',
        title: 'Switch to Console View',
        subtitle: 'Full-screen real-time console log viewer',
        icon: <ListOrdered size={16} className="text-yellow-400" />,
        keywords: ['console', 'logs', 'output', 'print'],
        action: () => setActiveView('console')
      },
      {
        id: 'view-terminal',
        category: 'Views',
        title: 'Switch to Terminal View',
        subtitle: 'Interactive command-line shell with Node/npm emulation',
        icon: <Terminal size={16} className="text-green-400" />,
        keywords: ['terminal', 'shell', 'bash', 'node', 'cli'],
        action: () => setActiveView('terminal')
      },
      {
        id: 'view-preview',
        category: 'Views',
        title: 'Switch to Live Preview',
        subtitle: 'Render interactive DOM output & responsive canvas',
        icon: <Tv size={16} className="text-purple-400" />,
        keywords: ['preview', 'render', 'html', 'dom', 'browser'],
        action: () => setActiveView('preview')
      },
      {
        id: 'toggle-sidebar',
        category: 'Views',
        title: isSidebarOpen ? 'Hide File Explorer Sidebar' : 'Show File Explorer Sidebar',
        subtitle: 'Toggle left directory tree panel',
        shortcut: 'Ctrl+B',
        icon: <Layers size={16} className="text-indigo-400" />,
        keywords: ['sidebar', 'explorer', 'files', 'tree'],
        action: () => setSidebarOpen(!isSidebarOpen)
      },
      {
        id: 'toggle-console-panel',
        category: 'Views',
        title: isConsoleVisible ? 'Hide Bottom Console Panel' : 'Show Bottom Console Panel',
        subtitle: 'Toggle split console inside editor view',
        shortcut: 'Ctrl+`',
        icon: <Terminal size={16} className="text-amber-400" />,
        keywords: ['console drawer', 'split console', 'bottom panel'],
        action: () => setConsoleVisible(!isConsoleVisible)
      },
      {
        id: 'toggle-ai-assistant',
        category: 'Views',
        title: isAIPanelVisible ? 'Close AI Assistant Panel' : 'Open AI Assistant Panel',
        subtitle: 'Ask AI to generate, explain, or fix JavaScript code',
        icon: <Bot size={16} className="text-purple-400" />,
        keywords: ['ai', 'gemini', 'assistant', 'chat', 'generate'],
        action: () => setAIPanelVisible(!isAIPanelVisible)
      },

      // File Management
      {
        id: 'new-file',
        category: 'Files',
        title: 'New JavaScript File...',
        subtitle: 'Create a new script file in workspace',
        icon: <FilePlus size={16} className="text-blue-400" />,
        keywords: ['create file', 'new file', 'add file'],
        action: () => {
          const name = `script-${files.length + 1}.js`;
          addFile(name, 'javascript', null);
          setActiveView('editor');
          toast.success(`Created ${name}`);
        }
      },
      {
        id: 'new-folder',
        category: 'Files',
        title: 'New Folder...',
        subtitle: 'Create a new directory in workspace',
        icon: <FolderPlus size={16} className="text-amber-400" />,
        keywords: ['create folder', 'new directory', 'mkdir'],
        action: () => {
          const name = `folder-${Date.now().toString().slice(-4)}`;
          addFolder(name, null);
          toast.success(`Created folder ${name}`);
        }
      },
      {
        id: 'copy-active-code',
        category: 'Files',
        title: 'Copy Active File Code',
        subtitle: `Copy content of ${activeFile?.name || 'file'} to clipboard`,
        icon: <Copy size={16} className="text-cyan-400" />,
        keywords: ['copy', 'clipboard', 'share code'],
        action: () => {
          if (activeFile) {
            navigator.clipboard.writeText(activeFile.content);
            toast.success(`Copied ${activeFile.name} to clipboard`);
          }
        }
      },
      {
        id: 'download-file',
        category: 'Files',
        title: 'Download Active File',
        subtitle: `Export ${activeFile?.name || 'file'} as local file`,
        icon: <Download size={16} className="text-green-400" />,
        keywords: ['download', 'export file', 'save as'],
        action: () => {
          if (!activeFile) return;
          const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = activeFile.name;
          a.click();
          URL.revokeObjectURL(url);
          toast.success(`Downloaded ${activeFile.name}`);
        }
      },

      {
        id: 'export-project-zip',
        category: 'Files',
        title: 'Export Project (ZIP Archive)',
        subtitle: 'Download complete workspace including all files and structure',
        icon: <FileArchive size={16} className="text-emerald-400" />,
        keywords: ['export', 'zip', 'archive', 'download project', 'save all'],
        action: () => {
          setExportModalOpen(true);
        }
      },
      {
        id: 'git-clone-repo',
        category: 'Files',
        title: 'Git & GitHub Integration',
        subtitle: 'Clone public repositories or load starter templates',
        icon: <FolderGit2 size={16} className="text-[#58a6ff]" />,
        keywords: ['git', 'github', 'clone', 'repo', 'template', 'starter'],
        action: () => {
          setGitModalOpen(true);
        }
      },

      // Tools & Cleanup
      {
        id: 'open-theme-settings',
        category: 'Settings',
        title: 'Themes & Editor Preferences',
        subtitle: 'Customize editor font, syntax theme presets, and tab sizes',
        icon: <Palette size={16} className="text-[#007acc]" />,
        keywords: ['theme', 'font', 'dark', 'light', 'monokai', 'dracula', 'settings', 'color'],
        action: () => {
          setSettingsModalOpen(true);
        }
      },
      {
        id: 'clear-console-logs',
        category: 'Settings',
        title: 'Clear Console Logs',
        subtitle: 'Remove all execution output and print logs',
        icon: <Eraser size={16} className="text-amber-400" />,
        keywords: ['clear', 'console', 'clean logs', 'cls', 'erase'],
        action: () => {
          clearLogs();
          toast.info('Console logs cleared');
        }
      },
      {
        id: 'clear-terminal-logs',
        category: 'Settings',
        title: 'Clear Terminal Output',
        subtitle: 'Reset simulated shell scroll history',
        icon: <Trash2 size={16} className="text-orange-400" />,
        keywords: ['clear terminal', 'reset cli', 'cls'],
        action: () => {
          clearTerminalLogs();
          toast.info('Terminal output cleared');
        }
      },
      {
        id: 'reset-workspace',
        category: 'Settings',
        title: 'Reset Workspace to Defaults',
        subtitle: 'Restore default sample files and clear state',
        icon: <Settings size={16} className="text-red-500" />,
        keywords: ['reset', 'factory', 'default', 'restore'],
        action: () => {
          if (window.confirm('Reset all files to default starter state? Any custom files will be lost.')) {
            resetToDefault();
            toast.success('Workspace reset to defaults');
          }
        }
      }
    ];
  }, [
    activeFile,
    activeFileId,
    files,
    isSidebarOpen,
    isConsoleVisible,
    isAIPanelVisible,
    minimap,
    wordWrap,
    lineNumbers,
    autoFormat,
    isServerRunning,
    formatActiveFile,
    saveFile,
    saveAllFiles,
    runTests,
    createSampleTestFile,
    setActiveView,
    setIsRunning,
    setSidebarOpen,
    setConsoleVisible,
    setAIPanelVisible,
    setMinimap,
    setWordWrap,
    setLineNumbers,
    setAutoFormat,
    clearLogs,
    clearTerminalLogs,
    setServerRunning,
    addFile,
    addFolder,
    resetToDefault
  ]);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase().trim();
    return commands.filter((cmd) => {
      if (cmd.title.toLowerCase().includes(lower)) return true;
      if (cmd.subtitle?.toLowerCase().includes(lower)) return true;
      if (cmd.category.toLowerCase().includes(lower)) return true;
      if (cmd.keywords?.some((k) => k.toLowerCase().includes(lower))) return true;
      return false;
    });
  }, [commands, query]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside Palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCommandPaletteOpen(false);
    }
  };

  const executeCommand = (cmd: CommandItem) => {
    setCommandPaletteOpen(false);
    cmd.action();
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-[#1e1e1e] border border-[#3e3e42] shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-[#333333] bg-[#252526] gap-3">
          <Search size={18} className="text-[#888888] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search actions... (Esc to close)"
            className="flex-1 bg-transparent text-sm text-white placeholder-[#777777] outline-none font-sans"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-[#888888] hover:text-white p-1 rounded transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#3e3e42]">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#333333] text-[#aaaaaa] rounded border border-[#444444]">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 divide-y divide-[#2a2a2a] max-h-[55vh] scrollbar-thin scrollbar-thumb-[#3e3e42]"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-[#888888] text-sm">
              No matching commands found for &ldquo;<span className="text-white">{query}</span>&rdquo;
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-xs ${
                    isSelected
                      ? 'bg-[#007acc]/20 text-white border border-[#007acc]/40'
                      : 'text-[#cccccc] hover:bg-[#282828] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-1.5 rounded-md bg-[#252526] shrink-0">
                      {cmd.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white truncate">{cmd.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#333333] text-[#888888] font-mono uppercase">
                          {cmd.category}
                        </span>
                      </div>
                      {cmd.subtitle && (
                        <p className="text-[11px] text-[#888888] truncate mt-0.5">
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-3 shrink-0">
                    {cmd.shortcut ? (
                      <kbd className="px-2 py-0.5 text-[11px] font-mono bg-[#2d2d2d] text-cyan-300 rounded border border-[#3e3e42] shadow-xs">
                        {cmd.shortcut}
                      </kbd>
                    ) : (
                      isSelected && (
                        <ArrowRight size={13} className="text-[#007acc] animate-pulse" />
                      )
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2 border-t border-[#333333] bg-[#1a1a1a] text-[11px] text-[#777777] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-[#252526] rounded border border-[#3e3e42] text-[10px]">↑</kbd>
              <kbd className="px-1 py-0.5 bg-[#252526] rounded border border-[#3e3e42] text-[10px]">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#252526] rounded border border-[#3e3e42] text-[10px]">↵</kbd>
              Execute
            </span>
          </div>
          <div>
            <span>{filteredCommands.length} available actions</span>
          </div>
        </div>
      </div>
    </div>
  );
};
