# `FetchPolling`

**Source:** `lib/core/hooks/fetchPolling.js`

`FetchPolling` is like `Fetch`, but it repeatedly fetches a resource at a configurable interval. The interval is started on mount and automatically cleared when the component is destroyed.

---

## Signature

```ts
function FetchPolling(
  url:         string | Request,
  intervalMs?: number,
  options?:    RequestInit
): { data: Proxy<any>, loading: Proxy<boolean>, error: Proxy<Error | null> }
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | `string \| Request` | *(required)* | The URL or `Request` object to poll. |
| `intervalMs` | `number` | `5000` | The polling interval in milliseconds. |
| `options` | `RequestInit` | `{}` | Standard `fetch()` options. |

### Returns

Same as [`Fetch`](./fetch.md): `{ data, loading, error }`.

---

## Lifecycle

| Lifecycle Event | Behavior |
|----------------|----------|
| `onMounted` | Fires the first request immediately, then starts the polling interval. |
| `onDestroy` | Clears the interval via `clearInterval()`. |

---

## Example — Live Stock Ticker

```js
import { FetchPolling } from 'ferali/hooks';

const { data: stock, loading, error } = FetchPolling('/api/stock/FRAL', 3000);

return useTemplate(`
  <div class="ticker">
    <? loading ? <{ <span>--</span> }> : <{
      <span class="price">{{ stock.price }}</span>
    }> ?>
  </div>
`);
```

---

## Notes

- The initial fetch fires immediately on mount (does not wait for the first interval tick).
- The `loading` state is `true` only during the **first** request. Subsequent poll updates do not reset `loading` to `true` (by design).
- If you need more control over polling behavior (start/stop, manual trigger), use `FetchPolling` from the **Store** module, which provides explicit subscription management.
