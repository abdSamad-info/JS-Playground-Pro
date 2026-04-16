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

import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/shadcn-ui/dialog";
import { Input } from "@/components/shadcn-ui/input";
import { Label } from "@/components/shadcn-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";

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
    setAIPanelVisible,
    accentColor,
    setAccentColor,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    lineNumbers,
    setLineNumbers,
    wordWrap,
    setWordWrap,
    minimap,
    setMinimap,
    themePreset,
    setThemePreset
  } = useStore();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const [tempAccent, setTempAccent] = React.useState(accentColor);
  const [tempFontSize, setTempFontSize] = React.useState(fontSize);
  const [tempFontFamily, setTempFontFamily] = React.useState(fontFamily);
  const [tempLineNumbers, setTempLineNumbers] = React.useState(lineNumbers);
  const [tempWordWrap, setTempWordWrap] = React.useState(wordWrap);
  const [tempMinimap, setTempMinimap] = React.useState(minimap);
  const [tempThemePreset, setTempThemePreset] = React.useState(themePreset);

  const handleRun = () => {
    setIsRunning(true);
    setConsoleVisible(true);
    toast.success('Code execution started');
    
    // If it's a web project (has HTML), maybe auto-open preview?
    // But user said "click karna pe", so we'll leave it to the Preview button.
  };

  const handlePreview = () => {
    const content = generateSandboxContent(files);
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
            <span className="hidden xs:inline">Run</span>
          </Button>

          <Button 
            onClick={handlePreview}
            variant="ghost"
            className="h-7 px-2 text-[#cccccc] hover:text-white hover:bg-[#454545] rounded text-[12px] gap-1.5"
          >
            <ExternalLink size={12} />
            <span className="hidden sm:inline">Preview</span>
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
            <span className="hidden sm:inline">Console</span>
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
            <span className="hidden sm:inline">AI Assistant</span>
          </Button>

          <div className="w-[1px] h-4 bg-[#454545] mx-1 hidden sm:block" />

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearLogs}
            className="h-7 px-2 text-[#cccccc] hover:text-white hover:bg-[#454545] rounded text-[12px] hidden md:flex"
          >
            <RotateCcw size={12} className="mr-1.5" />
            Clear Logs
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving}
            className="h-7 px-2 text-[#cccccc] hover:text-white hover:bg-[#454545] rounded text-[12px] gap-1.5 min-w-[70px] hidden md:flex"
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

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-[#cccccc] hover:text-white hover:bg-[#454545]">
                <Settings2 size={14} />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#252526] border-[#454545] text-white sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Editor Settings</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {['#007acc', '#f14c4c', '#4ec9b0', '#ce9178', '#b5cea8', '#c586c0'].map(color => (
                      <button
                        key={color}
                        onClick={() => setTempAccent(color)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          tempAccent === color ? "border-white scale-110" : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input 
                      type="color" 
                      value={tempAccent} 
                      onChange={(e) => setTempAccent(e.target.value)}
                      className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Font Size</Label>
                    <Select value={tempFontSize.toString()} onValueChange={(v) => setTempFontSize(parseInt(v))}>
                      <SelectTrigger className="bg-[#1e1e1e] border-[#454545]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#252526] border-[#454545] text-white">
                        {[12, 14, 16, 18, 20].map(size => (
                          <SelectItem key={size} value={size.toString()}>{size}px</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Font Family</Label>
                    <Select value={tempFontFamily} onValueChange={setTempFontFamily}>
                      <SelectTrigger className="bg-[#1e1e1e] border-[#454545]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#252526] border-[#454545] text-white">
                        <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                        <SelectItem value="Fira Code">Fira Code</SelectItem>
                        <SelectItem value="Source Code Pro">Source Code Pro</SelectItem>
                        <SelectItem value="Courier New">Courier New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Line Numbers</Label>
                    <Select value={tempLineNumbers} onValueChange={(v: 'on' | 'off') => setTempLineNumbers(v)}>
                      <SelectTrigger className="bg-[#1e1e1e] border-[#454545]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#252526] border-[#454545] text-white">
                        <SelectItem value="on">On</SelectItem>
                        <SelectItem value="off">Off</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Word Wrap</Label>
                    <Select value={tempWordWrap} onValueChange={(v: 'on' | 'off') => setTempWordWrap(v)}>
                      <SelectTrigger className="bg-[#1e1e1e] border-[#454545]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#252526] border-[#454545] text-white">
                        <SelectItem value="on">On</SelectItem>
                        <SelectItem value="off">Off</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Show Minimap</Label>
                  <Button 
                    variant={tempMinimap ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTempMinimap(!tempMinimap)}
                    className={cn("h-7 px-3", tempMinimap && "bg-[#007acc]")}
                  >
                    {tempMinimap ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="grid gap-2">
                  <Label>Theme Preset</Label>
                  <Select value={tempThemePreset} onValueChange={(v: any) => setTempThemePreset(v)}>
                    <SelectTrigger className="bg-[#1e1e1e] border-[#454545]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#252526] border-[#454545] text-white">
                      <SelectItem value="vs-code">VS Code Dark</SelectItem>
                      <SelectItem value="monokai">Monokai</SelectItem>
                      <SelectItem value="cobalt">Cobalt</SelectItem>
                      <SelectItem value="github-light">GitHub Light</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Editor Theme</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => setTheme('dark')}
                      className={cn("flex-1", theme === 'dark' && "bg-[#007acc]")}
                    >
                      <Moon size={14} className="mr-2" /> Dark
                    </Button>
                    <Button 
                      variant={theme === 'light' ? 'default' : 'outline'}
                      onClick={() => setTheme('light')}
                      className={cn("flex-1", theme === 'light' && "bg-[#007acc] text-white")}
                    >
                      <Sun size={14} className="mr-2" /> Light
                    </Button>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#454545]">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    onClick={() => {
                      if (confirm('Reset all project files and settings?')) {
                        resetToDefault();
                        setIsSettingsOpen(false);
                      }
                    }}
                  >
                    <Trash2 size={14} className="mr-2" /> Reset Project
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="ghost" 
                  onClick={() => setIsSettingsOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-[#007acc] hover:bg-[#007acc]/90"
                  onClick={() => {
                    setAccentColor(tempAccent);
                    setFontSize(tempFontSize);
                    setFontFamily(tempFontFamily);
                    setLineNumbers(tempLineNumbers);
                    setWordWrap(tempWordWrap);
                    setMinimap(tempMinimap);
                    setThemePreset(tempThemePreset);
                    setIsSettingsOpen(false);
                    toast.success('Settings saved!');
                    // The user specifically asked for a message for some features
                    toast.info('Advanced cloud sync features coming soon!');
                  }}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
