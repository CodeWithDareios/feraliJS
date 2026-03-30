# `Event`

**Source:** `lib/core/hooks/event.js`

`Event` attaches a global DOM event listener that is automatically removed when the component is destroyed. It is the clean alternative to manually managing `addEventListener` / `removeEventListener` pairs.

---

## Signature

```ts
function Event(
  eventName: string,
  listener:  EventListener,
  target?:   EventTarget,
  options?:  boolean | AddEventListenerOptions
): void
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `eventName` | `string` | *(required)* | The DOM event type (e.g., `'keydown'`, `'scroll'`, `'resize'`). |
| `listener` | `Function` | *(required)* | The event handler callback. |
| `target` | `EventTarget` | `window` | The DOM node or `Window` to attach to. |
| `options` | `boolean \| EventListenerOptions` | `false` | Standard Web API `addEventListener` options (e.g., `{ passive: true }`). |

---

## Lifecycle Timing

| Lifecycle Event | Behavior |
|----------------|----------|
| `onMounted` | The event listener is added via `target.addEventListener(...)`. |
| `onDestroy` | The event listener is removed via `target.removeEventListener(...)`. |

---

## Examples

### Keyboard Shortcut

```js
import { Event } from 'ferali/hooks';

const [menuOpen, toggleMenu] = Toggle(false);

// Close the menu on Escape key
Event('keydown', (e) => {
  if (e.key === 'Escape') {
    toggleMenu();
  }
});
```

### Page Scroll Position

```js
import { State, Event } from 'ferali/hooks';

const [scrollY, setScrollY] = State(0);

Event('scroll', () => {
  setScrollY(window.scrollY);
}, window, { passive: true });
```

### Listening on a Specific Element

```js
const containerRef = Ref(null);

Event('click', (e) => {
  console.log('Clicked inside container');
}, containerRef.current);
```

---

## Why Use `Event` Over Direct `addEventListener`?

While you can call `addEventListener` directly in a `useEffect` callback, the `Event` hook integrates more naturally with Ferali's lifecycle system and removes boilerplate. Both approaches are valid.

| Approach | When to use |
|----------|-------------|
| `Event` hook | Simple, one-shot listener with no dependencies. |
| `Effect` with cleanup | When the listener depends on reactive state, needs cleanup tied to dependencies, or requires dynamic re-attachment. |
