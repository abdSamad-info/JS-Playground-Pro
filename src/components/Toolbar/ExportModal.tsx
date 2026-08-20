import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { exportProjectAsZip, exportProjectAsJson, exportSingleFile } from '@/lib/projectExporter';
import { 
  Download, 
  FileArchive, 
  FileCode2, 
  FileJson2, 
  Copy, 
  Check, 
  X, 
  Package, 
  FolderTree, 
  Loader2, 
  Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';

export const ExportModal: React.FC = () => {
  const { 
    isExportModalOpen, 
    setExportModalOpen, 
    files, 
    folders, 
    activeFileId,
    themePreset,
    accentColor,
    fontSize,
    fontFamily 
  } = useStore();

  const [projectName, setProjectName] = useState('my-js-playground');
  const [isZipping, setIsZipping] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isExportModalOpen) return null;

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const handleExportZip = async () => {
    setIsZipping(true);
    try {
      await exportProjectAsZip(files, folders, projectName.trim() || 'js-playground');
      toast.success('Downloaded project ZIP archive successfully!');
      setExportModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to generate ZIP archive: ' + (err.message || 'Unknown error'));
    } finally {
      setIsZipping(false);
    }
  };

  const handleExportJson = () => {
    try {
      exportProjectAsJson(files, folders, { themePreset, accentColor, fontSize, fontFamily });
      toast.success('Exported workspace backup JSON');
      setExportModalOpen(false);
    } catch (err: any) {
      toast.error('Failed to export JSON backup');
    }
  };

  const handleExportSingle = () => {
    if (!activeFile) {
      toast.error('No active file selected');
      return;
    }
    exportSingleFile(activeFile);
    toast.success(`Downloaded ${activeFile.name}`);
  };

  const handleCopyAllCode = () => {
    const bundle = files.map(f => `// ================= ${f.name} =================\n${f.content}`).join('\n\n');
    navigator.clipboard.writeText(bundle);
    setCopied(true);
    toast.success('All project code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-[#1e1e1e] border border-[#3e3e42] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#252526] border-b border-[#3e3e42] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#007acc]/20 text-[#58a6ff] flex items-center justify-center border border-[#007acc]/30">
              <Download size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Export & Download Project</h2>
              <p className="text-[12px] text-zinc-400">Save your code, assets, and workspace locally</p>
            </div>
          </div>
          <button
            onClick={() => setExportModalOpen(false)}
            className="p-1.5 rounded-md hover:bg-[#333] text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Project Name Field */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Project Archive Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. javascript-algorithms-suite"
              className="w-full bg-[#141416] border border-[#3e3e42] focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none font-mono"
            />
          </div>

          {/* Export Options Grid */}
          <div className="space-y-3">
            {/* ZIP Export Card */}
            <div className="p-4 rounded-xl bg-[#252528] border border-[#38383c] hover:border-[#007acc] transition-all flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <FileArchive size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                    Complete Project ZIP
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-normal">
                      Recommended
                    </span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Includes all {files.length} workspace files, folders, <code className="text-[#58a6ff]">package.json</code>, and documentation.
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportZip}
                disabled={isZipping}
                className="px-3.5 py-2 bg-[#007acc] hover:bg-[#006bb3] disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-sm cursor-pointer"
              >
                {isZipping ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Zipping...</span>
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    <span>Download ZIP</span>
                  </>
                )}
              </button>
            </div>

            {/* Active File Download Card */}
            {activeFile && (
              <div className="p-3.5 rounded-xl bg-[#252528] border border-[#38383c] hover:border-[#444] transition-all flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <FileCode2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white">Active File: <code className="text-emerald-300">{activeFile.name}</code></h4>
                    <p className="text-[11px] text-zinc-400">Download single {activeFile.language} source file</p>
                  </div>
                </div>
                <button
                  onClick={handleExportSingle}
                  className="px-3 py-1.5 bg-[#333] hover:bg-[#444] text-zinc-200 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Download size={13} />
                  <span>Download File</span>
                </button>
              </div>
            )}

            {/* JSON Workspace Backup Card */}
            <div className="p-3.5 rounded-xl bg-[#252528] border border-[#38383c] hover:border-[#444] transition-all flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <FileJson2 size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-white">Workspace JSON Snapshot</h4>
                  <p className="text-[11px] text-zinc-400">Complete JSON snapshot for backup and migration</p>
                </div>
              </div>
              <button
                onClick={handleExportJson}
                className="px-3 py-1.5 bg-[#333] hover:bg-[#444] text-zinc-200 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Download size={13} />
                <span>Export JSON</span>
              </button>
            </div>

            {/* Copy All Code Card */}
            <div className="p-3.5 rounded-xl bg-[#252528] border border-[#38383c] hover:border-[#444] transition-all flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                  <Copy size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-white">Copy All Code to Clipboard</h4>
                  <p className="text-[11px] text-zinc-400">Concatenates all files formatted for sharing or prompts</p>
                </div>
              </div>
              <button
                onClick={handleCopyAllCode}
                className="px-3 py-1.5 bg-[#333] hover:bg-[#444] text-zinc-200 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#252526] border-t border-[#3e3e42] flex items-center justify-between text-[11px] text-zinc-400 shrink-0">
          <span>{files.length} files • {folders.length} folders</span>
          <button
            onClick={() => setExportModalOpen(false)}
            className="px-3 py-1 bg-[#333] hover:bg-[#444] text-white rounded text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
