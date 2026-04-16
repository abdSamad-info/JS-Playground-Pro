import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '@/store/useStore';
import { Check, CloudUpload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

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
    themePreset,
    setAiPrompt,
    setAIPanelVisible,
    isSaving,
    setIsSaving
  } = useStore();
  
  const [showSaved, setShowSaved] = React.useState(false);
  const activeFile = files.find(f => f.id === activeFileId);
  const editorRef = useRef<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedFadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Add custom action to context menu
    editor.addAction({
      id: 'explain-code-ai',
      label: 'Explain with AI',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyE],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: (ed: any) => {
        const selection = ed.getSelection();
        const selectedText = ed.getModel().getValueInRange(selection);
        if (selectedText) {
          setAiPrompt(`Please explain this code snippet:\n\n\`\`\`javascript\n${selectedText}\n\`\`\``);
          setAIPanelVisible(true);
        } else {
          toast.info('Please select some code to explain');
        }
      }
    });
  };

  const handleEditorWillMount = (monaco: any) => {
    // Define Monokai Theme
    monaco.editor.defineTheme('monokai', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '75715e' },
        { token: 'keyword', foreground: 'f92672' },
        { token: 'string', foreground: 'e6db74' },
        { token: 'number', foreground: 'ae81ff' },
      ],
      colors: {
        'editor.background': '#272822',
        'editor.foreground': '#f8f8f2',
        'editorCursor.foreground': '#f8f8f0',
        'editor.lineHighlightBackground': '#3e3d32',
        'editorLineNumber.foreground': '#90908a',
        'editor.selectionBackground': '#49483e',
      }
    });

    // Define Cobalt Theme
    monaco.editor.defineTheme('cobalt', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '0088ff' },
        { token: 'keyword', foreground: 'ff9d00' },
        { token: 'string', foreground: '3ad900' },
      ],
      colors: {
        'editor.background': '#002240',
        'editor.foreground': '#ffffff',
        'editorCursor.foreground': '#ffffff',
        'editor.lineHighlightBackground': '#003366',
        'editorLineNumber.foreground': '#0088ff',
      }
    });

    // Define GitHub Light Theme
    monaco.editor.defineTheme('github-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a737d' },
        { token: 'keyword', foreground: 'd73a49' },
        { token: 'string', foreground: '032f62' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#24292e',
        'editorCursor.foreground': '#24292e',
        'editor.lineHighlightBackground': '#f6f8fa',
        'editorLineNumber.foreground': '#1b1f234d',
      }
    });
  };

  const getMonacoTheme = () => {
    if (themePreset === 'vs-code') return theme === 'dark' ? 'vs-dark' : 'light';
    return themePreset;
  };

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
        theme={getMonacoTheme()}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
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
