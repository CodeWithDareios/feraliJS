# `Ref`

**Source:** `lib/core/hooks/ref.js`

`Ref` returns a mutable container object `{ current: value }` that persists across renders but does **not** trigger a re-render when mutated. It is useful for storing DOM element references, timer IDs, and other values that need to persist without causing UI updates.

---

## Signature

```ts
function Ref<T>(initialValue?: T): { current: T }
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `initialValue` | `T` | `null` | The initial value for `ref.current`. |

### Returns

A plain `{ current: T }` object that persists between renders.

---

## Common Use Cases

### Accessing a DOM Element

Use `Ref` to hold a reference to a real DOM element for direct manipulation (e.g., focusing an input, reading scroll position).

```js
import { defineComponent } from 'ferali';
import { useTemplate }     from 'ferali';
import { Ref, Effect }     from 'ferali/hooks';

const AutoFocusInput = defineComponent({
  render() {
    const inputRef = Ref(null);

    Effect(() => {
      // After mount, inputRef.current will be set by the template engine
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);

    return useTemplate(`<input type="text">`);
  }
});
```

### Storing a Timer ID

```js
const timerId = Ref(null);

Effect(() => {
  timerId.current = setInterval(() => doSomething(), 1000);
  return () => clearInterval(timerId.current);
}, []);
```

### Tracking Previous Value

```js
const [count, setCount] = State(0);
const prevCount = Ref(0);

Effect(() => {
  prevCount.current = count.__raw;
}); // No deps — runs after every render
```

---

## Important Notes

- Mutating `ref.current` does **not** trigger a re-render.
- `Ref` stores data in the same `STORAGE.REF` map as other hooks, so its value persists for the lifetime of the component.
- The ref object identity stays the same across renders — only `.current` changes.
