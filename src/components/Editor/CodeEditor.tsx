import React from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '@/store/useStore';

export const CodeEditor: React.FC = () => {
  const { files, activeFileId, updateFileContent, theme, fontSize, fontFamily } = useStore();
  
  const activeFile = files.find(f => f.id === activeFileId);

  if (!activeFile) return null;

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateFileContent(activeFileId, value);
    }
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        height="100%"
        language={activeFile.language}
        value={activeFile.content}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: fontSize,
          fontFamily: fontFamily,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12 },
          wordWrap: 'on',
          lineNumbers: 'on',
          bracketPairColorization: { enabled: true },
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
};
