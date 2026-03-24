import fs from 'fs';
import path from 'path';
import { getContentType, safeJoinPath } from './utils.js';
import { handleSSE } from './watcher.js';
import { error, warn, success } from './logger.js';

const INJECTED_SCRIPTS = `
<script type="importmap">
{
  "imports": {
    "ferali": "/@ferali/core.js",
    "ferali/hooks": "/@ferali/hooks/hooks.js",
    "ferali-router": "/@ferali-router/router.js"
  }
}
</script>
<script>
  {
      const evtSource = new EventSource("/__ferali_hmr__");
      evtSource.onmessage = function(event) {
        if (event.data === "reload") {
          window.location.reload();
        }
      };
      
      evtSource.onerror = function() {
        console.warn("[ferali] Lost connection to Dev Server. Retrying...");
      }
  }
</script>
`;

export function handleRequest(req, res, rootDir) {
    const url = req.url.split('?')[0];

    // 1. Handle Hot Reload SSE Endpoint
    if (url === '/__ferali_hmr__') {
        return handleSSE(req, res);
    }

    // 2. Handle framework package files dynamically
    if (url.startsWith('/@ferali/')) {
        const coreRelativePath = url.replace(/^\/@ferali\//, '');
        const coreDir = path.join(rootDir, 'lib', 'core');
        const safePath = safeJoinPath(coreDir, '/' + coreRelativePath);

        if (!safePath) return serve404(res);
        return serveFile(res, safePath);
    }

    if (url.startsWith('/@ferali-router/')) {
        const coreRelativePath = url.replace(/^\/@ferali-router\//, '');
        const coreDir = path.join(rootDir, 'lib', 'router');
        const safePath = safeJoinPath(coreDir, '/' + coreRelativePath);

        if (!safePath) return serve404(res);
        return serveFile(res, safePath);
    }

    // 3. Handle public folder with tight security
    if (url.startsWith('/public/')) {
        const safePath = safeJoinPath(rootDir, url);
        if (!safePath) return serve404(res);

        // Security Criteria: DO NOT SERVE SCRIPTS FROM PUBLIC
        if (safePath.endsWith('.js') || safePath.endsWith('.mjs')) {
            warn(`Blocked script execution attempt from public folder: ${url}`);
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('403 Forbidden: Scripts are not allowed from the public folder.');
            return;
        }

        return serveFile(res, safePath);
    }

    // 4. Handle src folder
    if (url.startsWith('/src/')) {
        const safePath = safeJoinPath(rootDir, url);
        if (!safePath) return serve404(res);
        return serveFile(res, safePath);
    }

    // 5. Default SPA Routing -> serve root index.html
    const indexPath = path.join(rootDir, 'index.html');
    if (fs.existsSync(indexPath)) {
        serveIndexWithScripts(res, indexPath);
    } else {
        serve404(res);
    }
}

/**
 * Serves index.html, injecting the importmap and live reload scripts onto it.
 */
function serveIndexWithScripts(res, indexPath) {
    fs.readFile(indexPath, 'utf8', (err, html) => {
        if (err) {
            error(`Error reading index.html: ${err.message}`);
            res.writeHead(500);
            return res.end('500 Internal Server Error');
        }

        // Inject the scripts inside the <head> tag
        const modifiedHtml = html.replace('</head>', `${INJECTED_SCRIPTS}\n</head>`);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(modifiedHtml);
    });
}

/**
 * Standalone file serving logic determining the actual MIME type.
 */
function serveFile(res, filePath) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return serve404(res);
            }
            error(`Read error on ${filePath}: ${err.message}`);
            res.writeHead(500);
            return res.end('500 Internal Server Error');
        }

        const mimeType = getContentType(filePath);
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    });
}

function serve404(res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
}
