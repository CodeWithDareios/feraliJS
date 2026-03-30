# `Effect`

**Source:** `lib/core/hooks/effect.js`

`Effect` registers a side effect — a callback that runs after a component mounts and, optionally, after every update where its dependencies have changed.

---

## Signature

```ts
function Effect(
  callback:     () => (void | (() => void)),
  dependencies?: any[]
): void
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | `Function` | The side effect to run. May optionally return a **cleanup function**. |
| `dependencies` | `any[]` | *(Optional)* An array of reactive State proxies. If omitted, the effect runs after every update. |

---

## Execution Timing

| Scenario | Behavior |
|----------|----------|
| No `dependencies` provided | Runs after `onMounted` and after **every** `onUpdate`. |
| Empty `dependencies` array `[]` | Runs only once, after `onMounted`. |
| With dependencies | Runs after `onMounted`, and after `onUpdate` only if any dependency value changed. |

---

## Cleanup Function

If the callback returns a function, that function is called as a **cleanup** before the effect runs again, and also on `onDestroy`.

This is useful for:
- Clearing intervals or timeouts.
- Removing event listeners.
- Cancelling network requests.

```js
Effect(() => {
  const timer = setInterval(() => {
    // ...
  }, 1000);

  // Cleanup: runs before re-run and on destroy
  return () => clearInterval(timer);
}, []);
```

---

## Dependency Tracking

Dependencies are tracked by their **value**, not by reference. Internally, `Effect` reads each dependency proxy's `__raw` value at the time of the last run and compares it to the current value on each update:

```js
Effect(() => {
  console.log('Count changed to:', count.__raw);
}, [count]);
```

> **Tip:** Always pass the exact State proxy objects that the effect depends on.

---

## Examples

### Run Once on Mount

```js
const [data, setData] = State(null);

Effect(() => {
  fetch('/api/data')
    .then(r => r.json())
    .then(json => setData(json));
}, []);  // Empty deps → runs once
```

### Run When Dependency Changes

```js
const [userId, setUserId] = State(1);
const [profile, setProfile] = State(null);

Effect(() => {
  fetch(`/api/users/${userId.__raw}`)
    .then(r => r.json())
    .then(json => setProfile(json));
}, [userId]);  // Re-runs whenever userId changes
```

### With Cleanup

```js
Effect(() => {
  const handler = () => console.log('Resized!');
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
```

### After Every Update

```js
Effect(() => {
  document.title = `Count: ${count.__raw}`;
  // No deps → runs after every render
});
```
