# Getting Started

This guide walks you through creating your first FeraliJs application.

## Prerequisites

- **Node.js** v18 or later
- A modern browser (Chrome, Firefox, Edge) — no transpilation required

## Step 1 — Scaffold a New App

Use the `create-ferali-app` package to generate a new project. You do not need to install it:

```bash
npx create-ferali-app my-app
```

This creates a `my-app/` directory containing the complete FeraliJs project structure with your app name pre-configured in `package.json`.

```
my-app/
├── index.html          # SPA entry point
├── package.json        # name: "my-app", scripts: { dev }
├── src/
│   └── App.js          # Starter root component
├── public/             # Static assets (images, fonts, etc.)
└── lib/                # FeraliJs framework source
    ├── core/
    ├── router/
    ├── store/
    └── cli/
```

> **Note:** The `index.html` is already configured with a `#root` div and a module script pointing to `src/App.js`. The Dev Server injects the Ferali import map and live-reload script automatically.

## Step 2 — Start the Dev Server

```bash
cd my-app
npm run dev
```

The server starts at **http://localhost:3000**.

## Step 3 — Create Your Root Component

```js
// src/App.js
import { createApp, defineComponent } from 'ferali';
import { useTemplate } from 'ferali';
import { State } from 'ferali/hooks';

const App = defineComponent({
  render() {
    const [count, setCount] = State(0);

    return useTemplate(`
      <div>
        <h1>Hello from FeraliJs!</h1>
        <p>Count: {{ count }}</p>
        <button #click="{{ setCount }}">+1</button>
      </div>
    `);
  }
});

createApp('root').mount(App);
```

## Step 4 — Add Routing (Optional)

```js
// src/App.js
import { createApp, defineComponent } from 'ferali';
import { useTemplate } from 'ferali';
import { createRouter } from 'ferali-router';

const router = createRouter([
  { path: '/',      component: () => import('./pages/Home.js') },
  { path: '/about', component: () => import('./pages/About.js') },
  { path: '*',      component: () => import('./pages/NotFound.js') },
]);

const App = defineComponent({
  render() {
    return useTemplate(`
      <div>
        <nav>
          <route-to href="/">Home</route-to>
          <route-to href="/about">About</route-to>
        </nav>
        <router-outlet></router-outlet>
      </div>
    `);
  }
});

createApp('root').use(router).mount(App);
```

---

## Template Syntax Quick Reference

| Syntax | Description |
|--------|-------------|
| `{{ expression }}` | Text interpolation — renders any JS expression as text. |
| `#eventName="{{ handler }}"` | Event binding — attaches a DOM event listener. |
| `@ComponentName({})` | Embeds a child Ferali component. |
| `<? JS expression ?>` | JavaScript block — renders the result of any JS expression. |
| `<{ <html/> }>` | HTML-in-JS block — embeds HTML markup inside a `<? ?>` block. |

---

## The `npm run dev` Script

The `dev` script in `package.json` runs the Ferali Dev Server:

```json
{
  "scripts": {
    "dev": "node lib/cli/dev-server/server.js"
  }
}
```

The Dev Server provides:

- **Zero-config import maps** — bare specifiers like `'ferali'` are automatically resolved.
- **Hot Module Replacement (HMR)** — the browser automatically reloads when files in `src/` or `public/` change.
- **Template auto-injection** — the second argument to `useTemplate()` is automatically generated from the template's context keys, so you never have to write it by hand.
- **Localized CSS scoping** — when a component uses `style: { localized: true }`, the dev server rewrites the CSS to scope it to that component only.
