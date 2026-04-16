import React, { useState } from 'react';
import { useStore } from '@/store/useStore.ts';
import { FileCode, FileJson, FileText, Search, Layers, Settings, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils.ts';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn-ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/shadcn-ui/dialog";
import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import { Label } from "@/components/shadcn-ui/label";
import { FileType } from '@/types/index';
import { toast } from 'sonner';

export const FileExplorer: React.FC = () => {
  const { files, activeFileId, setActiveFileId, addFile, deleteFile } = useStore();
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<FileType>('javascript');
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = (lang: string) => {
    switch (lang) {
      case 'javascript': return <FileCode size={18} className="text-yellow-400" />;
      case 'html': return <FileText size={18} className="text-orange-500" />;
      case 'css': return <FileJson size={18} className="text-blue-400" />;
      default: return <FileText size={18} />;
    }
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      toast.error('File name cannot be empty');
      return;
    }

    // Add extension if missing
    let fileName = newFileName.trim();
    if (newFileType === 'javascript' && !fileName.endsWith('.js')) fileName += '.js';
    if (newFileType === 'html' && !fileName.endsWith('.html')) fileName += '.html';
    if (newFileType === 'css' && !fileName.endsWith('.css')) fileName += '.css';

    addFile(fileName, newFileType);
    setNewFileName('');
    setIsNewFileDialogOpen(false);
    toast.success(`File ${fileName} created`);
  };

  const handleDeleteFile = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteFile(id);
      toast.success(`File ${name} deleted`);
    }
  };

  return (
    <div className={cn(
      "bg-[#252526] border-r border-[#454545] flex flex-col items-center py-4 gap-6 h-full shrink-0 transition-all duration-300",
      isExpanded ? "w-48" : "w-12"
    )}>
      <TooltipProvider>
        <div className="flex flex-col items-center gap-4 w-full">
          <Tooltip>
            <TooltipTrigger 
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "w-full flex justify-center cursor-pointer py-1 transition-colors",
                isExpanded ? "text-white" : "text-[#858585] hover:text-white"
              )}
            >
              <Layers size={24} strokeWidth={1.5} />
            </TooltipTrigger>
            <TooltipContent side="right">{isExpanded ? "Collapse" : "Explorer"}</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger className="w-full flex justify-center text-[#858585] hover:text-white cursor-pointer py-1">
              <Search size={24} strokeWidth={1.5} />
            </TooltipTrigger>
            <TooltipContent side="right">Search</TooltipContent>
          </Tooltip>

          <Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}>
            <Tooltip>
              <DialogTrigger asChild>
                <button className="w-full flex justify-center text-[#858585] hover:text-white cursor-pointer py-1">
                  <Plus size={24} strokeWidth={1.5} />
                </button>
              </DialogTrigger>
              <TooltipContent side="right">New File</TooltipContent>
            </Tooltip>
            <DialogContent className="bg-[#252526] border-[#454545] text-white">
              <DialogHeader>
                <DialogTitle>Create New File</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">File Name</Label>
                  <Input
                    id="name"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="index.js"
                    className="bg-[#1e1e1e] border-[#454545] text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">File Type</Label>
                  <Select value={newFileType} onValueChange={(value: FileType) => setNewFileType(value)}>
                    <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#252526] border-[#454545] text-white">
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="css">CSS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateFile} className="bg-[#007acc] hover:bg-[#007acc]/90">
                  Create File
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 w-full flex flex-col items-center gap-1 mt-4 border-t border-[#454545] pt-4 overflow-y-auto overflow-x-hidden">
          {files.map((file) => (
            <div key={file.id} className="w-full group relative px-1">
              <Tooltip>
                <TooltipTrigger
                  onClick={() => setActiveFileId(file.id)}
                  className={cn(
                    "w-full flex items-center py-2 transition-all rounded px-2",
                    activeFileId === file.id 
                      ? "bg-[#37373d] text-white" 
                      : "text-[#858585] hover:text-white hover:bg-[#2a2d2e]",
                    !isExpanded && "justify-center"
                  )}
                >
                  <div className="shrink-0">{getIcon(file.language)}</div>
                  {isExpanded && (
                    <span className="ml-3 text-[13px] truncate flex-1 text-left">
                      {file.name}
                    </span>
                  )}
                </TooltipTrigger>
                <TooltipContent side="right">{file.name}</TooltipContent>
              </Tooltip>
              {files.length > 1 && isExpanded && (
                <button
                  onClick={(e) => handleDeleteFile(e, file.id, file.name)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-[#858585] hover:text-red-400 p-1 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-col items-center gap-4 w-full">
          <Tooltip>
            <TooltipTrigger className="w-full flex justify-center text-[#858585] hover:text-white cursor-pointer py-1">
              <Settings size={24} strokeWidth={1.5} />
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};
