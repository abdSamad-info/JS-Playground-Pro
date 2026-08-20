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
  const { isGitModalOpen, setGitModalOpen, loadStarterTemplate, loadClonedWorkspace } = useStore();
  const [repoInput, setRepoInput] = useState('');
  const [branchInput, setBranchInput] = useState('main');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [activeTab, setActiveTab] = useState<'clone' | 'templates'>('clone');

  if (!isGitModalOpen) return null;

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

      loadClonedWorkspace(result.files, result.folders);
      toast.success(`Successfully imported ${parsed.owner}/${parsed.repo} (${result.files.length} files)`);
      setGitModalOpen(false);
      setRepoInput('');
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
        className="w-full max-w-2xl bg-[#1e1e1e] border border-[#3e3e42] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#252526] border-b border-[#3e3e42] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#30363d] flex items-center justify-center text-white shadow-inner">
              <Github size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Git & GitHub Integration</h2>
              <p className="text-[12px] text-zinc-400">Clone repositories or load curated JavaScript template projects</p>
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
            Clone from GitHub
          </button>
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
                    GitHub Repository URL or <code className="text-[#58a6ff]">owner/repo</code>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. facebook/react or https://github.com/lodash/lodash"
                      value={repoInput}
                      onChange={(e) => setRepoInput(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-[#141416] border border-[#3e3e42] focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Supports any public repository on GitHub containing JavaScript, TypeScript, HTML, CSS, or JSON files.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                      <GitBranch size={13} className="text-zinc-400" />
                      Branch (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="main (default) or master"
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
                          <span>Cloning...</span>
                        </>
                      ) : (
                        <>
                          <Download size={15} />
                          <span>Clone & Load Repository</span>
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
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
                  Quick Clone Suggestions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { name: 'lodash/lodash', desc: 'Modern JavaScript utility library', branch: 'main' },
                    { name: 'expressjs/express', desc: 'Fast, unopinionated web framework for Node', branch: 'master' },
                    { name: 'tastejs/todomvc', desc: 'Helping you select an MV* framework', branch: 'master' },
                    { name: 'trekhleb/javascript-algorithms', desc: 'Algorithms and data structures in JS', branch: 'master' }
                  ].map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        setRepoInput(item.name);
                        setBranchInput(item.branch);
                      }}
                      className="text-left p-2.5 rounded-lg bg-[#252528] hover:bg-[#2e2e33] border border-[#333] hover:border-[#444] transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-medium text-white group-hover:text-[#58a6ff]">
                          {item.name}
                        </span>
                        <ArrowRight size={12} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{item.desc}</p>
                    </button>
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
          <span>Git Playground Engine</span>
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
