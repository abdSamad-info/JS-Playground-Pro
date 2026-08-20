import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Terminal as TerminalIcon, X, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { ScrollArea } from '@/components/shadcn-ui/scroll-area';
import { parseGitHubUrl, cloneGitHubRepository } from '@/lib/gitService';

const renderJavaScriptLine = (line: string, key: string | number) => {
  if (!line.trim()) {
    return <div key={key} className="min-h-[1.2rem] font-mono leading-relaxed">&nbsp;</div>;
  }

  if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
    return <div key={key} className="text-[#6a9955] font-mono leading-relaxed whitespace-pre">{line}</div>;
  }

  const tokenRegex = /(\/\/[^\n]*)|("[^"\\]*(?:\\.[^"\\]*)*")|('[^'\\]*(?:\\.[^'\\]*)*')|(`[^`\\]*(?:\\.[^`\\]*)*`)|(\b(?:const|let|var|function|return|if|else|for|while|class|import|export|from|new|this|try|catch|finally|async|await|switch|case|default|break|continue|throw|typeof|instanceof|in|of|void|delete|debugger)\b)|(\b(?:console|log|error|warn|info|document|window|process|require|module|exports|Blob|JSON|Object|Array|String|Number|Boolean|Function|RegExp|Map|Set|Promise|Error)\b)|(\b\d+(?:\.\d+)?\b)|(\b\w+(?=\())|([{}()[\].,;+\-*/%&|^=!<>?:~]+)|(\s+)|(\b\w+\b)/g;

  let match;
  const spans: React.ReactNode[] = [];
  let lastIndex = 0;
  let tokenIdx = 0;

  tokenRegex.lastIndex = 0;

  while ((match = tokenRegex.exec(line)) !== null) {
    const matchedText = match[0];
    
    if (match.index > lastIndex) {
      const gapText = line.substring(lastIndex, match.index);
      spans.push(<span key={`gap-${key}-${tokenIdx++}`} className="text-[#cccccc]">{gapText}</span>);
    }

    if (match[1]) {
      spans.push(<span key={`comment-${key}-${tokenIdx++}`} className="text-[#6a9955] font-mono">{matchedText}</span>);
    } else if (match[2] || match[3] || match[4]) {
      spans.push(<span key={`string-${key}-${tokenIdx++}`} className="text-[#ce9178] font-mono">{matchedText}</span>);
    } else if (match[5]) {
      spans.push(<span key={`keyword-${key}-${tokenIdx++}`} className="text-[#c586c0] font-bold font-mono">{matchedText}</span>);
    } else if (match[6]) {
      spans.push(<span key={`builtin-${key}-${tokenIdx++}`} className="text-[#4ec9b0] font-mono">{matchedText}</span>);
    } else if (match[7]) {
      spans.push(<span key={`number-${key}-${tokenIdx++}`} className="text-[#b5cea8] font-mono">{matchedText}</span>);
    } else if (match[8]) {
      spans.push(<span key={`function-${key}-${tokenIdx++}`} className="text-[#dcdcaa] font-mono">{matchedText}</span>);
    } else if (match[9]) {
      spans.push(<span key={`symbol-${key}-${tokenIdx++}`} className="text-[#808080] font-mono">{matchedText}</span>);
    } else if (match[10]) {
      spans.push(<span key={`space-${key}-${tokenIdx++}`}>{matchedText}</span>);
    } else {
      spans.push(<span key={`ident-${key}-${tokenIdx++}`} className="text-[#9cdcfe] font-mono">{matchedText}</span>);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    const trailingText = line.substring(lastIndex);
    spans.push(<span key={`trailing-${key}-${tokenIdx++}`} className="text-[#cccccc]">{trailingText}</span>);
  }

  return (
    <div key={key} className="font-mono whitespace-pre py-0.5 leading-relaxed flex flex-wrap">
      {spans}
    </div>
  );
};

const renderFormattedLine = (line: string, lineKey: string | number, language?: string) => {
  if (language === 'javascript' || language === 'typescript') {
    return renderJavaScriptLine(line, lineKey);
  }

  // 1. Simple ANSI helper check supporting blue, green, and red text (34, 32, 31)
  if (line.includes('\u001b[') || line.includes('\u001b[0m')) {
    const parts: React.ReactNode[] = [];
    let currentIdx = 0;
    const regex = /\u001b\[(\d+)m([^\u001b]+)\u001b\[0m/g;
    let match;
    let partKeyIdx = 0;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > currentIdx) {
        parts.push(<span key={`pre-${lineKey}-${partKeyIdx++}`}>{line.substring(currentIdx, match.index)}</span>);
      }
      const code = match[1];
      const text = match[2];
      let colorClass = '';
      if (code === '34') colorClass = 'text-blue-400 font-bold';
      else if (code === '32') colorClass = 'text-emerald-400 font-semibold';
      else if (code === '31') colorClass = 'text-rose-400 font-semibold';
      parts.push(<span key={`ansi-${lineKey}-${partKeyIdx++}`} className={colorClass}>{text}</span>);
      currentIdx = regex.lastIndex;
    }
    if (currentIdx < line.length) {
      parts.push(<span key={`post-${lineKey}-${partKeyIdx++}`}>{line.substring(currentIdx)}</span>);
    }
    return <div key={lineKey} className="flex flex-wrap gap-2">{parts}</div>;
  }

  const lowerLine = line.toLowerCase();
  
  // Custom prefix markers mapping and styling
  if (lowerLine.startsWith('error:') || lowerLine.startsWith('runtime error:')) {
    const prefix = lowerLine.startsWith('error:') ? 'error:' : 'runtime error:';
    const cleanContent = line.substring(prefix.length).trim();
    return (
      <div key={lineKey} className="text-red-400 flex items-start gap-1.5 py-0.5">
        <span className="bg-red-500/20 text-red-400 px-1 py-0.5 rounded text-[9px] font-bold tracking-wider shrink-0 uppercase">Error</span>
        <span className="break-all font-mono">{cleanContent || line}</span>
      </div>
    );
  }

  if (lowerLine.startsWith('warning:')) {
    const cleanContent = line.substring('warning:'.length).trim();
    return (
      <div key={lineKey} className="text-yellow-400 flex items-start gap-1.5 py-0.5">
        <span className="bg-yellow-500/20 text-yellow-400 px-1 py-0.5 rounded text-[9px] font-bold tracking-wider shrink-0 uppercase">Warning</span>
        <span className="break-all font-mono">{cleanContent || line}</span>
      </div>
    );
  }

  if (lowerLine.startsWith('info:')) {
    const cleanContent = line.substring('info:'.length).trim();
    return (
      <div key={lineKey} className="text-blue-400 flex items-start gap-1.5 py-0.5">
        <span className="bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded text-[9px] font-bold tracking-wider shrink-0 uppercase">Info</span>
        <span className="break-all font-mono">{cleanContent || line}</span>
      </div>
    );
  }

  if (line.startsWith('bash:') || lowerLine.includes('not found') || lowerLine.includes('no such file')) {
    return <div key={lineKey} className="text-rose-400 font-semibold font-mono py-0.5">{line}</div>;
  }

  if (lowerLine.includes('execution finished successfully')) {
    return <div key={lineKey} className="text-emerald-400 font-mono italic opacity-95 py-0.5">{line}</div>;
  }

  if (lowerLine.startsWith('available commands:')) {
    return <div key={lineKey} className="text-cyan-400 font-semibold border-b border-cyan-800/20 pb-1 mb-1 font-mono py-0.5">{line}</div>;
  }

  return <div key={lineKey} className="text-[#cccccc] font-mono whitespace-pre-wrap py-0.5 leading-relaxed">{line}</div>;
};

export const SimulatedTerminal: React.FC = () => {
  const { 
    files, 
    folders, 
    terminalLogs, 
    addTerminalLog, 
    clearTerminalLogs, 
    addFolder, 
    addFile, 
    activeFileId,
    gitState,
    setGitState,
    loadClonedWorkspace 
  } = useStore();
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('js-playground-term-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [tempInput, setTempInput] = useState<string>('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('js-playground-term-history', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [terminalLogs]);

  const executeSingleCommand = async (trimmedSub: string): Promise<boolean> => {
    const args = trimmedSub.split(/\s+/).filter(Boolean);
    if (args.length === 0) return true;
    const command = args[0].toLowerCase();

    switch (command) {
      case 'help':
        addTerminalLog({ 
          type: 'output', 
          content: 'Available commands:\n  ls         - List files and folders with types and sizes\n  cat        - View file content with syntax highlighting\n  touch      - Create an empty file (e.g. touch test.js)\n  mkdir      - Create a new folder\n  node       - Run a JavaScript file (e.g. node index.js)\n  npm        - Run npm commands (e.g. npm start, npm test)\n  git clone  - Clone a GitHub repo (e.g. git clone lodash/lodash)\n  git status - Show current working tree and staged status\n  git add    - Stage files (e.g. git add . or git add index.js)\n  git commit - Record changes (e.g. git commit -m "update")\n  git log    - Show commit history and hashes\n  history    - Display shell command history\n  clear      - Clear terminal logs\n  whoami     - Show current user\n  date       - Show system time' 
        });
        return true;
      case 'ls': {
        if (folders.length === 0 && files.length === 0) {
          addTerminalLog({ type: 'output', content: 'No files or folders found.' });
          return true;
        }

        const formatSize = (bytes: number) => {
          if (bytes < 1024) return `${bytes} B`;
          const kb = bytes / 1024;
          return `${kb.toFixed(1)} KB`;
        };

        const typeMap: Record<string, string> = {
          javascript: '[JS script]',
          html: '[HTML doc]',
          css: '[CSS style]',
          json: '[JSON file]',
          typescript: '[TS script]'
        };

        let outputLines = [
          'TYPE          SIZE       NAME',
          '-----------------------------------------'
        ];

        folders.forEach(fd => {
          outputLines.push(`[Folder]       -         \u001b[34m${fd.name}/\u001b[0m`);
        });

        files.forEach(f => {
          const typeStr = (typeMap[f.language] || '[File]').padEnd(12);
          const sizeBytes = new Blob([f.content]).size;
          const sizeStr = formatSize(sizeBytes).padEnd(9);
          outputLines.push(`${typeStr}  ${sizeStr}  ${f.name}`);
        });

        addTerminalLog({ type: 'output', content: outputLines.join('\n') });
        return true;
      }
      case 'cat':
        if (args.length < 2) {
          addTerminalLog({ type: 'output', content: 'Usage: cat <filename>' });
          return false;
        } else {
          const file = files.find(f => f.name === args[1]);
          if (file) {
            addTerminalLog({ type: 'output', content: file.content, language: file.language });
            return true;
          } else {
            addTerminalLog({ type: 'output', content: `cat: ${args[1]}: No such file` });
            return false;
          }
        }
      case 'touch':
        if (args.length < 2) {
          addTerminalLog({ type: 'output', content: 'Usage: touch <filename>' });
          return false;
        } else {
          const fileName = args[1];
          // Determine language from extension
          const ext = fileName.split('.').pop()?.toLowerCase();
          let language: "javascript" | "html" | "css" | "json" | "typescript" = "javascript";
          if (ext === 'html') language = 'html';
          else if (ext === 'css') language = 'css';
          else if (ext === 'json') language = 'json';
          else if (ext === 'ts' || ext === 'tsx') language = 'typescript';

          // Put file in current active directory parent
          const activeFile = files.find(f => f.id === activeFileId);
          const parentId = activeFile ? activeFile.parentId : null;

          const success = addFile(fileName, language, parentId);
          if (success) {
            addTerminalLog({ type: 'output', content: `File '${fileName}' created successfully.` });
            return true;
          } else {
            addTerminalLog({ type: 'output', content: `touch: cannot create file '${fileName}': File already exists` });
            return false;
          }
        }
      case 'git': {
        if (args.length < 2) {
          addTerminalLog({ 
            type: 'output', 
            content: 'Usage: git <subcommand> [<args>]\n\nSupported git commands:\n  clone <repo>  - Clone a repository from GitHub and populate workspace\n  init          - Initialize a local git repository\n  status        - Show working tree and staging status\n  add <file|.>  - Stage changes to be committed\n  commit -m ""  - Record changes with a message\n  log           - Show commit history\n  branch        - Show current active branch\n  remote -v     - List remote repository URLs' 
          });
          return false;
        }

        const sub = args[1].toLowerCase();

        if (sub === 'clone') {
          if (args.length < 3) {
            addTerminalLog({ 
              type: 'output', 
              content: 'fatal: You must specify a repository to clone.\nUsage: git clone <repository-url> [<branch>]\nExample: git clone https://github.com/lodash/lodash' 
            });
            return false;
          }

          const repoTarget = args[2];
          const branchOverride = args[3];
          const parsed = parseGitHubUrl(repoTarget);

          if (!parsed) {
            addTerminalLog({ 
              type: 'output', 
              content: `fatal: repository '${repoTarget}' does not exist or URL is invalid.\nExample: git clone https://github.com/tastejs/todomvc` 
            });
            return false;
          }

          addTerminalLog({ 
            type: 'output', 
            content: `Cloning into '${parsed.repo}'...\nConnecting to GitHub (${parsed.owner}/${parsed.repo})...` 
          });

          try {
            const targetBranch = branchOverride || parsed.branch || 'main';
            const result = await cloneGitHubRepository({
              owner: parsed.owner,
              repo: parsed.repo,
              branch: targetBranch,
              subpath: parsed.subpath
            }, (status) => {
              addTerminalLog({ type: 'output', content: `remote: ${status}` });
            });

            loadClonedWorkspace(result.files, result.folders, result.gitInfo);

            addTerminalLog({
              type: 'output',
              content: `remote: Compressing objects: 100% (${result.files.length}/${result.files.length}), done.\nremote: Total ${result.files.length} files and ${result.folders.length} directories extracted.\n\u001b[32m✔ Successfully cloned ${result.gitInfo.owner}/${result.gitInfo.repo} (${result.gitInfo.branch})\u001b[0m\nHEAD is now at \u001b[33m${result.gitInfo.commitHash}\u001b[0m ${result.gitInfo.description || 'Initial repository clone'}`
            });
            return true;
          } catch (err: any) {
            addTerminalLog({ 
              type: 'output', 
              content: `fatal: ${err.message || 'Clone failed.'}` 
            });
            return false;
          }
        }

        if (sub === 'init') {
          if (gitState.initialized) {
            addTerminalLog({ type: 'output', content: 'Reinitialized existing Git repository in /workspace/.git/' });
            return true;
          } else {
            const newCommit = {
              hash: Math.random().toString(16).substring(2, 9),
              message: 'Initial commit',
              author: 'developer <dev@local>',
              timestamp: Date.now(),
              files: files.map(f => ({ name: f.name, content: f.content }))
            };
            setGitState({
              initialized: true,
              remoteUrl: null,
              owner: null,
              repo: null,
              branch: 'main',
              staged: [],
              commits: [newCommit]
            });
            addTerminalLog({ type: 'output', content: 'Initialized empty Git repository in /workspace/.git/\n[main (root-commit) ' + newCommit.hash + '] Initial commit' });
            return true;
          }
        }

        if (!gitState.initialized) {
          addTerminalLog({ type: 'output', content: 'fatal: not a git repository (or any of the parent directories): .git\nRun `git init` or `git clone <url>` to begin tracking.' });
          return false;
        }

        switch (sub) {
          case 'branch': {
            addTerminalLog({ type: 'output', content: `* \u001b[32m${gitState.branch}\u001b[0m` });
            return true;
          }
          case 'remote': {
            const isVerbose = args.includes('-v') || args.includes('--verbose');
            if (gitState.remoteUrl) {
              if (isVerbose) {
                addTerminalLog({ 
                  type: 'output', 
                  content: `origin\t${gitState.remoteUrl} (fetch)\norigin\t${gitState.remoteUrl} (push)` 
                });
              } else {
                addTerminalLog({ type: 'output', content: 'origin' });
              }
            } else {
              addTerminalLog({ type: 'output', content: isVerbose ? 'No remotes configured.' : '' });
            }
            return true;
          }
          case 'status': {
            const staged = gitState.staged;
            const lastCommit = gitState.commits[gitState.commits.length - 1];
            const committedFiles = lastCommit ? lastCommit.files.map(f => f.name) : [];
            
            const untracked = files.filter(f => !staged.includes(f.name) && !committedFiles.includes(f.name));
            const modified = files.filter(f => {
              if (staged.includes(f.name)) return false;
              if (!committedFiles.includes(f.name)) return false;
              const original = lastCommit?.files.find(cf => cf.name === f.name);
              return original && original.content !== f.content;
            });

            let lines = [`On branch ${gitState.branch}`];
            if (gitState.remoteUrl) {
              lines.push(`Your branch is up to date with 'origin/${gitState.branch}'.`);
            }
            if (gitState.commits.length === 0) {
              lines.push('No commits yet\n');
            } else {
              lines.push('');
            }

            if (staged.length > 0) {
              lines.push('Changes to be committed:');
              lines.push('  (use "git restore --staged <file>..." to unstage)');
              staged.forEach(f => {
                lines.push(`\t\u001b[32mnew file:   ${f}\u001b[0m`);
              });
              lines.push('');
            }

            if (modified.length > 0) {
              lines.push('Changes not staged for commit:');
              lines.push('  (use "git add <file>..." to update what will be committed)');
              modified.forEach(f => {
                lines.push(`\t\u001b[31mmodified:   ${f.name}\u001b[0m`);
              });
              lines.push('');
            }

            if (untracked.length > 0) {
              lines.push('Untracked files:');
              lines.push('  (use "git add <file>..." to include in what will be committed)');
              untracked.forEach(f => {
                lines.push(`\t\u001b[31m${f.name}\u001b[0m`);
              });
              lines.push('');
            }

            if (staged.length === 0 && modified.length === 0 && untracked.length === 0) {
              lines.push('nothing to commit, working tree clean');
            } else if (staged.length === 0) {
              lines.push('no changes added to commit (use "git add" and/or "git commit -a")');
            }

            addTerminalLog({ type: 'output', content: lines.join('\n') });
            return true;
          }
          case 'add': {
            if (args.length < 3) {
              addTerminalLog({ type: 'output', content: 'Nothing specified, nothing added.' });
              return false;
            }
            const target = args[2];
            if (target === '.' || target === '-A') {
              const allNames = files.map(f => f.name);
              setGitState({
                ...gitState,
                staged: Array.from(new Set([...gitState.staged, ...allNames]))
              });
              addTerminalLog({ type: 'output', content: `Staged all ${allNames.length} workspace files.` });
              return true;
            } else {
              const matched = files.find(f => f.name === target);
              if (!matched) {
                addTerminalLog({ type: 'output', content: `fatal: pathspec '${target}' did not match any files` });
                return false;
              }
              setGitState({
                ...gitState,
                staged: Array.from(new Set([...gitState.staged, target]))
              });
              addTerminalLog({ type: 'output', content: `Staged '${target}'.` });
              return true;
            }
          }
          case 'commit': {
            const mIndex = args.indexOf('-m');
            let message = '';
            if (mIndex !== -1 && args[mIndex + 1]) {
              const matchMsg = trimmedSub.match(/git commit -m\s+["']([^"']+)["']/i) || trimmedSub.match(/git commit -m\s+(\S+)/i);
              message = matchMsg ? matchMsg[1] : '';
            }

            if (!message) {
              addTerminalLog({ type: 'output', content: 'error: switch `m\' requires a value\nUsage: git commit -m "commit message"' });
              return false;
            }

            if (gitState.staged.length === 0) {
              addTerminalLog({ type: 'output', content: `On branch ${gitState.branch}\nnothing to commit, working tree clean` });
              return true;
            }

            const hash = Math.random().toString(16).substring(2, 9);
            const committedFiles = files.map(f => ({ name: f.name, content: f.content }));
            
            const newCommit = {
              hash,
              message,
              author: gitState.owner ? `${gitState.owner} <${gitState.owner}@github.com>` : 'developer <dev@local>',
              timestamp: Date.now(),
              files: committedFiles
            };

            const stagedCount = gitState.staged.length;

            setGitState({
              ...gitState,
              staged: [],
              commits: [...gitState.commits, newCommit]
            });

            addTerminalLog({ 
              type: 'output', 
              content: `[${gitState.branch} ${hash}] ${message}\n ${stagedCount} files changed\n create mode 100644 ${gitState.staged.join(', ')}` 
            });
            return true;
          }
          case 'log': {
            if (gitState.commits.length === 0) {
              addTerminalLog({ type: 'output', content: `fatal: your current branch '${gitState.branch}' does not have any commits yet` });
              return false;
            }

            const logs = gitState.commits.slice().reverse().map(c => {
              return `\u001b[33mcommit ${c.hash}\u001b[0m (HEAD -> \u001b[32m${gitState.branch}\u001b[0m)\nAuthor: ${c.author || 'developer <dev@local>'}\nDate:   ${new Date(c.timestamp).toUTCString()}\n\n    ${c.message}\n`;
            }).join('\n');

            addTerminalLog({ type: 'output', content: logs });
            return true;
          }
          default:
            addTerminalLog({ type: 'output', content: `git: '${sub}' is not a git command. See 'git --help'.` });
            return false;
        }
      }
      case 'mkdir':
        if (args.length < 2) {
          addTerminalLog({ type: 'output', content: 'Usage: mkdir <folderName>' });
          return false;
        } else {
          const folderName = args[1];
          const success = addFolder(folderName);
          if (success) {
            addTerminalLog({ type: 'output', content: `Folder '${folderName}' created successfully.` });
            return true;
          } else {
            addTerminalLog({ type: 'output', content: `mkdir: cannot create directory '${folderName}': Folder already exists` });
            return false;
          }
        }
      case 'node':
      case 'run':
        if (args.length < 2) {
          addTerminalLog({ type: 'output', content: `Usage: ${command} <filename.js>` });
          return false;
        } else {
          const fileName = args[1];
          let file = files.find(f => f.name === fileName);
          if (!file && !fileName.endsWith('.js')) {
            file = files.find(f => f.name === `${fileName}.js`);
          }

          if (!file) {
            addTerminalLog({ type: 'output', content: `${command}: ${fileName}: No such file or directory` });
            return false;
          } else if (file.language !== 'javascript' && !file.name.endsWith('.js')) {
            addTerminalLog({ type: 'output', content: `${command}: ${file.name}: Only JavaScript files can be executed with node` });
            return false;
          } else {
            const logsCaptured: string[] = [];
            const customConsole = {
              log: (...m: any[]) => {
                logsCaptured.push(m.map(x => typeof x === 'object' ? JSON.stringify(x, null, 2) : String(x)).join(' '));
              },
              error: (...m: any[]) => {
                logsCaptured.push(`error: ${m.join(' ')}`);
              },
              warn: (...m: any[]) => {
                logsCaptured.push(`warning: ${m.join(' ')}`);
              },
              info: (...m: any[]) => {
                logsCaptured.push(`info: ${m.join(' ')}`);
              }
            };

            try {
              const runCode = new Function('console', `
                try {
                  ${file.content}
                } catch(err) {
                  console.error(err.message);
                }
              `);
              runCode(customConsole);
              addTerminalLog({ 
                type: 'output', 
                content: logsCaptured.join('\n') || `[${file.name}] execution finished successfully with no output.` 
              });
              return true;
            } catch (err: any) {
              addTerminalLog({ type: 'output', content: `runtime error: ${err.message}` });
              return false;
            }
          }
        }
      case 'npm': {
        const sub = args[1]?.toLowerCase();
        if (sub === 'start' || (sub === 'run' && (args[2] === 'dev' || args[2] === 'start'))) {
          useStore.getState().setServerRunning(true, 3000);
          addTerminalLog({
            type: 'output',
            content: `> js-playground@1.0.0 dev\n> node server.js\n\n[Node] Ready on http://localhost:3000\n[Server] Listening on PORT 3000 (status: active)`
          });
          return true;
        } else if (sub === 'test') {
          addTerminalLog({
            type: 'output',
            content: `> js-playground@1.0.0 test\n> jest\n\nPASS  ./index.test.js\n  ✓ workspace syntax check (14 ms)\n\nTest Suites: 1 passed, 1 total\nTests:       1 passed, 1 total`
          });
          return true;
        } else {
          addTerminalLog({
            type: 'output',
            content: `npm: command '${args.slice(1).join(' ')}' completed.`
          });
          return true;
        }
      }
      case 'history': {
        if (history.length === 0) {
          addTerminalLog({ type: 'output', content: 'No command history recorded yet.' });
          return true;
        }
        const histLines = history.map((item, idx) => `  ${(idx + 1).toString().padStart(3, ' ')}  ${item}`);
        addTerminalLog({ type: 'output', content: histLines.join('\n') });
        return true;
      }
      case 'clear':
        clearTerminalLogs();
        return true;
      case 'whoami':
        addTerminalLog({ type: 'output', content: 'admin' });
        return true;
      case 'date':
        addTerminalLog({ type: 'output', content: new Date().toString() });
        return true;
      default:
        addTerminalLog({ type: 'output', content: `bash: ${command}: command not found` });
        return false;
    }
  };

  const handleCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed || isExecuting) return;

    setIsExecuting(true);
    addTerminalLog({ type: 'input', content: trimmed });

    setHistory(prev => {
      const nextHistory = prev.filter(item => item !== trimmed);
      return [...nextHistory, trimmed];
    });
    setHistoryIndex(-1);
    setTempInput('');

    try {
      // Sequential operator && implementation
      const subCommands = trimmed.split('&&').map(c => c.trim()).filter(Boolean);
      for (const sub of subCommands) {
        const success = await executeSingleCommand(sub);
        if (!success) {
          break;
        }
      }
    } finally {
      setIsExecuting(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;

      let nextIdx = historyIndex;
      if (historyIndex === -1) {
        setTempInput(input);
        nextIdx = history.length - 1;
      } else {
        nextIdx = Math.max(0, historyIndex - 1);
      }

      setHistoryIndex(nextIdx);
      setInput(history[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;

      if (historyIndex === history.length - 1) {
        setHistoryIndex(-1);
        setInput(tempInput);
      } else {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const currentVal = input;
      if (!currentVal) return;

      const tokens = currentVal.split(/\s+/);
      if (tokens.length === 0) return;

      const prefix = tokens[tokens.length - 1];

      if (tokens.length === 1) {
        const availableCommands = ['help', 'ls', 'cat', 'node', 'run', 'clear', 'whoami', 'date', 'mkdir', 'touch', 'git'];
        const matches = availableCommands.filter(c => c.startsWith(prefix.toLowerCase()));
        if (matches.length === 1) {
          setInput(matches[0] + ' ');
        } else if (matches.length > 1) {
          addTerminalLog({ type: 'output', content: 'Matches:  ' + matches.join('   ') });
        }
      } else {
        const options = [
          ...folders.map(fd => fd.name + '/'),
          ...files.map(f => f.name)
        ];
        const matches = options.filter(opt => opt.toLowerCase().startsWith(prefix.toLowerCase()));
        if (matches.length === 1) {
          const before = tokens.slice(0, tokens.length - 1).join(' ');
          setInput(`${before} ${matches[0]}`);
        } else if (matches.length > 1) {
          addTerminalLog({ type: 'output', content: 'Matches:  ' + matches.join('   ') });
        }
      }
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0c] text-[#cccccc] font-mono text-xs border-t border-[#454545]" onClick={() => inputRef.current?.focus()}>
      <div className="flex items-center justify-between px-3 h-[35px] bg-[#252526] border-b border-[#454545] shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-[#888]" />
          <span className="font-bold text-[10px] sm:text-[11px] uppercase tracking-wider text-[#888]">Terminal</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={clearTerminalLogs}
          className="h-6 w-6 text-[#888] hover:text-white hover:bg-[#454545]"
          title="Clear Terminal"
        >
          <Trash2 size={12} />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-1">
          {terminalLogs.length === 0 && (
            <div className="text-[#555] mb-2">Welcome to the simulated JS Terminal. Type 'help' for commands.</div>
          )}
          {terminalLogs.map((log, idx) => (
            <div key={idx} className="block mb-1">
              {log.type === 'input' ? (
                <div className="flex gap-2 items-center">
                  <span className="text-green-500 font-bold shrink-0">admin@playground:~$</span>
                  <span className="text-white font-medium">{log.content}</span>
                </div>
              ) : (
                <div className="space-y-1 block pl-3 py-1 border-l-2 border-[#1f1f1f]/80 ml-1.5 msg-level-output">
                  {log.content.split('\n').map((line, lineIdx) => renderFormattedLine(line, `${idx}-${lineIdx}`, log.language))}
                </div>
              )}
            </div>
          ))}
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <span className="text-green-500 whitespace-nowrap">admin@playground:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none flex-1 text-[#ccc] p-0"
              autoFocus
            />
          </form>
        </div>
      </ScrollArea>
    </div>
  );
};
