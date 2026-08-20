export interface ThemePresetInfo {
  id: string;
  name: string;
  category: 'dark' | 'light';
  bg: string;
  editorBg: string;
  sidebarBg: string;
  cardBg: string;
  border: string;
  text: string;
  accent: string;
  monacoTheme: string;
}

export const THEME_PRESETS: ThemePresetInfo[] = [
  {
    id: 'vs-code',
    name: 'VS Code Dark Modern',
    category: 'dark',
    bg: '#1e1e1e',
    editorBg: '#1e1e1e',
    sidebarBg: '#252526',
    cardBg: '#2d2d2d',
    border: '#3e3e42',
    text: '#cccccc',
    accent: '#007acc',
    monacoTheme: 'vs-dark'
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    category: 'dark',
    bg: '#0d1117',
    editorBg: '#0d1117',
    sidebarBg: '#161b22',
    cardBg: '#21262d',
    border: '#30363d',
    text: '#c9d1d9',
    accent: '#58a6ff',
    monacoTheme: 'github-dark'
  },
  {
    id: 'dracula',
    name: 'Dracula Gothic',
    category: 'dark',
    bg: '#282a36',
    editorBg: '#282a36',
    sidebarBg: '#21222c',
    cardBg: '#343746',
    border: '#44475a',
    text: '#f8f8f2',
    accent: '#bd93f9',
    monacoTheme: 'dracula'
  },
  {
    id: 'monokai',
    name: 'Monokai Pro',
    category: 'dark',
    bg: '#272822',
    editorBg: '#272822',
    sidebarBg: '#1e1f1c',
    cardBg: '#3e3d32',
    border: '#49483e',
    text: '#f8f8f2',
    accent: '#a6e22e',
    monacoTheme: 'monokai'
  },
  {
    id: 'nord',
    name: 'Nord Frost',
    category: 'dark',
    bg: '#2e3440',
    editorBg: '#2e3440',
    sidebarBg: '#242933',
    cardBg: '#3b4252',
    border: '#434c5e',
    text: '#eceff4',
    accent: '#88c0d0',
    monacoTheme: 'nord'
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    category: 'dark',
    bg: '#1a1b26',
    editorBg: '#1a1b26',
    sidebarBg: '#16161e',
    cardBg: '#24283b',
    border: '#2f354a',
    text: '#a9b1d6',
    accent: '#7aa2f7',
    monacoTheme: 'tokyo-night'
  },
  {
    id: 'one-dark-pro',
    name: 'One Dark Pro',
    category: 'dark',
    bg: '#282c34',
    editorBg: '#282c34',
    sidebarBg: '#21252b',
    cardBg: '#2c313a',
    border: '#3e4451',
    text: '#abb2bf',
    accent: '#61afef',
    monacoTheme: 'one-dark-pro'
  },
  {
    id: 'cobalt',
    name: 'Cobalt 2',
    category: 'dark',
    bg: '#193549',
    editorBg: '#193549',
    sidebarBg: '#15232d',
    cardBg: '#1f4662',
    border: '#275270',
    text: '#e1effa',
    accent: '#ffc600',
    monacoTheme: 'cobalt'
  },
  {
    id: 'synthwave',
    name: 'Synthwave Neon',
    category: 'dark',
    bg: '#262335',
    editorBg: '#262335',
    sidebarBg: '#1f1d2b',
    cardBg: '#34294f',
    border: '#463465',
    text: '#f92aad',
    accent: '#36f9f6',
    monacoTheme: 'synthwave'
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    category: 'dark',
    bg: '#002b36',
    editorBg: '#002b36',
    sidebarBg: '#073642',
    cardBg: '#094757',
    border: '#0d576a',
    text: '#839496',
    accent: '#268bd2',
    monacoTheme: 'solarized-dark'
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    category: 'light',
    bg: '#ffffff',
    editorBg: '#ffffff',
    sidebarBg: '#f6f8fa',
    cardBg: '#eaeef2',
    border: '#d0d7de',
    text: '#24292f',
    accent: '#0969da',
    monacoTheme: 'github-light'
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    category: 'light',
    bg: '#fdf6e3',
    editorBg: '#fdf6e3',
    sidebarBg: '#eee8d5',
    cardBg: '#e0d6ba',
    border: '#d3cbb7',
    text: '#657b83',
    accent: '#268bd2',
    monacoTheme: 'solarized-light'
  }
];

export const ACCENT_COLORS = [
  { name: 'VS Blue', value: '#007acc' },
  { name: 'GitHub Blue', value: '#58a6ff' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Dracula Pink', value: '#ff79c6' },
  { name: 'Amber Glow', value: '#f59e0b' },
  { name: 'Coral Rose', value: '#f43f5e' },
  { name: 'Monokai Green', value: '#a6e22e' },
  { name: 'Synth Neon', value: '#36f9f6' },
];

export const FONT_FAMILIES = [
  { id: 'JetBrains Mono', name: 'JetBrains Mono', category: 'Programming' },
  { id: 'Fira Code', name: 'Fira Code (Ligatures)', category: 'Programming' },
  { id: 'Source Code Pro', name: 'Source Code Pro', category: 'Clean' },
  { id: 'Cascadia Code', name: 'Cascadia Code', category: 'Modern' },
  { id: 'Geist Mono', name: 'Geist Mono', category: 'Minimalist' },
  { id: 'Courier New', name: 'Courier New', category: 'Classic' },
];

export const registerAllMonacoThemes = (monaco: any) => {
  if (!monaco?.editor) return;

  // GitHub Dark
  monaco.editor.defineTheme('github-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff7b72' },
      { token: 'string', foreground: 'a5d6ff' },
      { token: 'number', foreground: '79c0ff' },
      { token: 'type', foreground: 'ffa657' },
      { token: 'function', foreground: 'd2a8ff' },
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#c9d1d9',
      'editorCursor.foreground': '#58a6ff',
      'editor.lineHighlightBackground': '#161b22',
      'editorLineNumber.foreground': '#484f58',
      'editor.selectionBackground': '#1f242c',
    }
  });

  // Monokai Pro
  monaco.editor.defineTheme('monokai', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'f92672' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'type', foreground: '66d9ef' },
      { token: 'function', foreground: 'a6e22e' },
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

  // Dracula
  monaco.editor.defineTheme('dracula', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff79c6' },
      { token: 'string', foreground: 'f1fa8c' },
      { token: 'type', foreground: '8be9fd' },
      { token: 'function', foreground: '50fa7b' },
      { token: 'number', foreground: 'bd93f9' },
    ],
    colors: {
      'editor.background': '#282a36',
      'editor.foreground': '#f8f8f2',
      'editorCursor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#44475a50',
      'editorLineNumber.foreground': '#6272a4',
      'editor.selectionBackground': '#44475a',
    }
  });

  // Nord
  monaco.editor.defineTheme('nord', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '616e88', fontStyle: 'italic' },
      { token: 'keyword', foreground: '81a1c1' },
      { token: 'string', foreground: 'a3be8c' },
      { token: 'number', foreground: 'b48ead' },
      { token: 'type', foreground: '8fbcbb' },
      { token: 'function', foreground: '88c0d0' },
    ],
    colors: {
      'editor.background': '#2e3440',
      'editor.foreground': '#eceff4',
      'editorCursor.foreground': '#d8dee9',
      'editor.lineHighlightBackground': '#3b4252',
      'editorLineNumber.foreground': '#4c566a',
      'editor.selectionBackground': '#434c5e',
    }
  });

  // Tokyo Night
  monaco.editor.defineTheme('tokyo-night', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '565f89', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'bb9af7' },
      { token: 'string', foreground: '9ece6a' },
      { token: 'number', foreground: 'ff9e64' },
      { token: 'type', foreground: '2ac3de' },
      { token: 'function', foreground: '7aa2f7' },
    ],
    colors: {
      'editor.background': '#1a1b26',
      'editor.foreground': '#a9b1d6',
      'editorCursor.foreground': '#c0caf5',
      'editor.lineHighlightBackground': '#24283b',
      'editorLineNumber.foreground': '#3b4261',
      'editor.selectionBackground': '#283457',
    }
  });

  // One Dark Pro
  monaco.editor.defineTheme('one-dark-pro', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'c678dd' },
      { token: 'string', foreground: '98c379' },
      { token: 'number', foreground: 'd19a66' },
      { token: 'type', foreground: 'e5c07b' },
      { token: 'function', foreground: '61afef' },
    ],
    colors: {
      'editor.background': '#282c34',
      'editor.foreground': '#abb2bf',
      'editorCursor.foreground': '#528bff',
      'editor.lineHighlightBackground': '#2c313a',
      'editorLineNumber.foreground': '#4b5263',
      'editor.selectionBackground': '#3e4451',
    }
  });

  // Cobalt 2
  monaco.editor.defineTheme('cobalt', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '0088ff', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff9d00' },
      { token: 'string', foreground: '3ad900' },
      { token: 'number', foreground: 'ff628c' },
      { token: 'function', foreground: 'ffc600' },
    ],
    colors: {
      'editor.background': '#193549',
      'editor.foreground': '#ffffff',
      'editorCursor.foreground': '#ffc600',
      'editor.lineHighlightBackground': '#002240',
      'editorLineNumber.foreground': '#0088ff',
      'editor.selectionBackground': '#005088',
    }
  });

  // Synthwave
  monaco.editor.defineTheme('synthwave', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6d778d', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'f92aad' },
      { token: 'string', foreground: 'ff7edb' },
      { token: 'number', foreground: 'fede5d' },
      { token: 'type', foreground: 'fe4450' },
      { token: 'function', foreground: '36f9f6' },
    ],
    colors: {
      'editor.background': '#262335',
      'editor.foreground': '#f8f8f2',
      'editorCursor.foreground': '#f92aad',
      'editor.lineHighlightBackground': '#34294f',
      'editorLineNumber.foreground': '#6d778d',
      'editor.selectionBackground': '#463465',
    }
  });

  // Solarized Dark
  monaco.editor.defineTheme('solarized-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '586e75', fontStyle: 'italic' },
      { token: 'keyword', foreground: '859900' },
      { token: 'string', foreground: '2aa198' },
      { token: 'number', foreground: 'd33682' },
      { token: 'function', foreground: '268bd2' },
    ],
    colors: {
      'editor.background': '#002b36',
      'editor.foreground': '#839496',
      'editorCursor.foreground': '#839496',
      'editor.lineHighlightBackground': '#073642',
      'editorLineNumber.foreground': '#586e75',
      'editor.selectionBackground': '#0d576a',
    }
  });

  // GitHub Light
  monaco.editor.defineTheme('github-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6e7781', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'cf222e' },
      { token: 'string', foreground: '0a3069' },
      { token: 'number', foreground: '0550ae' },
      { token: 'function', foreground: '8250df' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#24292f',
      'editorCursor.foreground': '#0969da',
      'editor.lineHighlightBackground': '#f6f8fa',
      'editorLineNumber.foreground': '#8c959f',
      'editor.selectionBackground': '#b6e3ff',
    }
  });

  // Solarized Light
  monaco.editor.defineTheme('solarized-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '93a1a1', fontStyle: 'italic' },
      { token: 'keyword', foreground: '859900' },
      { token: 'string', foreground: '2aa198' },
      { token: 'number', foreground: 'd33682' },
      { token: 'function', foreground: '268bd2' },
    ],
    colors: {
      'editor.background': '#fdf6e3',
      'editor.foreground': '#657b83',
      'editorCursor.foreground': '#657b83',
      'editor.lineHighlightBackground': '#eee8d5',
      'editorLineNumber.foreground': '#93a1a1',
      'editor.selectionBackground': '#e0d6ba',
    }
  });
};
