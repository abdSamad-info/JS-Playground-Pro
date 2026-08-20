import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { ScrollArea } from '@/components/shadcn-ui/scroll-area';
import { 
  Terminal, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  X, 
  ArrowDown, 
  Eraser, 
  Search,
  Filter 
} from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type LogFilter = 'all' | 'log' | 'error' | 'warn' | 'info';

export const ConsoleOutput: React.FC = () => {
  const { logs, clearLogs } = useStore();
  const [selectedFilters, setSelectedFilters] = useState<LogFilter[]>(['all']);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = selectedFilters.includes('all') || selectedFilters.includes(log.type);
    const matchesSearch = !searchQuery.trim() || log.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const toggleFilter = (f: LogFilter) => {
    setSelectedFilters(prev => {
      if (f === 'all') return ['all'];
      const withoutAll = prev.filter(x => x !== 'all');
      if (withoutAll.includes(f)) {
        const next = withoutAll.filter(x => x !== f);
        return next.length === 0 ? ['all'] : next;
      } else {
        return [...withoutAll, f];
      }
    });
  };

  const handleClear = () => {
    if (logs.length === 0) {
      toast.info('Console is already clean');
      return;
    }
    const count = logs.length;
    clearLogs();
    toast.success(`Cleared ${count} console log message${count === 1 ? '' : 's'}`);
  };

  const handleCopyLogs = () => {
    if (logs.length === 0) {
      toast.error('No logs to copy');
      return;
    }
    const text = logs.map(l => `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.type.toUpperCase()}] ${l.content}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Console logs copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (logs.length === 0) {
      toast.error('No logs to export');
      return;
    }
    const logText = logs.map(log => {
      const time = new Date(log.timestamp).toISOString();
      return `[${time}] [${log.type.toUpperCase()}] ${log.content}`;
    }).join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded console log text file');
  };

  const filterOptions: { label: string; value: LogFilter; color?: string }[] = [
    { label: 'All', value: 'all' },
    { label: 'Logs', value: 'log' },
    { label: 'Errors', value: 'error', color: 'text-rose-400' },
    { label: 'Warnings', value: 'warn', color: 'text-amber-400' },
    { label: 'Info', value: 'info', color: 'text-blue-400' },
  ];

  const errorCount = logs.filter(l => l.type === 'error').length;
  const warnCount = logs.filter(l => l.type === 'warn').length;

  return (
    <div className="flex flex-col h-full bg-[#121214] text-[#eee] font-mono text-xs border-t border-[#3e3e42] select-text">
      {/* Console Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1e1e20] border-b border-[#333336] shrink-0 gap-2 flex-wrap sm:flex-nowrap">
        {/* Left Side: Title and Quick Filter Pills */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <Terminal size={13} className="text-[#58a6ff]" />
            <span className="font-semibold text-[11px] uppercase tracking-wider text-zinc-300">
              Console
            </span>
            {logs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#2d2d30] text-[10px] text-zinc-300 font-mono border border-[#444]">
                {logs.length}
              </span>
            )}
            {errorCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono border border-rose-500/30">
                {errorCount} err
              </span>
            )}
          </div>
          
          {/* Filter Pills */}
          <div className="flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => toggleFilter(opt.value)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] transition-colors whitespace-nowrap cursor-pointer",
                  selectedFilters.includes(opt.value)
                    ? "bg-[#007acc] text-white font-medium shadow-xs" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-[#2d2d30]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search Filter Input */}
          <div className="hidden md:flex items-center relative flex-1 max-w-[180px]">
            <Search size={11} className="absolute left-2 text-zinc-500 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141416] border border-[#3e3e42] rounded-md pl-6 pr-5 py-0.5 text-[10px] text-white focus:outline-none focus:border-[#007acc] placeholder:text-zinc-600 font-sans"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 text-zinc-500 hover:text-zinc-300 p-0.5"
              >
                <X size={10} />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn(
              "px-2 py-0.5 rounded text-[10px] flex items-center gap-1 transition-colors border cursor-pointer",
              autoScroll 
                ? "bg-[#007acc]/20 text-[#58a6ff] border-[#007acc]/40" 
                : "bg-[#252528] text-zinc-400 border-transparent hover:text-zinc-200"
            )}
            title="Auto-scroll to bottom on new logs"
          >
            <ArrowDown size={11} className={autoScroll ? "animate-bounce" : ""} />
            <span className="hidden sm:inline">Scroll</span>
          </button>

          {/* Copy Logs */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopyLogs}
            className="h-6.5 px-2 text-[10px] text-zinc-400 hover:text-white hover:bg-[#333338] gap-1 cursor-pointer"
            title="Copy logs to clipboard"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </Button>

          {/* Download Logs */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleExport}
            className="h-6.5 px-2 text-[10px] text-zinc-400 hover:text-white hover:bg-[#333338] gap-1 cursor-pointer"
            title="Download log history text file"
          >
            <Download size={12} />
            <span className="hidden md:inline">Export</span>
          </Button>

          {/* Dedicated Clear Console Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClear}
            className="h-6.5 px-2 text-[10px] text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 gap-1 border border-amber-500/30 rounded cursor-pointer"
            title="Clear all console logs"
          >
            <Eraser size={12} />
            <span>Clear</span>
          </Button>
        </div>
      </div>
      
      {/* Scrollable Logs Output Area */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {filteredLogs.length === 0 ? (
              <div className="text-zinc-500 italic py-6 text-center text-[11px]">
                {logs.length === 0 ? (
                  <div className="space-y-1">
                    <p className="text-zinc-400">Console is clear.</p>
                    <p className="text-[10px] text-zinc-600">Press <kbd className="px-1 py-0.5 bg-[#252528] rounded border border-[#3e3e42] text-zinc-400">Ctrl+Enter</kbd> or click &ldquo;Run&rdquo; to execute JavaScript.</p>
                  </div>
                ) : (
                  "No logs match the current search filter."
                )}
              </div>
            ) : (
              filteredLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-2 py-1 px-2 rounded-md transition-colors font-mono text-[11px] leading-relaxed",
                    log.type === 'error' && "text-rose-300 bg-rose-500/10 border-l-2 border-rose-500",
                    log.type === 'warn' && "text-amber-300 bg-amber-500/10 border-l-2 border-amber-500",
                    log.type === 'info' && "text-blue-300 bg-blue-500/10 border-l-2 border-blue-500",
                    log.type === 'log' && "text-zinc-200 hover:bg-white/5 border-l-2 border-transparent"
                  )}
                >
                  <span className="text-zinc-500 shrink-0 text-[10px] select-none">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className={cn(
                    "shrink-0 text-[9px] uppercase font-bold px-1 rounded select-none",
                    log.type === 'error' ? "bg-rose-500/30 text-rose-300" :
                    log.type === 'warn' ? "bg-amber-500/30 text-amber-300" :
                    log.type === 'info' ? "bg-blue-500/30 text-blue-300" :
                    "text-zinc-500"
                  )}>
                    {log.type}
                  </span>
                  <span className="whitespace-pre-wrap break-all flex-1 select-text">
                    {log.content}
                  </span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
