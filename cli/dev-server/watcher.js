import fs from 'fs';
import path from 'path';
import dns from 'dns';
import { info } from './logger.js';

let clients = [];

/**
 * Handle incoming Server-Sent Events (SSE) connections for hot reload.
 */
export function handleSSE(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    // Send initial connection successful message
    res.write('data: connected\n\n');

    clients.push(res);

    const ip = req.socket.remoteAddress;
    
    // Attempt to resolve the client's PC/Device hostname using native DNS
    dns.reverse(ip, (err, hostnames) => {
        const clientName = (!err && hostnames && hostnames.length > 0) ? hostnames[0] : 'Unknown';
        info(`New connection established ⇄ IP: ${ip} | Device: ${clientName}`);
    });

    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
}

/**
 * Broadcast a reload message to all connected clients.
 */
function broadcastReload(filename) {
    info(`File changed: ${filename}. Triggering reload...`);
    clients.forEach(client => {
        client.write('data: reload\n\n');
    });
}

/**
 * Setup watchers on relevant directories using native fs.watch.
 * Using recursive: true for Windows.
 */
let reloadTimeout = null;
const mtimeCache = new Map();

export function setupWatcher(rootDir) {
    const dirsToWatch = ['src', 'public', 'index.html'];

    dirsToWatch.forEach(relativeTarget => {
        const targetPath = path.join(rootDir, relativeTarget);
        
        if (fs.existsSync(targetPath)) {
            const stat = fs.statSync(targetPath);
            const isDirectory = stat.isDirectory();
            
            // Pre-populate cache for all existing files to prevent reload on first access
            if (isDirectory) {
                populateMtimeCache(targetPath);
            } else {
                mtimeCache.set(targetPath, stat.mtimeMs);
            }

            fs.watch(targetPath, { recursive: isDirectory }, (eventType, filename) => {
                if (filename) {
                    const fullPath = path.join(isDirectory ? targetPath : rootDir, filename);
                    
                    try {
                        // Ignore directories and non-existent files
                        const stat = fs.statSync(fullPath);
                        if (stat.isDirectory()) return;

                        // Check if file was ACTUALLY modified (prevents Windows firing on read access)
                        if (mtimeCache.get(fullPath) === stat.mtimeMs) return;
                        mtimeCache.set(fullPath, stat.mtimeMs);
                    } catch (e) {
                        // Ignore stat errors (like file deletions), just let it reload
                    }

                    if (reloadTimeout) clearTimeout(reloadTimeout);
                    reloadTimeout = setTimeout(() => {
                        broadcastReload(filename);
                    }, 50); // 50ms debounce
                }
            });
        }
    });
}

/**
 * Recursively populates the mtime cache for all files in a directory.
 */
function populateMtimeCache(dir) {
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                populateMtimeCache(fullPath);
            } else {
                const stat = fs.statSync(fullPath);
                mtimeCache.set(fullPath, stat.mtimeMs);
            }
        }
    } catch (e) {
        // Ignore errors during startup cache population
    }
}
