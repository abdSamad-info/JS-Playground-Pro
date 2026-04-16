import React, { useState } from 'react';
import { useStore } from '@/store/useStore.ts';
import { 
  FileCode, 
  FileJson, 
  FileText, 
  Search, 
  Layers, 
  Settings, 
  Plus, 
  Trash2, 
  FolderPlus, 
  Folder as FolderIcon, 
  ChevronRight, 
  ChevronDown 
} from 'lucide-react';
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
import { FileType, File, Folder } from '@/types/index';
import { toast } from 'sonner';

export const FileExplorer: React.FC = () => {
  const { 
    files, 
    folders, 
    activeFileId, 
    setActiveFileId, 
    addFile, 
    addFolder, 
    deleteFile, 
    deleteFolder 
  } = useStore();
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileType, setNewFileType] = useState<FileType>('javascript');
  const [newFileParentId, setNewFileParentId] = useState<string>('root');
  const [newFolderParentId, setNewFolderParentId] = useState<string>('root');
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (id: string) => {
    const next = new Set(expandedFolders);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedFolders(next);
  };

  const getIcon = (lang: string) => {
    switch (lang) {
      case 'javascript': return <FileCode size={16} className="text-yellow-400" />;
      case 'html': return <FileText size={16} className="text-orange-500" />;
      case 'css': return <FileJson size={16} className="text-blue-400" />;
      default: return <FileText size={16} />;
    }
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      toast.error('File name cannot be empty');
      return;
    }

    let fileName = newFileName.trim();
    if (newFileType === 'javascript' && !fileName.endsWith('.js')) fileName += '.js';
    if (newFileType === 'html' && !fileName.endsWith('.html')) fileName += '.html';
    if (newFileType === 'css' && !fileName.endsWith('.css')) fileName += '.css';

    addFile(fileName, newFileType, newFileParentId === 'root' ? null : newFileParentId);
    setNewFileName('');
    setNewFileParentId('root');
    setIsNewFileDialogOpen(false);
    toast.success(`File ${fileName} created`);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }
    addFolder(newFolderName.trim(), newFolderParentId === 'root' ? null : newFolderParentId);
    setNewFolderName('');
    setNewFolderParentId('root');
    setIsNewFolderDialogOpen(false);
    toast.success(`Folder ${newFolderName} created`);
  };

  const handleDeleteFile = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteFile(id);
      toast.success(`File ${name} deleted`);
    }
  };

  const handleDeleteFolder = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${name} and all its contents?`)) {
      deleteFolder(id);
      toast.success(`Folder ${name} deleted`);
    }
  };

  const renderFile = (file: File, depth = 0) => (
    <div key={file.id} className="w-full group relative">
      <Tooltip>
        <TooltipTrigger
          onClick={() => setActiveFileId(file.id)}
          className={cn(
            "w-full flex items-center py-1 transition-all rounded px-2",
            activeFileId === file.id 
              ? "bg-[#37373d] text-white" 
              : "text-[#858585] hover:text-white hover:bg-[#2a2d2e]",
            !isExpanded && "justify-center"
          )}
          style={{ paddingLeft: isExpanded ? `${depth * 12 + 8}px` : '8px' }}
        >
          <div className="shrink-0">{getIcon(file.language)}</div>
          {isExpanded && (
            <span className="ml-2 text-[13px] truncate flex-1 text-left">
              {file.name}
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent side="right">{file.name}</TooltipContent>
      </Tooltip>
      {isExpanded && (
        <button
          onClick={(e) => handleDeleteFile(e, file.id, file.name)}
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-[#858585] hover:text-red-400 p-1 transition-opacity"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );

  const renderFolder = (folder: Folder, depth = 0) => {
    const isOpen = expandedFolders.has(folder.id);
    const folderFiles = files.filter(f => f.parentId === folder.id);
    const childFolders = folders.filter(f => f.parentId === folder.id);

    return (
      <div key={folder.id} className="w-full">
        <div className="w-full group relative">
          <button
            onClick={() => toggleFolder(folder.id)}
            className={cn(
              "w-full flex items-center py-1 text-[#858585] hover:text-white hover:bg-[#2a2d2e] transition-all rounded px-2",
              !isExpanded && "justify-center"
            )}
            style={{ paddingLeft: isExpanded ? `${depth * 12 + 8}px` : '8px' }}
          >
            {isExpanded && (
              <div className="shrink-0 mr-1">
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
            )}
            <FolderIcon size={16} className="text-[#dcb67a] shrink-0" />
            {isExpanded && (
              <span className="ml-2 text-[13px] truncate flex-1 text-left font-medium">
                {folder.name}
              </span>
            )}
          </button>
          {isExpanded && (
            <button
              onClick={(e) => handleDeleteFolder(e, folder.id, folder.name)}
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-[#858585] hover:text-red-400 p-1 transition-opacity"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
        {isOpen && isExpanded && (
          <div className="flex flex-col">
            {childFolders.map(cf => renderFolder(cf, depth + 1))}
            {folderFiles.map(f => renderFile(f, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      "bg-[#252526] border-r border-[#454545] flex flex-col h-full shrink-0 transition-all duration-300",
      isExpanded ? "w-64" : "w-12"
    )}>
      <div className="flex items-center justify-between px-3 h-[35px] bg-[#252526] border-b border-[#454545] shrink-0">
        {isExpanded && <span className="text-[11px] uppercase tracking-wider font-bold text-[#888]">Explorer</span>}
        <div className="flex items-center gap-1">
          <Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}>
            <Tooltip>
              <DialogTrigger asChild>
                <button className="text-[#858585] hover:text-white p-1 rounded hover:bg-[#37373d]">
                  <Plus size={16} />
                </button>
              </DialogTrigger>
              <TooltipContent side="bottom">New File</TooltipContent>
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
                <div className="grid gap-2">
                  <Label htmlFor="parent">Parent Folder</Label>
                  <Select value={newFileParentId} onValueChange={setNewFileParentId}>
                    <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-white">
                      <SelectValue placeholder="Root" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#252526] border-[#454545] text-white">
                      <SelectItem value="root">Root</SelectItem>
                      {folders.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
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

          <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
            <Tooltip>
              <DialogTrigger asChild>
                <button className="text-[#858585] hover:text-white p-1 rounded hover:bg-[#37373d]">
                  <FolderPlus size={16} />
                </button>
              </DialogTrigger>
              <TooltipContent side="bottom">New Folder</TooltipContent>
            </Tooltip>
            <DialogContent className="bg-[#252526] border-[#454545] text-white">
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="folder-name">Folder Name</Label>
                  <Input
                    id="folder-name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="components"
                    className="bg-[#1e1e1e] border-[#454545] text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="folder-parent">Parent Folder</Label>
                  <Select value={newFolderParentId} onValueChange={setNewFolderParentId}>
                    <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-white">
                      <SelectValue placeholder="Root" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#252526] border-[#454545] text-white">
                      <SelectItem value="root">Root</SelectItem>
                      {folders.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateFolder} className="bg-[#007acc] hover:bg-[#007acc]/90">
                  Create Folder
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#858585] hover:text-white p-1 rounded hover:bg-[#37373d]"
          >
            {isExpanded ? <ChevronRight className="rotate-180" size={16} /> : <Layers size={16} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        {folders.filter(f => !f.parentId).map(folder => renderFolder(folder))}
        {files.filter(f => !f.parentId).map(file => renderFile(file))}
      </div>

      <div className="mt-auto border-t border-[#454545] p-2 flex justify-center">
        <Tooltip>
          <TooltipTrigger className="text-[#858585] hover:text-white p-1 rounded hover:bg-[#37373d]">
            <Settings size={18} />
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
