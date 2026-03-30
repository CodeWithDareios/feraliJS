# Components

**Sources:** `lib/core/component/`

Components are the fundamental building blocks of every FeraliJs application. Every piece of UI — from a full page to a small button — is a Ferali component.

---

## `defineComponent(config)`

The primary public API for creating a component. Returns a new `Component` instance.

### Signature

```ts
function defineComponent(config: ComponentConfig): Component
```

### `ComponentConfig` Object

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `render` | `() => Function` | ✅ | A function that returns a **blueprint** (typically via `useTemplate()`). Called once during the first build. |
| `style` | `string \| { path: string, localized?: boolean }` | ❌ | Path to an external CSS file to automatically inject and remove with the component. |
| `onInit` | `() => void` | ❌ | Lifecycle callback — runs before the first render. |
| `onMounted` | `() => void` | ❌ | Lifecycle callback — runs after the component is added to the real DOM. |
| `onUpdate` | `() => void` | ❌ | Lifecycle callback — runs after every reactive update. |
| `onDestroy` | `() => void` | ❌ | Lifecycle callback — runs before the component is torn down. |

### Example

```js
import { defineComponent } from 'ferali';
import { useTemplate }     from 'ferali';
import { State }           from 'ferali/hooks';

const Counter = defineComponent({
  style: 'src/css/counter.css',

  onInit()    { console.log('onInit — before first render'); },
  onMounted() { console.log('onMounted — in the DOM now'); },
  onUpdate()  { console.log('onUpdate — re-rendered'); },
  onDestroy() { console.log('onDestroy — being removed'); },

  render() {
    const [count, setCount] = State(0);
    const increment = () => setCount(count.__raw + 1);

    return useTemplate(`
      <div class="counter">
        <span>{{ count }}</span>
        <button #click="{{ increment }}">+</button>
      </div>
    `);
  }
});

export default Counter;
```

---

## The `Component` Class

`defineComponent()` creates an instance of the internal `Component` class (`lib/core/component/component.js`). You do not need to instantiate it directly, but understanding its methods is useful for advanced use cases.

### Lifecycle Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `build()` | `Promise<void>` | Performs the initial render. Injects CSS, calls `render()`, builds the VNode tree, and fires `onMounted`. No-op if already built. |
| `update()` | `Promise<void>` | Re-runs the blueprint, diffs the new VNode tree against the old one, patches the DOM, and fires `onUpdate`. |
| `destroy()` | `Promise<void>` | Fires `onDestroy`, removes injected CSS (if this was the last user of it), tears down the VDOM tree, and clears all hook storage. |

### Data Access Methods

| Method | Description |
|--------|-------------|
| `useProps(props)` | Sets the current props for this component. |
| `getProps()` | Returns the current props object. |
| `getCurrentDOM()` | Returns the current live VNode tree root, or `null` if not built. |
| `setNewDOM(vnode)` | Replaces the stored VNode reference. Used internally after build/update. |
| `INFO()` | Returns frozen metadata: `{ __isComponent, __identity, __componentID }`. |
| `getConfig()` | Returns the original config object passed to `defineComponent`. |

---

## Component Lifecycle

```
defineComponent(config)
       │
       ▼
   [ build() ]   ←── Called by createApp().mount() or router outlet
       │
   onInit()       ← Runs first, before any rendering
       │
   render()       ← Executes the render function → creates Blueprint
       │
   BUILD_DOM()    ← Blueprint is executed → VNode tree built → real DOM created
       │
   onMounted()    ← Component is mounted in the real DOM
       │
       │ ←── State update triggered (e.g., setCount())
       │
   [ update() ]
       │
   Blueprint re-runs → new VNode tree
       │
   UPDATE_DOM()   ← Diffing engine patches the real DOM
       │
   onUpdate()
       │
       │ ←── Component removed from tree
       │
   [ destroy() ]
       │
   onDestroy()
       │
   CSS removed, hook storage cleaned up
```

---

## CSS Management

Ferali automatically manages component stylesheet injection and removal via a **reference-counted stylesheet registry** (`STYLESHEET_REGISTRY`).

### Global Stylesheet

```js
defineComponent({
  style: 'src/css/button.css',  // or: style: { path: 'src/css/button.css' }
  render() { ... }
});
```

- The stylesheet is injected once even if multiple instances of the same component exist simultaneously.
- The stylesheet is removed only when the **last** instance is destroyed.

### Localized (Scoped) Stylesheet

```js
defineComponent({
  style: { path: 'src/css/button.css', localized: true },
  render() { ... }
});
```

When `localized: true`:
- The Dev Server rewrites every CSS rule to be scoped using the attribute `[ferali-cid="<componentID>"]`.
- All elements rendered by the component automatically receive the `ferali-cid` attribute via the `h()` function.
- Rules can use `:host` to select the component's root element.

---

## Props

Components can receive data from parent components or the router via **props**.

### Passing Props (in a template)

```html
@Button({ label: "Click me", color: "blue" })
```

### Passing Props (in a JS block)

```html
<? items.map(item => <{ @Card({ title: item.title }) }>) ?>
```

### Receiving Props (in `render()`)

```js
const MyCard = defineComponent({
  render() {
    const props = this.getProps();  // { title: '...' }

    return useTemplate(`
      <div class="card">
        <h2>{{ props.title }}</h2>
      </div>
    `);
  }
});
```

---

## `useComponent(component, props)`

**Source:** `lib/core/component/useComponent.js`

Creates a VNode-compatible component descriptor for embedding a Ferali component inside another component's virtual DOM tree. This is called internally by the template compiler for every `@ComponentName({})` expression. You typically do not need to call it directly.

```ts
function useComponent(
  component: Component,
  props?: Object
): { component: Component, props: Object, isComponent: true, changeProps: Function }
```

Under the hood, `useComponent()` creates a **fresh instance** of the component (via `defineComponent(component.getConfig())`) so that each embedding gets its own isolated state and lifecycle.
