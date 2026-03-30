# URL Params API

**Source:** `lib/router/router.js`

The Ferali Router exposes a small utility API for reading and manipulating the current URL's path parameters and query string.

---

## `getUrlParams()`

Returns a merged object containing all current path parameters (`:param` captures) and query string parameters.

```ts
function getUrlParams(): Object
```

### Example

```js
import { getUrlParams } from 'ferali-router';

// URL: /users/42?tab=posts&page=2
const params = getUrlParams();
// → { id: '42', tab: 'posts', page: '2' }
```

> **Note:** In page components rendered by `<router-outlet>`, you can also access params via `this.getProps()` — no need to call `getUrlParams()` explicitly.

---

## `setUrlParam(key, value)`

Sets a single query parameter in the URL and triggers a full navigation (the URL updates and all outlets re-render).

```ts
function setUrlParam(key: string, value: string): void
```

### Example

```js
import { setUrlParam } from 'ferali-router';

// Current URL: /search
setUrlParam('q', 'ferali');
// → Navigates to /search?q=ferali
```

Existing query params are preserved:

```js
// Current URL: /search?q=ferali
setUrlParam('page', '2');
// → Navigates to /search?q=ferali&page=2
```

---

## `deleteUrlParam(key)`

Removes a single query parameter from the URL and triggers a navigation.

```ts
function deleteUrlParam(key: string): void
```

### Example

```js
import { deleteUrlParam } from 'ferali-router';

// Current URL: /search?q=ferali&page=2
deleteUrlParam('page');
// → Navigates to /search?q=ferali
```

---

## Reactive Query Parameters Pattern

Use query params as a source of truth for filterable/paginated views:

```js
import { defineComponent } from 'ferali';
import { useTemplate }     from 'ferali';
import { getUrlParams, setUrlParam } from 'ferali-router';
import { Debounce }        from 'ferali/hooks';

const SearchPage = defineComponent({
  render() {
    const { q = '' } = this.getProps(); // Passed by router outlet
    const [query, setQuery] = Debounce(q, 300);

    // Reflect debounced input to URL
    const handleSearch = (e) => {
      setQuery(e.target.value);
      setUrlParam('q', e.target.value);
    };

    return useTemplate(`
      <div>
        <input value="{{ q }}" #input="handleSearch" placeholder="Search..." />
      </div>
    `);
  }
});
```
