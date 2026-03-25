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
        return serveFile(req, res, safePath);
    }

    if (url.startsWith('/@ferali-router/')) {
        const coreRelativePath = url.replace(/^\/@ferali-router\//, '');
        const coreDir = path.join(rootDir, 'lib', 'router');
        const safePath = safeJoinPath(coreDir, '/' + coreRelativePath);

        if (!safePath) return serve404(res);
        return serveFile(req, res, safePath);
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

        return serveFile(req, res, safePath);
    }

    // 4. Handle src folder
    if (url.startsWith('/src/')) {
        const safePath = safeJoinPath(rootDir, url);
        if (!safePath) return serve404(res);
        return serveFile(req, res, safePath);
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
 * Supports on-the-fly CSS transformation for localized components.
 */
function serveFile(req, res, filePath) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const isLocalized = url.searchParams.get('localized') === 'true';
    const feraliCid = url.searchParams.get('ferali-cid');

    // Read as buffer to support images/binary files
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
        
        // Only transform if it's a CSS file AND localization is requested
        if (isLocalized && feraliCid && filePath.endsWith('.css')) {
            const transformed = transformScopedCss(data.toString('utf8'), feraliCid);
            res.writeHead(200, { 'Content-Type': mimeType });
            return res.end(transformed);
        }

        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    });
}

/**
 * Prefixes CSS selectors with [ferali-id="id"] to ensure scoping.
 * Uses a lookbehind check to ensure we only prefix characters that follow a delimiter (;, {, or })
 * or the start of the file, and are followed by an opening brace.
 */
function transformScopedCss(css, id) {
    // Regex: find sequences that don't contain delimiters, preceded by a delimiter or start, and followed by {
    return css.replace(/(?<=^|[}{;])([^}{;]+)(?={)/g, (match) => {
        if (match.trim().startsWith('@')) return match;
        
        const scoped = match.split(',')
            .map(s => {
                const trimmed = s.trim();
                const leadingWhitespace = s.match(/^\s*/)[0];
                if (!trimmed) return s;
                
                // If :host is present, replace it with the specific ID selector
                // Otherwise, prefix to ensure nesting/descendant scoping
                if (trimmed.includes(':host')) {
                    return `${leadingWhitespace}${trimmed.replace(':host', `[ferali-cid="${id}"]`)}`;
                }

                return `${leadingWhitespace}[ferali-cid="${id}"] ${trimmed}`;
            })
            .join(',');
        
        return scoped;
    });
}

function serve404(res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
}
