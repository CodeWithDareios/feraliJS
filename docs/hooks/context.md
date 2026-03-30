# `Provide` & `Inject`

**Source:** `lib/core/hooks/context.js`

`Provide` and `Inject` implement a lightweight **context system** for passing data implicitly down the component tree — without passing props through every intermediate component (prop-drilling).

---

## `Provide(key, value)`

Provides a value to all descendant components that `Inject` the same key.

```ts
function Provide(key: string | symbol, value: any): void
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string \| symbol` | A unique identifier for this context. |
| `value` | `any` | The data to provide to descendants. |

---

## `Inject(key)`

Injects a value provided by an ancestor component.

```ts
function Inject(key: string | symbol): any
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string \| symbol` | The unique identifier for the context. |

### Returns

The provided value, or `undefined` if no ancestor has provided the key.

---

## How It Works

`Provide` stores values in `STORAGE.CONTEXT`, a `WeakMap` keyed by the component instance. `Inject` traverses the `COMPONENT_STACK` (which tracks the active component hierarchy during build) from deepest to shallowest, returning the first matching value it finds.

> **Important:** Context is resolved **at build time** — i.e., during the initial render of each component. It is not reactive. If a provided value changes, descendants that have already been built will not automatically re-receive the new value.

---

## Example — Theme Context

**Parent (provides theme):**

```js
import { defineComponent } from 'ferali';
import { useTemplate }     from 'ferali';
import { Provide }         from 'ferali/hooks';

const ThemeProvider = defineComponent({
  render() {
    Provide('theme', 'dark');

    return useTemplate(`
      <div>
        @Sidebar({})
        @Content({})
      </div>
    `);
  }
});
```

**Grandchild (injects theme):**

```js
import { defineComponent } from 'ferali';
import { useTemplate }     from 'ferali';
import { Inject }          from 'ferali/hooks';

const Button = defineComponent({
  render() {
    const theme = Inject('theme'); // → 'dark'

    return useTemplate(`
      <button class="{{ theme }}">Click me</button>
    `);
  }
});
```

---

## Using Symbols for Unique Keys

For large apps, using `Symbol` keys prevents accidental key collisions between different context providers:

```js
// context-keys.js
export const THEME_KEY = Symbol('theme');
export const AUTH_KEY  = Symbol('auth');

// Provider
Provide(THEME_KEY, { mode: 'dark' });

// Consumer
const theme = Inject(THEME_KEY);
```

---

## Caveats

- Context is **not reactive** — it does not cause re-renders when the provided value changes.
- For reactive cross-component data sharing, use the [Global Store](../store/README.md).
- `Inject` only works during the component build phase (inside `render()`), not in async callbacks or event handlers.
