<div align="center">

# FeraliJs

**A fast, beginner-friendly JavaScript frontend framework — built from scratch.**

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-ISC-blue)](#license)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success)](package.json)

</div>

---

FeraliJs is a complete frontend framework that gives you everything you need to build modern single-page applications — with no third-party dependencies, no build tooling required, and no magic you can't read.

```js
import { createApp, defineComponent } from 'ferali';
import { useTemplate }                from 'ferali';
import { State }                      from 'ferali/hooks';

const App = defineComponent({
  render() {
    const [count, setCount] = State(0);

    return useTemplate(`
      <div>
        <h1>Count: {{ count }}</h1>
        <button #click="{{ () => setCount(count.__raw + 1) }}">+</button>
      </div>
    `);
  }
});

createApp('root').mount(App);
```

---

## Features

- 🧩 **Component System** — Define self-contained UI components with a clean config-object API and automatic lifecycle management.
- 🔥 **Reactive Hooks** — `State`, `Effect`, `Memo`, `Ref`, `Toggle`, `Debounce`, and more — all scoped per-component instance.
- 📝 **Declarative Templates** — Write plain HTML with `{{ interpolation }}`, `#eventBindings`, and `@ChildComponents`. A custom compiler handles the rest.
- ⚡ **Virtual DOM** — Efficient diffing engine with keyed list reconciliation. Only the parts of the DOM that actually changed are updated.
- 🗺 **Built-in SPA Router** — Nested routes, dynamic path params (`:id`), wildcards (`*`), query strings, and two custom HTML elements: `<router-outlet>` and `<route-to>`.
- 🌐 **Global Store** — Cross-component reactive state with explicit subscriptions and batched async updates.
- 🎨 **Localized CSS Scoping** — Opt-in per-component CSS scoping. The Dev Server rewrites your stylesheet to scope every rule under the component's unique ID.
- 🛠 **Zero-Config Dev Server** — Built-in HTTP server with import map injection, hot module replacement (HMR), and transparent template auto-injection. Run `npm run dev` and go.
- 📦 **Zero Build Step** — Ships as native ES modules. No Webpack, Vite, Rollup, or any bundler needed for development.

---

## Getting Started

### Scaffold a new app

```bash
npx create-ferali-app my-app
cd my-app
npm run dev
```

Open **http://localhost:3000**. That's it.

The scaffold generates a complete project folder named `my-app`:

```
my-app/
├── index.html          # SPA shell — Dev Server injects import map & HMR here
├── package.json        # name: "my-app", scripts: { dev }
├── src/
│   └── App.js          # Your root component
├── public/             # Static assets (images, fonts, etc.)
└── lib/                # FeraliJs framework source
    ├── core/           # Component system, hooks, VDOM, compiler
    ├── router/         # SPA router
    ├── store/          # Global state store
    └── cli/            # Dev server
```

---

## A Taste of FeraliJs

### Reactive State

```js
const [name, setName] = State('');
const [items, setItems] = State([]);

const addItem = () => setItems([...items.__raw, name.__raw]);
```

### Template Syntax

```html
<!-- Interpolation -->
<h1>Hello, {{ user.name }}!</h1>

<!-- Event binding -->
<button #click="{{ handleClick }}">Submit</button>

<!-- Child components -->
@UserCard({ name: "{{ user.name }}", active: {{ isOnline }} })

<!-- Conditional rendering -->
<? isLoggedIn
  ? <{ <p>Welcome back!</p> }>
  : <{ <p>Please log in.</p> }>
?>

<!-- List rendering -->
<ul>
  <? items.map(item => <{ <li key="{{ item.id }}">{{ item.name }}</li> }>) ?>
</ul>
```

### Lifecycle & Effects

```js
const Counter = defineComponent({
  onMounted() { console.log('In the DOM!'); },
  onDestroy()  { console.log('Cleaned up.'); },

  render() {
    const [count, setCount] = State(0);

    // Sync document title whenever count changes
    Effect(() => {
      document.title = `Count: ${count.__raw}`;
    }, [count]);

    return useTemplate(`
      <div>
        <p>{{ count }}</p>
        <button #click="{{ () => setCount(count.__raw + 1) }}">+</button>
      </div>
    `);
  }
});
```

### Routing

```js
import { createRouter } from 'ferali-router';

const router = createRouter([
  { path: '/',        component: () => import('./pages/Home.js') },
  { path: '/about',   component: () => import('./pages/About.js') },
  { path: '/users/:id', component: () => import('./pages/User.js') },
  { path: '*',        component: () => import('./pages/NotFound.js') },
]);

createApp('root').use(router).mount(App);
```

```html
<!-- In your template -->
<route-to href="/about">About</route-to>
<router-outlet></router-outlet>
```

### Global Store

```js
// src/store.js
import createStore from 'ferali-store';
const store = createStore();
store.registerState('cartCount', 0);
export default store;

// In any component
const { value: count, set: setCount } = store.subscribe('cartCount');
```

---

## Documentation

Full documentation is in the [`docs/`](./docs/) folder:

| Document | Description |
|----------|-------------|
| [Getting Started](./docs/getting-started.md) | Install, scaffold, and run your first app |
| [User Manual](./docs/user-manual.md) | Practical guide to building complete apps |
| [Components](./docs/core/components.md) | `defineComponent`, lifecycle, props, CSS |
| [Templates](./docs/core/templates.md) | Full template syntax reference |
| [Hooks](./docs/hooks/README.md) | All 13 built-in hooks |
| [Router](./docs/router/README.md) | SPA routing, nested routes, URL params |
| [Store](./docs/store/README.md) | Global reactive state management |
| [Dev Server](./docs/cli/dev-server.md) | HMR, import maps, CSS scoping, transformer |
| [Virtual DOM](./docs/core/vdom.md) | How the VDOM diffing engine works |
| [Compiler](./docs/core/compiler.md) | How the template compiler works |

---

## Built-in Hooks Reference

| Hook | Description |
|------|-------------|
| `State(initial)` | Reactive state variable. Returns `[proxy, setter]`. |
| `Effect(fn, deps?)` | Side effect with optional cleanup. Runs after render. |
| `Memo(fn, deps)` | Memoized derived value. Recomputes when deps change. |
| `Ref(initial?)` | Mutable `{ current }` container. No re-renders on change. |
| `Toggle(initial?)` | Boolean state with a built-in `toggle()` function. |
| `Debounce(initial, ms?)` | State with a debounced setter (default: 300ms). |
| `Event(name, fn, target?)` | Global event listener with auto-cleanup on destroy. |
| `Fetch(url, options?)` | Async data fetch on mount. Returns `{ data, loading, error }`. |
| `FetchPolling(url, ms?, options?)` | Repeating `Fetch` on an interval. Auto-clears on destroy. |
| `LocalStorage(key, initial)` | Reactive state persisted to `localStorage`. |
| `SessionStorage(key, initial)` | Reactive state persisted to `sessionStorage`. |
| `Provide(key, value)` | Makes a value available to all descendant components. |
| `Inject(key)` | Reads a value provided by an ancestor. |

---

## Project Structure

```
lib/
├── core/
│   ├── app.js               # createApp()
│   ├── core.js              # Public API entry point
│   ├── compiler/            # Template compiler: scanner → parser → AST → blueprint
│   ├── component/           # Component class, defineComponent, useTemplate
│   ├── hooks/               # All 13 built-in hooks
│   ├── node/                # VNode, h() hyperscript
│   ├── utils/               # cloneObject, compareObjects, miniHash, etc.
│   └── vdom/                # BUILD_DOM, UPDATE_DOM, DESTROY_DOM
├── router/
│   ├── router.js            # createRouter(), getUrlParams, setUrlParam
│   ├── components/          # <router-outlet>, <route-to>
│   ├── core/                # Route matcher, navigation engine, router state
│   └── utils/               # pathToRegex(), getParams()
├── store/
│   ├── store.js             # createStore()
│   └── hooks/               # registerState, registerToggle, registerFetch, etc.
└── cli/
    └── dev-server/          # HTTP server, HMR, transformer, watcher, logger
```

---

## How It Works (Under the Hood)

1. **`npx create-ferali-app my-app`** scaffolds the project and sets the name in `package.json`.
2. **`npm run dev`** starts the built-in Node.js HTTP server on port 3000.
3. The server **injects an import map** into `index.html` so you can write `import { State } from 'ferali/hooks'` without a bundler.
4. When the browser loads a `.js` file from `src/`, the server **auto-injects the second argument** to `useTemplate()` (the context object), saving you from writing boilerplate.
5. `useTemplate()` passes the string through the **template compiler**: Scanner → Parser → AST → JavaScript blueprint function.
6. On the first render, **`BUILD_DOM(blueprint)`** calls the blueprint and walks the resulting VNode tree to create real DOM elements.
7. When state changes, **`UPDATE_DOM(oldVNode, newVNode)`** performs a minimal diff and patches only what changed.
8. When the component unmounts, **`DESTROY_DOM(vnode)`** removes all event listeners and nullifies references.
9. The **file watcher** broadcasts `data: reload` via Server-Sent Events to all connected browsers when any file in `src/` or `public/` changes.

---

## License

[ISC](package.json)

---

<div align="center">
Built with ❤️ — FeraliJs
</div>
