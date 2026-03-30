# Template Compiler

**Sources:** `lib/core/compiler/`

FeraliJs includes a custom, handwritten HTML template compiler. When you call `useTemplate(templateString)`, this compiler transforms the Ferali template syntax into a raw JavaScript function — the **blueprint** — that the VDOM engine can call on every render.

The compiler is a **one-time operation per template string**. The resulting blueprint is stored and reused for every subsequent render, making re-renders extremely fast.

---

## Compilation Pipeline

```
Template String
      │
      ▼
  [ Scanner ]        lib/core/compiler/scanner.js
  Character-by-character cursor with peek/consume API
      │
      ▼
  [ Parser ]         lib/core/compiler/parser/
  Converts token stream into an Abstract Syntax Tree (AST)
      │
      ▼
  [ Code Generator ] lib/core/compiler/ast/
  Traverses the AST and generates a JavaScript code string
      │
      ▼
  [ Blueprint Fn ]   new Function(...)
  Wrapped into an executable function closure
```

---

## 1. Scanner

**Source:** `lib/core/compiler/scanner.js`

A simple stateful cursor over the template string. Exposes:

| Method | Description |
|--------|-------------|
| `eof()` | Returns `true` when the cursor has reached the end of the input. |
| `peek(len?)` | Returns the next `len` characters without consuming them. |
| `consume(len?)` | Returns the next `len` characters and advances the cursor. |
| `consumeUntil(str)` | Advances the cursor until the target string is found, returning everything consumed. |

---

## 2. Parser

**Source:** `lib/core/compiler/parser/`

The parser reads from the scanner and produces an **AST** — an array of node objects. The root parse function is `parseNodes(scanner, stopTokens)`, which dispatches to a dedicated sub-parser based on the current token.

| Token | Parser called | AST Node type |
|-------|---------------|---------------|
| `<?` | `parseJsBlock` | `js_block` |
| `{{` | `parseInterpolation` | `interpolation` |
| `@` | `parseComponent` | `component` |
| `<` (not `</` or `<{`) | `parseElement` | `element` |
| *(anything else)* | `parseText` | `text` |

### AST Node Shapes

```ts
// Plain text
{ type: 'text', content: string }

// {{ expression }}
{ type: 'interpolation', path: string }

// <tagname attr="val">...</tagname>
{ type: 'element', tag: string, attributes: Attribute[], children: AstNode[] }

// @ComponentName(props)
{ type: 'component', name: string, props: string }

// <? JS code ?>
{ type: 'js_block', chunks: Chunk[] }

// <{ HTML nodes }> (inside a js_block)
{ type: 'html_in_js', nodes: AstNode[] }
```

### Attribute Parsing

Attributes are parsed using the regex `/(#?[a-zA-Z0-9_\-]+)="([^"]*)"/g`.

- Regular attributes: `class="foo"` → `{ name: 'class', value: 'foo' }`
- Event attributes: `#click="{{ handler }}"` → `{ name: '#click', value: '{{ handler }}' }`

---

## 3. Code Generator (AST → JS String)

**Source:** `lib/core/compiler/ast/`

The code generator traverses the AST and produces a JavaScript code string that, when executed, returns a VNode tree.

### `generateRoot(nodes, isInsideJsBlock?)`

The top-level generator. Filters whitespace-only text nodes and then:
- **Single node:** Returns its generated code directly.
- **Multiple nodes:** Wraps them in `__h('div', null, [...])` (implicit root element).

### `generateNode(node, isInsideJsBlock?)`

Dispatches to the correct generation logic by node type:

| Node Type | Generated Output |
|-----------|-----------------|
| `element` | `__h('div', { ...attrs }, [ ...children ])` |
| `text` | `` `text content` `` (a template literal) |
| `interpolation` | `` `${expression}` `` |
| `component` | `__useComponent(ComponentName, props)` |
| `js_block` | `(() => { return JS_CODE }).call(contextObject)` (IIFE) |

### `generateAttributes(attrs, isInsideJsBlock?)`

Converts an `Attribute[]` into a JavaScript object literal string for use in `__h()` calls:

- **Event attributes** (`#click`): `"onclick": handlerReference`
- **Static attributes**: `"class": "my-class"`

---

## 4. Blueprint Function Wrapping

**Source:** `lib/core/compiler/compiler.js`

After code generation, the compiler wraps the generated code string into an executable function:

```js
// Generated internally — never write this by hand!
function bluePrint(contextObject, __h, __useComponent) {
  const { count, setCount, myHandler } = contextObject;
  return __h('div', { "onclick": myHandler }, [
    `${count}`
  ]);
}
```

The blueprint function:
- Receives `contextObject` (the `this` of the render function, containing all state/hooks).
- Receives `__h` and `__useComponent` to avoid collisions with destructured user variables.
- Destructures all known context keys at the top for efficient access.

The blueprint is wrapped in a `new Function(...)` call, making it a fully compiled, executable function that runs at near-native speed on every re-render.

---

## Important Compiler Behaviors

### JS Blocks Run as IIFEs

Every `<? ?>` block is compiled into an Immediately Invoked Function Expression (IIFE) with `this` bound to `contextObject`:

```js
// Template: <? items.map(item => <{ <li>{{ item }}</li> }>) ?>
// Generated:
(() => {
  return items.map(item => __h('li', null, [`${item}`]))
}).call(contextObject)
```

### `<? ?>` Variables Are Scoped

Variables declared with `let` or `const` inside a `<? ?>` block are local to that block's IIFE and are **not** accessible in sibling blocks. Use the context object to share data across blocks.

### Multi-root Templates

If your template has more than one root element (ignoring whitespace), the compiler automatically wraps them in a `<div>`. Always prefer a single root element.
