import React, { useState } from 'react';
import { useStore } from '@/store/useStore.ts';
import { motion, AnimatePresence } from 'motion/react';
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
  ChevronDown,
  Pencil
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
    deleteFolder,
    moveFile,
    moveFolder,
    renameFile,
    renameFolder
  } = useStore();
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<{ id: string; name: string; type: 'file' | 'folder' } | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileType, setNewFileType] = useState<FileType>('javascript');
  const [newFileParentId, setNewFileParentId] = useState<string>('root');
  const [newFolderParentId, setNewFolderParentId] = useState<string>('root');
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

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
      toast.error('File name cannot be empty', { duration: 2000 });
      return;
    }

    let fileName = newFileName.trim();
    if (newFileType === 'javascript' && !fileName.endsWith('.js')) fileName += '.js';
    if (newFileType === 'html' && !fileName.endsWith('.html')) fileName += '.html';
    if (newFileType === 'css' && !fileName.endsWith('.css')) fileName += '.css';

    const parentId = newFileParentId === 'root' ? null : newFileParentId;
    const success = addFile(fileName, newFileType, parentId);
    
    if (success) {
      setNewFileName('');
      setNewFileParentId('root');
      setIsNewFileDialogOpen(false);
      toast.success(`File ${fileName} created`, { duration: 2000 });
    } else {
      toast.error(`File ${fileName} already exists in this folder`, { duration: 2000 });
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name cannot be empty', { duration: 2000 });
      return;
    }
    const parentId = newFolderParentId === 'root' ? null : newFolderParentId;
    const success = addFolder(newFolderName.trim(), parentId);
    
    if (success) {
      setNewFolderName('');
      setNewFolderParentId('root');
      setIsNewFolderDialogOpen(false);
      toast.success(`Folder ${newFolderName} created`, { duration: 2000 });
    } else {
      toast.error(`Folder ${newFolderName} already exists in this folder`, { duration: 2000 });
    }
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

  const handleRename = () => {
    if (!itemToRename || !renameValue.trim()) {
      toast.error('Name cannot be empty', { duration: 2000 });
      return;
    }

    if (itemToRename.type === 'file') {
      renameFile(itemToRename.id, renameValue.trim());
    } else {
      renameFolder(itemToRename.id, renameValue.trim());
    }

    toast.success('Renamed successfully', { duration: 2000 });
    setIsRenameDialogOpen(false);
    setItemToRename(null);
    setRenameValue('');
  };

  const openRenameDialog = (e: React.MouseEvent, id: string, name: string, type: 'file' | 'folder') => {
    e.stopPropagation();
    setItemToRename({ id, name, type });
    setRenameValue(name);
    setIsRenameDialogOpen(true);
  };

  const onDragStart = (e: React.DragEvent, id: string, type: 'file' | 'folder') => {
    e.dataTransfer.setData('sourceId', id);
    e.dataTransfer.setData('sourceType', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, id: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTarget !== id) {
      setDragOverTarget(id);
    }
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if we actually left the boundary (some nesting issues can happen)
    // For simplicity, we can let it be, but let's try to clear on root or similar
  };

  const onDrop = (e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    setDragOverTarget(null);
    const sourceId = e.dataTransfer.getData('sourceId');
    const sourceType = e.dataTransfer.getData('sourceType');

    if (sourceId === targetId) return;

    if (sourceType === 'file') {
      moveFile(sourceId, targetId);
    } else {
      moveFolder(sourceId, targetId);
    }
    toast.success('Item moved', { duration: 2000 });
  };

  const renderFile = (file: File, depth = 0) => (
    <motion.div 
      key={file.id} 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className="w-full group relative"
      draggable
      onDragStart={(e) => onDragStart(e, file.id, 'file')}
    >
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
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#2a2d2e] rounded pl-1">
          <button
            onClick={(e) => openRenameDialog(e, file.id, file.name, 'file')}
            className="text-[#858585] hover:text-[#007acc] p-1"
            title="Rename"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={(e) => handleDeleteFile(e, file.id, file.name)}
            className="text-[#858585] hover:text-red-400 p-1"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </motion.div>
  );

  const renderFolder = (folder: Folder, depth = 0) => {
    const isOpen = expandedFolders.has(folder.id);
    const folderFiles = files.filter(f => f.parentId === folder.id);
    const childFolders = folders.filter(f => f.parentId === folder.id);
    const isDragTarget = dragOverTarget === folder.id;

    return (
      <motion.div 
        key={folder.id} 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        layout
        className="w-full"
        onDragOver={(e) => onDragOver(e, folder.id)}
        onDrop={(e) => onDrop(e, folder.id)}
        onDragLeave={() => dragOverTarget === folder.id && setDragOverTarget(null)}
      >
        <div 
          className={cn(
            "w-full group relative transition-colors",
            isDragTarget && "bg-[#37373d]/50"
          )}
          draggable
          onDragStart={(e) => onDragStart(e, folder.id, 'folder')}
        >
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
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#2a2d2e] rounded pl-1">
              <button
                onClick={(e) => openRenameDialog(e, folder.id, folder.name, 'folder')}
                className="text-[#858585] hover:text-[#007acc] p-1"
                title="Rename"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={(e) => handleDeleteFolder(e, folder.id, folder.name)}
                className="text-[#858585] hover:text-red-400 p-1"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
        {isOpen && isExpanded && (
          <div className="flex flex-col">
            <AnimatePresence mode="popLayout">
              {childFolders.map(cf => renderFolder(cf, depth + 1))}
              {folderFiles.map(f => renderFile(f, depth + 1))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
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

      <div 
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden py-2 transition-colors",
          dragOverTarget === null && "bg-transparent",
          dragOverTarget === 'root' && "bg-[#37373d]/20"
        )}
        onDragOver={(e) => onDragOver(e, 'root')}
        onDrop={(e) => onDrop(e, null)}
        onDragLeave={() => dragOverTarget === 'root' && setDragOverTarget(null)}
      >
        <AnimatePresence mode="popLayout">
          {folders.filter(f => !f.parentId).map(folder => renderFolder(folder))}
          {files.filter(f => !f.parentId).map(file => renderFile(file))}
        </AnimatePresence>
      </div>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="bg-[#252526] border-[#454545] text-white">
          <DialogHeader>
            <DialogTitle>Rename {itemToRename?.type === 'file' ? 'File' : 'Folder'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rename-input">New Name</Label>
              <Input
                id="rename-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="bg-[#1e1e1e] border-[#454545] text-white"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleRename} className="bg-[#007acc] hover:bg-[#007acc]/90">
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
