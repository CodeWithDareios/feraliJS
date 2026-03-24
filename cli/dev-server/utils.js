import path from 'path';
import fs from 'fs';

/**
 * Common MIME types for web development.
 */
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.wasm': 'application/wasm',
    '.txt': 'text/plain'
};

/**
 * Gets the correct content type for a given file path based on extension.
 * Defaults to 'application/octet-stream' if unknown.
 */
export function getContentType(filePath) {
    const ext = String(path.extname(filePath)).toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Safely resolves a path relative to a base directory, preventing 
 * directory traversal attacks (e.g. using ../../../)
 * @param {string} baseDir The allowed root directory
 * @param {string} requestedPath The user requested path
 * @returns {string|null} The safe absolute path, or null if it escapes the baseDir
 */
export function safeJoinPath(baseDir, requestedPath) {
    // Resolve the absolute path of the root to ensure a clean compare
    const absoluteBase = path.resolve(baseDir);
    
    // Join and resolve the requested path
    // Remove query strings or hashes if they somehow get here
    const cleanPath = requestedPath.split('?')[0].split('#')[0];
    
    const absoluteRequested = path.resolve(absoluteBase, cleanPath.replace(/^\//, ''));
    
    // Windows path casing normalization
    const baseLower = absoluteBase.toLowerCase();
    const requestedLower = absoluteRequested.toLowerCase();

    // Check if the resulting path still starts with the base directory
    if (requestedLower.startsWith(baseLower)) {
        return absoluteRequested;
    }
    
    return null; // Path traversal attempt detected
}
