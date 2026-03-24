import http from 'http';
import path from 'path';
import process from 'process';
import readline from 'readline';
import { handleRequest } from './router.js';
import { setupWatcher } from './watcher.js';
import { info, success, requestLog, error, warn } from './logger.js';

const PORT = 3000;
const ROOT_DIR = process.cwd(); // Root directory is where the npm run dev script is called from

const server = http.createServer((req, res) => {
    try {
        handleRequest(req, res, ROOT_DIR);
    } catch (err) {
        error(`Internal Server Error: ${err.message}`);
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 Internal Server Error');
        }
    }
});

server.listen(PORT, () => {
    console.clear();
    console.log('\n');

    console.log("======================================================================");
    process.stdout.write("|");
    info(`Ferali Dev Server starting...`);
    process.stdout.write('\x1b[1A\x1b[70G');
    process.stdout.write('|');
    process.stdout.write('\x1b[1B\x1b[1G');
    process.stdout.write("|");
    success(`Local: http://localhost:${PORT}/`);
    process.stdout.write('\x1b[1A\x1b[70G');
    process.stdout.write('|');
    process.stdout.write('\x1b[1B\x1b[1G');
    process.stdout.write("|");
    info(`Watching for file changes in src/ and public/...`);
    process.stdout.write('\x1b[1A\x1b[70G');
    process.stdout.write('|');
    process.stdout.write('\x1b[1B\x1b[1G');
    console.log("======================================================================")
    console.log('\n');

    // Start FS watchers
    setupWatcher(ROOT_DIR);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false // Prevents echoing the input twice in some terminals
    });

    rl.on('line', (line) => {
        const command = line.trim().toLowerCase();

        switch (command) {
            case 'exit':
                process.stdout.write('\x1b[1A\x1b[1G');
                warn('Shutting down Ferali Dev Server...');
                rl.close();
                process.exit(0);
                break;

            case 'help':
                info('Available commands: exit, help');
                break;

            default:
                if (command.length > 0) {
                    error(`Unknown command: ${command}`);
                }
                break;
        }
    });

    // Handle CTRL+C gracefully
    rl.on('SIGINT', () => {
        process.emit('SIGINT');
    });
});
