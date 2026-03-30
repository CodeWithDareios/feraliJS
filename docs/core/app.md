# `createApp(rootID)`

**Source:** `lib/core/app.js`

Bootstraps a FeraliJs single-page application by mounting a root component into a specific DOM element.

---

## Signature

```ts
function createApp(rootID: string): AppInstance
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `rootID` | `string` | The `id` of the HTML element that will host the app (e.g., `'root'`). |

### Returns

An `AppInstance` object with four chained methods:

| Method | Description |
|--------|-------------|
| `.useCss(link)` | Queues a global CSS file to be loaded before mounting. |
| `.use(plugin)` | Installs a plugin (e.g., the Router). |
| `.mount(Component)` | Mounts the root component. Returns a `Promise<void>`. |
| `.enableDevMode()` | *Deprecated.* Placeholder for a future dev mode implementation. |

---

## `.useCss(link: string): AppInstance`

Registers a global stylesheet that will be injected into `<head>` before the root component is built. Multiple calls can be chained. Loading is awaited in parallel to prevent a Flash of Unstyled Content (FOUC).

```js
createApp('root')
  .useCss('src/css/global.css')
  .useCss('src/css/theme.css')
  .mount(App);
```

---

## `.use(plugin: { install(app): void }): AppInstance`

Installs a plugin into the application. Any object with an `install(app)` method can be a plugin. The Ferali Router uses this API.

```js
import { createRouter } from 'ferali-router';

const router = createRouter([...]);

createApp('root').use(router).mount(App);
```

---

## `.mount(Component): Promise<void>`

Builds the root component and appends its root DOM element to the container element identified by `rootID`. The method:

1. Awaits all CSS files queued with `.useCss()`.
2. Calls `Component.build()` to execute the render pipeline.
3. Retrieves the root DOM node from the component's VNode tree.
4. Appends it to the root container element.

Throws an error if the root element is not found in the document.

---

## Example — Full Bootstrap

```js
// src/App.js
import { createApp, defineComponent } from 'ferali';
import { createRouter }               from 'ferali-router';
import { useTemplate }                from 'ferali';
import App                            from './components/App.js';

const router = createRouter([
  { path: '/',     component: () => import('./pages/Home.js') },
  { path: '/docs', component: () => import('./pages/Docs.js') },
  { path: '*',     component: () => import('./pages/NotFound.js') },
]);

createApp('root')
  .useCss('src/css/global.css')
  .use(router)
  .mount(App);
```

---

## Internal State

`app.js` also exports two module-level variables used internally by the framework:

| Export | Type | Description |
|--------|------|-------------|
| `dev_enabled` | `boolean` | When `true`, the Component class records build timing into `devInfo`. Currently always `false`. |
| `devInfo` | `Object` | Stores performance timing data for the build process during dev mode. |
