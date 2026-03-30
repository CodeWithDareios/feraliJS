# `State`

**Source:** `lib/core/hooks/state.js`

`State` is Ferali's primary reactive primitive. It declares a reactive variable tied to the current component. When the setter is called with a new value, the component automatically re-renders.

---

## Signature

```ts
function State<T>(initialValue: T): [Proxy<T>, (newValue: T) => void]
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `initialValue` | `T` | The initial value for this state slot. Only used on the first render. |

### Returns

A **tuple** of:

1. **State Proxy** — A `Proxy` object that transparently forwards property accesses to the current raw value. Supports `valueOf`, `toString`, and `Symbol.toPrimitive`.
2. **Setter function** — Sets the state to `newValue` and, if the value changed, triggers `component.update()`.

---

## State Proxies

The reactive value returned by `State` is a **JavaScript Proxy**, not the raw value itself. This design allows Ferali's template compiler to access nested properties naturally (e.g., `user.name`) without losing the connection to the live component.

### Accessing the Raw Value

When you need the actual primitive value (e.g., to compute `count + 1`), use the special `__raw` property:

```js
const [count, setCount] = State(0);

// In a handler — reading the raw value:
const increment = () => setCount(count.__raw + 1);

// In a template — the proxy handles toString automatically:
// {{ count }}  →  calls count.toString()  →  returns the current number
```

### The `__raw` Pattern in Toggle

```js
// Toggle uses __raw internally to safely read a boolean:
const toggleFn = () => setValue(!value.__raw);
```

---

## Example

```js
import { defineComponent } from 'ferali';
import { useTemplate }     from 'ferali';
import { State }           from 'ferali/hooks';

const Counter = defineComponent({
  render() {
    const [count, setCount] = State(0);
    const [name,  setName]  = State('World');

    const increment = () => setCount(count.__raw + 1);
    const reset     = () => setCount(0);

    return useTemplate(`
      <div>
        <h1>Hello, {{ name }}!</h1>
        <p>Count: {{ count }}</p>
        <button #click="{{ increment }}">+</button>
        <button #click="{{ reset }}">Reset</button>
      </div>
    `);
  }
});
```

---

## Important Notes

- **Initialization:** The `initialValue` is only used the first time the component renders. On subsequent renders, the hook returns the stored value.
- **Equality check:** The setter only triggers a re-render if `newValue !== currentValue` (strict identity check). Mutating an object in place will **not** trigger a re-render — always pass a new value:
  ```js
  // Wrong — mutates in place, no re-render
  items.__raw.push('new item');
  setItems(items);

  // Correct — creates a new array
  setItems([...items.__raw, 'new item']);
  ```

- **Proxy identity:** The proxy object itself never changes between renders, making it safe to pass to effects as a dependency.
