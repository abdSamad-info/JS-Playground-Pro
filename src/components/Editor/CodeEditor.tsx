import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '@/store/useStore';
import { Check, CloudUpload, Type, Hash, Parentheses, Braces, Square, Equal, Dot, ChevronRight, Code2, Terminal, Variable, FunctionSquare, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import * as prettier from 'prettier/standalone';
import * as parserBabel from 'prettier/plugins/babel';
import * as parserHtml from 'prettier/plugins/html';
import * as parserPostcss from 'prettier/plugins/postcss';
import * as parserEstree from 'prettier/plugins/estree';

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
    autoFormat,
    setAiPrompt,
    setAIPanelVisible,
    isSaving,
    setIsSaving
  } = useStore();
  
  const [showSaved, setShowSaved] = React.useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Symbols');
  const activeFile = files.find(f => f.id === activeFileId);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedFadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const formatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatCode = async (content: string, language: string) => {
    try {
      let parser = 'babel';
      let plugins: any[] = [parserBabel, parserEstree];

      if (language === 'html') {
        parser = 'html';
        plugins = [parserHtml];
      } else if (language === 'css') {
        parser = 'css';
        plugins = [parserPostcss];
      } else if (language === 'json') {
        parser = 'json';
        plugins = [parserBabel, parserEstree];
      }

      const formatted = await prettier.format(content, {
        parser,
        plugins,
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        printWidth: 80,
      });

      return formatted;
    } catch (error) {
      console.error('Formatting error:', error);
      return content;
    }
  };

  const handleFormat = async () => {
    if (!activeFile || !editorRef.current) return;
    const content = editorRef.current.getValue();
    const formatted = await formatCode(content, activeFile.language);
    if (formatted !== content) {
      updateFileContent(activeFileId, formatted);
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Mobile suggestions listener
    editor.onDidChangeCursorPosition((e: any) => {
      const model = editor.getModel();
      if (!model) return;
      
      const lineContent = model.getLineContent(e.position.lineNumber);
      const column = e.position.column;

      // Suggest based on context
      if (lineContent.trim().length === 0 || column <= lineContent.search(/\S/) + 1) {
        setActiveCategory('Keywords');
      } else if (lineContent.charAt(column - 2) === '.') {
        setActiveCategory('Snippets');
      } else if (column > 1) {
        // Only switch back to symbols if we're not currently in a category that makes sense
        // This avoids flickering while typing
      }
    });

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

    // Add format action
    editor.addAction({
      id: 'format-code',
      label: 'Format Document',
      keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.1,
      run: handleFormat
    });

    // Handle blur for auto-format
    editor.onDidBlurEditorText(() => {
      if (autoFormat) {
        handleFormat();
      }
    });
  };

  const handleEditorWillMount = (monaco: any) => {
    monacoRef.current = monaco;
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

    // Define Dracula Theme
    monaco.editor.defineTheme('dracula', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4' },
        { token: 'keyword', foreground: 'ff79c6' },
        { token: 'string', foreground: 'f1fa8c' },
        { token: 'type', foreground: '8be9fd' },
        { token: 'function', foreground: '50fa7b' },
      ],
      colors: {
        'editor.background': '#282a36',
        'editor.foreground': '#f8f8f2',
        'editorCursor.foreground': '#f8f8f2',
        'editor.lineHighlightBackground': '#44475a',
        'editorLineNumber.foreground': '#6272a4',
        'editor.selectionBackground': '#44475a',
      }
    });

    // Define Solarized Dark
    monaco.editor.defineTheme('solarized-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '586e75' },
        { token: 'keyword', foreground: '859900' },
        { token: 'string', foreground: '2aa198' },
      ],
      colors: {
        'editor.background': '#002b36',
        'editor.foreground': '#839496',
        'editorCursor.foreground': '#839496',
        'editor.lineHighlightBackground': '#073642',
        'editorLineNumber.foreground': '#586e75',
      }
    });

    // Define Material Theme
    monaco.editor.defineTheme('material', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '546e7a' },
        { token: 'keyword', foreground: 'c792ea' },
        { token: 'string', foreground: 'c3e88d' },
      ],
      colors: {
        'editor.background': '#263238',
        'editor.foreground': '#eeffff',
        'editorCursor.foreground': '#ffcc00',
        'editor.lineHighlightBackground': '#00000050',
        'editorLineNumber.foreground': '#37474f',
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
      // Auto-save indicator logic (visual only at first)
      setIsSaving(true);
      setShowSaved(false);
      
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (savedFadeTimeoutRef.current) clearTimeout(savedFadeTimeoutRef.current);
      
      // Debounce the actual state update (The "Save Interval")
      saveTimeoutRef.current = setTimeout(() => {
        updateFileContent(activeFileId, value);
        setIsSaving(false);
        setShowSaved(true);
        savedFadeTimeoutRef.current = setTimeout(() => {
          setShowSaved(false);
        }, 2000);
      }, 800); // 800ms debounce for saving

      // Auto-format logic (after longer delay while typing)
      if (autoFormat) {
        if (formatTimeoutRef.current) clearTimeout(formatTimeoutRef.current);
        formatTimeoutRef.current = setTimeout(() => {
          handleFormat();
        }, 3000); // 3 seconds of inactivity
      }
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (savedFadeTimeoutRef.current) clearTimeout(savedFadeTimeoutRef.current);
      if (formatTimeoutRef.current) clearTimeout(formatTimeoutRef.current);
    };
  }, []);

  const insertText = (text: string) => {
    if (editorRef.current && monacoRef.current) {
      const selection = editorRef.current.getSelection();
      const range = new monacoRef.current.Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn
      );
      editorRef.current.executeEdits('mobile-toolbar', [
        { range, text, forceMoveMarkers: true }
      ]);
      editorRef.current.focus();
    }
  };

  const mobileShortcuts = [
    // Symbols
    { label: '=', icon: <Equal size={14} />, value: ' = ', category: 'Symbols' },
    { label: '.', icon: <Dot size={14} />, value: '.', category: 'Symbols' },
    { label: '(', icon: <Parentheses size={14} />, value: '()', category: 'Symbols' },
    { label: '{', icon: <Braces size={14} />, value: '{}', category: 'Symbols' },
    { label: '[', icon: <Square size={14} />, value: '[]', category: 'Symbols' },
    { label: '=>', icon: <ChevronRight size={14} />, value: ' => ', category: 'Symbols' },
    { label: ':', icon: <span className="text-xs font-bold">:</span>, value: ': ', category: 'Symbols' },
    { label: ';', icon: <span className="text-xs font-bold">;</span>, value: ';', category: 'Symbols' },
    { label: '"', icon: <span className="text-xs font-bold">"</span>, value: '""', category: 'Symbols' },
    { label: '`', icon: <span className="text-xs font-bold">`</span>, value: '``', category: 'Symbols' },
    
    // Keywords
    { label: 'const', icon: <Variable size={14} />, value: 'const ', category: 'Keywords' },
    { label: 'let', icon: <Variable size={14} />, value: 'let ', category: 'Keywords' },
    { label: 'func', icon: <FunctionSquare size={14} />, value: 'function  () {\n  \n}', category: 'Keywords' },
    { label: 'if', icon: <span className="text-[10px] font-bold">IF</span>, value: 'if () {\n  \n}', category: 'Keywords' },
    { label: 'else', icon: <span className="text-[10px] font-bold">ELSE</span>, value: ' else {\n  \n}', category: 'Keywords' },
    { label: 'for', icon: <Repeat size={14} />, value: 'for (let i = 0; i < .length; i++) {\n  \n}', category: 'Keywords' },
    
    // Snippets
    { label: 'log', icon: <Terminal size={14} />, value: 'console.log();', category: 'Snippets' },
    { label: 'async', icon: <span className="text-[10px] font-bold">ASYNC</span>, value: 'async () => {\n  \n}', category: 'Snippets' },
    { label: 'await', icon: <span className="text-[10px] font-bold">AWAIT</span>, value: 'await ', category: 'Snippets' },
    { label: 'map', icon: <span className="text-[10px] font-bold">MAP</span>, value: '.map(item => )', category: 'Snippets' },
  ];

  const categories = ['Symbols', 'Keywords', 'Snippets'];

  const filteredShortcuts = mobileShortcuts.filter(sc => sc.category === activeCategory);

  return (
    <div className="h-full w-full overflow-hidden flex flex-col relative">
      <AnimatePresence>
        {isSaving && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 md:bottom-4 right-8 z-20 flex items-center gap-2 bg-[#252526] border border-[#454545] px-3 py-1.5 rounded-full shadow-lg pointer-events-none"
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
            className="absolute bottom-16 md:bottom-4 right-8 z-20 flex items-center gap-2 bg-[#252526]/80 border border-green-500/30 px-3 py-1.5 rounded-full pointer-events-none"
          >
            <Check size={14} className="text-green-500" />
            <span className="text-[11px] text-[#888]">Saved</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-h-0">
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
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
          }}
        />
      </div>

      {/* Mobile Quick Toolbar */}
      {isMobile && (
        <div className="bg-[#252526] border-t border-[#454545] shrink-0 flex flex-col">
          <div className="flex border-b border-[#333] h-7">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex-1 text-[9px] uppercase font-bold tracking-wider transition-colors",
                  activeCategory === cat ? "bg-[#37373d] text-[#007acc]" : "text-[#888] hover:text-[#ccc]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="h-10 flex items-center px-2 gap-1 overflow-x-auto no-scrollbar">
            {filteredShortcuts.map((sc, i) => (
              <button
                key={i}
                onClick={() => insertText(sc.value)}
                className="flex items-center justify-center min-w-[40px] h-7 bg-[#333] hover:bg-[#444] text-[#ccc] rounded text-[10px] transition-colors active:bg-[#007acc] active:text-white px-2"
              >
                {sc.icon || sc.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
