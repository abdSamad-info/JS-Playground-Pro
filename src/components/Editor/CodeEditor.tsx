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
import { registerAllMonacoThemes } from '@/lib/themeDefinitions';

export const CodeEditor: React.FC = () => {
  const { 
    files, 
    activeFileId, 
    updateFileContent, 
    dirtyFileIds,
    theme, 
    fontSize, 
    fontFamily,
    lineNumbers,
    wordWrap,
    minimap,
    themePreset,
    tabSize,
    autoFormat,
    setAiPrompt,
    setAIPanelVisible,
    isSaving,
    setIsSaving
  } = useStore();
  
  const [isMobile, setIsMobile] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Symbols');
  const activeFile = files.find(f => f.id === activeFileId);
  const isDirty = Boolean(activeFile && dirtyFileIds[activeFile.id]);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
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
    registerAllMonacoThemes(monaco);
  };

  const getMonacoTheme = () => {
    if (themePreset === 'vs-code') return theme === 'dark' ? 'vs-dark' : 'light';
    return themePreset;
  };

  if (!activeFile) return null;

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateFileContent(activeFileId, value);

      // Delayed auto-save after 5 seconds of inactivity
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        useStore.getState().saveFile(activeFileId);
      }, 5000);

      // Auto-format logic (after 4 seconds of inactivity if enabled)
      if (autoFormat) {
        if (formatTimeoutRef.current) clearTimeout(formatTimeoutRef.current);
        formatTimeoutRef.current = setTimeout(() => {
          handleFormat();
        }, 4000);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
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
      <div className="absolute bottom-16 md:bottom-3 right-6 z-20 pointer-events-none flex items-center gap-2">
        {isDirty && (
          <div className="flex items-center gap-1.5 bg-[#252526]/90 border border-amber-500/30 px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] text-amber-300 font-medium">Unsaved changes (Ctrl+S)</span>
          </div>
        )}
      </div>

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
            tabSize: tabSize || 2,
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
