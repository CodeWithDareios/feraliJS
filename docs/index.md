# FeraliJs Documentation

> A lightweight, component-based frontend JavaScript framework with a native HTML template compiler, Virtual DOM diffing engine, SPA router, and global store.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](./getting-started.md)
3. [User Manual](./user-manual.md) ← *Start here to learn how to build apps*
3. [Core](./core/README.md)
   - [Application Bootstrap (`createApp`)](./core/app.md)
   - [Components (`defineComponent`)](./core/components.md)
   - [Templates (`useTemplate`)](./core/templates.md)
   - [Virtual DOM](./core/vdom.md)
   - [Template Compiler](./core/compiler.md)
4. [Hooks](./hooks/README.md)
   - [`State`](./hooks/state.md)
   - [`Effect`](./hooks/effect.md)
   - [`Memo`](./hooks/memo.md)
   - [`Ref`](./hooks/ref.md)
   - [`Toggle`](./hooks/toggle.md)
   - [`Debounce`](./hooks/debounce.md)
   - [`Event`](./hooks/event.md)
   - [`Fetch`](./hooks/fetch.md)
   - [`FetchPolling`](./hooks/fetch-polling.md)
   - [`LocalStorage`](./hooks/local-storage.md)
   - [`SessionStorage`](./hooks/session-storage.md)
   - [`Provide` & `Inject`](./hooks/context.md)
5. [Router](./router/README.md)
   - [`createRouter`](./router/create-router.md)
   - [`<router-outlet>`](./router/outlet.md)
   - [`<route-to>`](./router/route-to.md)
   - [URL Params API](./router/url-params.md)
6. [Store](./store/README.md)
   - [`createStore`](./store/create-store.md)
   - [Store Hooks](./store/store-hooks.md)
7. [Dev Server & CLI](./cli/dev-server.md)

---

## Introduction

FeraliJs is a **zero-dependency** frontend framework built from scratch with the following design principles:

| Principle | Description |
|-----------|-------------|
| **Declarative Templates** | Write HTML directly — a custom compiler transforms it into an efficient Virtual DOM blueprint. |
| **Reactive Hooks** | Familiar hook-based state management (`State`, `Effect`, `Memo`, etc.) tied to each component's lifecycle. |
| **Component Lifecycle** | Every component has four lifecycle events: `onInit`, `onMounted`, `onUpdate`, `onDestroy`. |
| **Minimal Footprint** | No build step required for development — the included Dev Server handles everything at runtime. |
| **Built-in Router** | A full SPA router with nested routes, dynamic params, query strings, and custom HTML elements. |
| **Global Store** | A reactive cross-component state store with batched updates and explicit subscriptions. |

---

## Creating a New App

FeraliJs projects are scaffolded using the `create-ferali-app` npm package. You do not install it — run it directly with `npx` or the global install:

```bash
# Using npx (no install needed)
npx create-ferali-app my-app

# Or install globally once
npm install -g create-ferali-app
create-ferali-app my-app
```

This creates a `my-app/` folder containing the complete FeraliJs project structure — the framework source (`lib/`), a starter `src/`, the `index.html` entry point, and a pre-configured `package.json` with `my-app` as the project name.

```
my-app/
├── index.html
├── package.json       # name: "my-app" (set automatically)
├── src/
│   └── App.js         # Your app's root component
├── public/            # Static assets
└── lib/               # FeraliJs framework source
    ├── core/
    ├── router/
    ├── store/
    └── cli/
```

Then:

```bash
cd my-app
npm run dev
```

Your app is live at **http://localhost:3000**.

---

## Module Structure

```
lib/
├── core/                    # Framework core
│   ├── app.js               # createApp() bootstrap
│   ├── core.js              # Public exports entry point
│   ├── compiler/            # HTML template compiler
│   ├── component/           # Component class & factories
│   ├── hooks/               # All built-in hooks
│   ├── node/                # VNode definition & h() factory
│   ├── utils/               # Shared utility functions
│   └── vdom/                # Virtual DOM: build, update, destroy
├── router/                  # SPA Router
│   ├── router.js            # createRouter() and URL param API
│   ├── components/          # <router-outlet> and <route-to>
│   ├── core/                # Matcher, navigation, state
│   └── utils/               # Path regex utilities
├── store/                   # Global state store
│   ├── store.js             # createStore() factory
│   └── hooks/               # Store-specific hook implementations
└── cli/
    └── dev-server/          # Development HTTP server
```

---

## Import Map Reference

The Ferali Dev Server automatically injects the following import map into `index.html`, so you can use clean bare specifiers in your app code:

```json
{
  "imports": {
    "ferali":          "/@ferali/core.js",
    "ferali/":         "/@ferali/",
    "ferali/hooks":    "/@ferali/hooks/hooks.js",
    "ferali-router":   "/@ferali-router/router.js",
    "ferali-store":    "/@ferali-store/store.js"
  }
}
```

So in your source files you write:

```js
import { createApp, defineComponent } from 'ferali';
import { State, Effect }             from 'ferali/hooks';
import { createRouter }              from 'ferali-router';
import createStore                   from 'ferali-store';
```
