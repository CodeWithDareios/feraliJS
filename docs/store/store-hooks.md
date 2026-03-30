# Store Hooks Reference

**Source:** `lib/store/hooks/`

These are the hook implementations that power the `register*` methods on a `Store` instance. Each one registers a named slot into the store's internal registry and exposes a specific API via `store.subscribe()`.

---

## `registerState(key, initialValue)`

Registers a simple reactive value.

**API returned by `store.subscribe(key)`:**

| Property | Type | Description |
|----------|------|-------------|
| `value` | `Proxy` | Reactive proxy for the current value. |
| `set` | `(newValue) => void` | Setter — updates the value and notifies subscribers. |

```js
store.registerState('username', '');
// ...
const { value: username, set: setUsername } = store.subscribe('username');
```

---

## `registerToggle(key, initialValue?)`

Registers a boolean toggle.

**API returned by `store.subscribe(key)`:**

| Property | Type | Description |
|----------|------|-------------|
| `value` | `Proxy<boolean>` | Reactive boolean proxy. |
| `toggle` | `() => void` | Flips the boolean and notifies subscribers. |

```js
store.registerToggle('menuOpen', false);
// ...
const { value: menuOpen, toggle: toggleMenu } = store.subscribe('menuOpen');
```

---

## `registerLocalStorage(key, storageKey, initialValue)`

Registers a reactive value backed by `window.localStorage`.

**API returned by `store.subscribe(key)`:**

| Property | Type | Description |
|----------|------|-------------|
| `value` | `Proxy` | Reactive proxy for the stored value. |
| `set` | `(newValue) => void` | Writes to localStorage **and** notifies subscribers. |

```js
store.registerLocalStorage('theme', 'app-theme', 'light');
// ...
const { value: theme, set: setTheme } = store.subscribe('theme');
```

---

## `registerSessionStorage(key, storageKey, initialValue)`

Identical to `registerLocalStorage` but uses `window.sessionStorage`.

```js
store.registerSessionStorage('tempCart', 'session-cart', []);
```

---

## `registerDebounce(key, initialValue, delayMs?)`

Registers a value whose setter is debounced — the value only actually updates after `delayMs` ms of silence.

**API returned by `store.subscribe(key)`:**

| Property | Type | Description |
|----------|------|-------------|
| `value` | `Proxy` | Reactive proxy for the current (debounced) value. |
| `set` | `(newValue) => void` | Debounced setter. |

```js
store.registerDebounce('globalSearch', '', 500);
// ...
const { value: search, set: setSearch } = store.subscribe('globalSearch');
```

---

## `registerFetchPolling(key, url, intervalMs?, options?)`

Registers a polling fetch resource. Internally creates three sub-keys in the registry: `${key}_data`, `${key}_loading`, `${key}_error`.

**API returned by `store.subscribe(key)`:**

| Property | Type | Description |
|----------|------|-------------|
| `data` | `Proxy` | Reactive proxy for the parsed JSON response. |
| `loading` | `Proxy<boolean>` | Reactive proxy for the loading state. |
| `error` | `Proxy<Error\|null>` | Reactive proxy for the error (if any). |

```js
store.registerFetchPolling('weather', '/api/weather', 60000);
// ...
const { data: weather, loading, error } = store.subscribe('weather');
```

The subscriber automatically connects to all three internal sub-keys, so a change to `data`, `loading`, or `error` will trigger a re-render of the subscribing component.

---

## The Global Proxy Pattern

All store values are returned as **JavaScript Proxy** objects, matching the same interface as component-level `State` proxies:

- `value.__raw` — access the raw primitive value.
- `value.valueOf()` / `value.toString()` — used automatically by template interpolation.
- `value.propName` — forward property access to the raw value.

This means store values and component-local state values behave identically in templates and event handlers.
