# `useTemplate(templateString)`

**Source:** `lib/core/component/useTemplate.js`

`useTemplate` is the primary way to define a component's UI in FeraliJs. It accepts an HTML template string, compiles it into an efficient blueprint function, and returns that blueprint to the component's rendering engine.

---

## Signature

```ts
function useTemplate(templateString: string): BlueprintFunction
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `templateString` | `string` | A Ferali HTML template string. |

### Returns

A **blueprint function** — a compiled, executable representation of the template that the VDOM engine calls on every render.

---

## When to Call `useTemplate`

`useTemplate` must be called inside a component's `render()` function, and its return value must be the `render()` function's return value.

```js
const MyComponent = defineComponent({
  render() {
    const [name, setName] = State('World');

    // useTemplate is called here, inside render()
    return useTemplate(`<h1>Hello, {{ name }}!</h1>`);
  }
});
```

> **Caveats:** The Dev Server automatically injects The second argument into `useTemplate()`. You should never provide a second argument in your source code — the tooling manages this for you.

---

## Template Syntax

### 1. Text Interpolation: `{{ expression }}`

Renders any JavaScript expression as a text node.

```html
<p>Hello, {{ name }}!</p>
<p>2 + 2 = {{ 2 + 2 }}</p>
<p>Status: {{ isLoggedIn ? 'Yes' : 'No' }}</p>
```

Interpolations support any valid JavaScript expression, including property access on state proxies:

```html
<p>First name: {{ user.firstName }}</p>
```

---

### 2. Event Binding: `#eventName="{{ handler }}"`

Binds a DOM event listener to a function defined in the component.

```html
<button #click="{{ handleClick }}">Click me</button>
<input #input="{{ handleInput }}">
<form #submit="{{ handleSubmit }}">
```

The `#` prefix is the Ferali event directive. The event name directly follows (e.g., `#click`, `#keydown`). The value must be the reference to a function — **not** a function call.

```js
// Correct
const handleClick = () => setCount(count.__raw + 1);
return useTemplate(`<button #click="{{ handleClick }}">Click</button>`);

// Wrong — calling the function instead of referencing it
return useTemplate(`<button #click="{{ handleClick() }}">Click</button>`);
```

---

### 3. Child Components: `@ComponentName(props)`

Embeds another Ferali component as a child.

```html
@Button({})
@UserCard({ name: "Alice", age: 30 })
@Icon({ name: "star", color: "gold" })
```

The props argument must be a valid JavaScript object literal. You can use interpolations inside props to pass reactive values:

```html
@UserCard({ name: "{{ user.name }}", active: {{ isActive }} })
```

The component name must be in scope in the render function context.

---

### 4. JavaScript Blocks: `<? expression ?>`

Embeds any JavaScript expression directly in the template. The result is rendered into the DOM.

```html
<!-- Conditional rendering -->
<? isLoggedIn ? <{ <div>Welcome back!</div> }> : <{ <div>Please log in.</div> }> ?>

<!-- Iterating a list -->
<ul>
  <? items.map(item => <{ <li>{{ item.name }}</li> }>) ?>
</ul>
```

> **⚠️ Limitation:** JS blocks are compiled into an IIFE but operate in non-strict mode. Variables declared with `let` or `const` inside one `<? ?>` block are not visible in sibling blocks.

---

### 5. HTML-in-JS Blocks: `<{ <html/> }>`

A special syntax used exclusively *inside* `<? ?>` blocks. Allows embedding HTML markup as the return value of a JavaScript expression.

```html
<? condition ? <{ <strong>Yes</strong> }> : <{ <em>No</em> }> ?>
```

This is how list rendering works in Ferali:

```html
<ul>
  <? todos.map(todo =>
    <{ <li class="todo">{{ todo.text }}</li> }>
  ) ?>
</ul>
```

---

## Static vs. Dynamic Attributes

| Syntax | Result |
|--------|--------|
| `class="my-class"` | Static string attribute |
| `id="main"` | Static string attribute |
| `#click="{{ handler }}"` | Dynamic event listener |

All attributes without the `#` prefix are treated as static strings. Dynamic data binding for non-event attributes is done via template interpolation in the attribute value:

```html
<div class="{{ dynamicClass }}">...</div>
```

---

## Void Elements

The compiler correctly handles HTML void elements — they do not need a closing tag and cannot have children:

`area`, `base`, `br`, `col`, `embed`, `hr`, `img`, `input`, `link`, `meta`, `param`, `source`, `track`, `wbr`

```html
<img src="{{ imageUrl }}" alt="Profile">
<input #input="{{ handleInput }}" type="text">
<br>
```

---

## Keyed Lists

For efficient list re-rendering, use a `key` attribute on repeated elements. The VDOM reconciler uses keys to match old and new nodes, minimizing DOM mutations.

```html
<ul>
  <? items.map(item => <{ <li key="{{ item.id }}">{{ item.name }}</li> }>) ?>
</ul>
```

---

## External Template Files

Instead of an inline template string, you can pass a relative path to an `.html` file:

```js
return useTemplate('./templates/my-component.html');
```

The Dev Server reads the file from disk, injects its content, and applies all the same transformations. This is useful for separating large template markup into dedicated files.
