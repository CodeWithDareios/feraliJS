# Core — Overview

The `lib/core` module is the heart of FeraliJs. It contains everything needed to define and render components: the template compiler, the Virtual DOM engine, and the hook system.

## Modules

| Module | File | Description |
|--------|------|-------------|
| **App bootstrap** | `app.js` | `createApp()` — mounts the root component. |
| **Component** | `component/component.js` | The `Component` class — manages lifecycle, props, CSS, and state storage. |
| **defineComponent** | `component/defineComponent.js` | The primary public factory for creating components. |
| **useComponent** | `component/useComponent.js` | Creates an embeddable child component descriptor. |
| **useTemplate** | `component/useTemplate.js` | Compiles an HTML template string into a reactive blueprint. |
| **Compiler** | `compiler/compiler.js` | Entry point for the template compiler pipeline. |
| **Hyperscript** | `node/h.js` | The `h()` factory that produces VNode objects. |
| **VNode** | `node/vnode.js` | The `VNode` class definition. |
| **VDOM Build** | `vdom/fullBuild.js` | Transforms a VNode tree into real DOM nodes. |
| **VDOM Update** | `vdom/update.js` | Diffs two VNode trees and patches the real DOM (reconciliation). |
| **VDOM Destroy** | `vdom/destroy.js` | Recursively removes a VNode subtree from the DOM. |
| **Hooks** | `hooks/` | All reactive hooks: `State`, `Effect`, `Memo`, `Ref`, etc. |
| **Utils** | `utils/` | Shared utility functions used throughout the framework. |

## Exported Public API (`core.js`)

```js
// From app.js
export { createApp }

// From component/useComponent.js
export { useComponent }

// From component/useTemplate.js
export { useTemplate }

// From component/defineComponent.js
export { defineComponent }
```

The hooks are exported separately from `ferali/hooks`:

```js
// From hooks/hooks.js
export {
  State, Effect, Memo, Ref,
  Toggle, Debounce, Event, Fetch,
  FetchPolling, LocalStorage, SessionStorage,
  Provide, Inject
}
```
