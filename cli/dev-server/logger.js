/**
 * Custom logger with colorful CLI output using ANSI escape codes.
 */

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",

    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
    },
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
    }
};

const prefix = `${colors.bright}${colors.fg.magenta}[ferali]${colors.reset}`;

export function info(message) {
    console.log(`${prefix} ${colors.fg.cyan}INFO>${colors.reset} ${message}`);
}

export function success(message) {
    console.log(`${prefix} ${colors.fg.green}SUCCESS> ${message}${colors.reset}`);
}

export function warn(message) {
    console.log(`${prefix} ${colors.fg.yellow}WARN> ${message}${colors.reset}`);
}

export function error(message) {
    console.error(`${prefix} ${colors.fg.red}ERROR> ${message}${colors.reset}`);
}

export function requestLog(method, url, status) {
    let statusColor = status >= 500 ? colors.fg.red : status >= 400 ? colors.fg.yellow : status >= 300 ? colors.fg.cyan : colors.fg.green;
    console.log(`${colors.dim}${new Date().toLocaleTimeString()} ${colors.reset}${method.padEnd(4)} ${statusColor}${status}${colors.reset} ${url}`);
}
