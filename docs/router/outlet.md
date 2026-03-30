# `<router-outlet>`

**Source:** `lib/router/components/Outlet.js`

`<router-outlet>` is a Web Component (Custom Element) that acts as the **rendering viewport** for the Ferali Router. It dynamically loads and renders the matched page component for its depth in the route branch.

---

## Usage

Place `<router-outlet>` in your layout templates wherever you want the matched route content to appear:

```html
<!-- In your App or layout component template -->
<div class="app-layout">
  <header>...</header>
  <main>
    <router-outlet></router-outlet>
  </main>
  <footer>...</footer>
</div>
```

### Nested Outlets

For nested routing, place a `<router-outlet>` inside the parent route's layout component. The router automatically resolves each outlet's depth:

- **Depth 0** (outermost outlet): Renders `currentBranch[0]` — the root route component.
- **Depth 1** (nested outlet inside a layout): Renders `currentBranch[1]` — the child route component.

---

## How It Works

1. On `connectedCallback`, the outlet counts how many ancestor `<router-outlet>` elements it has — this becomes its **depth index**.
2. It listens for the `ferali-nav` custom event (dispatched by the navigation engine after every URL change).
3. On each navigation:
   - Looks up `RouterState.currentBranch[depth]` to find the matched route for its level.
   - Dynamically imports the route's component module.
   - If the **same component** is re-used (e.g., navigating with different params on the same route), it calls `useProps()` and `update()` to pass new params without destroying the component.
   - If a **different component** is needed, it destroys the old one and builds and mounts the new one.

---

## Component Freshness

The router outlet always creates a **fresh instance** of the page component (via `defineComponent(ComponentDef.getConfig())`). This ensures each mount gets its own isolated hook state and lifecycle, even when the same module is re-loaded on multiple navigations.

This is critical because ES module imports are cached — the outlet must not reuse the cached singleton.

---

## Props on Page Components

The outlet automatically passes the current URL params and query string as props to the rendered component:

```js
// URL: /users/42?tab=posts
// Props passed to the component:
{ id: '42', tab: 'posts' }
```

Access them in your page component via `this.getProps()`:

```js
const UserPage = defineComponent({
  render() {
    const { id, tab } = this.getProps();
    // ...
  }
});
```

---

## Multiple Outlets

An application can have multiple outlets at the same depth level, but the current implementation routes all navigation events to all outlets of the same depth. In typical usage, you have one outlet per layout level.
