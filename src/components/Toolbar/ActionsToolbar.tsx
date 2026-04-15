import React from 'react';
import { useStore } from '@/store/useStore.ts';
import { 
  Play, 
  RotateCcw, 
  Download, 
  Upload, 
  Share2, 
  Copy, 
  Sun, 
  Moon,
  Settings2,
  Save,
  Trash2,
  ExternalLink,
  Terminal,
  Sparkles
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { Button, buttonVariants } from '@/components/shadcn-ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/shadcn-ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generateSandboxContent } from '@/lib/sandbox';

export const ActionsToolbar: React.FC = () => {
  const { 
    files, 
    activeFileId, 
    updateFileContent, 
    isRunning, 
    setIsRunning, 
    clearLogs, 
    theme, 
    setTheme, 
    resetToDefault,
    isConsoleVisible,
    setConsoleVisible,
    isAIPanelVisible,
    setAIPanelVisible
  } = useStore();
  const [isSaving, setIsSaving] = React.useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setConsoleVisible(true);
    toast.success('Code execution started');
    
    // If it's a web project (has HTML), maybe auto-open preview?
    // But user said "click karna pe", so we'll leave it to the Preview button.
  };

  const handlePreview = () => {
    const content = generateSandboxContent(files, activeFileId);
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    toast.info('Opening preview in new tab');
  };

  const handleSave = () => {
    setIsSaving(true);
    // Since we use persist middleware, it's already saved to localStorage.
    // This button provides visual feedback and ensures the user feels in control.
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Project saved successfully');
    }, 600);
  };

  const handleCopy = () => {
    const activeFile = files.find(f => f.id === activeFileId);
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      toast.success('Code copied to clipboard');
    }
  };

  const handleDownload = () => {
    const activeFile = files.find(f => f.id === activeFileId);
    if (activeFile) {
      const blob = new Blob([activeFile.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeFile.name;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('File downloaded');
    }
  };

  const handleShare = () => {
    const state = JSON.stringify(files);
    const encoded = btoa(state);
    const url = `${window.location.origin}?code=${encoded}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied to clipboard');
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        updateFileContent(activeFileId, content);
        toast.success(`File ${file.name} uploaded successfully`);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="h-12 border-b border-[#454545] bg-[#323233] flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 mr-4">
          <div className="w-6 h-6 bg-[#007acc] rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">JS</span>
          </div>
          <span className="text-[13px] font-medium text-white hidden sm:inline-block tracking-tight">sandbox-project-v1</span>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRun} 
            disabled={isRunning}
            className="bg-[#007acc] hover:bg-[#007acc]/90 text-white h-7 px-3 gap-2 rounded text-[12px] font-medium transition-all active:scale-95"
          >
            <Play size={12} fill="currentColor" />
            <span>Run</span>
          </Button>

          <Button 
            onClick={handlePreview}
            variant="ghost"
            className="h-7 px-2 text-[#cccccc] hover:text-white hover:bg-[#454545] rounded text-[12px] gap-1.5"
          >
            <ExternalLink size={12} />
            <span>Preview</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setConsoleVisible(!isConsoleVisible)}
            className={cn(
              "h-7 px-2 text-[#cccccc] hover:text-white hover:bg-[#454545] rounded text-[12px] gap-1.5",
              isConsoleVisible && "bg-[#454545] text-white"
            )}
          >
            <Terminal size={12} />
            <span>Console</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setAIPanelVisible(!isAIPanelVisible)}
            className={cn(
              "h-7 px-2 text-[#cccccc] hover:text-white hover:bg-[#454545] rounded text-[12px] gap-1.5",
              isAIPanelVisible && "bg-[#454545] text-white"
            )}
          >
            <Sparkles size={12} className="text-purple-400" />
            <span>AI Assistant</span>
          </Button>

          <div className="w-[1px] h-4 bg-[#454545] mx-1" />

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearLogs}
            className="h-7 px-2 text-[#cccccc] hover:text-white hover:bg-[#454545] rounded text-[12px]"
          >
            <RotateCcw size={12} className="mr-1.5" />
            Clear Logs
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving}
            className="h-7 px-2 text-[#cccccc] hover:text-white hover:bg-[#454545] rounded text-[12px] gap-1.5 min-w-[70px]"
          >
            {isSaving ? (
              <RotateCcw size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 mr-2 border-r border-[#454545] pr-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger 
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7 text-[#cccccc] hover:text-white hover:bg-[#454545]")}
                onClick={handleCopy}
              >
                <Copy size={14} />
              </TooltipTrigger>
              <TooltipContent>Copy Code</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger 
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7 text-[#cccccc] hover:text-white hover:bg-[#454545]")}
                onClick={handleDownload}
              >
                <Download size={14} />
              </TooltipTrigger>
              <TooltipContent>Download JS</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger 
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7 text-[#cccccc] hover:text-white hover:bg-[#454545] relative")}
              >
                <Upload size={14} />
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleUpload}
                  accept=".js,.html,.css,.txt"
                />
              </TooltipTrigger>
              <TooltipContent>Upload File</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger 
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7 text-[#cccccc] hover:text-white hover:bg-[#454545]")}
                onClick={handleShare}
              >
                <Share2 size={14} />
              </TooltipTrigger>
              <TooltipContent>Share Snippet</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-7 w-7 text-[#cccccc] hover:text-white hover:bg-[#454545]"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7 text-[#cccccc] hover:text-white hover:bg-[#454545]" />}>
              <Settings2 size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#252526] border-[#454545] text-white w-48">
              <DropdownMenuLabel>Project Settings</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#454545]" />
              <DropdownMenuItem 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hover:bg-[#37373d] cursor-pointer"
              >
                {theme === 'dark' ? <Sun size={14} className="mr-2" /> : <Moon size={14} className="mr-2" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#454545]" />
              <DropdownMenuItem 
                onClick={() => {
                  if (confirm('Are you sure you want to reset the project? All your files will be replaced with defaults.')) {
                    resetToDefault();
                    toast.success('Project reset to default');
                  }
                }}
                className="text-red-400 hover:bg-red-400/10 cursor-pointer"
              >
                <Trash2 size={14} className="mr-2" />
                Reset Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
