import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { parseGitHubUrl, cloneGitHubRepository, STARTER_TEMPLATES, StarterTemplate } from '@/lib/gitService';
import { 
  Github, 
  GitBranch, 
  Download, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Loader2, 
  X, 
  FolderGit2, 
  BookOpen, 
  Activity, 
  Brain, 
  Code2, 
  ArrowRight 
} from 'lucide-react';
import { toast } from 'sonner';

export const GitModal: React.FC = () => {
  const { isGitModalOpen, setGitModalOpen, loadStarterTemplate, loadClonedWorkspace, gitState, files } = useStore();
  const [repoInput, setRepoInput] = useState('');
  const [branchInput, setBranchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [activeTab, setActiveTab] = useState<'clone' | 'status' | 'templates'>('clone');

  if (!isGitModalOpen) return null;

  const parsedUrl = parseGitHubUrl(repoInput);

  const handleCloneRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoInput.trim()) {
      toast.error('Please enter a GitHub repository URL or user/repo format');
      return;
    }

    const parsed = parseGitHubUrl(repoInput);
    if (!parsed) {
      toast.error('Invalid GitHub URL format. Example: owner/repo or https://github.com/owner/repo');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Connecting to GitHub API...');

    try {
      const result = await cloneGitHubRepository(
        {
          owner: parsed.owner,
          repo: parsed.repo,
          branch: branchInput.trim() || parsed.branch || 'main',
          subpath: parsed.subpath
        },
        (status) => setLoadingStep(status)
      );

      loadClonedWorkspace(result.files, result.folders, result.gitInfo);
      toast.success(`Successfully cloned ${result.gitInfo.owner}/${result.gitInfo.repo} (${result.files.length} files, ${result.folders.length} folders)`);
      setGitModalOpen(false);
      setRepoInput('');
      setBranchInput('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to clone repository from GitHub');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleSelectTemplate = (template: StarterTemplate) => {
    loadStarterTemplate(template.id);
    toast.success(`Loaded template: ${template.name}`);
    setGitModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#1e1e1e] border border-[#3e3e42] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#252526] border-b border-[#3e3e42] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#30363d] flex items-center justify-center text-white shadow-inner">
              <Github size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">Git & GitHub Repository Cloner</h2>
                {gitState.initialized && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {gitState.branch}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-zinc-400">Clone public GitHub repositories, populate file tree, and manage Git state</p>
            </div>
          </div>
          <button
            onClick={() => setGitModalOpen(false)}
            className="p-1.5 rounded-md hover:bg-[#333] text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#333] bg-[#222225] px-5 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('clone')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-medium transition-colors ${
              activeTab === 'clone'
                ? 'border-[#007acc] text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FolderGit2 size={14} />
            Clone Repository
          </button>
          {gitState.initialized && (
            <button
              onClick={() => setActiveTab('status')}
              className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-medium transition-colors ${
                activeTab === 'status'
                  ? 'border-[#007acc] text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <GitBranch size={14} />
              Local Git Status
            </button>
          )}
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-medium transition-colors ${
              activeTab === 'templates'
                ? 'border-[#007acc] text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles size={14} />
            Starter Project Templates
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'clone' ? (
            <div className="space-y-5">
              <form onSubmit={handleCloneRepo} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    GitHub Repository URL, Shorthand, or SSH Clone Link
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. https://github.com/lodash/lodash or facebook/react or git@github.com:owner/repo.git"
                      value={repoInput}
                      onChange={(e) => setRepoInput(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-[#141416] border border-[#3e3e42] focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none font-mono"
                    />
                  </div>
                  
                  {/* Live Parsed Preview Badge */}
                  {parsedUrl && (
                    <div className="mt-2 p-2.5 rounded-lg bg-[#1a2332] border border-[#234567] text-[11px] text-zinc-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-400">Target:</span>
                        <span className="text-[#58a6ff] font-mono font-medium">{parsedUrl.owner}/{parsedUrl.repo}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-400">Branch:</span>
                        <span className="text-emerald-400 font-mono">{branchInput || parsedUrl.branch || 'main (auto-detect)'}</span>
                      </div>
                      {parsedUrl.subpath && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-400">Subpath:</span>
                          <span className="text-amber-400 font-mono">{parsedUrl.subpath}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-[11px] text-zinc-500 mt-1.5">
                    Supports any public repository on GitHub. Files (.js, .ts, .html, .css, .json) and folder structures will be parsed directly into your workspace.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                      <GitBranch size={13} className="text-zinc-400" />
                      Branch (Optional override)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. main, master, or leave empty"
                      value={branchInput}
                      onChange={(e) => setBranchInput(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-[#141416] border border-[#3e3e42] focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none font-mono"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isLoading || !repoInput.trim()}
                      className="w-full h-[38px] bg-[#007acc] hover:bg-[#006bb3] disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Cloning Repository...</span>
                        </>
                      ) : (
                        <>
                          <Download size={15} />
                          <span>Clone & Populate Workspace</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Progress Indicator */}
              {isLoading && (
                <div className="bg-[#24283b]/60 border border-[#7aa2f7]/30 rounded-lg p-3.5 flex items-center gap-3">
                  <Loader2 size={18} className="animate-spin text-[#7aa2f7] shrink-0" />
                  <p className="text-xs text-zinc-300 animate-pulse">{loadingStep || 'Fetching repository...'}</p>
                </div>
              )}

              {/* Quick Popular Repositories */}
              <div className="pt-2">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Quick Clone Suggestions</span>
                  <span className="text-[10px] text-zinc-500 lowercase font-normal">click to auto-fill</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { name: 'lodash/lodash', desc: 'Modern JavaScript utility library', branch: 'main' },
                    { name: 'tastejs/todomvc/tree/master/examples/vanillajs', desc: 'Vanilla JS TodoMVC Architecture', branch: 'master' },
                    { name: 'trekhleb/javascript-algorithms', desc: 'Algorithms and data structures in JS', branch: 'master' },
                    { name: 'mrdoob/three.js/tree/master/examples', desc: 'Three.js 3D WebGL / Canvas examples', branch: 'master' },
                    { name: 'd3/d3', desc: 'Data visualization library for web', branch: 'main' },
                    { name: 'chartjs/Chart.js', desc: 'Simple HTML5 charting for designers & developers', branch: 'master' }
                  ].map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setRepoInput(item.name);
                        setBranchInput(item.branch);
                      }}
                      className="text-left p-2.5 rounded-lg bg-[#252528] hover:bg-[#2e2e33] border border-[#333] hover:border-[#444] transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-medium text-white group-hover:text-[#58a6ff] truncate mr-2">
                          {item.name}
                        </span>
                        <ArrowRight size={12} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'status' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#252528] border border-[#38383c] space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#333]">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="text-[#58a6ff]" size={16} />
                    <span className="text-xs font-semibold text-white">Current Git Repository</span>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Branch: {gitState.branch}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Remote URL:</span>
                    <span className="text-white font-mono truncate block">{gitState.remoteUrl || 'Local Playground Repo'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Total Commits:</span>
                    <span className="text-white font-mono">{gitState.commits.length}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Workspace Files:</span>
                    <span className="text-white font-mono">{files.length}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Staged Files:</span>
                    <span className="text-white font-mono">{gitState.staged.length}</span>
                  </div>
                </div>
              </div>

              {/* Commit History */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Commit Log</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {gitState.commits.slice().reverse().map((commit) => (
                    <div key={commit.hash} className="p-2.5 rounded-lg bg-[#252528] border border-[#333] flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-white font-medium">{commit.message}</p>
                        <p className="text-[11px] text-zinc-500">
                          {commit.author} • {new Date(commit.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-[#18181a] border border-[#444] font-mono text-[10px] text-amber-400">
                        {commit.hash}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400 mb-2">
                Load ready-to-run interactive templates with pre-configured unit tests, canvases, and clean modules.
              </p>
              <div className="grid grid-cols-1 gap-3">
                {STARTER_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="p-4 rounded-xl bg-[#252528] border border-[#38383c] hover:border-[#007acc] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#007acc]/20 text-[#58a6ff] border border-[#007acc]/30">
                          {tmpl.badge}
                        </span>
                        <h4 className="text-xs font-semibold text-white group-hover:text-[#58a6ff] transition-colors">
                          {tmpl.name}
                        </h4>
                      </div>
                      <p className="text-[12px] text-zinc-400 leading-relaxed">
                        {tmpl.description}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500 font-mono">
                        {tmpl.files.map(f => (
                          <span key={f.name} className="bg-[#18181a] px-1.5 py-0.5 rounded border border-[#333]">
                            {f.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectTemplate(tmpl)}
                      className="px-3.5 py-2 bg-[#333] hover:bg-[#007acc] text-zinc-200 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                    >
                      <span>Load Template</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#252526] border-t border-[#3e3e42] flex items-center justify-between text-[11px] text-zinc-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Git Engine Connected • GitHub REST v3</span>
          </div>
          <button
            onClick={() => setGitModalOpen(false)}
            className="px-3 py-1 bg-[#333] hover:bg-[#444] text-white rounded text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
