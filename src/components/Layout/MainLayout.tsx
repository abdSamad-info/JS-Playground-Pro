import React, { useEffect, useState } from 'react';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/shadcn-ui/resizable';
import { ActionsToolbar } from '@/components/Toolbar/ActionsToolbar';
import { FileExplorer } from '@/components/Sidebar/FileExplorer';
import { CodeEditor } from '@/components/Editor/CodeEditor';
import { ConsoleOutput } from '@/components/Console/ConsoleOutput';
import { SimulatedTerminal } from '@/components/Console/SimulatedTerminal';
import { LivePreview } from '@/components/Preview/LivePreview';
import { AIAssistant } from '@/components/Sidebar/AIAssistant';
import { TestRunnerView } from '@/components/TestRunner/TestRunnerView';
import { CommandPalette } from '@/components/CommandPalette/CommandPalette';
import { UnsavedChangesModal } from '@/components/Editor/UnsavedChangesModal';
import { useStore } from '@/store/useStore';
import { Toaster } from '@/components/shadcn-ui/sonner';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs';
import { 
  X, 
  Plus, 
  Terminal, 
  ListOrdered, 
  Tv, 
  Code2, 
  Server, 
  Check, 
  AlertTriangle,
  FileCode,
  FileJson,
  FileText,
  FileSpreadsheet,
  CheckSquare,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { TooltipProvider } from '@/components/shadcn-ui/tooltip';
import { File } from '@/types/index';

export const MainLayout: React.FC = () => {
  const { 
    files, 
    activeFileId, 
    setActiveFileId, 
    dirtyFileIds,
    saveFile,
    revertFileChanges,
    deleteFile,
    addFile,
    isSidebarOpen,
    setSidebarOpen,
    activeView,
    setActiveView,
    isConsoleVisible, 
    setConsoleVisible,
    isAIPanelVisible,
    setIsRunning,
    isServerRunning,
    serverPort,
    accentColor,
    fontSize,
    fontFamily,
    themePreset,
    setSharedState,
    formatActiveFile,
    runTests,
    setCommandPaletteOpen
  } = useStore();

  const [isLargeScreen, setIsLargeScreen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [fileToClosePrompt, setFileToClosePrompt] = useState<File | null>(null);
  const [editorBottomTab, setEditorBottomTab] = useState<'console' | 'terminal'>('console');

  // Check URL parameters for shared workspace
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedCode = params.get('code');
    if (sharedCode) {
      try {
        const decoded = JSON.parse(atob(sharedCode));
        setSharedState(decoded);
        toast.success('Shared project loaded!');
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error('Failed to decode shared state', e);
        toast.error('Failed to load shared project');
      }
    }
  }, [setSharedState]);

  // Dynamic CSS Variables
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.documentElement.style.setProperty('--editor-font-size', `${fontSize}px`);
    document.documentElement.style.setProperty('--editor-font-family', fontFamily);
    document.documentElement.setAttribute('data-theme-preset', themePreset);
  }, [accentColor, fontSize, fontFamily, themePreset]);

  // Window Resize Listener
  useEffect(() => {
    const handleResize = () => {
      const large = window.innerWidth >= 768;
      setIsLargeScreen(large);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette: Ctrl + Shift + P or Cmd + Shift + P
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Format Document: Shift + Alt + F or Shift + Option + F
      if (e.shiftKey && e.altKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        formatActiveFile().then((changed) => {
          if (changed) toast.success('Formatted document with Prettier');
          else toast.info('Document is already formatted');
        });
        return;
      }

      // Run Unit Tests: Ctrl + Shift + T or Cmd + Shift + T
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'T' || e.key === 't')) {
        e.preventDefault();
        setActiveView('tests');
        runTests();
        toast.info('Running unit tests...');
        return;
      }

      // Run Code: Ctrl + Enter or Cmd + Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        setIsRunning(true);
        saveFile();
        if (activeView === 'editor') {
          setConsoleVisible(true);
        }
        toast.success('Running JavaScript code...');
        return;
      }
      
      // Save: Ctrl + S or Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
        toast.success('Saved active file changes');
        return;
      }

      // Toggle Explorer: Ctrl + B or Cmd + B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen(!isSidebarOpen);
        return;
      }

      // Toggle Console Drawer: Ctrl + `
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setConsoleVisible(!isConsoleVisible);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isSidebarOpen, 
    setSidebarOpen, 
    isConsoleVisible, 
    setConsoleVisible, 
    setIsRunning, 
    saveFile, 
    activeView, 
    formatActiveFile, 
    runTests, 
    setCommandPaletteOpen,
    setActiveView
  ]);

  const activeFile = files.find(f => f.id === activeFileId);
  const dirtyCount = Object.values(dirtyFileIds).filter(Boolean).length;

  const handleRequestCloseFile = (file: File, e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length <= 1) {
      toast.info('At least one file must remain open in the editor.');
      return;
    }

    if (dirtyFileIds[file.id]) {
      setFileToClosePrompt(file);
    } else {
      deleteFile(file.id);
    }
  };

  const handleSaveAndClose = () => {
    if (fileToClosePrompt) {
      saveFile(fileToClosePrompt.id);
      deleteFile(fileToClosePrompt.id);
      toast.success(`Saved and closed ${fileToClosePrompt.name}`);
      setFileToClosePrompt(null);
    }
  };

  const handleDiscardAndClose = () => {
    if (fileToClosePrompt) {
      revertFileChanges(fileToClosePrompt.id);
      deleteFile(fileToClosePrompt.id);
      toast.info(`Closed ${fileToClosePrompt.name} without saving`);
      setFileToClosePrompt(null);
    }
  };

  const getFileTabIcon = (lang: string, name: string) => {
    if (name.includes('.test.') || name.includes('.spec.')) {
      return <CheckSquare size={13} className="text-emerald-400 shrink-0" />;
    }
    if (name.endsWith('.ts') || name.endsWith('.tsx') || lang === 'typescript') {
      return <FileCode size={13} className="text-sky-400 shrink-0" />;
    }
    if (name.endsWith('.json') || lang === 'json') {
      return <FileJson size={13} className="text-amber-400 shrink-0" />;
    }
    if (name.endsWith('.html') || lang === 'html') {
      return <FileText size={13} className="text-orange-500 shrink-0" />;
    }
    if (name.endsWith('.css') || lang === 'css') {
      return <FileSpreadsheet size={13} className="text-cyan-400 shrink-0" />;
    }
    return <FileCode size={13} className="text-yellow-400 shrink-0" />;
  };

  return (
    <TooltipProvider>
      <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden font-sans select-none">
        {/* Top Navbar */}
        <ActionsToolbar />

        {/* Main Body Workspace */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Mobile Explorer Backdrop */}
          <AnimatePresence>
            {!isLargeScreen && isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="absolute inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
              />
            )}
          </AnimatePresence>

          {/* Left Sidebar (File Explorer) */}
          <motion.div 
            initial={false}
            animate={{ 
              width: isSidebarOpen ? (isLargeScreen ? 250 : 280) : 0,
              x: !isLargeScreen && !isSidebarOpen ? -280 : 0
            }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={cn(
              "h-full shrink-0 z-50 bg-[#252526] border-r border-[#3e3e42] overflow-hidden flex flex-col",
              !isLargeScreen && "absolute left-0 top-0 shadow-2xl"
            )}
            style={{ width: isSidebarOpen ? (isLargeScreen ? 250 : 280) : 0 }}
          >
            <div className="w-[250px] md:w-[250px] h-full flex flex-col">
              <FileExplorer />
            </div>
          </motion.div>

          {/* Right Workspace Area */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* When viewing Editor: Show File Tabs */}
            {activeView === 'editor' && (
              <div className="h-9 bg-[#252526] border-b border-[#3e3e42] flex items-center px-1 overflow-x-auto scrollbar-hide shrink-0 justify-between">
                <div className="flex items-center gap-0.5 min-w-0">
                  {files.map(file => {
                    const isActive = activeFileId === file.id;
                    const isDirty = Boolean(dirtyFileIds[file.id]);

                    return (
                      <div 
                        key={file.id} 
                        onClick={() => setActiveFileId(file.id)}
                        className={cn(
                          "group h-8 px-3 rounded-t text-xs flex items-center gap-2 cursor-pointer border-r border-[#333333] transition-colors relative shrink-0",
                          isActive 
                            ? "bg-[#1e1e1e] text-white font-medium border-t-2 border-t-[#007acc]" 
                            : "bg-[#2d2d2d] text-[#888888] hover:text-[#cccccc] hover:bg-[#282828]"
                        )}
                      >
                        {getFileTabIcon(file.language, file.name)}
                        <span className="truncate max-w-[130px]">{file.name}</span>

                        {isDirty ? (
                          <span 
                            className="w-2 h-2 rounded-full bg-amber-400 shrink-0" 
                            title="Unsaved changes" 
                          />
                        ) : (
                          files.length > 1 && (
                            <button
                              title="Close File"
                              onClick={(e) => handleRequestCloseFile(file, e)}
                              className="opacity-0 group-hover:opacity-100 hover:bg-[#454545] p-0.5 rounded text-[#888888] hover:text-white transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center px-2 shrink-0">
                  <button
                    title="Add File to Workspace"
                    onClick={() => addFile(`script-${files.length + 1}.js`, 'javascript', null)}
                    className="p-1 text-[#888888] hover:text-white hover:bg-[#3e3e42] rounded transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* View Containers based on activeView */}
            <div className="flex-1 flex overflow-hidden relative">
              {/* 1. CODE EDITOR VIEW */}
              {activeView === 'editor' && (
                <div className="flex-1 flex overflow-hidden">
                  {isLargeScreen ? (
                    <ResizablePanelGroup direction="horizontal" className="flex-1">
                      <ResizablePanel defaultSize={isConsoleVisible ? 62 : 100} minSize={30}>
                        <CodeEditor />
                      </ResizablePanel>

                      {isConsoleVisible && (
                        <>
                          <ResizableHandle className="w-[2px] bg-[#3e3e42] hover:bg-[#007acc] transition-colors" />
                          <ResizablePanel defaultSize={38} minSize={20} className="flex flex-col bg-[#1e1e1e]">
                            <div className="h-8 bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between px-2 shrink-0">
                              <Tabs value={editorBottomTab} onValueChange={(v: any) => setEditorBottomTab(v)}>
                                <TabsList className="bg-transparent h-8 p-0 gap-3">
                                  <TabsTrigger 
                                    value="console"
                                    className="h-8 rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-[#007acc] data-[state=active]:text-white text-[#888888] text-[11px] uppercase font-bold tracking-wider px-1.5"
                                  >
                                    Console
                                  </TabsTrigger>
                                  <TabsTrigger 
                                    value="terminal"
                                    className="h-8 rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-[#007acc] data-[state=active]:text-white text-[#888888] text-[11px] uppercase font-bold tracking-wider px-1.5"
                                  >
                                    Terminal
                                  </TabsTrigger>
                                </TabsList>
                              </Tabs>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setConsoleVisible(false)}
                                className="h-6 w-6 text-[#888888] hover:text-white"
                              >
                                <X size={13} />
                              </Button>
                            </div>
                            <div className="flex-1 overflow-hidden">
                              {editorBottomTab === 'console' ? <ConsoleOutput /> : <SimulatedTerminal />}
                            </div>
                          </ResizablePanel>
                        </>
                      )}

                      {isAIPanelVisible && (
                        <>
                          <ResizableHandle className="w-[2px] bg-[#3e3e42] hover:bg-[#007acc] transition-colors" />
                          <ResizablePanel defaultSize={30} minSize={20}>
                            <AIAssistant />
                          </ResizablePanel>
                        </>
                      )}
                    </ResizablePanelGroup>
                  ) : (
                    <div className="flex-1 flex flex-col overflow-hidden relative">
                      <CodeEditor />
                      {isAIPanelVisible && (
                        <div className="absolute inset-0 bg-[#252526] z-30">
                          <AIAssistant />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 2. DEDICATED TEST RUNNER VIEW */}
              {activeView === 'tests' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <TestRunnerView />
                </div>
              )}

              {/* 3. DEDICATED CONSOLE PAGE/VIEW */}
              {activeView === 'console' && (
                <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
                  <div className="h-8 bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between px-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <ListOrdered size={14} className="text-blue-400" />
                      <span className="text-xs font-semibold text-white">Full Console Output</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setActiveView('editor')}
                      className="h-6 text-[11px] bg-[#333333] hover:bg-[#444444] text-white"
                    >
                      Back to Editor
                    </Button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <ConsoleOutput />
                  </div>
                </div>
              )}

              {/* 4. DEDICATED TERMINAL PAGE/VIEW */}
              {activeView === 'terminal' && (
                <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
                  <div className="h-8 bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between px-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <Terminal size={14} className="text-emerald-400" />
                      <span className="text-xs font-semibold text-white">Full Simulated Terminal</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setActiveView('editor')}
                      className="h-6 text-[11px] bg-[#333333] hover:bg-[#444444] text-white"
                    >
                      Back to Editor
                    </Button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <SimulatedTerminal />
                  </div>
                </div>
              )}

              {/* 5. DEDICATED LIVE PREVIEW PAGE/VIEW */}
              {activeView === 'preview' && (
                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                  <div className="h-8 bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between px-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <Tv size={14} className="text-purple-400" />
                      <span className="text-xs font-semibold text-white">Live Application Preview</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setActiveView('editor')}
                      className="h-6 text-[11px] bg-[#333333] hover:bg-[#444444] text-white"
                    >
                      Back to Editor
                    </Button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <LivePreview />
                  </div>
                </div>
              )}

              {/* Background runner for sandbox state & logs */}
              {activeView !== 'preview' && (
                <div className="hidden">
                  <LivePreview />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <footer className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-[11px] shrink-0 select-none z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Node.js v20</span>
            </div>

            {isServerRunning && (
              <div className="flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded text-[10px]">
                <Server size={10} />
                <span>Port {serverPort} (Live)</span>
              </div>
            )}

            {dirtyCount > 0 ? (
              <span className="text-amber-200 font-medium">
                ● {dirtyCount} unsaved {dirtyCount === 1 ? 'file' : 'files'}
              </span>
            ) : (
              <span className="text-white/80 flex items-center gap-1">
                <Check size={11} /> Saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-white/90">
            <span className="hidden sm:inline">UTF-8</span>
            <span className="hidden sm:inline">Spaces: 2</span>
            <span>{activeFile?.language?.toUpperCase() || 'JAVASCRIPT'}</span>
            <span className="hidden md:inline">Prettier</span>
          </div>
        </footer>

        {/* Searchable Command Palette */}
        <CommandPalette />

        {/* Unsaved Changes Confirmation Modal */}
        <UnsavedChangesModal
          isOpen={Boolean(fileToClosePrompt)}
          file={fileToClosePrompt}
          onSaveAndClose={handleSaveAndClose}
          onDiscardAndClose={handleDiscardAndClose}
          onCancel={() => setFileToClosePrompt(null)}
        />

        <Toaster position="bottom-right" theme="dark" />
      </div>
    </TooltipProvider>
  );
};
