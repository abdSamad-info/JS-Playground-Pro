import React, { useState } from 'react';
import { useStore } from '@/store/useStore.ts';
import { ScrollArea } from '@/components/shadcn-ui/scroll-area.tsx';
import { Terminal, Trash2, Download, Filter } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '@/components/shadcn-ui/badge.tsx';
import { cn } from '@/lib/utils.ts';
import { toast } from 'sonner';

type LogFilter = 'all' | 'log' | 'error' | 'warn' | 'info';

export const ConsoleOutput: React.FC = () => {
  const { logs, clearLogs } = useStore();
  const [filter, setFilter] = useState<LogFilter>('all');

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const filteredLogs = logs.filter(log => filter === 'all' || log.type === filter);

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
    a.download = `console-logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Logs exported successfully');
  };

  const filterOptions: { label: string; value: LogFilter; color?: string }[] = [
    { label: 'All', value: 'all' },
    { label: 'Logs', value: 'log' },
    { label: 'Errors', value: 'error', color: 'text-[#f14c4c]' },
    { label: 'Warnings', value: 'warn', color: 'text-yellow-400' },
    { label: 'Info', value: 'info', color: 'text-blue-400' },
  ];

  return (
    <div className="flex flex-col h-full bg-black text-[#eee] font-mono text-xs border-t border-[#454545]">
      <div className="flex items-center justify-between px-3 h-[35px] bg-[#252526] border-b border-[#454545] shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-[#888]" />
            <span className="font-bold text-[11px] uppercase tracking-wider text-[#888]">Console Output</span>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] transition-colors",
                  filter === opt.value 
                    ? "bg-[#454545] text-white" 
                    : "text-[#888] hover:text-[#ccc] hover:bg-[#333]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleExport}
            className="h-6 w-6 text-[#888] hover:text-white hover:bg-[#454545]"
            title="Export Logs"
          >
            <Download size={12} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={clearLogs}
            className="h-6 w-6 text-[#888] hover:text-white hover:bg-[#454545]"
            title="Clear Console"
          >
            <Trash2 size={12} />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {filteredLogs.length === 0 ? (
              <div className="text-[#666] italic py-2">
                {logs.length === 0 ? "No output yet. Run your code to see results." : "No logs match the current filter."}
              </div>
            ) : (
              filteredLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`flex gap-2 py-0.5 px-1 rounded transition-colors ${
                    log.type === 'error' ? 'text-[#f14c4c] bg-[#f14c4c]/5' : 
                    log.type === 'warn' ? 'text-yellow-400 bg-yellow-400/5' : 
                    log.type === 'info' ? 'text-blue-400 bg-blue-400/5' :
                    'text-[#eee]'
                  }`}
                >
                  <span className="text-[#666] shrink-0 text-[10px] mt-0.5 w-16">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className="shrink-0 text-[9px] uppercase font-bold opacity-50 w-10">
                    [{log.type}]
                  </span>
                  <span className="whitespace-pre-wrap break-all leading-relaxed flex-1">{log.content}</span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};
