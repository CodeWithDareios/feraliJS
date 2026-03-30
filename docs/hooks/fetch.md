# `Fetch`

**Source:** `lib/core/hooks/fetch.js`

`Fetch` is an asynchronous data-fetching hook that automatically fires a network request when the component mounts and provides three reactive state objects: `data`, `loading`, and `error`.

---

## Signature

```ts
function Fetch(
  url:     string | Request,
  options?: RequestInit
): { data: Proxy<any>, loading: Proxy<boolean>, error: Proxy<Error | null> }
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | `string \| Request` | *(required)* | The URL or `Request` object to fetch. |
| `options` | `RequestInit` | `{}` | Standard `fetch()` options (method, headers, body, etc.). |

### Returns

An object with three reactive State Proxies:

| Key | Type | Initial | Description |
|-----|------|---------|-------------|
| `data` | `Proxy<any>` | `null` | The parsed JSON response body. |
| `loading` | `Proxy<boolean>` | `true` | `true` while the request is in flight. |
| `error` | `Proxy<Error \| null>` | `null` | The error object if the request failed, otherwise `null`. |

---

## Timing

The request is fired in `onMounted` (after the component is in the DOM). `loading` starts as `true` and is set to `false` when the request completes (success or error).

---

## Error Handling

If the HTTP response status is not OK (not `2xx`), `Fetch` throws an error that is caught and stored in the `error` state. Network failures are also caught.

---

## Example

```js
import { defineComponent } from 'ferali';
import { useTemplate }     from 'ferali';
import { Fetch }           from 'ferali/hooks';

const UserProfile = defineComponent({
  render() {
    const { data: user, loading, error } = Fetch('/api/user/1');

    return useTemplate(`
      <div>
        <? loading ? <{ <p>Loading...</p> }> : null ?>
        <? error ? <{ <p class="error">Error: {{ error.message }}</p> }> : null ?>
        <? !loading && !error ? <{
          <div class="profile">
            <h1>{{ user.name }}</h1>
            <p>{{ user.email }}</p>
          </div>
        }> : null ?>
      </div>
    `);
  }
});
```

---

## Fetch vs. FetchPolling

| Hook | Use case |
|------|----------|
| `Fetch` | Single request on mount (e.g., loading initial page data). |
| `FetchPolling` | Repeatedly fetching data at regular intervals (e.g., live dashboard). |
