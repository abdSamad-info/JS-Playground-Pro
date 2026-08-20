import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCode, 
  FileJson, 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  FolderPlus, 
  Folder as FolderIcon,
  FolderOpen,
  ChevronRight, 
  ChevronDown,
  Pencil,
  RotateCcw,
  ChevronsDownUp,
  FilePlus2,
  FolderTree,
  X,
  FileSpreadsheet,
  GitBranch,
  Github
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
    dirtyFileIds,
    addFile, 
    addFolder, 
    deleteFile, 
    deleteFolder,
    renameFile,
    renameFolder,
    moveFile,
    moveFolder,
    gitState,
    setGitModalOpen
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(true);

  // Dialogs
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileType, setNewFileType] = useState<FileType>('javascript');
  const [targetParentId, setTargetParentId] = useState<string>('root');
  
  const [itemToRename, setItemToRename] = useState<{ id: string; name: string; type: 'file' | 'folder' } | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Inline creation states (VS Code like)
  const [inlineCreating, setInlineCreating] = useState<{ type: 'file' | 'folder'; parentId: string | null } | null>(null);
  const [inlineName, setInlineName] = useState('');

  const toggleFolder = (id: string) => {
    const next = new Set(expandedFolders);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedFolders(next);
  };

  const collapseAllFolders = () => {
    setExpandedFolders(new Set());
  };

  const expandAllFolders = () => {
    const all = new Set(['root', ...folders.map(f => f.id)]);
    setExpandedFolders(all);
  };

  const getFileIcon = (lang: string, name: string) => {
    if (name.endsWith('.ts') || name.endsWith('.tsx') || lang === 'typescript') {
      return <FileCode size={15} className="text-sky-400 shrink-0" />;
    }
    if (name.endsWith('.json') || lang === 'json') {
      return <FileJson size={15} className="text-amber-400 shrink-0" />;
    }
    if (name.endsWith('.html') || lang === 'html') {
      return <FileText size={15} className="text-orange-500 shrink-0" />;
    }
    if (name.endsWith('.css') || lang === 'css') {
      return <FileSpreadsheet size={15} className="text-cyan-400 shrink-0" />;
    }
    return <FileCode size={15} className="text-yellow-400 shrink-0" />;
  };

  const openCreateFileDialog = (parentId: string | null = null) => {
    setTargetParentId(parentId ?? selectedFolderId ?? 'root');
    setNewFileName('');
    setNewFileType('javascript');
    setIsNewFileDialogOpen(true);
  };

  const openCreateFolderDialog = (parentId: string | null = null) => {
    setTargetParentId(parentId ?? selectedFolderId ?? 'root');
    setNewFolderName('');
    setIsNewFolderDialogOpen(true);
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      toast.error('File name cannot be empty');
      return;
    }

    let fileName = newFileName.trim();
    // Auto-append appropriate extension
    if (newFileType === 'javascript' && !fileName.includes('.')) fileName += '.js';
    else if (newFileType === 'typescript' && !fileName.includes('.')) fileName += '.ts';
    else if (newFileType === 'html' && !fileName.includes('.')) fileName += '.html';
    else if (newFileType === 'css' && !fileName.includes('.')) fileName += '.css';
    else if (newFileType === 'json' && !fileName.includes('.')) fileName += '.json';

    // Infer language from name if provided
    let detectedLang = newFileType;
    if (fileName.endsWith('.js')) detectedLang = 'javascript';
    else if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) detectedLang = 'typescript';
    else if (fileName.endsWith('.html')) detectedLang = 'html';
    else if (fileName.endsWith('.css')) detectedLang = 'css';
    else if (fileName.endsWith('.json')) detectedLang = 'json';

    const parentId = targetParentId === 'root' ? null : targetParentId;
    const success = addFile(fileName, detectedLang, parentId);

    if (success) {
      if (parentId) {
        setExpandedFolders(prev => new Set(prev).add(parentId));
      }
      setIsNewFileDialogOpen(false);
      setNewFileName('');
      toast.success(`Created ${fileName}`);
    } else {
      toast.error(`A file named "${fileName}" already exists in this folder`);
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }
    const folderName = newFolderName.trim();
    const parentId = targetParentId === 'root' ? null : targetParentId;
    const success = addFolder(folderName, parentId);

    if (success) {
      if (parentId) {
        setExpandedFolders(prev => new Set(prev).add(parentId));
      }
      setIsNewFolderDialogOpen(false);
      setNewFolderName('');
      toast.success(`Created folder ${folderName}`);
    } else {
      toast.error(`A folder named "${folderName}" already exists in this location`);
    }
  };

  const handleInlineSubmit = () => {
    if (!inlineCreating || !inlineName.trim()) {
      setInlineCreating(null);
      return;
    }

    const name = inlineName.trim();
    const parentId = inlineCreating.parentId;

    if (inlineCreating.type === 'file') {
      let lang: FileType = 'javascript';
      if (name.endsWith('.ts') || name.endsWith('.tsx')) lang = 'typescript';
      else if (name.endsWith('.html')) lang = 'html';
      else if (name.endsWith('.css')) lang = 'css';
      else if (name.endsWith('.json')) lang = 'json';

      const success = addFile(name, lang, parentId);
      if (success) {
        if (parentId) setExpandedFolders(prev => new Set(prev).add(parentId));
        toast.success(`Created ${name}`);
      } else {
        toast.error(`File "${name}" already exists`);
      }
    } else {
      const success = addFolder(name, parentId);
      if (success) {
        if (parentId) setExpandedFolders(prev => new Set(prev).add(parentId));
        toast.success(`Created folder ${name}`);
      } else {
        toast.error(`Folder "${name}" already exists`);
      }
    }

    setInlineCreating(null);
    setInlineName('');
  };

  const openRenameDialog = (id: string, currentName: string, type: 'file' | 'folder', e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToRename({ id, name: currentName, type });
    setRenameValue(currentName);
    setIsRenameDialogOpen(true);
  };

  const handleRename = () => {
    if (!itemToRename || !renameValue.trim()) return;
    if (itemToRename.type === 'file') {
      renameFile(itemToRename.id, renameValue.trim());
      toast.success(`Renamed file to ${renameValue.trim()}`);
    } else {
      renameFolder(itemToRename.id, renameValue.trim());
      toast.success(`Renamed folder to ${renameValue.trim()}`);
    }
    setIsRenameDialogOpen(false);
  };

  const handleDeleteFile = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete file "${name}" permanently?`)) {
      deleteFile(id);
      toast.success(`Deleted ${name}`);
    }
  };

  const handleDeleteFolder = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete folder "${name}" and all contents inside?`)) {
      deleteFolder(id);
      toast.success(`Deleted folder ${name}`);
    }
  };

  // Filter files by search
  const filteredFiles = searchQuery 
    ? files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : files;

  // Render tree node recursively
  const renderTree = (parentId: string | null, depth: number = 0) => {
    const childFolders = folders.filter(f => f.parentId === parentId);
    const childFiles = files.filter(f => f.parentId === parentId);

    return (
      <div className="space-y-0.5">
        {/* Child Folders */}
        {childFolders.map(folder => {
          const isExpanded = expandedFolders.has(folder.id);
          const isSelected = selectedFolderId === folder.id;

          return (
            <div key={folder.id} className="select-none">
              <div 
                onClick={() => {
                  setSelectedFolderId(folder.id);
                  toggleFolder(folder.id);
                }}
                style={{ paddingLeft: `${Math.max(depth * 12 + 10, 10)}px` }}
                className={cn(
                  "group flex items-center justify-between h-7 pr-2 text-xs rounded-sm cursor-pointer transition-colors relative",
                  isSelected ? "bg-[#37373d] text-white" : "text-[#bbbbbb] hover:bg-[#2a2d2e] hover:text-white"
                )}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="text-[#888888] shrink-0">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                  <span className="text-amber-400 shrink-0">
                    {isExpanded ? <FolderOpen size={15} /> : <FolderIcon size={15} />}
                  </span>
                  <span className="truncate font-medium text-[12px]">{folder.name}</span>
                </div>

                {/* Folder Hover Actions */}
                <div className="hidden group-hover:flex items-center gap-1 shrink-0 text-[#888888]">
                  <button
                    title="New File Inside"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedFolders(prev => new Set(prev).add(folder.id));
                      setInlineCreating({ type: 'file', parentId: folder.id });
                      setInlineName('');
                    }}
                    className="p-1 hover:text-white hover:bg-[#454545] rounded"
                  >
                    <FilePlus2 size={12} />
                  </button>

                  <button
                    title="New Folder Inside"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedFolders(prev => new Set(prev).add(folder.id));
                      setInlineCreating({ type: 'folder', parentId: folder.id });
                      setInlineName('');
                    }}
                    className="p-1 hover:text-white hover:bg-[#454545] rounded"
                  >
                    <FolderPlus size={12} />
                  </button>

                  <button
                    title="Rename"
                    onClick={(e) => openRenameDialog(folder.id, folder.name, 'folder', e)}
                    className="p-1 hover:text-white hover:bg-[#454545] rounded"
                  >
                    <Pencil size={11} />
                  </button>

                  <button
                    title="Delete"
                    onClick={(e) => handleDeleteFolder(folder.id, folder.name, e)}
                    className="p-1 hover:text-red-400 hover:bg-[#454545] rounded"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              {/* Nested Contents */}
              {isExpanded && (
                <div className="relative border-l border-[#3a3a3a] ml-4">
                  {/* Inline creation inside folder */}
                  {inlineCreating && inlineCreating.parentId === folder.id && (
                    <div 
                      style={{ paddingLeft: `${(depth + 1) * 12 + 10}px` }} 
                      className="flex items-center gap-1.5 h-7 pr-2"
                    >
                      {inlineCreating.type === 'file' ? (
                        <FileCode size={14} className="text-yellow-400 shrink-0" />
                      ) : (
                        <FolderIcon size={14} className="text-amber-400 shrink-0" />
                      )}
                      <input
                        autoFocus
                        type="text"
                        value={inlineName}
                        placeholder={inlineCreating.type === 'file' ? 'filename.js' : 'folder-name'}
                        onChange={(e) => setInlineName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleInlineSubmit();
                          if (e.key === 'Escape') setInlineCreating(null);
                        }}
                        onBlur={handleInlineSubmit}
                        className="bg-[#1e1e1e] border border-[#007acc] text-white text-[11px] h-5 px-1.5 rounded outline-none w-full"
                      />
                    </div>
                  )}
                  {renderTree(folder.id, depth + 1)}
                </div>
              )}
            </div>
          );
        })}

        {/* Child Files */}
        {childFiles.map(file => {
          const isActive = activeFileId === file.id;
          const isDirty = Boolean(dirtyFileIds[file.id]);

          return (
            <div
              key={file.id}
              onClick={() => {
                setActiveFileId(file.id);
                setSelectedFolderId(file.parentId);
              }}
              style={{ paddingLeft: `${Math.max(depth * 12 + 22, 22)}px` }}
              className={cn(
                "group flex items-center justify-between h-7 pr-2 text-xs rounded-sm cursor-pointer transition-colors relative select-none",
                isActive 
                  ? "bg-[#37373d] text-white font-medium shadow-sm border-l-2 border-[#007acc]" 
                  : "text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white"
              )}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {getFileIcon(file.language, file.name)}
                <span className="truncate text-[12px]">{file.name}</span>
                {isDirty && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
                )}
              </div>

              {/* File Hover Actions */}
              <div className="hidden group-hover:flex items-center gap-1 shrink-0 text-[#888888]">
                <button
                  title="Rename"
                  onClick={(e) => openRenameDialog(file.id, file.name, 'file', e)}
                  className="p-1 hover:text-white hover:bg-[#454545] rounded"
                >
                  <Pencil size={11} />
                </button>

                {files.length > 1 && (
                  <button
                    title="Delete"
                    onClick={(e) => handleDeleteFile(file.id, file.name, e)}
                    className="p-1 hover:text-red-400 hover:bg-[#454545] rounded"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-[#252526] text-[#cccccc] flex flex-col select-none border-r border-[#3e3e42]">
      {/* Top Header with VS Code Explorer Title & Actions */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-[#3e3e42] bg-[#2d2d2d] shrink-0">
        <div className="flex items-center gap-1.5">
          <FolderTree size={14} className="text-[#007acc]" />
          <span className="text-[11px] font-bold text-[#bbbbbb] tracking-wider uppercase">
            Explorer
          </span>
        </div>

        {/* Global Explorer Quick Action Icons */}
        <div className="flex items-center gap-0.5 text-[#aaaaaa]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setInlineCreating({ type: 'file', parentId: selectedFolderId });
                    setInlineName('');
                  }}
                  className="p-1 hover:text-white hover:bg-[#3e3e42] rounded transition-colors"
                >
                  <FilePlus2 size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">New File</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setInlineCreating({ type: 'folder', parentId: selectedFolderId });
                    setInlineName('');
                  }}
                  className="p-1 hover:text-white hover:bg-[#3e3e42] rounded transition-colors"
                >
                  <FolderPlus size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">New Folder</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={collapseAllFolders}
                  className="p-1 hover:text-white hover:bg-[#3e3e42] rounded transition-colors"
                >
                  <ChevronsDownUp size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Collapse All</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Quick Search Filter */}
      <div className="p-2 border-b border-[#333333]">
        <div className="relative flex items-center">
          <Search size={12} className="absolute left-2 text-[#777777] pointer-events-none" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-[#3e3e42] focus:border-[#007acc] rounded h-6 pl-6 pr-6 text-xs text-white placeholder-[#777777] outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-1.5 text-[#777777] hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Workspace Root Section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 space-y-1">
        {/* Workspace Root Banner */}
        <div 
          onClick={() => {
            setSelectedFolderId(null);
            setIsWorkspaceExpanded(!isWorkspaceExpanded);
          }}
          className={cn(
            "flex items-center justify-between px-2 h-7 text-xs font-semibold uppercase tracking-wider rounded cursor-pointer transition-colors",
            selectedFolderId === null ? "bg-[#333333] text-white" : "text-[#aaaaaa] hover:bg-[#2a2d2e] hover:text-white"
          )}
        >
          <div className="flex items-center gap-1.5 truncate max-w-[140px]">
            {isWorkspaceExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="truncate text-[11px]">
              {gitState.repo ? `📦 ${gitState.repo}` : '📁 WORKSPACE'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#888888]">
            {gitState.initialized && (
              <button
                title={`Git Branch: ${gitState.branch} (${gitState.remoteUrl || 'Local'})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setGitModalOpen(true);
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1e1e1e] hover:bg-[#2a2d2e] text-[10px] text-emerald-400 font-mono lowercase border border-[#444]"
              >
                <GitBranch size={10} />
                <span className="truncate max-w-[50px]">{gitState.branch}</span>
              </button>
            )}
            <button
              title="Add File to Root"
              onClick={(e) => {
                e.stopPropagation();
                openCreateFileDialog('root');
              }}
              className="p-0.5 hover:text-white"
            >
              <Plus size={13} />
            </button>
            <button
              title="Add Folder to Root"
              onClick={(e) => {
                e.stopPropagation();
                openCreateFolderDialog('root');
              }}
              className="p-0.5 hover:text-white"
            >
              <FolderPlus size={13} />
            </button>
          </div>
        </div>

        {/* Tree Content */}
        {isWorkspaceExpanded && (
          <div className="space-y-0.5 pt-0.5">
            {/* Inline creation at root */}
            {inlineCreating && inlineCreating.parentId === null && (
              <div className="flex items-center gap-1.5 h-7 px-4">
                {inlineCreating.type === 'file' ? (
                  <FileCode size={14} className="text-yellow-400 shrink-0" />
                ) : (
                  <FolderIcon size={14} className="text-amber-400 shrink-0" />
                )}
                <input
                  autoFocus
                  type="text"
                  value={inlineName}
                  placeholder={inlineCreating.type === 'file' ? 'filename.js' : 'folder-name'}
                  onChange={(e) => setInlineName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInlineSubmit();
                    if (e.key === 'Escape') setInlineCreating(null);
                  }}
                  onBlur={handleInlineSubmit}
                  className="bg-[#1e1e1e] border border-[#007acc] text-white text-[11px] h-5 px-1.5 rounded outline-none w-full"
                />
              </div>
            )}

            {searchQuery ? (
              filteredFiles.length > 0 ? (
                filteredFiles.map(file => (
                  <div
                    key={file.id}
                    onClick={() => setActiveFileId(file.id)}
                    className={cn(
                      "flex items-center justify-between px-3 h-7 text-xs rounded cursor-pointer",
                      activeFileId === file.id ? "bg-[#007acc]/20 text-white font-medium" : "text-[#cccccc] hover:bg-[#2a2d2e]"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {getFileIcon(file.language, file.name)}
                      <span className="truncate text-xs">{file.name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-[#777777]">
                  No matching files found
                </div>
              )
            ) : (
              renderTree(null, 0)
            )}
          </div>
        )}
      </div>

      {/* Footer Quick stats */}
      <div className="h-7 px-3 bg-[#1e1e1e] border-t border-[#333333] flex items-center justify-between text-[10px] text-[#888888] shrink-0">
        <span>{files.length} {files.length === 1 ? 'file' : 'files'}</span>
        <span>{folders.length} {folders.length === 1 ? 'folder' : 'folders'}</span>
      </div>

      {/* New File Dialog */}
      <Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-[#252526] border-[#454545] text-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <FilePlus2 size={16} className="text-[#007acc]" />
              Create New File
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs text-[#aaaaaa]">Destination Folder</Label>
              <Select value={targetParentId} onValueChange={setTargetParentId}>
                <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-xs text-white h-8">
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent className="bg-[#252526] border-[#454545] text-white">
                  <SelectItem value="root" className="text-xs font-semibold">📁 Root Workspace</SelectItem>
                  {folders.map(f => (
                    <SelectItem key={f.id} value={f.id} className="text-xs">
                      📁 {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-[#aaaaaa]">File Name</Label>
              <Input
                autoFocus
                placeholder="e.g. app.js, helper.ts, styles.css"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFile(); }}
                className="bg-[#1e1e1e] border-[#454545] text-xs text-white h-8"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-[#aaaaaa]">Language Type</Label>
              <Select value={newFileType} onValueChange={(val: any) => setNewFileType(val)}>
                <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-xs text-white h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#252526] border-[#454545] text-white">
                  <SelectItem value="javascript" className="text-xs">JavaScript (.js)</SelectItem>
                  <SelectItem value="typescript" className="text-xs">TypeScript (.ts)</SelectItem>
                  <SelectItem value="html" className="text-xs">HTML (.html)</SelectItem>
                  <SelectItem value="css" className="text-xs">CSS (.css)</SelectItem>
                  <SelectItem value="json" className="text-xs">JSON (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNewFileDialogOpen(false)}
              className="text-xs text-[#888888]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateFile}
              className="text-xs bg-[#007acc] hover:bg-[#007acc]/90 text-white"
            >
              Create File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-[#252526] border-[#454545] text-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <FolderPlus size={16} className="text-amber-400" />
              Create New Folder
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs text-[#aaaaaa]">Parent Folder</Label>
              <Select value={targetParentId} onValueChange={setTargetParentId}>
                <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-xs text-white h-8">
                  <SelectValue placeholder="Select parent" />
                </SelectTrigger>
                <SelectContent className="bg-[#252526] border-[#454545] text-white">
                  <SelectItem value="root" className="text-xs font-semibold">📁 Root Workspace</SelectItem>
                  {folders.map(f => (
                    <SelectItem key={f.id} value={f.id} className="text-xs">
                      📁 {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-[#aaaaaa]">Folder Name</Label>
              <Input
                autoFocus
                placeholder="e.g. components, utils, styles"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); }}
                className="bg-[#1e1e1e] border-[#454545] text-xs text-white h-8"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNewFolderDialogOpen(false)}
              className="text-xs text-[#888888]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateFolder}
              className="text-xs bg-[#007acc] hover:bg-[#007acc]/90 text-white"
            >
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-[#252526] border-[#454545] text-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              Rename {itemToRename?.type === 'file' ? 'File' : 'Folder'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <Input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); }}
              className="bg-[#1e1e1e] border-[#454545] text-xs text-white h-8"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRenameDialogOpen(false)}
              className="text-xs text-[#888888]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRename}
              className="text-xs bg-[#007acc] hover:bg-[#007acc]/90 text-white"
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
