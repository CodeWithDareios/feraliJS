# `LocalStorage` & `SessionStorage`

**Sources:** `lib/core/hooks/localStorage.js`, `lib/core/hooks/sessionStorage.js`

These hooks create reactive state variables that automatically sync their values to the browser's `localStorage` or `sessionStorage`. They are drop-in replacements for `State` in cases where you want the value to persist across page reloads (`LocalStorage`) or within the current browser tab session (`SessionStorage`).

---

## `LocalStorage`

```ts
function LocalStorage(
  key:          string,
  initialValue: any
): [Proxy<any>, (newValue: any) => void]
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | The key used to store the value in `window.localStorage`. |
| `initialValue` | `any` | The fallback value if no value exists for this key in storage. |

### Behavior

1. On first call: reads from `localStorage`. If the key doesn't exist, stores `initialValue` and uses it.
2. Parses stored strings as JSON (`JSON.parse`). Keeps as a string if parsing fails.
3. The returned setter writes to `localStorage` **and** triggers a component re-render.

---

## `SessionStorage`

Identical API to `LocalStorage`, but uses `window.sessionStorage`. Values are cleared when the browser tab is closed.

```ts
function SessionStorage(
  key:          string,
  initialValue: any
): [Proxy<any>, (newValue: any) => void]
```

---

## Examples

### Persisting a Theme Preference

```js
import { LocalStorage } from 'ferali/hooks';

const [theme, setTheme] = LocalStorage('ferali-theme', 'light');

const toggleTheme = () => setTheme(theme.__raw === 'light' ? 'dark' : 'light');

return useTemplate(`
  <body class="{{ theme }}">
    <button #click="toggleTheme">Toggle Theme</button>
  </body>
`);
```

### Persisting Form Data in a Session

```js
import { SessionStorage } from 'ferali/hooks';

const [formData, setFormData] = SessionStorage('checkout-form', { name: '', email: '' });

const handleChange = (field) => (e) => {
  setFormData({ ...formData.__raw, [field]: e.target.value });
};
```

---

## Data Serialization

Values are serialized with `JSON.stringify` before writing (unless the value is already a string). They are deserialized with `JSON.parse` when reading. Primitive values like numbers, booleans, and arrays are supported.

---

## Comparison

| Hook | Persistence | Cleared When |
|------|-------------|--------------|
| `State` | In-memory only | Component unmounts |
| `LocalStorage` | Persistent on disk | Manually cleared or storage cleared |
| `SessionStorage` | Per browser tab | Tab is closed |
