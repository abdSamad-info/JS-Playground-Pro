import JSZip from 'jszip';
import { File, Folder } from '../types/index';

export const buildFolderHierarchy = (files: File[], folders: Folder[]) => {
  const folderMap = new Map<string, { folder: Folder; path: string }>();

  // Build recursive paths for folders
  const getFolderPath = (folderId: string | null): string => {
    if (!folderId) return '';
    const cached = folderMap.get(folderId);
    if (cached) return cached.path;

    const f = folders.find(folder => folder.id === folderId);
    if (!f) return '';

    const parentPath = getFolderPath(f.parentId);
    const fullPath = parentPath ? `${parentPath}/${f.name}` : f.name;
    folderMap.set(folderId, { folder: f, path: fullPath });
    return fullPath;
  };

  folders.forEach(f => getFolderPath(f.id));

  // Generate mapping of file ID to full relative path
  const filePaths = new Map<string, string>();
  files.forEach(f => {
    const parentPath = getFolderPath(f.parentId);
    const fullPath = parentPath ? `${parentPath}/${f.name}` : f.name;
    filePaths.set(f.id, fullPath);
  });

  return { filePaths, getFolderPath };
};

export const exportProjectAsZip = async (
  files: File[], 
  folders: Folder[], 
  projectName: string = 'js-playground-project'
) => {
  const zip = new JSZip();
  const { filePaths } = buildFolderHierarchy(files, folders);

  // Add all user files with folder paths
  files.forEach(file => {
    const relativePath = filePaths.get(file.id) || file.name;
    zip.file(relativePath, file.content);
  });

  // If package.json is not present, generate a standard development package.json
  const hasPackageJson = files.some(f => f.name === 'package.json');
  if (!hasPackageJson) {
    const defaultPkg = {
      name: projectName.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
      version: '1.0.0',
      description: 'Interactive JavaScript project exported from JS Playground Pro',
      main: files.find(f => f.name === 'index.js') ? 'index.js' : files[0]?.name || 'index.js',
      scripts: {
        test: 'vitest run || node index.test.js',
        start: 'node index.js'
      },
      devDependencies: {
        prettier: '^3.2.0'
      }
    };
    zip.file('package.json', JSON.stringify(defaultPkg, null, 2));
  }

  // If README.md is not present, generate a clean README
  const hasReadme = files.some(f => f.name.toLowerCase() === 'readme.md');
  if (!hasReadme) {
    const readmeContent = `# ${projectName}

Exported from **JS Playground Pro** on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.

## Project Structure
${files.map(f => `- \`${filePaths.get(f.id) || f.name}\` (${f.language})`).join('\n')}

## Getting Started
1. Open \`index.html\` in your browser or run \`node index.js\`.
2. Edit your source files and test algorithms interactively.
`;
    zip.file('README.md', readmeContent);
  }

  // Generate blob and trigger download
  const content = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}-${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportProjectAsJson = (files: File[], folders: Folder[], extraState?: Record<string, any>) => {
  const exportPayload = {
    schemaVersion: '1.0.0',
    exportedAt: new Date().toISOString(),
    generator: 'JS Playground Pro',
    files,
    folders,
    settings: extraState || {}
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workspace-backup-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportSingleFile = (file: File) => {
  let mimeType = 'text/plain';
  if (file.language === 'javascript') mimeType = 'application/javascript';
  else if (file.language === 'html') mimeType = 'text/html';
  else if (file.language === 'css') mimeType = 'text/css';
  else if (file.language === 'json') mimeType = 'application/json';

  const blob = new Blob([file.content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
