# FeraliJs User Manual

A practical guide to building applications with FeraliJs — from scaffolding your first project to structuring a complete multi-page application.

---

## Table of Contents

1. [Your First App](#your-first-app)
2. [Components — The Building Block](#components--the-building-block)
3. [Template Syntax In Depth](#template-syntax-in-depth)
4. [Working with State](#working-with-state)
5. [Side Effects & Lifecycle](#side-effects--lifecycle)
6. [Derived & Computed State](#derived--computed-state)
7. [Handling Forms](#handling-forms)
8. [Rendering Lists](#rendering-lists)
9. [Conditional Rendering](#conditional-rendering)
10. [Component Composition & Props](#component-composition--props)
11. [CSS Styling](#css-styling)
12. [Routing — Building Multi-Page Apps](#routing--building-multi-page-apps)
13. [Global State with the Store](#global-state-with-the-store)
14. [Sharing Data Between Components (Context)](#sharing-data-between-components-context)
15. [Fetching Data from an API](#fetching-data-from-an-api)
16. [Persistent State (Storage Hooks)](#persistent-state-storage-hooks)
17. [Real-World App Structure](#real-world-app-structure)

---

## Your First App

### 1. Scaffold the project

```bash
npx create-ferali-app my-app
cd my-app
npm run dev
```

Your app is live at **http://localhost:3000**.

### 2. Open `src/App.js`

This is your root component — the entry point for all UI. Start editing it:

```js
import { createApp, defineComponent } from 'ferali';
import { useTemplate }                from 'ferali';
import { State }                      from 'ferali/hooks';

const App = defineComponent({
  render() {
    const [greeting, setGreeting] = State('Hello, World!');

    return useTemplate(`
      <div>
        <h1>{{ greeting }}</h1>
        <button #click="{{ () => setGreeting('Hello, FeraliJs!') }}">
          Change Greeting
        </button>
      </div>
    `);
  }
});

createApp('root').mount(App);
```

Every time `setGreeting` is called, only the parts of the DOM that changed are updated.

---

## Components — The Building Block

Everything in FeraliJs is a **component** — a self-contained unit of UI with its own state, lifecycle, and template.

### Defining a Component

```js
// src/components/Card.js
import { defineComponent } from 'ferali';
import { useTemplate }     from 'ferali';

const Card = defineComponent({
  render() {
    const { title, description } = this.getProps();

    return useTemplate(`
      <div class="card">
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
    `);
  }
});

export default Card;
```

### The Lifecycle

```
defineComponent → build() → onInit → render() → onMounted
                                                    │
                              state changes →  update() → onUpdate
                                                    │
                              removed from DOM →  destroy() → onDestroy
```

Use lifecycle callbacks in the config:

```js
const MyComponent = defineComponent({
  onInit()    { /* runs before the first render — good for setup */ },
  onMounted() { /* component is in the DOM — safe to read DOM props */ },
  onUpdate()  { /* called after each re-render */ },
  onDestroy() { /* cleanup — timers, connections, etc. */ },

  render() {
    return useTemplate(`<div>Hello</div>`);
  }
});
```

---

## Template Syntax In Depth

### Interpolation

```html
<p>{{ name }}</p>
<p>{{ user.profile.email }}</p>
<p>{{ count.__raw + 1 }}</p>
<p>{{ isActive ? 'Online' : 'Offline' }}</p>
```

### Event Binding

```html
<!-- Reference a named handler -->
<button #click="{{ handleClick }}">Click</button>

<!-- Inline arrow function -->
<button #click="{{ () => setCount(count.__raw + 1) }}">+</button>

<!-- Pass event object -->
<input #input="{{ e => setName(e.target.value) }}">
<form  #submit="{{ e => { e.preventDefault(); handleSubmit(); } }}">
```

Any DOM event works: `#click`, `#keydown`, `#input`, `#change`, `#submit`, `#mouseover`, etc.

### Child Components

```html
<!-- Embed a component with no props -->
@Header({})

<!-- With static props -->
@Card({ title: "My Card", color: "blue" })

<!-- With dynamic props — use interpolation inside the props object -->
@UserCard({ name: "{{ user.name }}", active: {{ isOnline }} })
```

The component must be in scope in the render function — either imported or created in the same file.

### JavaScript Blocks

Execute arbitrary JavaScript inside a template with `<? ?>`:

```html
<? 2 + 2 ?>                               <!-- renders: 4 -->
<? new Date().getFullYear() ?>            <!-- renders: 2026 -->
<? Math.max(a.__raw, b.__raw) ?>          <!-- renders: max value -->
```

Use `<{ }>` to embed HTML inside a JS block:

```html
<? isAdmin ? <{ <span class="badge">Admin</span> }> : null ?>
```

---

## Working with State

### Basic State

```js
const [name, setName]   = State('');
const [count, setCount] = State(0);
const [user, setUser]   = State({ name: 'Alice', age: 30 });
const [tags, setTags]   = State(['js', 'css', 'html']);
```

### Reading State in a Template

State proxies work transparently in templates:

```html
<p>{{ name }}</p>       <!-- string value -->
<p>{{ count }}</p>      <!-- number value -->
<p>{{ user.name }}</p>  <!-- property of an object state -->
```

### Updating State (Object)

```js
// Always create a new object — don't mutate in place
const updateName = (newName) => setUser({ ...user.__raw, name: newName });
```

### Updating State (Array)

```js
const addItem  = (item) => setTags([...tags.__raw, item]);
const removeItem = (i)  => setTags(tags.__raw.filter((_, idx) => idx !== i));
```

### The `__raw` Property

The proxy's `.toString()` and `.valueOf()` handle template rendering automatically. For JavaScript logic, use `.__raw` to get the actual value:

```js
const isEven   = count.__raw % 2 === 0;
const doubled  = count.__raw * 2;
const hasItems = tags.__raw.length > 0;
```

### Toggle

```js
const [open, toggleOpen] = Toggle(false);
// toggleOpen() → open becomes true → toggleOpen() → false → ...
```

---

## Side Effects & Lifecycle

`Effect` lets you run code in response to renders or state changes.

### On Mount (once)

```js
Effect(() => {
  console.log('Mounted!');
  document.title = 'My App';
}, []);
```

### When Dependencies Change

```js
const [userId, setUserId] = State(1);

Effect(() => {
  console.log('User ID changed to:', userId.__raw);
  // fetch user data, etc.
}, [userId]);
```

### With Cleanup

```js
Effect(() => {
  const id = setInterval(() => tick(), 1000);
  return () => clearInterval(id);  // cleanup function
}, []);
```

### On Every Update

```js
Effect(() => {
  // Runs after every render
  document.title = `${count.__raw} items`;
});
```

### Global Event Listeners

```js
// Attaches on mount, removes on destroy automatically
Event('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

Event('scroll', syncScrollPosition, window, { passive: true });
```

---

## Derived & Computed State

Use `Memo` for values derived from other state:

```js
const [items, setItems]   = State([1, 2, 3, 4, 5]);
const [min, setMin]       = State(0);
const [max, setMax]       = State(10);

// Recomputes automatically whenever `items`, `min`, or `max` changes
const filtered = Memo(
  () => items.__raw.filter(n => n >= min.__raw && n <= max.__raw),
  [items, min, max]
);

// Use in template
return useTemplate(`
  <p>Showing {{ filtered }} items</p>
`);
```

---

## Handling Forms

### Controlled Input

```js
const [value, setValue] = State('');
const handleInput = (e) => setValue(e.target.value);

return useTemplate(`
  <input #input="{{ handleInput }}" />
  <p>You typed: {{ value }}</p>
`);
```

### Form Submission

```js
const [name, setName]   = State('');
const [email, setEmail] = State('');

const handleSubmit = (e) => {
  e.preventDefault();
  console.log({ name: name.__raw, email: email.__raw });
};

return useTemplate(`
  <form #submit="{{ handleSubmit }}">
    <input #input="{{ e => setName(e.target.value) }}"   placeholder="Name"  />
    <input #input="{{ e => setEmail(e.target.value) }}"  placeholder="Email" />
    <button type="submit">Submit</button>
  </form>
`);
```

### Debounced Search Input

```js
const [query, setQuery] = Debounce('', 400);

Effect(() => {
  if (query.__raw) performSearch(query.__raw);
}, [query]);

return useTemplate(`
  <input #input="{{ e => setQuery(e.target.value) }}" placeholder="Search..." />
`);
```

---

## Rendering Lists

Use the `<? ?>` JS block with `.map()` and `<{ }>`:

```js
const [todos, setTodos] = State([
  { id: 1, text: 'Learn FeraliJs', done: false },
  { id: 2, text: 'Build something cool', done: false },
]);

const toggle = (id) => setTodos(
  todos.__raw.map(t => t.id === id ? { ...t, done: !t.done } : t)
);

return useTemplate(`
  <ul>
    <? todos.map(todo => <{
      <li key="{{ todo.id }}" #click="{{ () => toggle(todo.id) }}">
        {{ todo.text }}
      </li>
    }>) ?>
  </ul>
`);
```

> **Tip:** Always add a `key` attribute when rendering lists. FeraliJs uses it for efficient DOM reconciliation.

---

## Conditional Rendering

### Ternary Expression

```html
<? isLoggedIn
  ? <{ <p>Welcome back!</p> }>
  : <{ <p>Please log in.</p> }>
?>
```

### And Short-Circuit (show only if true)

```html
<? isLoading ? <{ <div class="spinner"></div> }> : null ?>
```

### Complex Conditions

```html
<?
  error
    ? <{ <p class="error">{{ error.message }}</p> }>
    : loading
      ? <{ <p>Loading...</p> }>
      : <{ <div class="content">{{ data.title }}</div> }>
?>
```

---

## Component Composition & Props

### Passing Props

Pass data from parent to child via the `@Component({})` syntax:

```js
// src/App.js — parent
import Button from './components/Button.js';

return useTemplate(`
  <div>
    @Button({ label: "Submit", color: "primary" })
  </div>
`);
```

### Receiving Props

```js
// src/components/Button.js — child
const Button = defineComponent({
  render() {
    const { label, color } = this.getProps();

    return useTemplate(`
      <button class="{{ color }}">{{ label }}</button>
    `);
  }
});
```

### Props with Dynamic Values

Use interpolation inside the props object to pass reactive values:

```html
@UserCard({ name: "{{ currentUser.name }}", active: {{ isOnline }} })
```

### Embedding Multiple Components

```js
import Header  from './components/Header.js';
import Sidebar from './components/Sidebar.js';
import Footer  from './components/Footer.js';

return useTemplate(`
  <div class="layout">
    @Header({})
    <div class="body">
      @Sidebar({ items: "{{ navItems }}" })
      <main>...</main>
    </div>
    @Footer({})
  </div>
`);
```

---

## CSS Styling

### Global CSS

Load a stylesheet for the whole app:

```js
createApp('root').useCss('src/css/global.css').mount(App);
```

### Per-Component CSS (Shared)

A stylesheet linked to a component is injected when the first instance mounts and removed when the last instance is destroyed:

```js
const Card = defineComponent({
  style: 'src/css/card.css',
  render() { ... }
});
```

### Scoped/Localized CSS

Scope CSS to a single component — every rule is automatically rewritten to target only that component's elements:

```js
const Button = defineComponent({
  style: { path: 'src/css/button.css', localized: true },
  render() { ... }
});
```

**`src/css/button.css`:**

```css
/* :host targets the component's root element */
:host {
  display: inline-block;
}

/* This selector is automatically scoped to the component */
.btn {
  padding: 8px 16px;
  border-radius: 4px;
}
```

The Dev Server transforms this to:

```css
[ferali-cid="<id>"] {
  display: inline-block;
}
[ferali-cid="<id>"] .btn {
  padding: 8px 16px;
  border-radius: 4px;
}
```

---

## Routing — Building Multi-Page Apps

### Setup

```js
// src/App.js
import { createApp, defineComponent } from 'ferali';
import { useTemplate }                from 'ferali';
import { createRouter }               from 'ferali-router';

const router = createRouter([
  { path: '/',        component: () => import('./pages/Home.js') },
  { path: '/about',   component: () => import('./pages/About.js') },
  { path: '/users/:id', component: () => import('./pages/User.js') },
  { path: '*',        component: () => import('./pages/NotFound.js') },
]);

const App = defineComponent({
  render() {
    return useTemplate(`
      <div>
        <nav>
          <route-to href="/">Home</route-to>
          <route-to href="/about">About</route-to>
        </nav>
        <router-outlet></router-outlet>
      </div>
    `);
  }
});

createApp('root').use(router).mount(App);
```

### Page Components Receive URL Params as Props

```js
// src/pages/User.js
const User = defineComponent({
  render() {
    const { id } = this.getProps();  // e.g. { id: '42' }
    const { data: user, loading } = Fetch(`/api/users/${id}`);

    return useTemplate(`
      <div>
        <? loading ? <{ <p>Loading...</p> }> : <{ <h1>{{ user.name }}</h1> }> ?>
      </div>
    `);
  }
});
export default User;
```

### Nested Routes (Layout Routes)

```js
const router = createRouter([
  {
    path: '/dashboard',
    component: () => import('./layouts/DashboardLayout.js'),
    children: [
      { path: '/overview', component: () => import('./pages/Overview.js'), index: true },
      { path: '/analytics', component: () => import('./pages/Analytics.js') },
    ]
  }
]);
```

```js
// layouts/DashboardLayout.js
const DashboardLayout = defineComponent({
  render() {
    return useTemplate(`
      <div class="dashboard">
        <aside>
          <route-to href="/dashboard/overview">Overview</route-to>
          <route-to href="/dashboard/analytics">Analytics</route-to>
        </aside>
        <main>
          <router-outlet></router-outlet>
        </main>
      </div>
    `);
  }
});
```

### Programmatic Navigation

```js
import { setUrlParam, deleteUrlParam, getUrlParams } from 'ferali-router';

// Update a query param and navigate
setUrlParam('page', '2');

// Remove a query param
deleteUrlParam('filter');

// Read current params (path params + query string merged)
const { id, tab } = getUrlParams();
```

---

## Global State with the Store

Use the store for state that needs to be **shared between multiple components**.

### 1. Create and configure the store

```js
// src/store.js
import createStore from 'ferali-store';

const store = createStore();

store.registerState('cartCount', 0);
store.registerToggle('sidebarOpen', false);
store.registerLocalStorage('theme', 'user-theme', 'light');
store.registerFetchPolling('liveUpdates', '/api/feed', 5000);

export default store;
```

### 2. Subscribe in any component

```js
// src/components/CartBadge.js
import store from '../store.js';

const CartBadge = defineComponent({
  render() {
    const { value: count, set: setCount } = store.subscribe('cartCount');

    return useTemplate(`<span class="badge">{{ count }}</span>`);
  }
});
```

```js
// src/pages/Shop.js
import store from '../store.js';

const Shop = defineComponent({
  render() {
    const { value: count, set: setCount } = store.subscribe('cartCount');

    const addToCart = () => setCount(count.__raw + 1);

    return useTemplate(`
      <button #click="{{ addToCart }}">Add to Cart</button>
    `);
  }
});
```

Both `CartBadge` and `Shop` re-render automatically when `cartCount` changes. No prop passing required.

### 3. Subscribe without re-rendering

```js
// Read from store in an event handler only, don't subscribe to updates
const { value: count, set: setCount } = store.subscribe('cartCount', { blockUpdate: true });
```

---

## Sharing Data Between Components (Context)

Context passes data implicitly through the component tree — useful for theme, authentication, or locale data.

### Provider (ancestor component)

```js
import { Provide } from 'ferali/hooks';

const App = defineComponent({
  render() {
    Provide('currentUser', { name: 'Alice', role: 'admin' });

    return useTemplate(`<div>@MainLayout({})</div>`);
  }
});
```

### Consumer (any descendant)

```js
import { Inject } from 'ferali/hooks';

const ProfileCard = defineComponent({
  render() {
    const user = Inject('currentUser');

    return useTemplate(`<p>Logged in as: {{ user.name }}</p>`);
  }
});
```

> **Note:** Context is not reactive. For reactive shared state, use the Store.

---

## Fetching Data from an API

### On Mount (once)

```js
import { Fetch } from 'ferali/hooks';

const PostList = defineComponent({
  render() {
    const { data: posts, loading, error } = Fetch('/api/posts');

    return useTemplate(`
      <div>
        <? loading ? <{ <p>Loading posts...</p> }> : null ?>
        <? error   ? <{ <p class="err">Failed to load.</p> }> : null ?>
        <? !loading && posts ? <{
          <ul>
            <? posts.map(post => <{ <li key="{{ post.id }}">{{ post.title }}</li> }>) ?>
          </ul>
        }> : null ?>
      </div>
    `);
  }
});
```

### On Demand (user-triggered)

```js
import { State, Effect } from 'ferali/hooks';

const Search = defineComponent({
  render() {
    const [query, setQuery]   = State('');
    const [results, setResults] = State([]);
    const [loading, setLoading] = State(false);

    const search = async () => {
      setLoading(true);
      const res = await fetch(`/api/search?q=${query.__raw}`);
      setResults(await res.json());
      setLoading(false);
    };

    return useTemplate(`
      <div>
        <input #input="{{ e => setQuery(e.target.value) }}" />
        <button #click="{{ search }}">Search</button>
        <? loading ? <{ <p>Searching...</p> }> : null ?>
        <? results.map(r => <{ <p>{{ r.title }}</p> }>) ?>
      </div>
    `);
  }
});
```

### Polling (live data)

```js
import { FetchPolling } from 'ferali/hooks';

const LiveFeed = defineComponent({
  render() {
    const { data: feed, loading } = FetchPolling('/api/feed', 3000);

    return useTemplate(`
      <div>
        <? loading ? <{ <span>--</span> }> : <{
          <span>{{ feed.count }} new items</span>
        }> ?>
      </div>
    `);
  }
});
```

---

## Persistent State (Storage Hooks)

### localStorage (persists across page reloads)

```js
import { LocalStorage } from 'ferali/hooks';

const [theme, setTheme] = LocalStorage('app-theme', 'light');
const [user, setUser]   = LocalStorage('user-data', null);
```

### sessionStorage (clears when tab closes)

```js
import { SessionStorage } from 'ferali/hooks';

const [formDraft, setFormDraft] = SessionStorage('form-draft', {});
```

These work identically to `State` in templates. Setters write to storage and trigger re-renders automatically.

---

## Real-World App Structure

For a production-scale application, consider this folder structure:

```
my-app/
├── index.html
├── package.json
├── src/
│   ├── App.js                    # Root component + router setup
│   ├── store.js                  # Global store singleton
│   │
│   ├── pages/                    # Route-level page components
│   │   ├── Home.js
│   │   ├── About.js
│   │   └── User.js
│   │
│   ├── layouts/                  # Layout wrapper components
│   │   ├── MainLayout.js
│   │   └── DashboardLayout.js
│   │
│   ├── components/               # Reusable UI components
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── Modal.js
│   │   └── Navbar.js
│   │
│   ├── hooks/                    # Custom re-usable hook functions
│   │   └── useAuth.js
│   │
│   └── css/                      # Stylesheets
│       ├── global.css
│       ├── button.css
│       └── card.css
│
└── public/                       # Static assets
    ├── favicon.ico
    └── images/
```

### Tip — Custom Hooks

You can extract reusable hook logic into plain JavaScript functions:

```js
// src/hooks/useAuth.js
import { LocalStorage } from 'ferali/hooks';
import store            from '../store.js';

export function useAuth() {
  const [token, setToken] = LocalStorage('auth-token', null);
  const isLoggedIn = !!token.__raw;

  const login  = (newToken) => setToken(newToken);
  const logout = ()         => setToken(null);

  return { token, isLoggedIn, login, logout };
}
```

```js
// In any component
import { useAuth } from '../hooks/useAuth.js';

const { isLoggedIn, logout } = useAuth();
```

### Tip — Page Component Pattern

Every page component follows the same pattern:

```js
// src/pages/Profile.js
import { defineComponent } from 'ferali';
import { useTemplate }     from 'ferali';
import { Fetch }           from 'ferali/hooks';

const Profile = defineComponent({
  render() {
    const { id } = this.getProps();              // From router
    const { data, loading, error } = Fetch(`/api/users/${id}`);

    return useTemplate(`
      <section class="profile-page">
        <? loading ? <{ <div class="spinner"></div> }> : null ?>
        <? error   ? <{ <p>Error loading profile.</p> }> : null ?>
        <? data    ? <{ <h1>{{ data.name }}</h1> }> : null ?>
      </section>
    `);
  }
});

export default Profile;
```

---

## Common Patterns Cheat Sheet

| Task | Solution |
|------|----------|
| Reactive value | `const [x, setX] = State(initial)` |
| Boolean toggle | `const [open, toggle] = Toggle(false)` |
| Read raw value | `x.__raw` |
| Side effect on mount | `Effect(() => { ... }, [])` |
| Side effect on change | `Effect(() => { ... }, [dep1, dep2])` |
| Computed value | `const x = Memo(() => compute(), [deps])` |
| DOM reference | `const el = Ref(null)` |
| Global event listener | `Event('resize', handler)` |
| Debounced input | `const [v, setV] = Debounce('', 300)` |
| Fetch on mount | `const { data, loading, error } = Fetch(url)` |
| Auto-polling | `const { data } = FetchPolling(url, 5000)` |
| Persist to disk | `const [v, setV] = LocalStorage('key', default)` |
| Shared state | `store.subscribe('key')` |
| Pass data down tree | `Provide('key', val)` / `Inject('key')` |
| Navigate to route | `<route-to href="/path">` |
| Read URL params | `this.getProps()` or `getUrlParams()` |
| Update query param | `setUrlParam('key', 'value')` |
