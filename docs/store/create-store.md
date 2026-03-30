# `createStore()`

**Source:** `lib/store/store.js`

Creates and returns a new `Store` instance. Typically, you create a single store for your entire application and export it as a module singleton.

---

## Signature

```ts
function createStore(): Store
```

---

## Store Instance API

### `store.registerState(key, initialValue)`

Registers a named global reactive value. Returns `void`.

```js
store.registerState('count', 0);
```

### `store.registerToggle(key, initialValue?)`

Registers a named global boolean with a toggle function. Returns `void`.

```js
store.registerToggle('sidebarOpen', false);
```

### `store.registerLocalStorage(key, storageKey, initialValue)`

Registers a named global value backed by `localStorage`. Returns `void`.

```js
store.registerLocalStorage('theme', 'app-theme', 'light');
```

| Parameter | Description |
|-----------|-------------|
| `key` | The store key name. |
| `storageKey` | The `localStorage` key string. |
| `initialValue` | Fallback if nothing is stored. |

### `store.registerSessionStorage(key, storageKey, initialValue)`

Same as `registerLocalStorage` but uses `sessionStorage`.

### `store.registerDebounce(key, initialValue, delayMs?)`

Registers a named global value whose setter is debounced.

```js
store.registerDebounce('searchQuery', '', 400);
```

### `store.registerFetchPolling(key, url, intervalMs?, options?)`

Registers a polling fetch slice. Creates three internal sub-keys: `${key}_data`, `${key}_loading`, `${key}_error`. Returns `void`.

```js
store.registerFetchPolling('stockPrice', '/api/stock/FRAL', 3000);
```

### `store.subscribe(key, options?)`

Subscribes the current component to the store key. Returns the key's API object.

```ts
store.subscribe(key: string, options?: { blockUpdate: boolean }): KeyAPI
```

| Option | Default | Description |
|--------|---------|-------------|
| `blockUpdate` | `false` | If `true`, subscribes to read the value but does NOT register the component for re-renders. |

The returned API object exposes `_disableUpdate()` and `_enableUpdate()` methods to dynamically control re-render registration.

---

## Example — Application Store Setup

**`src/store.js` — Define your store:**

```js
import createStore from 'ferali-store';

const store = createStore();

// Register all global state slots
store.registerState('count', 0);
store.registerToggle('darkMode', false);
store.registerLocalStorage('user', 'ferali-user', null);
store.registerFetchPolling('notifications', '/api/notifications', 10000);

export default store;
```

**`src/pages/Counter.js` — Subscribe in a component:**

```js
import { defineComponent } from 'ferali';
import { useTemplate }     from 'ferali';
import store               from '../store.js';

const Counter = defineComponent({
  render() {
    const { value: count, set: setCount } = store.subscribe('count');

    const increment = () => setCount(count.__raw + 1);
    const decrement = () => setCount(count.__raw - 1);

    return useTemplate(`
      <div>
        <button #click="decrement">-</button>
        <span>{{ count }}</span>
        <button #click="increment">+</button>
      </div>
    `);
  }
});
```

**`src/components/Navbar.js` — Subscribe to dark mode toggle:**

```js
const { value: darkMode, toggle: toggleDark } = store.subscribe('darkMode');

return useTemplate(`
  <nav class="{{ darkMode ? 'dark' : 'light' }}">
    <button #click="toggleDark">Toggle Theme</button>
  </nav>
`);
```

**`src/components/Notifications.js` — Subscribe to polled fetch:**

```js
const { data, loading, error } = store.subscribe('notifications');

return useTemplate(`
  <div>
    <? this.loading ? <{ <span>Loading...</span> }> : null ?>
    <? this.data ? <{ <span>{{ data.count }} new notifications</span> }> : null ?>
  </div>
`);
```

---

## Update Batching

When multiple store values change in sequence, the store batches all resulting component updates into a single microtask (using `Promise.resolve().then()`). This means:

- Multiple `set()` calls in one event handler result in a **single** re-render per component.
- Destroyed components are automatically pruned from subscriber sets during the batch.

---

## `blockUpdate` Option

Use `blockUpdate: true` when you need to read a store value without subscribing the component to changes (useful for event handlers that only need the value at the time they run):

```js
// Component won't re-render when 'count' changes
const { value: count, set: setCount } = store.subscribe('count', { blockUpdate: true });
```
