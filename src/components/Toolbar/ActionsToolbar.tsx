import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Play, 
  RotateCcw, 
  Download, 
  Upload, 
  Share2, 
  Copy, 
  Settings2,
  Save,
  Trash2,
  ExternalLink,
  Terminal,
  Sparkles,
  MoreHorizontal,
  PanelLeft,
  Code2,
  Tv,
  ListOrdered,
  Keyboard,
  Check,
  CheckSquare,
  Search,
  FolderGit2,
  Palette,
  FileArchive,
  Eraser
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { Button } from '@/components/shadcn-ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/shadcn-ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/shadcn-ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generateSandboxContent } from '@/lib/sandbox';
import { SettingsModal } from './SettingsModal';
import { ShortcutsModal } from './ShortcutsModal';
import { GitModal } from '../Git/GitModal';
import { ExportModal } from './ExportModal';

export const ActionsToolbar: React.FC = () => {
  const { 
    files, 
    folders,
    activeFileId, 
    updateFileContent, 
    isRunning, 
    setIsRunning, 
    clearLogs, 
    resetToDefault,
    isConsoleVisible,
    setConsoleVisible,
    isAIPanelVisible,
    setAIPanelVisible,
    isSidebarOpen,
    toggleSidebar,
    activeView,
    setActiveView,
    dirtyFileIds,
    saveFile,
    saveAllFiles,
    formatActiveFile,
    testResults,
    setCommandPaletteOpen,
    isGitModalOpen,
    setGitModalOpen,
    isExportModalOpen,
    setExportModalOpen,
    isSettingsModalOpen,
    setSettingsModalOpen,
    logs
  } = useStore();

  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const activeFile = files.find(f => f.id === activeFileId);
  const isCurrentFileDirty = Boolean(activeFile && dirtyFileIds[activeFile.id]);

  const handleRun = () => {
    setIsRunning(true);
    saveAllFiles();
    if (activeView === 'editor') {
      setConsoleVisible(true);
    }
    toast.success('Executing JavaScript...', { duration: 1200 });
  };

  const handleFormat = async () => {
    setIsFormatting(true);
    try {
      const changed = await formatActiveFile();
      if (changed) {
        toast.success(`Formatted ${activeFile?.name || 'document'} with Prettier`);
      } else {
        toast.info('Document already cleanly formatted');
      }
    } catch (e) {
      toast.error('Formatting error occurred');
    } finally {
      setIsFormatting(false);
    }
  };

  const handleManualSave = () => {
    setIsSavingLocal(true);
    saveFile(activeFileId);
    setTimeout(() => {
      setIsSavingLocal(false);
      toast.success(`Saved ${activeFile?.name || 'file'}`);
    }, 300);
  };

  const handlePreviewInNewTab = () => {
    const content = generateSandboxContent(files, activeFileId);
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    toast.info('Opened sandbox preview in new tab');
  };

  const handleCopy = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      toast.success('Active code copied to clipboard');
    }
  };

  const handleShare = () => {
    const state = { files, folders, activeFileId };
    const encoded = btoa(JSON.stringify(state));
    const url = `${window.location.origin}${window.location.pathname}?code=${encoded}`;
    navigator.clipboard.writeText(url);
    toast.success('Shareable link copied to clipboard!');
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        updateFileContent(activeFileId, content);
        toast.success(`Loaded ${file.name}`);
      };
      reader.readAsText(file);
    }
  };

  const handleClearConsole = () => {
    clearLogs();
    toast.info('Console logs cleared');
  };

  const totalTests = testResults.summary?.totalTests || 0;
  const passedTests = testResults.summary?.passedTests || 0;
  const failedTests = testResults.summary?.failedTests || 0;

  return (
    <>
      <header className="h-11 md:h-12 bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between px-1.5 sm:px-3 shrink-0 select-none z-30 w-full overflow-x-auto no-scrollbar gap-1 sm:gap-2">
        {/* Left Section: Sidebar Toggle & Branding */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={cn(
                  "h-7 w-7 sm:h-8 sm:w-8 text-[#cccccc] hover:text-white hover:bg-[#333333] rounded transition-colors",
                  isSidebarOpen && "text-[#58a6ff] bg-[#333333]/70"
                )}
              >
                <PanelLeft size={15} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Toggle Explorer (Ctrl+B)</TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-1.5">
            <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 bg-[#007acc] rounded flex items-center justify-center shadow-xs">
              <span className="text-white font-bold text-[10px] sm:text-[11px] tracking-tighter">JS</span>
            </div>
            <span className="text-xs sm:text-[13px] font-semibold text-white tracking-tight hidden lg:inline-block">
              Playground
            </span>
          </div>

          {/* Search / Command Palette trigger on larger screens */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden 2xl:flex items-center gap-2 h-7 px-2.5 bg-[#1e1e1e] hover:bg-[#2a2a2e] text-[#888888] hover:text-zinc-200 border border-[#3e3e42] rounded-md text-[11px] font-normal transition-colors"
          >
            <Search size={12} className="text-[#888888]" />
            <span>Search actions...</span>
            <kbd className="px-1 py-0.2 bg-[#2d2d2d] text-[#888888] rounded text-[9px] font-mono border border-[#444444]">
              ⌘P
            </kbd>
          </button>
        </div>

        {/* Center Section: Run Action & View Switcher */}
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 shrink-0">
          {/* Green Run Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleRun} 
                disabled={isRunning}
                className="bg-emerald-600 hover:bg-emerald-500 text-white h-7 sm:h-8 px-2 sm:px-3 gap-1 rounded-md text-[11px] sm:text-xs font-semibold shadow-xs transition-all active:scale-95 flex items-center shrink-0 cursor-pointer"
              >
                <Play size={11} fill="currentColor" className="text-white shrink-0" />
                <span className="hidden sm:inline">Run</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Execute JavaScript (Ctrl + Enter)</TooltipContent>
          </Tooltip>

          {/* Format Document Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                id="format-document-button"
                variant="outline"
                size="sm"
                onClick={handleFormat}
                disabled={isFormatting || !activeFile}
                className="hidden xl:flex h-7 sm:h-8 px-2 bg-[#1e1e1e] hover:bg-[#333333] text-[#cccccc] hover:text-white border-[#3e3e42] rounded-md text-xs font-medium gap-1.5 transition-colors shrink-0"
              >
                <Sparkles size={12} className={cn("text-amber-400 shrink-0", isFormatting && "animate-spin")} />
                <span>Format</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Format Document (Shift + Alt + F)</TooltipContent>
          </Tooltip>

          {/* Responsive View Tabs Switcher */}
          <div className="flex items-center bg-[#18181a] p-0.5 rounded-md border border-[#3e3e42] shrink-0">
            {/* Code Tab */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveView('editor')}
                  className={cn(
                    "flex items-center gap-1 px-1.5 sm:px-2.5 h-6 sm:h-7 rounded text-[11px] font-medium transition-all cursor-pointer",
                    activeView === 'editor' 
                      ? "bg-[#2d2d30] text-white shadow-xs font-semibold" 
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <Code2 size={13} className="text-yellow-400 shrink-0" />
                  <span className="hidden md:inline">Code</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Code Editor</TooltipContent>
            </Tooltip>

            {/* Tests Tab */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveView('tests')}
                  className={cn(
                    "flex items-center gap-1 px-1.5 sm:px-2.5 h-6 sm:h-7 rounded text-[11px] font-medium transition-all relative cursor-pointer",
                    activeView === 'tests' 
                      ? "bg-[#2d2d30] text-white shadow-xs font-semibold" 
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <CheckSquare size={13} className="text-emerald-400 shrink-0" />
                  <span className="hidden md:inline">Tests</span>
                  {totalTests > 0 && (
                    <span className={cn(
                      "px-1 py-0.2 rounded-full text-[9px] font-mono leading-none",
                      failedTests > 0 
                        ? "bg-rose-600 text-white" 
                        : "bg-emerald-600 text-white"
                    )}>
                      {passedTests}/{totalTests}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Unit Test Runner</TooltipContent>
            </Tooltip>

            {/* Console / Logs Tab */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveView('console')}
                  className={cn(
                    "flex items-center gap-1 px-1.5 sm:px-2.5 h-6 sm:h-7 rounded text-[11px] font-medium transition-all relative cursor-pointer",
                    activeView === 'console' 
                      ? "bg-[#2d2d30] text-white shadow-xs font-semibold" 
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <ListOrdered size={13} className="text-blue-400 shrink-0" />
                  <span className="hidden md:inline">Logs</span>
                  {logs.length > 0 && (
                    <span className="px-1 py-0.2 rounded-full bg-[#007acc] text-[9px] text-white font-mono leading-none">
                      {logs.length}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Console Output Logs</TooltipContent>
            </Tooltip>

            {/* Terminal Tab */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveView('terminal')}
                  className={cn(
                    "flex items-center gap-1 px-1.5 sm:px-2.5 h-6 sm:h-7 rounded text-[11px] font-medium transition-all cursor-pointer",
                    activeView === 'terminal' 
                      ? "bg-[#2d2d30] text-white shadow-xs font-semibold" 
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <Terminal size={13} className="text-emerald-400 shrink-0" />
                  <span className="hidden md:inline">Terminal</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Interactive Terminal</TooltipContent>
            </Tooltip>

            {/* Preview Tab */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveView('preview')}
                  className={cn(
                    "flex items-center gap-1 px-1.5 sm:px-2.5 h-6 sm:h-7 rounded text-[11px] font-medium transition-all cursor-pointer",
                    activeView === 'preview' 
                      ? "bg-[#2d2d30] text-white shadow-xs font-semibold" 
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <Tv size={13} className="text-purple-400 shrink-0" />
                  <span className="hidden md:inline">Preview</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Live Sandbox Preview</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Right Section: Save Status, Git, Export & Three-Dots Menu */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Git Modal Trigger */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setGitModalOpen(true)}
                className="hidden xl:flex h-7.5 w-7.5 text-zinc-300 hover:text-white hover:bg-[#333333] rounded"
              >
                <FolderGit2 size={15} className="text-[#58a6ff]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Git & GitHub Integration</TooltipContent>
          </Tooltip>

          {/* Quick Export Project Trigger */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExportModalOpen(true)}
                className="hidden xl:flex h-7.5 w-7.5 text-zinc-300 hover:text-white hover:bg-[#333333] rounded"
              >
                <FileArchive size={15} className="text-emerald-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Export Project as ZIP / JSON</TooltipContent>
          </Tooltip>

          {/* Save Button with Unsaved Indicator - ALWAYS VISIBLE */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                id="save-button"
                variant="ghost"
                size="sm"
                onClick={handleManualSave}
                disabled={isSavingLocal}
                className={cn(
                  "h-7 sm:h-8 px-1.5 sm:px-2.5 text-xs rounded gap-1 transition-colors border cursor-pointer",
                  isCurrentFileDirty 
                    ? "bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20 font-medium" 
                    : "border-transparent text-zinc-400 hover:text-white hover:bg-[#333333]"
                )}
              >
                {isSavingLocal ? (
                  <RotateCcw size={12} className="animate-spin text-[#007acc]" />
                ) : isCurrentFileDirty ? (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <Save size={13} className="text-amber-400" />
                  </div>
                ) : (
                  <Save size={13} />
                )}
                <span className="hidden sm:inline text-[11px]">
                  {isSavingLocal ? 'Saving...' : isCurrentFileDirty ? 'Save *' : 'Save'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Save Active File (Ctrl + S)</TooltipContent>
          </Tooltip>

          {/* AI Code Assistant Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAIPanelVisible(!isAIPanelVisible)}
                className={cn(
                  "h-7 w-7 sm:h-8 sm:w-8 text-zinc-300 hover:text-white hover:bg-[#333333] rounded",
                  isAIPanelVisible && "text-purple-400 bg-[#333333]"
                )}
              >
                <Sparkles size={14} className="text-purple-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">AI Code Assistant</TooltipContent>
          </Tooltip>

          {/* Three-Dot Menu - Fully Accessible & Pinned on Mobile & Desktop */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                id="three-dots-menu-button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-zinc-200 hover:text-white hover:bg-[#38383c] border border-transparent hover:border-[#444] rounded shrink-0 cursor-pointer"
              >
                <MoreHorizontal size={17} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 bg-[#222225] border-[#3e3e42] text-[#cccccc] shadow-2xl z-50">
              <DropdownMenuLabel className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                Tools & Operations
              </DropdownMenuLabel>

              <DropdownMenuItem 
                onClick={() => setCommandPaletteOpen(true)}
                className="text-xs cursor-pointer hover:bg-[#2d2d32] text-white gap-2.5 py-2"
              >
                <Search size={14} className="text-emerald-400" />
                <div className="flex items-center justify-between w-full">
                  <span>Command Palette</span>
                  <span className="text-[10px] text-zinc-400 font-mono">⌘P</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={handleFormat}
                className="text-xs cursor-pointer hover:bg-[#2d2d32] text-white gap-2.5 py-2"
              >
                <Sparkles size={14} className="text-amber-400" />
                <div className="flex items-center justify-between w-full">
                  <span>Format Document</span>
                  <span className="text-[10px] text-zinc-400 font-mono">⇧⌥F</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => setGitModalOpen(true)}
                className="text-xs cursor-pointer hover:bg-[#2d2d32] text-white gap-2.5 py-2"
              >
                <FolderGit2 size={14} className="text-[#58a6ff]" />
                <div className="flex items-center justify-between w-full">
                  <span>Git & GitHub Clone</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-[#58a6ff]/20 text-[#58a6ff]">Git</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => setExportModalOpen(true)}
                className="text-xs cursor-pointer hover:bg-[#2d2d32] text-white gap-2.5 py-2"
              >
                <FileArchive size={14} className="text-emerald-400" />
                <div className="flex items-center justify-between w-full">
                  <span>Export Project (ZIP)</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400">ZIP</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => setSettingsModalOpen(true)}
                className="text-xs cursor-pointer hover:bg-[#2d2d32] text-white gap-2.5 py-2"
              >
                <Palette size={14} className="text-[#007acc]" />
                <span>Themes & Preferences</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => setIsShortcutsOpen(true)}
                className="text-xs cursor-pointer hover:bg-[#2d2d32] text-white gap-2.5 py-2"
              >
                <Keyboard size={14} className="text-emerald-400" />
                <span>Keyboard Shortcuts</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[#333338]" />

              <DropdownMenuItem 
                onClick={handleShare}
                className="text-xs cursor-pointer hover:bg-[#2d2d32] text-white gap-2.5 py-2"
              >
                <Share2 size={14} className="text-blue-400" />
                <span>Share Playground Link</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={handleCopy}
                className="text-xs cursor-pointer hover:bg-[#2d2d32] text-white gap-2.5 py-2"
              >
                <Copy size={14} className="text-zinc-400" />
                <span>Copy Active File Code</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={handlePreviewInNewTab}
                className="text-xs cursor-pointer hover:bg-[#2d2d32] text-white gap-2.5 py-2"
              >
                <ExternalLink size={14} className="text-purple-400" />
                <span>Open Preview in New Tab</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs cursor-pointer hover:bg-[#2d2d32] text-white gap-2.5 py-2"
              >
                <Upload size={14} className="text-zinc-400" />
                <span>Import File from Computer</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[#333338]" />

              <DropdownMenuItem 
                onClick={handleClearConsole}
                className="text-xs cursor-pointer hover:bg-[#2d2d32] text-amber-300 gap-2.5 py-2"
              >
                <Eraser size={14} />
                <span>Clear Console Logs</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => setIsResetDialogOpen(true)}
                className="text-xs cursor-pointer hover:bg-rose-500/20 text-rose-400 gap-2.5 py-2"
              >
                <Trash2 size={14} />
                <span>Reset Playground</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
            accept=".js,.ts,.html,.css,.json,.txt"
          />
        </div>
      </header>

      {/* Reset Confirmation Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-[#252526] border-[#454545] text-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2 text-rose-400">
              <Trash2 size={16} />
              Reset Playground Workspace
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 text-xs text-[#cccccc] space-y-2">
            <p>
              Are you sure you want to reset the entire workspace?
            </p>
            <p className="text-amber-400 text-[11px] bg-amber-950/40 p-2 rounded border border-amber-800/50">
              ⚠️ This will restore default starter files and clear all custom files and folders.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsResetDialogOpen(false)}
              className="text-xs text-[#888888] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                resetToDefault();
                setIsResetDialogOpen(false);
                toast.success('Workspace reset to defaults');
              }}
              className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-medium"
            >
              Reset Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setSettingsModalOpen(false)} 
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal 
        isOpen={isShortcutsOpen} 
        onClose={() => setIsShortcutsOpen(false)} 
      />

      {/* Git & GitHub Integration Modal */}
      <GitModal />

      {/* Project Export Modal */}
      <ExportModal />
    </>
  );
};
