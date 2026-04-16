import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '@/store/useStore';
import { Check, CloudUpload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CodeEditor: React.FC = () => {
  const { 
    files, 
    activeFileId, 
    updateFileContent, 
    theme, 
    fontSize, 
    fontFamily,
    lineNumbers,
    wordWrap,
    minimap,
    isSaving,
    setIsSaving
  } = useStore();
  
  const [showSaved, setShowSaved] = React.useState(false);
  const activeFile = files.find(f => f.id === activeFileId);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedFadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!activeFile) return null;

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateFileContent(activeFileId, value);
      
      // Auto-save indicator logic
      setIsSaving(true);
      setShowSaved(false);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (savedFadeTimeoutRef.current) clearTimeout(savedFadeTimeoutRef.current);
      
      saveTimeoutRef.current = setTimeout(() => {
        setIsSaving(false);
        setShowSaved(true);
        savedFadeTimeoutRef.current = setTimeout(() => {
          setShowSaved(false);
        }, 2000);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (savedFadeTimeoutRef.current) clearTimeout(savedFadeTimeoutRef.current);
    };
  }, []);

  return (
    <div className="h-full w-full overflow-hidden relative">
      <AnimatePresence>
        {isSaving && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 right-8 z-20 flex items-center gap-2 bg-[#252526] border border-[#454545] px-3 py-1.5 rounded-full shadow-lg pointer-events-none"
          >
            <CloudUpload size={14} className="text-[#007acc] animate-pulse" />
            <span className="text-[11px] text-[#888]">Saving...</span>
          </motion.div>
        )}
        {showSaved && !isSaving && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-4 right-8 z-20 flex items-center gap-2 bg-[#252526]/80 border border-green-500/30 px-3 py-1.5 rounded-full pointer-events-none"
          >
            <Check size={14} className="text-green-500" />
            <span className="text-[11px] text-[#888]">Saved</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Editor
        height="100%"
        language={activeFile.language}
        value={activeFile.content}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: minimap },
          fontSize: fontSize,
          fontFamily: fontFamily,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12 },
          wordWrap: wordWrap,
          lineNumbers: lineNumbers,
          bracketPairColorization: { enabled: true },
          formatOnPaste: true,
          formatOnType: true,
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          contextmenu: true,
        }}
      />
    </div>
  );
};
