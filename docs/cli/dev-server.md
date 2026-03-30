# Dev Server & CLI

**Source:** `lib/cli/dev-server/`

FeraliJs ships with a built-in Node.js development server. It provides zero-configuration module resolution, hot module replacement, and a transparent transformation layer — all without requiring any bundler or build tool.

---

## Starting the Dev Server

```bash
npm run dev
```

The server starts at **http://localhost:3000** and watches for file changes in `src/` and `public/`.

---

## Features

| Feature | Description |
|---------|-------------|
| **Import Map injection** | Automatically injects a `<script type="importmap">` into `index.html`. |
| **Hot Reload (HMR)** | Detects file changes and sends a reload signal to all connected browsers via Server-Sent Events. |
| **Template auto-injection** | Automatically generates the second argument for `useTemplate()` calls. |
| **Localized CSS scoping** | Transforms CSS files with `?localized=true` query params, scoping all selectors under a component ID. |
| **Security** | Prevents directory traversal attacks and blocks JS execution from the `public/` folder. |

---

## Server Architecture

### `server.js`

The entry point. Creates an HTTP server on port 3000, delegates all requests to `router.js`, and starts the file watcher. Handles interactive CLI commands (`exit`, `help`) via `readline`.

### `router.js` — Request Router

Handles all incoming HTTP requests:

| URL Pattern | Behavior |
|-------------|----------|
| `/__ferali_hmr__` | SSE endpoint for hot reload. |
| `/@ferali/*` | Serves `lib/core/*` files (the framework core). |
| `/@ferali-router/*` | Serves `lib/router/*` files. |
| `/@ferali-store/*` | Serves `lib/store/*` files. |
| `/core/*` | Resolves cross-workspace relative imports from the `lib/core` directory. |
| `/public/*` | Serves static assets from `public/`. JS files are **blocked** for security. |
| `/src/*` | Serves app source files. JS files are transformed by `transformer.js`. |
| *(anything else)* | Falls back to serving `index.html` (SPA catch-all). |

#### Injected Scripts

For every request to `index.html`, the server injects two scripts before `</head>`:

1. **Import map** — maps bare specifiers (`'ferali'`, `'ferali-router'`, `'ferali-store'`) to their actual file paths on the server.
2. **Live reload client** — opens an SSE connection to `/__ferali_hmr__` and reloads the page when it receives a `reload` message.

---

### `transformer.js` — Template Auto-Injection

Every `.js` file served from `/src/` passes through `transformJSFile()`. This transformer:

1. Finds all `useTemplate(...)` calls in the file.
2. For each call:
   - If the argument is a `.html` file path, reads the file from disk and inlines the content.
   - Parses the template string to extract all referenced identifiers (from `{{ }}`, `#event`, and `@Component` expressions).
   - Automatically generates and injects the second argument: `useTemplate(template, { count, setCount, handler, ... })`.
3. Returns the modified source code.

This means you always write:

```js
return useTemplate(`<div>{{ count }}</div>`);
```

And the Dev Server transparently transforms it to:

```js
return useTemplate(`<div>{{ count }}</div>`, { count });
```

### Localized CSS Transformation

When a component's stylesheet is requested with `?localized=true&ferali-cid=<id>`, the server rewrites all CSS rules to be scoped:

```css
/* Original */
.button { color: red; }
:host { background: white; }

/* Transformed */
[ferali-cid="abc123"] .button { color: red; }
[ferali-cid="abc123"] { background: white; }
```

---

### `watcher.js` — File Watcher & HMR

Watches the `src/`, `public/`, and `index.html` paths using Node's native `fs.watch`. To prevent false positives on Windows (which fires watch events on file reads), the watcher maintains a **modification time cache** (`mtimeCache`). A reload is only broadcast if a file's `mtimeMs` actually changed.

Reloads are debounced by `50ms` to coalesce rapid file system events.

**SSE Protocol:** Each browser connected to `/__ferali_hmr__` is tracked in a `clients` array. On a detected change, `broadcastReload` sends `data: reload\n\n` to all clients.

---

### `logger.js` — CLI Logger

A small colored console logger used by the server:

| Function | Color | Use case |
|----------|-------|----------|
| `info(msg)` | Cyan | General informational messages |
| `success(msg)` | Green | Server started, HMR connected |
| `warn(msg)` | Yellow | Non-fatal warnings |
| `error(msg)` | Red | Errors and blocked requests |
| `requestLog(method, url, status)` | Color by status code | HTTP request logs |

---

### `utils.js` — Security Utilities

| Function | Description |
|----------|-------------|
| `getContentType(filePath)` | Returns the correct MIME type for a file based on its extension. Defaults to `application/octet-stream`. |
| `safeJoinPath(baseDir, requestedPath)` | Resolves a path within a base directory and returns `null` if the resolved path escapes the base (prevents directory traversal attacks). |

---

## Available CLI Commands (While Dev Server is Running)

Type these commands in the terminal where `npm run dev` is running:

| Command | Description |
|---------|-------------|
| `exit` | Gracefully shuts down the server. |
| `help` | Lists available commands. |
| `Ctrl+C` | Also gracefully shuts down the server. |
