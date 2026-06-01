import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Terminal as TerminalIcon, X, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { ScrollArea } from '@/components/shadcn-ui/scroll-area';

const renderFormattedLine = (line: string, lineKey: string | number) => {
  // 1. Simple ANSI blue folder helper check (it uses \u001b[34m...\u001b[0m)
  if (line.includes('\u001b[34m') || line.includes('\u001b[0m')) {
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
      const colorClass = code === '34' ? 'text-blue-400 font-bold' : '';
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
  const { files, folders, terminalLogs, addTerminalLog, clearTerminalLogs, addFolder } = useStore();
  const [input, setInput] = useState('');
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

  const executeSingleCommand = (trimmedSub: string): boolean => {
    const args = trimmedSub.split(/\s+/).filter(Boolean);
    if (args.length === 0) return true;
    const command = args[0].toLowerCase();

    switch (command) {
      case 'help':
        addTerminalLog({ 
          type: 'output', 
          content: 'Available commands:\n  ls      - List files and folders with types and sizes\n  cat     - View file content\n  node    - Run a JavaScript file (e.g. node index.js)\n  mkdir   - Create a new folder\n  clear   - Clear terminal logs\n  help    - Show this help message\n  whoami  - Show current user info\n  date    - Show current date' 
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
            addTerminalLog({ type: 'output', content: file.content });
            return true;
          } else {
            addTerminalLog({ type: 'output', content: `cat: ${args[1]}: No such file` });
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

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addTerminalLog({ type: 'input', content: trimmed });

    setHistory(prev => {
      const nextHistory = prev.filter(item => item !== trimmed);
      return [...nextHistory, trimmed];
    });
    setHistoryIndex(-1);
    setTempInput('');

    // Sequential operator && implementation
    const subCommands = trimmed.split('&&').map(c => c.trim()).filter(Boolean);
    for (const sub of subCommands) {
      const success = executeSingleCommand(sub);
      if (!success) {
        break;
      }
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
        const availableCommands = ['help', 'ls', 'cat', 'node', 'run', 'clear', 'whoami', 'date', 'mkdir'];
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
                  {log.content.split('\n').map((line, lineIdx) => renderFormattedLine(line, `${idx}-${lineIdx}`))}
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
