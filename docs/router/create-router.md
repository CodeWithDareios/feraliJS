# `createRouter(routes)`

**Source:** `lib/router/router.js`

Creates the Ferali Router plugin. Must be installed into your app via `app.use(router)`.

---

## Signature

```ts
function createRouter(routes: RouteDefinition[]): RouterPlugin
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `routes` | `RouteDefinition[]` | The top-level route definitions for the application. |

### Returns

A router plugin object with an `install(app)` method. Pass it to `app.use()`.

---

## Route Definition

```ts
interface RouteDefinition {
  path:       string;                    // URL path pattern
  component:  () => Promise<any>;        // Dynamic import factory returning a component
  children?:  RouteDefinition[];         // Nested routes (layout routes)
  index?:     boolean;                   // Render at the parent's exact path
}
```

---

## Path Patterns

| Pattern | Matches |
|---------|---------|
| `/` | Exact root path |
| `/about` | Exact `/about` |
| `/users/:id` | `/users/42`, `/users/alice` — captures `id` |
| `/docs/:slug` | `/docs/getting-started` — captures `slug` |
| `*` | Anything that didn't match (404 fallback) |

---

## Basic Example

```js
import { createApp, defineComponent } from 'ferali';
import { useTemplate }                from 'ferali';
import { createRouter }               from 'ferali-router';

const router = createRouter([
  { path: '/',       component: () => import('./pages/Home.js') },
  { path: '/about',  component: () => import('./pages/About.js') },
  { path: '/users/:id', component: () => import('./pages/User.js') },
  { path: '*',       component: () => import('./pages/NotFound.js') },
]);

const App = defineComponent({
  render() {
    return useTemplate(`
      <div>
        <nav>
          <route-to href="/">Home</route-to>
          <route-to href="/about">About</route-to>
        </nav>
        <main>
          <router-outlet></router-outlet>
        </main>
      </div>
    `);
  }
});

createApp('root').use(router).mount(App);
```

---

## Nested Routes (Layouts)

Use `children` to define nested routes. The parent route renders a layout with a `<router-outlet>` for child content.

```js
const router = createRouter([
  {
    path: '/dashboard',
    component: () => import('./layouts/Dashboard.js'),
    children: [
      { path: '/overview', component: () => import('./pages/Overview.js'), index: true },
      { path: '/stats',    component: () => import('./pages/Stats.js') },
      { path: '/settings', component: () => import('./pages/Settings.js') },
    ]
  }
]);
```

**`Dashboard.js` (layout component):**

```js
// This outlet renders the matched child route
return useTemplate(`
  <div class="dashboard">
    <sidebar></sidebar>
    <router-outlet></router-outlet>
  </div>
`);
```

### The `index` Property

When `index: true`, the route matches when the URL equals the parent path exactly — it is the default child route.

---

## URL Params

Page components automatically receive the current URL params and query string as **props** via the router outlet.

```js
// src/pages/User.js
const UserPage = defineComponent({
  render() {
    const { id } = this.getProps();  // { id: '42' }
    const { data, loading } = Fetch(`/api/users/${id}`);

    return useTemplate(`<div><h1>User #{{ id }}</h1></div>`);
  }
});
```

---

## Wildcard Fallbacks

The `*` route is the catch-all. When no other route matches, the router falls back to the nearest wildcard. Wildcards defined at a parent level are inherited by child levels.

```js
const router = createRouter([
  { path: '/', component: () => import('./Home.js') },
  {
    path: '/docs',
    component: () => import('./layouts/DocsLayout.js'),
    children: [
      { path: '/intro', component: () => import('./docs/Intro.js') },
      { path: '*', component: () => import('./docs/NotFound.js') }, // Docs-specific 404
    ]
  },
  { path: '*', component: () => import('./NotFound.js') },  // Global 404
]);
```

---

## URL Params API

See [URL Params API](./url-params.md) for `getUrlParams()`, `setUrlParam()`, and `deleteUrlParam()`.
