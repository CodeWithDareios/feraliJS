# Store — Overview

**Source:** `lib/store/`

The Ferali Store is an optional **global state management** system. Unlike component-local hooks, store state is shared across all components in the application. Any component that subscribes to a store key is automatically re-rendered when that key's value changes.

---

## Core Design

The store uses an **explicit subscription** model:

1. You define named global "slots" on the store using `register*` methods.
2. Components call `store.subscribe(key)` to read the current value and register themselves as subscribers.
3. When a value changes, all non-destroyed subscribers are updated in a **batched, asynchronous** queue (resolved via `Promise.resolve().then(...)`).

---

## Import

```js
import createStore from 'ferali-store';
```

---

## Modules

| Module | File | Description |
|--------|------|-------------|
| **createStore** | `store.js` | Factory function — creates a `Store` instance. |
| **registerState** | `hooks/state.js` | Registers a simple reactive value. |
| **registerToggle** | `hooks/toggle.js` | Registers a boolean with a toggle function. |
| **registerLocalStorage** | `hooks/storage.js` | Registers a value backed by localStorage. |
| **registerSessionStorage** | `hooks/storage.js` | Registers a value backed by sessionStorage. |
| **registerDebounce** | `hooks/debounce.js` | Registers a debounced reactive value. |
| **registerFetchPolling** | `hooks/fetch.js` | Registers a polling fetch with reactive data/loading/error. |
