import { File } from '../types/index';

export const generateSandboxContent = (files: File[], activeFileId?: string) => {
  const activeFile = activeFileId ? files.find(f => f.id === activeFileId) : null;

  let htmlFile = files.find(f => f.name === 'index.html') || files.find(f => f.language === 'html');
  let cssFile = files.find(f => f.name === 'styles.css') || files.find(f => f.language === 'css');
  let jsFile = files.find(f => f.name === 'index.js') || files.find(f => f.language === 'javascript');

  // If there is an active file, use it to override the default files for preview/execution
  if (activeFile) {
    if (activeFile.language === 'javascript' || activeFile.name.endsWith('.js')) {
      jsFile = activeFile;
    } else if (activeFile.language === 'html' || activeFile.name.endsWith('.html')) {
      htmlFile = activeFile;
    } else if (activeFile.language === 'css' || activeFile.name.endsWith('.css')) {
      cssFile = activeFile;
    }
  }

  const html = htmlFile?.content || '';
  const css = cssFile?.content || '';
  const js = jsFile?.content || '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>
          (function() {
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            const originalInfo = console.info;

            const sendToParent = (type, args) => {
              window.parent.postMessage({
                type: 'CONSOLE_LOG',
                payload: {
                  type,
                  content: args.map(arg => {
                    if (typeof arg === 'object') {
                      try {
                        return JSON.stringify(arg, null, 2);
                      } catch (e) {
                        return String(arg);
                      }
                    }
                    return String(arg);
                  }).join(' ')
                }
              }, '*');
            };

            console.log = (...args) => {
              sendToParent('log', args);
              originalLog.apply(console, args);
            };
            console.error = (...args) => {
              sendToParent('error', args);
              originalError.apply(console, args);
            };
            console.warn = (...args) => {
              sendToParent('warn', args);
              originalWarn.apply(console, args);
            };
            console.info = (...args) => {
              sendToParent('info', args);
              originalInfo.apply(console, args);
            };

            window.onerror = function(message, source, lineno, colno, error) {
              sendToParent('error', [message]);
              return false;
            };

            try {
              ${js}
            } catch (err) {
              sendToParent('error', [err.message]);
            }
          })();
        </script>
      </body>
    </html>
  `;
};
