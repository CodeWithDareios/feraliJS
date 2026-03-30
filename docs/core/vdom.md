# Virtual DOM

**Sources:** `lib/core/vdom/`, `lib/core/node/`

FeraliJs uses a **Virtual DOM (VDOM)** to efficiently update the browser DOM. Rather than re-creating the entire DOM on every state change, Ferali computes the minimal set of changes needed.

---

## VNode

**Source:** `lib/core/node/vnode.js`

A `VNode` (Virtual DOM Node) is a plain JavaScript object that describes a DOM node.

```ts
class VNode {
  tag:      string | symbol;   // HTML tag or identity symbol (TEXT, FRAGMENT, COMPONENT)
  props:    Object | null;     // HTML attributes and event listeners
  children: VNode[] | string;  // Child VNodes, or a string for text nodes
  ell:      HTMLElement | Text | null;  // The real DOM element (set during build)
}
```

VNodes are created by the `h()` function and are produced by the compiled blueprint function on every render.

---

## Identity Symbols

**Source:** `lib/core/node/identity.js`

Special symbol constants used to mark VNode types:

| Symbol | Description |
|--------|-------------|
| `TEXT` | Marks a VNode that represents a plain text node. |
| `FRAGMENT` | Reserved for fragment nodes (not yet used). |
| `COMPONENT` | Marks component metadata objects. |

---

## The `h()` Hyperscript Function

**Source:** `lib/core/node/h.js`

`h()` is the core VNode factory. It is called by the compiled template blueprint to produce the VNode tree.

```ts
function h(
  tag:      string | symbol,
  props:    Object | null,
  children: any[] | null
): VNode
```

The `h()` function performs several normalizations:

1. **Text nodes:** If `tag === TEXT`, it creates a text VNode directly from the `children` string.
2. **CSS Scoping:** If the current component uses `localized: true`, `h()` automatically adds the `ferali-cid` attribute to every element it creates.
3. **Child flattening:** Deeply nested arrays of children are flattened using `Array.flat(Infinity)`.
4. **Text merging:** Consecutive string and number children are concatenated into a single text node (joined with a space).

---

## VDOM Build — `BUILD_DOM(blueprint, props)`

**Source:** `lib/core/vdom/fullBuild.js`

Executes a blueprint function and builds the corresponding real DOM tree for the first time.

```ts
async function BUILD_DOM(blueprint: Function, props?: Object): Promise<VNode>
```

1. Calls `blueprint(props)` to get the root VNode.
2. Tags the root VNode with the component's `instanceID` using the `ferali-id` attribute.
3. Recursively calls `buildNode(vnode)` on every node in the tree.

### `buildNode(vnode)` — Internal

Recursively converts a single VNode into a real DOM element:

- **Text VNode:** Creates a `Text` node via `document.createTextNode()`.
- **Component VNode:** Calls `component.build()` (recursive component initialization).
- **Element VNode:**
  1. Creates the element via `document.createElement(tag)`.
  2. Iterates over `props`: event handlers (keys starting with `on`) are added via `addEventListener`; all others are set via `setAttribute`.
  3. Recursively builds and appends all children.

---

## VDOM Update — `UPDATE_DOM(oldNode, newNode, parentDOM)`

**Source:** `lib/core/vdom/update.js`

The reconciliation engine. Diffs an old VNode against a new VNode and makes the minimal set of real DOM mutations.

```ts
async function UPDATE_DOM(
  oldNode:   VNode | null,
  newNode:   VNode | null,
  parentDOM: HTMLElement
): Promise<void>
```

### Diffing Algorithm

The algorithm handles the following cases in priority order:

| Case | Action |
|------|--------|
| `oldNode === null` | **Insertion** — Build `newNode` and append it to `parentDOM`. |
| `newNode === null` | **Removal** — Remove `oldNode`'s DOM element from `parentDOM` and call `DESTROY_DOM(oldNode)`. |
| Both are components, same config | **Component update** — Call `propDiff()` to update props if needed. Reuse existing instance. |
| Both are components, different config | **Component replacement** — Build new component, replace old DOM node, destroy old component. |
| Both are text nodes | **Text update** — If text changed, update `textContent` in place. |
| Tags differ | **Full replacement** — Build new node, replace old DOM node, destroy old subtree. |
| Same tag | **In-place patch** — Patch props, then recursively diff children using keyed diffing. |

### Keyed Children Diffing

When reconciling children arrays, the engine uses the `key` prop (or positional index as a fallback) to build an `oldKeyMap`. This allows it to:

- Re-order nodes efficiently without destroying and rebuilding components.
- Remove nodes from the old tree that have no corresponding entry in the new tree.

---

## VDOM Destroy — `DESTROY_DOM(vnode)`

**Source:** `lib/core/vdom/destroy.js`

Recursively tears down a VNode subtree.

```ts
async function DESTROY_DOM(dom: VNode): Promise<void>
```

For each node in the tree:

- **Component VNode:** Delegates to `component.destroy()`, which handles its own lifecycle and hook cleanup.  
- **Text VNode:** Nullifies the `ell` reference.  
- **Element VNode:** Removes all event listeners, removes all attributes, recursively destroys all children, and removes the DOM element.

---

## Prop Diffing — `propDiff(Component, newProps)`

**Source:** `lib/core/vdom/propDiff.js`

A utility used during reconciliation to check if a component's props have changed. If the new props differ (deep comparison), it calls `Component.useProps(newProps)` and triggers `Component.update()`.

```ts
async function propDiff(Component: Component, newProps: Object): Promise<void>
```
