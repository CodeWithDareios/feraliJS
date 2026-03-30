# `Memo`

**Source:** `lib/core/hooks/memo.js`

`Memo` memoizes a derived/computed value, recalculating it only when its dependencies change. It is built on top of `State` and `Effect`.

---

## Signature

```ts
function Memo<T>(
  computeFn:    () => T,
  dependencies: any[]
): Proxy<T>
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `computeFn` | `() => T` | A pure function that computes the derived value. |
| `dependencies` | `any[]` | State proxies to watch for changes. When any changes, `computeFn` is re-called. |

### Returns

A reactive **State Proxy** containing the latest computed value.

---

## Example

```js
import { State, Memo } from 'ferali/hooks';

const [items, setItems] = State([1, 2, 3, 4, 5]);
const [filter, setFilter] = State('');

const filtered = Memo(
  () => items.__raw.filter(n => String(n).includes(filter.__raw)),
  [items, filter]
);

return useTemplate(`
  <div>
    <input #input="{{ e => setFilter(e.target.value) }}" />
    <p>Filtered count: {{ filtered }}</p>
  </div>
`);
```

---

## How It Works

`Memo` is a thin convenience layer:

```js
// Internally equivalent to:
const [computedValue, setComputedValue] = State(computeFn());

Effect(() => {
  setComputedValue(computeFn());
}, dependencies);

return computedValue;
```

The computed value is stored as a `State` slot, so it is reactive — templates that use it will automatically re-render when it changes.
