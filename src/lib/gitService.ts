import { File, Folder, FileType } from '../types/index';

export interface GitHubRepoInfo {
  owner: string;
  repo: string;
  branch: string;
  subpath?: string;
}

export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  icon: string;
  repoUrl?: string;
  files: { name: string; language: FileType; content: string }[];
}

export interface ClonedRepoResult {
  files: File[];
  folders: Folder[];
  gitInfo: {
    remoteUrl: string;
    owner: string;
    repo: string;
    branch: string;
    defaultBranch?: string;
    commitHash?: string;
    description?: string;
  };
}

export const parseGitHubUrl = (input: string): GitHubRepoInfo | null => {
  let cleaned = input.trim();
  if (!cleaned) return null;

  // Handle git SSH syntax: git@github.com:owner/repo.git
  const sshMatch = cleaned.match(/^git@github\.com:([^\/]+)\/([^\/]+?)(?:\.git)?$/i);
  if (sshMatch) {
    return {
      owner: sshMatch[1],
      repo: sshMatch[2].replace(/\.git$/, ''),
      branch: 'main',
      subpath: ''
    };
  }

  // Remove leading protocol prefix if partial, trailing .git, or trailing slashes
  cleaned = cleaned.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  cleaned = cleaned.replace(/\.git$/, '').replace(/\/+$/, '');

  // Case 1: Full URL github.com/owner/repo/tree/branch/subpath
  const fullUrlMatch = cleaned.match(/^github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+)(?:\/(.+))?)?/i);
  if (fullUrlMatch) {
    return {
      owner: fullUrlMatch[1],
      repo: fullUrlMatch[2],
      branch: fullUrlMatch[3] || 'main',
      subpath: fullUrlMatch[4] || ''
    };
  }

  // Case 2: Short format owner/repo or owner/repo#branch or owner/repo/tree/branch
  const branchPathMatch = cleaned.match(/^([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)\/tree\/([^\/]+)(?:\/(.+))?$/);
  if (branchPathMatch) {
    return {
      owner: branchPathMatch[1],
      repo: branchPathMatch[2],
      branch: branchPathMatch[3],
      subpath: branchPathMatch[4] || ''
    };
  }

  const shortMatch = cleaned.match(/^([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)(?:#([a-zA-Z0-9_.-]+))?$/);
  if (shortMatch) {
    return {
      owner: shortMatch[1],
      repo: shortMatch[2],
      branch: shortMatch[3] || 'main',
      subpath: ''
    };
  }

  return null;
};

const detectLanguage = (filename: string): FileType => {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs') || lower.endsWith('.jsx')) return 'javascript';
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'typescript';
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html';
  if (lower.endsWith('.css') || lower.endsWith('.scss')) return 'css';
  if (lower.endsWith('.json')) return 'json';
  return 'javascript';
};

const isAllowedFile = (path: string): boolean => {
  const lower = path.toLowerCase();
  // Filter out node_modules, build artifacts, git internals, large binaries
  if (
    lower.includes('node_modules/') ||
    lower.includes('.git/') ||
    lower.includes('dist/') ||
    lower.includes('.next/') ||
    lower.includes('build/') ||
    lower.includes('.cache/') ||
    lower.includes('coverage/') ||
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.ico') ||
    lower.endsWith('.pdf') ||
    lower.endsWith('.zip') ||
    lower.endsWith('.woff') ||
    lower.endsWith('.woff2') ||
    lower.endsWith('.ttf') ||
    lower.endsWith('.mp3') ||
    lower.endsWith('.mp4') ||
    lower.endsWith('.lock')
  ) {
    return false;
  }
  return true;
};

export const cloneGitHubRepository = async (
  repoInfo: GitHubRepoInfo,
  onProgress?: (msg: string) => void
): Promise<ClonedRepoResult> => {
  const { owner, repo, branch = 'main', subpath = '' } = repoInfo;
  const remoteUrl = `https://github.com/${owner}/${repo}`;

  onProgress?.(`Connecting to GitHub repository ${owner}/${repo}...`);

  // Try fetching repo info to resolve default branch & description
  let defaultBranch = branch || 'main';
  let repoDesc = '';
  try {
    const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    if (metaRes.ok) {
      const meta = await metaRes.json();
      defaultBranch = meta.default_branch || defaultBranch;
      repoDesc = meta.description || '';
    }
  } catch {
    // Non-fatal, fallback to specified branch
  }

  let activeBranch = branch && branch !== 'main' ? branch : defaultBranch;
  let treeData: any = null;

  try {
    onProgress?.(`Querying Git tree on branch '${activeBranch}'...`);
    let res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${activeBranch}?recursive=1`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (res.status === 404 && activeBranch !== 'master') {
      // Fallback to master
      activeBranch = 'master';
      res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
    }

    if (res.status === 404 && activeBranch !== 'main') {
      // Fallback to main
      activeBranch = 'main';
      res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
    }

    if (res.ok) {
      treeData = await res.json();
    } else if (res.status === 403) {
      throw new Error('GitHub API rate limit reached. Please wait a moment or try one of the starter templates.');
    } else {
      throw new Error(`Repository not found (${res.status}). Verify that the repository is public and spelled correctly.`);
    }
  } catch (err: any) {
    if (err.message) throw err;
    throw new Error('Failed to connect to GitHub. Please check your network or repository URL.');
  }

  if (!treeData || !Array.isArray(treeData.tree)) {
    throw new Error('Unable to parse repository tree structure.');
  }

  const rawItems = treeData.tree.filter((item: any) => {
    if (subpath && !item.path.startsWith(subpath)) return false;
    return isAllowedFile(item.path);
  });

  // Limit to reasonable number of code files (up to 35 files)
  const candidateBlobs = rawItems.filter((item: any) => item.type === 'blob').slice(0, 35);
  const candidateTrees = rawItems.filter((item: any) => item.type === 'tree');

  if (candidateBlobs.length === 0) {
    throw new Error('No compatible code files (.js, .ts, .html, .css, .json) found in this repository.');
  }

  onProgress?.(`Discovered ${candidateBlobs.length} source files. Downloading file blobs...`);

  // Build Folder hierarchy
  const folderMap = new Map<string, string>(); // path -> folderId
  const createdFolders: Folder[] = [];

  candidateTrees.forEach((t: any) => {
    const segments = t.path.split('/');
    let currentPath = '';
    let parentFolderId: string | null = null;

    segments.forEach((seg: string) => {
      currentPath = currentPath ? `${currentPath}/${seg}` : seg;
      if (!folderMap.has(currentPath)) {
        const folderId = `folder-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        folderMap.set(currentPath, folderId);
        createdFolders.push({
          id: folderId,
          name: seg,
          parentId: parentFolderId
        });
        parentFolderId = folderId;
      } else {
        parentFolderId = folderMap.get(currentPath)!;
      }
    });
  });

  // Fetch file contents in parallel (batches of 6)
  const createdFiles: File[] = [];
  const batchSize = 6;

  for (let i = 0; i < candidateBlobs.length; i += batchSize) {
    const batch = candidateBlobs.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (blob: any) => {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${activeBranch}/${blob.path}`;
          const contentRes = await fetch(rawUrl);
          if (contentRes.ok) {
            const text = await contentRes.text();
            const segments = blob.path.split('/');
            const fileName = segments[segments.length - 1];
            const parentDir = segments.slice(0, -1).join('/');
            const parentFolderId = parentDir ? (folderMap.get(parentDir) || null) : null;

            createdFiles.push({
              id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
              name: fileName,
              language: detectLanguage(fileName),
              parentId: parentFolderId,
              content: text
            });
          }
        } catch (e) {
          console.warn(`Failed to fetch file ${blob.path}`, e);
        }
      })
    );
    onProgress?.(`Downloaded ${Math.min(i + batchSize, candidateBlobs.length)} of ${candidateBlobs.length} files...`);
  }

  if (createdFiles.length === 0) {
    throw new Error('Could not download file contents from GitHub.');
  }

  onProgress?.(`Initializing local Git repository for ${owner}/${repo}...`);

  const commitHash = treeData.sha ? treeData.sha.substring(0, 7) : Math.random().toString(16).substring(2, 9);

  return {
    files: createdFiles,
    folders: createdFolders,
    gitInfo: {
      remoteUrl,
      owner,
      repo,
      branch: activeBranch,
      defaultBranch,
      commitHash,
      description: repoDesc
    }
  };
};

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'algorithms-ds',
    name: 'Algorithms & Data Structures',
    description: 'Sorting algorithms (QuickSort, MergeSort), binary search trees, and comprehensive unit tests.',
    badge: 'Algorithms',
    icon: 'Brain',
    files: [
      {
        name: 'algorithms.js',
        language: 'javascript',
        content: `// Algorithms & Data Structures in Modern JS
export class BinarySearchTree {
  constructor(val = null) {
    this.value = val;
    this.left = null;
    this.right = null;
  }

  insert(val) {
    if (this.value === null) {
      this.value = val;
      return this;
    }
    if (val < this.value) {
      if (!this.left) this.left = new BinarySearchTree(val);
      else this.left.insert(val);
    } else {
      if (!this.right) this.right = new BinarySearchTree(val);
      else this.right.insert(val);
    }
    return this;
  }

  inOrderTraversal(result = []) {
    if (this.left) this.left.inOrderTraversal(result);
    if (this.value !== null) result.push(this.value);
    if (this.right) this.right.inOrderTraversal(result);
    return result;
  }
}

export function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}

const numbers = [64, 34, 25, 12, 22, 11, 90];
console.log("Original Array:", numbers);
console.log("Quick Sorted Array:", quickSort(numbers));

const tree = new BinarySearchTree();
[50, 30, 70, 20, 40, 60, 80].forEach(n => tree.insert(n));
console.log("BST In-Order Traversal:", tree.inOrderTraversal());
`
      },
      {
        name: 'algorithms.test.js',
        language: 'javascript',
        content: `// Unit tests for algorithms.js
describe('QuickSort Algorithm', () => {
  test('correctly sorts arbitrary positive integer array', () => {
    const input = [5, 2, 9, 1, 5, 6];
    expect(quickSort(input)).toEqual([1, 2, 5, 5, 6, 9]);
  });

  test('handles empty arrays cleanly', () => {
    expect(quickSort([])).toEqual([]);
  });

  test('handles single element array', () => {
    expect(quickSort([42])).toEqual([42]);
  });
});

describe('BinarySearchTree Implementation', () => {
  test('inserts and retrieves in ascending order', () => {
    const tree = new BinarySearchTree();
    [15, 10, 20, 8, 12].forEach(n => tree.insert(n));
    expect(tree.inOrderTraversal()).toEqual([8, 10, 12, 15, 20]);
  });
});
`
      },
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html>
<head>
  <title>Algorithms Playground</title>
  <style>
    body { font-family: monospace; background: #121214; color: #eee; padding: 24px; }
    h2 { color: #58a6ff; }
    .card { background: #1e1e24; padding: 16px; border-radius: 8px; border: 1px solid #333; margin-top: 12px; }
  </style>
</head>
<body>
  <h2>⚡ Algorithms & Unit Testing Playground</h2>
  <div class="card">
    <p>Check the <strong>Console</strong> or run the <strong>Tests</strong> tab to view execution metrics!</p>
  </div>
</body>
</html>`
      }
    ]
  },
  {
    id: 'canvas-particles',
    name: 'Interactive Canvas Physics',
    description: 'Real-time particle simulation, fluid velocity vectors, and interactive mouse gravity well in HTML5 Canvas.',
    badge: 'Graphics',
    icon: 'Sparkles',
    files: [
      {
        name: 'index.js',
        language: 'javascript',
        content: `// Interactive Canvas Physics Simulation
const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
  constructor(x, y) {
    this.x = x || Math.random() * canvas.width;
    this.y = y || Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.radius = Math.random() * 3 + 1.5;
    this.hue = Math.random() * 60 + 190;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = \`hsl(\${this.hue}, 90%, 65%)\`;
    ctx.fill();
  }
}

const particles = Array.from({ length: 65 }, () => new Particle());
console.log("Initialized Particle Engine with", particles.length, "particles");

function animate() {
  ctx.fillStyle = 'rgba(15, 17, 23, 0.25)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 90) {
        ctx.strokeStyle = \`rgba(88, 166, 255, \${1 - dist / 90})\`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animate);
}

animate();
`
      },
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html>
<head>
  <title>Canvas Particle Physics</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; overflow: hidden; }
    body { background: #0f1117; width: 100vw; height: 100vh; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <canvas id="scene"></canvas>
</body>
</html>`
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `body { background: #0f1117; margin: 0; }`
      }
    ]
  },
  {
    id: 'async-patterns',
    name: 'Async JS & Promise Sandbox',
    description: 'Modern asynchronous JavaScript patterns: concurrent promises, retry loops, custom EventEmitters, and timeout cancellation.',
    badge: 'Async JS',
    icon: 'Activity',
    files: [
      {
        name: 'index.js',
        language: 'javascript',
        content: `// Asynchronous JavaScript & Concurrency Toolkit

export class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, listener) {
    if (!this.events.has(event)) this.events.set(event, []);
    this.events.get(event).push(listener);
    return () => this.off(event, listener);
  }

  off(event, listener) {
    if (!this.events.has(event)) return;
    const filtered = this.events.get(event).filter(l => l !== listener);
    this.events.set(event, filtered);
  }

  emit(event, ...args) {
    if (!this.events.has(event)) return;
    this.events.get(event).forEach(l => l(...args));
  }
}

export async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retryWithBackoff(fn, retries = 3, delayMs = 300) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 1) throw err;
    console.warn(\`Retrying in \${delayMs}ms... Remaining attempts: \${retries - 1}\`);
    await delay(delayMs);
    return retryWithBackoff(fn, retries - 1, delayMs * 2);
  }
}

// Demo Execution
const emitter = new EventEmitter();
emitter.on('data', (val) => console.log("Received async event:", val));

(async () => {
  console.log("Starting async pipeline...");
  await delay(200);
  emitter.emit('data', { status: 200, payload: 'Async Hello!' });
  
  let attempt = 0;
  const flakyTask = async () => {
    attempt++;
    if (attempt < 3) throw new Error("Temporary network glitch");
    return "Success after retries!";
  };

  const result = await retryWithBackoff(flakyTask);
  console.log("Backoff Task Completed:", result);
})();
`
      },
      {
        name: 'async.test.js',
        language: 'javascript',
        content: `// Unit tests for Async patterns
describe('EventEmitter Pattern', () => {
  test('subscribes and fires listener with payloads', () => {
    const emitter = new EventEmitter();
    let received = null;
    emitter.on('test', (data) => { received = data; });
    emitter.emit('test', { id: 99 });
    expect(received).toEqual({ id: 99 });
  });

  test('unsubscribes listener cleanly', () => {
    const emitter = new EventEmitter();
    let count = 0;
    const unsub = emitter.on('tick', () => { count++; });
    emitter.emit('tick');
    unsub();
    emitter.emit('tick');
    expect(count).toBe(1);
  });
});

describe('Retry with Backoff', () => {
  test('resolves successful promise on first try', async () => {
    const res = await retryWithBackoff(async () => 100);
    expect(res).toBe(100);
  });
});
`
      },
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html>
<head><title>Async Patterns</title></head>
<body style="background:#18181b; color:#f4f4f5; font-family:sans-serif; padding:20px;">
  <h2>Async Toolkit Sandbox</h2>
  <p>Check the console and unit tests tab for execution outputs.</p>
</body>
</html>`
      }
    ]
  }
];
