# `Debounce`

**Source:** `lib/core/hooks/debounce.js`

`Debounce` creates a reactive state whose setter is **debounced** — the underlying value only updates after the caller has stopped invoking the setter for a specified quiet period. This is ideal for search inputs, resize handlers, or any scenario where you want to delay processing until the user has paused.

---

## Signature

```ts
function Debounce<T>(
  initialValue: T,
  delayMs?:     number
): [Proxy<T>, (newValue: T) => void]
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `initialValue` | `T` | *(required)* | The initial state value. |
| `delayMs` | `number` | `300` | The debounce delay in milliseconds. |

### Returns

A tuple of:
1. A reactive **State Proxy** representing the debounced value.
2. A **debounced setter** — calling it resets the internal timer; the value only updates after `delayMs` ms of silence.

---

## Lifecycle Integration

The `Debounce` hook automatically registers an `onDestroy` callback to cancel any pending timeout when the component is destroyed, preventing stale state updates on unmounted components.

---

## Example — Search Input

```js
import { Debounce, Effect } from 'ferali/hooks';

const [query, setQuery] = Debounce('', 400);

Effect(() => {
  if (query.__raw) {
    fetch(`/api/search?q=${query.__raw}`)
      .then(r => r.json())
      .then(results => setResults(results));
  }
}, [query]);

return useTemplate(`
  <div>
    <input
      #input="{{ e => setQuery(e.target.value) }}"
      placeholder="Search..."
    />
    <p>Searching for: {{ query }}</p>
  </div>
`);
```

---

## How It Works

Internally, `Debounce` is equivalent to:

```js
const [value, setValue] = State(initialValue);
let timeoutId = null;

const setDebounced = (newValue) => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => setValue(newValue), delayMs);
};

// Cleanup on destroy
comp.addLifeCycleHook('onDestroy', () => clearTimeout(timeoutId));

return [value, setDebounced];
```
