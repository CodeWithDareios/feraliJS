# Hooks — Overview

**Source:** `lib/core/hooks/`

Hooks are functions that let you add reactive behavior to Ferali components. They must be called **inside a component's `render()` function** — they rely on the currently-rendering component context to store their data.

The hooks are exported from the `ferali/hooks` module:

```js
import {
  State, Effect, Memo, Ref,
  Toggle, Debounce, Event, Fetch,
  FetchPolling, LocalStorage, SessionStorage,
  Provide, Inject
} from 'ferali/hooks';
```

---

## How Hooks Work Internally

Ferali's hook system uses a similar principle to React's hooks — **call order is the source of identity**.

### The Storage System (`storage.js`)

All hook data is stored in three shared `Map` objects, keyed by component `instanceID`:

| Map | Contents |
|-----|----------|
| `STORAGE.STATE` | State values indexed by hook call order (`hookIndex`). |
| `STORAGE.EFFECT` | Effect data (callbacks, dependencies, cleanup functions). |
| `STORAGE.REF` | Ref objects. |
| `STORAGE.CONTEXT` | A `WeakMap` from component → context key/value pairs (`Provide`/`Inject`). |

### The `currentComponent` Pointer

Before calling `render()`, the framework sets `currentComponent.component` to the current component instance. Hooks read this pointer to know which component they belong to.

```js
// Set before render()
CURRENT_COMPONENT.component = this;

// Hooks use it internally:
const comp = currentComponent.component;
const id = comp.instanceID;
```

After `render()` completes, the pointer is cleared.

### The `COMPONENT_STACK`

An array that tracks the component hierarchy being built at any given moment. Used exclusively by `Provide` and `Inject` to traverse ancestor components.

---

## Hook Rules

These rules must be followed or hooks will not work correctly:

1. **Call hooks only inside `render()`** — not in event handlers, async callbacks, or condition branches.
2. **Call hooks unconditionally** — never inside `if/else`, loops, or nested functions. Hooks depend on consistent call order to maintain their state.
3. **Hooks are per-instance** — each component instance has its own independent hook storage.

---

## Available Hooks

| Hook | Category | Description |
|------|----------|-------------|
| [`State`](./state.md) | Reactive State | Declares a reactive value that triggers re-renders. |
| [`Effect`](./effect.md) | Side Effects | Runs a callback after mount, and optionally after updates. |
| [`Memo`](./memo.md) | Derived State | Memoizes a computed value, updating only when dependencies change. |
| [`Ref`](./ref.md) | Mutable Reference | A mutable container that persists across renders without triggering updates. |
| [`Toggle`](./toggle.md) | Reactive State | A boolean `State` with a built-in toggle function. |
| [`Debounce`](./debounce.md) | Reactive State | A `State` whose setter is debounced. |
| [`Event`](./event.md) | Side Effects | Attaches a global event listener that auto-cleans on destroy. |
| [`Fetch`](./fetch.md) | Async Data | Fetches data on mount and exposes reactive `data`, `loading`, `error`. |
| [`FetchPolling`](./fetch-polling.md) | Async Data | Like `Fetch`, but repeats at a configurable interval. |
| [`LocalStorage`](./local-storage.md) | Persistent State | A `State` synced to `window.localStorage`. |
| [`SessionStorage`](./session-storage.md) | Persistent State | A `State` synced to `window.sessionStorage`. |
| [`Provide`](./context.md) | Context | Provides a value to all descendant components. |
| [`Inject`](./context.md) | Context | Injects a value provided by an ancestor component. |
