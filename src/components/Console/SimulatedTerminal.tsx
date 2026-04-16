import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Terminal as TerminalIcon, X, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { ScrollArea } from '@/components/shadcn-ui/scroll-area';

export const SimulatedTerminal: React.FC = () => {
  const { files, folders, terminalLogs, addTerminalLog, clearTerminalLogs } = useStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [terminalLogs]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addTerminalLog({ type: 'input', content: trimmed });

    const args = trimmed.split(' ');
    const command = args[0].toLowerCase();

    switch (command) {
      case 'help':
        addTerminalLog({ 
          type: 'output', 
          content: 'Available commands:\n  ls      - List files and folders\n  cat     - View file content\n  clear   - Clear terminal logs\n  help    - Show this help message\n  whoami  - Show current user info\n  date    - Show current date' 
        });
        break;
      case 'ls':
        const items = [
          ...folders.map(f => `\u001b[34m${f.name}/\u001b[0m`),
          ...files.map(f => f.name)
        ].join('  ');
        addTerminalLog({ type: 'output', content: items || 'No files found.' });
        break;
      case 'cat':
        if (args.length < 2) {
          addTerminalLog({ type: 'output', content: 'Usage: cat <filename>' });
        } else {
          const file = files.find(f => f.name === args[1]);
          if (file) {
            addTerminalLog({ type: 'output', content: file.content });
          } else {
            addTerminalLog({ type: 'output', content: `cat: ${args[1]}: No such file` });
          }
        }
        break;
      case 'clear':
        clearTerminalLogs();
        break;
      case 'whoami':
        addTerminalLog({ type: 'output', content: 'admin' });
        break;
      case 'date':
        addTerminalLog({ type: 'output', content: new Date().toString() });
        break;
      default:
        addTerminalLog({ type: 'output', content: `bash: ${command}: command not found` });
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
            <div key={idx} className="whitespace-pre-wrap flex gap-2">
              {log.type === 'input' ? (
                <>
                  <span className="text-green-500">admin@playground:~$</span>
                  <span>{log.content}</span>
                </>
              ) : (
                <span className="text-[#aaa] block w-full">{log.content}</span>
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
              className="bg-transparent border-none outline-none flex-1 text-[#ccc] p-0"
              autoFocus
            />
          </form>
        </div>
      </ScrollArea>
    </div>
  );
};
