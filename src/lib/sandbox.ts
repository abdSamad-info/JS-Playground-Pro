import { File } from '../types/index';

export const generateSandboxContent = (files: File[]) => {
  const htmlFile = files.find(f => f.name === 'index.html') || files.find(f => f.language === 'html');
  const cssFile = files.find(f => f.name === 'styles.css') || files.find(f => f.language === 'css');
  const jsFile = files.find(f => f.name === 'index.js') || files.find(f => f.language === 'javascript');

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
