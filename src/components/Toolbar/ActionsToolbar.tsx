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
  Server,
  Activity
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
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/shadcn-ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generateSandboxContent } from '@/lib/sandbox';
import { SettingsModal } from './SettingsModal';
import { ShortcutsModal } from './ShortcutsModal';
import { ViewTab } from '@/types/index';

export const ActionsToolbar: React.FC = () => {
  const { 
    files, 
    folders,
    activeFileId, 
    updateFileContent, 
    isRunning, 
    setIsRunning, 
    isServerRunning,
    serverPort,
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
    logs
  } = useStore();

  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const activeFile = files.find(f => f.id === activeFileId);
  const isCurrentFileDirty = Boolean(activeFile && dirtyFileIds[activeFile.id]);
  const hasAnyDirtyFiles = Object.values(dirtyFileIds).some(Boolean);

  const handleRun = () => {
    setIsRunning(true);
    // Auto-save before running
    saveAllFiles();
    // If not in preview or console, switch or open console/preview
    if (activeView === 'editor') {
      // Also show console or switch to console
      setConsoleVisible(true);
    }
    toast.success('Running JavaScript code...', { duration: 1500 });
  };

  const handleManualSave = () => {
    setIsSavingLocal(true);
    saveFile(activeFileId);
    setTimeout(() => {
      setIsSavingLocal(false);
      toast.success(`Saved ${activeFile?.name || 'file'}`);
    }, 400);
  };

  const handlePreviewInNewTab = () => {
    const content = generateSandboxContent(files);
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    toast.info('Opening preview in new tab');
  };

  const handleCopy = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      toast.success('Code copied to clipboard');
    }
  };

  const handleDownloadActive = () => {
    if (activeFile) {
      const blob = new Blob([activeFile.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeFile.name;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${activeFile.name}`);
    }
  };

  const handleDownloadProject = () => {
    const projectData = {
      name: 'js-playground-project',
      exportedAt: new Date().toISOString(),
      files,
      folders
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-workspace.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported workspace bundle');
  };

  const handleShare = () => {
    const state = {
      files,
      folders,
      activeFileId,
    };
    const encoded = btoa(JSON.stringify(state));
    const url = `${window.location.origin}${window.location.pathname}?code=${encoded}`;
    navigator.clipboard.writeText(url);
    toast.success('Shareable playground link copied to clipboard!');
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        updateFileContent(activeFileId, content);
        toast.success(`Loaded content into ${activeFile?.name || 'file'}`);
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <header className="h-12 bg-[#2d2d2d] border-b border-[#3e3e42] flex items-center justify-between px-2 sm:px-4 shrink-0 select-none z-30">
        {/* Left Section: Sidebar Toggle & Branding */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={cn(
                  "h-8 w-8 text-[#cccccc] hover:text-white hover:bg-[#3e3e42] rounded transition-colors",
                  isSidebarOpen && "text-[#007acc] bg-[#3e3e42]/50"
                )}
              >
                <PanelLeft size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Toggle Explorer (Ctrl+B)
            </TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#007acc] rounded flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-[11px] tracking-tighter">JS</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-white leading-tight hidden xs:inline-block">
                Playground
              </span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#202020] border border-[#3e3e42] text-[10px] text-[#aaaaaa]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Node.js v20</span>
            {isServerRunning && (
              <>
                <span className="text-[#555]">•</span>
                <span className="text-emerald-400 font-mono font-medium">:{serverPort} (Live)</span>
              </>
            )}
          </div>
        </div>

        {/* Center Section: Run Button & Top Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Prominent Run Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleRun} 
                disabled={isRunning}
                className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 px-3 sm:px-4 gap-1.5 rounded-md text-[12px] font-semibold shadow-md transition-all active:scale-95 flex items-center"
              >
                <Play size={13} fill="currentColor" className="text-white" />
                <span>Run</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Execute Code (Ctrl + Enter)</TooltipContent>
          </Tooltip>

          {/* Clean View Tabs Switcher */}
          <div className="flex items-center bg-[#1e1e1e] p-0.5 rounded-md border border-[#3e3e42]">
            <button
              onClick={() => setActiveView('editor')}
              className={cn(
                "flex items-center gap-1 px-2 sm:px-3 h-7 rounded text-[11px] font-medium transition-all",
                activeView === 'editor' 
                  ? "bg-[#333333] text-white shadow-sm font-semibold" 
                  : "text-[#888888] hover:text-[#cccccc]"
              )}
            >
              <Code2 size={13} className="text-yellow-400" />
              <span>Code</span>
            </button>

            <button
              onClick={() => setActiveView('console')}
              className={cn(
                "flex items-center gap-1 px-2 sm:px-3 h-7 rounded text-[11px] font-medium transition-all relative",
                activeView === 'console' 
                  ? "bg-[#333333] text-white shadow-sm font-semibold" 
                  : "text-[#888888] hover:text-[#cccccc]"
              )}
            >
              <ListOrdered size={13} className="text-blue-400" />
              <span>Console</span>
              {logs.length > 0 && (
                <span className="ml-0.5 px-1 py-0.2 rounded-full bg-[#007acc] text-[9px] text-white font-mono leading-none">
                  {logs.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('terminal')}
              className={cn(
                "flex items-center gap-1 px-2 sm:px-3 h-7 rounded text-[11px] font-medium transition-all",
                activeView === 'terminal' 
                  ? "bg-[#333333] text-white shadow-sm font-semibold" 
                  : "text-[#888888] hover:text-[#cccccc]"
              )}
            >
              <Terminal size={13} className="text-emerald-400" />
              <span>Terminal</span>
            </button>

            <button
              onClick={() => setActiveView('preview')}
              className={cn(
                "flex items-center gap-1 px-2 sm:px-3 h-7 rounded text-[11px] font-medium transition-all",
                activeView === 'preview' 
                  ? "bg-[#333333] text-white shadow-sm font-semibold" 
                  : "text-[#888888] hover:text-[#cccccc]"
              )}
            >
              <Tv size={13} className="text-purple-400" />
              <span className="hidden xs:inline">Preview</span>
            </button>
          </div>
        </div>

        {/* Right Section: Save & Clean 3-Dot Menu */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Save Button with Unsaved Indicator */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                id="save-button"
                variant="ghost"
                size="sm"
                onClick={handleManualSave}
                disabled={isSavingLocal}
                className={cn(
                  "h-8 px-2 sm:px-2.5 text-xs rounded gap-1.5 transition-colors border",
                  isCurrentFileDirty 
                    ? "bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20 font-medium" 
                    : "border-transparent text-[#888888] hover:text-white hover:bg-[#3e3e42]"
                )}
              >
                {isSavingLocal ? (
                  <RotateCcw size={13} className="animate-spin text-[#007acc]" />
                ) : isCurrentFileDirty ? (
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <Save size={13} className="text-amber-400" />
                  </div>
                ) : (
                  <Save size={13} />
                )}
                <span className="hidden md:inline">
                  {isSavingLocal ? 'Saving...' : isCurrentFileDirty ? 'Save *' : 'Saved'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Save File (Ctrl + S)</TooltipContent>
          </Tooltip>

          {/* AI Assistant Toggle Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAIPanelVisible(!isAIPanelVisible)}
                className={cn(
                  "h-8 w-8 text-[#cccccc] hover:text-white hover:bg-[#3e3e42] rounded",
                  isAIPanelVisible && "text-purple-400 bg-[#3e3e42]"
                )}
              >
                <Sparkles size={15} className="text-purple-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">AI Code Assistant</TooltipContent>
          </Tooltip>

          {/* Preview in external tab */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePreviewInNewTab}
                className="h-8 w-8 text-[#cccccc] hover:text-white hover:bg-[#3e3e42] rounded hidden sm:flex"
              >
                <ExternalLink size={15} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Open Preview in New Tab</TooltipContent>
          </Tooltip>

          {/* Three-Dot Menu housing all secondary / settings options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#cccccc] hover:text-white hover:bg-[#3e3e42] rounded"
              >
                <MoreHorizontal size={17} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#252526] border-[#454545] text-[#cccccc] shadow-xl">
              <DropdownMenuLabel className="text-[11px] text-[#888888] font-mono uppercase tracking-wider">
                Workspace & Options
              </DropdownMenuLabel>
              
              <DropdownMenuItem 
                onClick={() => setIsSettingsOpen(true)}
                className="text-xs cursor-pointer hover:bg-[#37373d] text-white gap-2 py-2"
              >
                <Settings2 size={14} className="text-[#007acc]" />
                <span>Editor Preferences</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => setIsShortcutsOpen(true)}
                className="text-xs cursor-pointer hover:bg-[#37373d] text-white gap-2 py-2"
              >
                <Keyboard size={14} className="text-emerald-400" />
                <span>Keyboard Shortcuts</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={handleShare}
                className="text-xs cursor-pointer hover:bg-[#37373d] text-white gap-2 py-2"
              >
                <Share2 size={14} className="text-blue-400" />
                <span>Share Project Link</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[#3e3e42]" />

              <DropdownMenuItem 
                onClick={handleCopy}
                className="text-xs cursor-pointer hover:bg-[#37373d] text-white gap-2 py-2"
              >
                <Copy size={14} className="text-[#888888]" />
                <span>Copy Active Code</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={handleDownloadActive}
                className="text-xs cursor-pointer hover:bg-[#37373d] text-white gap-2 py-2"
              >
                <Download size={14} className="text-[#888888]" />
                <span>Download Active File</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={handleDownloadProject}
                className="text-xs cursor-pointer hover:bg-[#37373d] text-white gap-2 py-2"
              >
                <Download size={14} className="text-[#888888]" />
                <span>Export All (JSON)</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs cursor-pointer hover:bg-[#37373d] text-white gap-2 py-2"
              >
                <Upload size={14} className="text-[#888888]" />
                <span>Import File to Editor</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[#3e3e42]" />

              <DropdownMenuItem 
                onClick={clearLogs}
                className="text-xs cursor-pointer hover:bg-[#37373d] text-white gap-2 py-2"
              >
                <RotateCcw size={14} className="text-amber-400" />
                <span>Clear Console Logs</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => {
                  if (confirm('Reset playground workspace to default files and settings?')) {
                    resetToDefault();
                    toast.success('Workspace reset to defaults');
                  }
                }}
                className="text-xs cursor-pointer hover:bg-red-500/20 text-red-400 gap-2 py-2"
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

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal 
        isOpen={isShortcutsOpen} 
        onClose={() => setIsShortcutsOpen(false)} 
      />
    </>
  );
};
