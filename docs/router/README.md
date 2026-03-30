# Router — Overview

**Source:** `lib/router/`

The Ferali Router is a full-featured SPA (Single-Page Application) router built into the framework. It provides:

- Declarative, nested route definitions
- Dynamic path parameters (`:id`)
- Wildcard/catch-all routes (`*`)
- Query string management
- Two custom HTML elements: `<router-outlet>` and `<route-to>`
- A clean plugin API for integration with `createApp()`

---

## Import

```js
import { createRouter, getUrlParams, setUrlParam, deleteUrlParam } from 'ferali-router';
```

---

## Modules

| Module | File | Description |
|--------|------|-------------|
| **createRouter** | `router.js` | Public factory — creates and installs the router plugin. |
| **Matcher** | `core/matcher.js` | Recursive, depth-first route matching algorithm. |
| **Navigation** | `core/navigation.js` | History-based navigation engine. |
| **RouterState** | `core/state.js` | Shared mutable state (routes, current branch, params, query). |
| **Outlet** | `components/Outlet.js` | `<router-outlet>` custom element. |
| **Link** | `components/Link.js` | `<route-to>` custom element. |
| **Path utils** | `utils/path.js` | `pathToRegex()` and `getParams()` utility functions. |

---

## Route Definition Object

```ts
interface RouteDefinition {
  path:       string;                    // URL path, supports :param and *
  component:  () => Promise<any>;        // Dynamic import factory
  children?:  RouteDefinition[];         // Nested child routes
  index?:     boolean;                   // Match when parent path is exactly matched
}
```
