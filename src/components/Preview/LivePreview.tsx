import React, { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { generateSandboxContent } from '@/lib/sandbox';
import { Loader2 } from 'lucide-react';

export const LivePreview: React.FC = () => {
  const { files, isRunning, setIsRunning, addLog } = useStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CONSOLE_LOG') {
        addLog(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addLog]);

  useEffect(() => {
    if (isRunning && iframeRef.current) {
      // Clear logs before running if needed? 
      // User might want to see previous logs, so we don't clear by default.
      
      const content = generateSandboxContent(files);
      const iframe = iframeRef.current;
      
      // Force a reload by clearing srcdoc first or using a unique URL if needed
      // but srcdoc update should be enough for most cases.
      iframe.srcdoc = '';
      
      // Small delay to ensure the iframe is cleared
      const reloadTimer = setTimeout(() => {
        iframe.srcdoc = content;
        
        // Reset isRunning after a short delay to allow the next run
        const resetTimer = setTimeout(() => {
          setIsRunning(false);
        }, 100);
        
        return () => clearTimeout(resetTimer);
      }, 10);

      return () => clearTimeout(reloadTimer);
    }
  }, [isRunning, files, setIsRunning]);

  return (
    <div className="h-full w-full bg-[#2d2d2d] relative flex flex-col">
      <div className="flex items-center justify-between px-3 h-[35px] bg-[#252526] border-b border-[#454545] shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[11px] uppercase tracking-wider text-[#888]">Live Preview</span>
        </div>
      </div>
      <div className="flex-1 p-3">
        <div className="h-full w-full bg-white rounded overflow-hidden relative">
          {isRunning && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-[#007acc]" size={24} />
            </div>
          )}
          <iframe
            ref={iframeRef}
            title="Live Preview"
            className="h-full w-full border-none"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
};
