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

export function setupWatcher(rootDir) {
    const dirsToWatch = ['src', 'public', 'index.html'];

    dirsToWatch.forEach(relativeTarget => {
        const targetPath = path.join(rootDir, relativeTarget);
        
        if (fs.existsSync(targetPath)) {
            const isDirectory = fs.statSync(targetPath).isDirectory();
            
            fs.watch(targetPath, { recursive: isDirectory }, (eventType, filename) => {
                if (filename) {
                    if (reloadTimeout) clearTimeout(reloadTimeout);
                    reloadTimeout = setTimeout(() => {
                        broadcastReload(filename);
                    }, 50); // 50ms debounce
                }
            });
        }
    });
}
