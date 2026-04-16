import React, { useEffect, useState } from 'react';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/shadcn-ui/resizable';
import { ActionsToolbar } from '@/components/Toolbar/ActionsToolbar';
import { FileExplorer } from '@/components/Sidebar/FileExplorer';
import { CodeEditor } from '@/components/Editor/CodeEditor';
import { ConsoleOutput } from '@/components/Console/ConsoleOutput';
import { LivePreview } from '@/components/Preview/LivePreview';
import { AIAssistant } from '@/components/Sidebar/AIAssistant';
import { useStore } from '@/store/useStore';
import { Toaster } from '@/components/shadcn-ui/sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { cn } from '@/lib/utils';

import { motion, AnimatePresence } from 'motion/react';

import { TooltipProvider } from '@/components/shadcn-ui/tooltip';

export const MainLayout: React.FC = () => {
  const { 
    setIsRunning, 
    activeFileId, 
    setActiveFileId, 
    files, 
    isConsoleVisible, 
    isAIPanelVisible,
    setAIPanelVisible,
    deleteFile,
    accentColor,
    fontSize,
    fontFamily,
    themePreset,
    setThemePreset
  } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [isLargeScreen, setIsLargeScreen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 640 : true);

  useEffect(() => {
    // Apply dynamic theme styles
    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.documentElement.style.setProperty('--editor-font-size', `${fontSize}px`);
    document.documentElement.style.setProperty('--editor-font-family', fontFamily);
    document.documentElement.setAttribute('data-theme-preset', themePreset);
  }, [accentColor, fontSize, fontFamily, themePreset]);

  useEffect(() => {
    const handleResize = () => {
      const large = window.innerWidth >= 640;
      setIsLargeScreen(large);
      if (large) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        setIsRunning(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsRunning]);

  return (
    <TooltipProvider>
      <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden font-sans">
        <ActionsToolbar />
        
        <div className="flex-1 flex overflow-hidden relative">
          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {!isLargeScreen && isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="absolute inset-0 bg-black/50 z-40 sm:hidden"
              />
            )}
          </AnimatePresence>

          {/* Mobile Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-4 left-4 z-50 sm:hidden bg-[#007acc] text-white rounded-full shadow-lg hover:bg-[#007acc]/90"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>

          {/* Mobile View Toggle */}
          <div className="absolute bottom-4 right-4 z-50 sm:hidden flex bg-[#252526] rounded-full shadow-lg border border-[#454545] p-1">
            <Button
              variant={mobileView === 'editor' ? 'default' : 'ghost'}
              size="sm"
              className={cn("rounded-full h-8 px-4 text-[12px]", mobileView === 'editor' && "bg-[#007acc] text-white")}
              onClick={() => setMobileView('editor')}
            >
              Editor
            </Button>
            <Button
              variant={mobileView === 'preview' ? 'default' : 'ghost'}
              size="sm"
              className={cn("rounded-full h-8 px-4 text-[12px]", mobileView === 'preview' && "bg-[#007acc] text-white")}
              onClick={() => setMobileView('preview')}
            >
              Preview
            </Button>
          </div>

          {/* Sidebar */}
          <motion.div 
            initial={false}
            animate={{ 
              width: isSidebarOpen ? (isLargeScreen ? 'auto' : '260px') : 0,
              x: !isLargeScreen && !isSidebarOpen ? -260 : 0
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            className={cn(
              "h-full shrink-0 z-50 bg-[#252526] border-r border-[#454545]",
              !isLargeScreen && "absolute left-0 top-0 shadow-2xl",
              !isSidebarOpen && !isLargeScreen && "pointer-events-none"
            )}
          >
            <div className="w-[260px] h-full overflow-hidden">
              <FileExplorer />
            </div>
          </motion.div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="h-[35px] bg-[#252526] border-b border-[#454545] flex items-center px-0 overflow-x-auto scrollbar-hide">
              <Tabs value={activeFileId} onValueChange={setActiveFileId} className="w-full">
                <TabsList className="bg-transparent h-[35px] p-0 gap-0 flex-nowrap">
                  {files.map(file => (
                    <div key={file.id} className="relative group">
                      <TabsTrigger 
                        value={file.id}
                        className="data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white data-[state=active]:border-t border-[#007acc] text-[#858585] text-[12px] h-[35px] px-4 pr-8 rounded-none border-r border-[#454545] transition-none whitespace-nowrap flex items-center gap-2"
                      >
                        <span>{file.name}</span>
                      </TabsTrigger>
                      {files.length > 1 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFile(file.id);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:bg-[#454545] p-0.5 rounded text-[#858585] hover:text-white transition-all"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Desktop View */}
              {isLargeScreen ? (
                <>
                  <ResizablePanelGroup direction="horizontal" className="flex-1">
                    <ResizablePanel defaultSize={isConsoleVisible ? 60 : 100} minSize={20}>
                      <CodeEditor />
                    </ResizablePanel>
                    
                    {isConsoleVisible && (
                      <>
                        <ResizableHandle className="w-[1px] bg-[#454545] hover:bg-[#007acc] transition-colors" />
                        <ResizablePanel defaultSize={40} minSize={20}>
                          <ConsoleOutput />
                        </ResizablePanel>
                      </>
                    )}

                    {isAIPanelVisible && (
                      <>
                        <ResizableHandle className="w-[1px] bg-[#454545] hover:bg-[#007acc] transition-colors" />
                        <ResizablePanel defaultSize={30} minSize={20}>
                          <AIAssistant />
                        </ResizablePanel>
                      </>
                    )}
                  </ResizablePanelGroup>
                  {/* Hidden runner for desktop to handle code execution and console logs */}
                  <div className="hidden">
                    <LivePreview />
                  </div>
                </>
              ) : (
                /* Mobile View Content */
                <div className="flex-1 flex flex-col overflow-hidden relative">
                  {mobileView === 'editor' ? (
                    <div className="flex-1 flex flex-col overflow-hidden relative">
                      <div className={cn(
                        "flex-1 transition-all duration-300",
                        isConsoleVisible ? "h-1/2" : "h-full"
                      )}>
                        <CodeEditor />
                      </div>
                      
                      <AnimatePresence>
                        {isConsoleVisible && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: '50%' }}
                            exit={{ height: 0 }}
                            className="bg-black z-30 border-t border-[#454545] overflow-hidden"
                          >
                            <ConsoleOutput />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {isAIPanelVisible && (
                          <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="absolute inset-0 bg-[#252526] z-40"
                          >
                            <AIAssistant />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <LivePreview />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <footer className="h-[22px] bg-[#007acc] text-white flex items-center justify-between px-3 text-[11px] shrink-0">
          <div className="flex gap-4">
            <span className="hidden xs:inline">&otimes; 0</span>
            <span className="hidden xs:inline">&triangle; 0</span>
            <span>Ln 1, Col 1</span>
          </div>
          <div className="flex gap-4">
            <span className="hidden sm:inline">Spaces: 2</span>
            <span className="hidden sm:inline">UTF-8</span>
            <span>JavaScript</span>
            <span className="hidden md:inline">Prettier</span>
          </div>
        </footer>
        
        <Toaster position="bottom-right" theme="dark" />
      </div>
    </TooltipProvider>
  );
};
