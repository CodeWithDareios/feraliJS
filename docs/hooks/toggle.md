# `Toggle`

**Source:** `lib/core/hooks/toggle.js`

`Toggle` is a streamlined boolean state hook. It is a thin wrapper over `State` that provides a toggle function instead of a raw setter.

---

## Signature

```ts
function Toggle(initialValue?: boolean): [Proxy<boolean>, () => void]
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `initialValue` | `boolean` | `false` | The starting boolean value. |

### Returns

A tuple of:
1. A reactive boolean **State Proxy**.
2. A **toggle function** — calling it flips the boolean between `true` and `false`.

---

## Example

```js
import { Toggle } from 'ferali/hooks';

const [menuOpen, toggleMenu] = Toggle(false);

return useTemplate(`
  <div>
    <button #click="{{ toggleMenu }}">
      <? menuOpen ? <{ <span>Close</span> }> : <{ <span>Open</span> }> ?>
    </button>
    <? menuOpen ? <{
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
      </nav>
    }> : null ?>
  </div>
`);
```

---

## Equivalent to

```js
const [visible, setVisible] = State(false);
const toggle = () => setVisible(!visible.__raw);
```

`Toggle` uses `value.__raw` internally to safely bypass the Proxy and read the raw boolean.

---

## When to Use Toggle vs State

| Use case | Recommended hook |
|----------|-----------------|
| A simple on/off, show/hide, open/close | `Toggle` |
| A value that changes to a specific new value each time | `State` |
