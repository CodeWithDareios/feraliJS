# `<route-to>`

**Source:** `lib/router/components/Link.js`

`<route-to>` is a Web Component (Custom Element) that renders a declarative SPA navigation link. When clicked, it calls the Ferali router's `navigateTo()` function instead of triggering a full browser navigation.

---

## Usage

```html
<!-- Absolute navigation -->
<route-to href="/docs">Go to Docs</route-to>

<!-- Navigate to a child route relative to the current path -->
<route-to href="*/nested">Go to Nested</route-to>
```

---

## Attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `href` | ✅ | The target URL. Can be absolute (e.g., `/about`) or relative (e.g., `*/settings`). |

---

## Absolute Navigation

When `href` starts with `/`, the router navigates to the exact path:

```html
<route-to href="/users/42">View User</route-to>
```

## Relative Navigation (`*/segment`)

When `href` starts with `*/`, the router appends the segment to the current URL path:

```html
<!-- If current path is /docs, this navigates to /docs/getting-started -->
<route-to href="*/getting-started">Getting Started</route-to>
```

This is useful inside nested layouts where you don't want to hardcode the parent path prefix.

---

## Styling

`<route-to>` elements have `cursor: pointer` set automatically via an inline style. You can style them like any other inline element:

```css
route-to {
  color: #6c63ff;
  text-decoration: none;
  font-weight: 500;
}

route-to:hover {
  text-decoration: underline;
}
```

---

## Intercepting `<a>` Tags

The router also intercepts clicks on standard `<a>` tags with paths starting with `/`, *unless* the link has a `native` attribute:

```html
<!-- Handled by Ferali router -->
<a href="/about">About</a>

<!-- Treated as a normal browser navigation link -->
<a href="/download" native>Download PDF</a>
```

This means you can use both `<route-to>` and `<a>` tags for internal navigation, depending on your preference.

---

## Programmatic Navigation

To navigate programmatically from JavaScript, import `navigateTo` directly from the router internals or use `setUrlParam`/`deleteUrlParam`:

```js
import { navigateTo } from '../../lib/router/core/navigation.js';

// Or using the URL params API from ferali-router:
import { getUrlParams, setUrlParam, deleteUrlParam } from 'ferali-router';

// Navigate programmatically
navigateTo('/dashboard');

// Update a query param
setUrlParam('page', '2');    // → navigates to ?page=2
deleteUrlParam('filter');    // → removes ?filter=...
```
