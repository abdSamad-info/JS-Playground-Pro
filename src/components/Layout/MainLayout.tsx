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

export const MainLayout: React.FC = () => {
  const { 
    setIsRunning, 
    activeFileId, 
    setActiveFileId, 
    files, 
    isConsoleVisible, 
    isAIPanelVisible,
    setAIPanelVisible,
    deleteFile 
  } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

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
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden font-sans">
      <ActionsToolbar />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-4 left-4 z-50 sm:hidden bg-[#007acc] text-white rounded-full shadow-lg"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>

        {/* Mobile View Toggle */}
        <div className="absolute bottom-4 right-4 z-50 sm:hidden flex bg-[#252526] rounded-full shadow-lg border border-[#454545] p-1">
          <Button
            variant={mobileView === 'editor' ? 'default' : 'ghost'}
            size="sm"
            className={cn("rounded-full h-8 px-4", mobileView === 'editor' && "bg-[#007acc]")}
            onClick={() => setMobileView('editor')}
          >
            Editor
          </Button>
          <Button
            variant={mobileView === 'preview' ? 'default' : 'ghost'}
            size="sm"
            className={cn("rounded-full h-8 px-4", mobileView === 'preview' && "bg-[#007acc]")}
            onClick={() => setMobileView('preview')}
          >
            Preview
          </Button>
        </div>

        <div className={cn(
          "transition-all duration-300 ease-in-out h-full shrink-0",
          isSidebarOpen ? "w-auto" : "w-0 overflow-hidden"
        )}>
          <FileExplorer />
        </div>
        
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
            <ResizablePanelGroup direction="horizontal" className="hidden sm:flex flex-1">
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

            {/* Mobile View Content */}
            <div className="sm:hidden flex-1 flex flex-col overflow-hidden">
              {mobileView === 'editor' ? (
                <>
                  <CodeEditor />
                  {isConsoleVisible && (
                    <div className="h-1/3 border-t border-[#454545]">
                      <ConsoleOutput />
                    </div>
                  )}
                </>
              ) : (
                <LivePreview />
              )}
            </div>
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
  );
};
