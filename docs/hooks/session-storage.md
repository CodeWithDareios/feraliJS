# `SessionStorage`

**Source:** `lib/core/hooks/sessionStorage.js`

See [`LocalStorage` & `SessionStorage`](./local-storage.md) for full documentation.

`SessionStorage` is identical in API to `LocalStorage` but uses `window.sessionStorage`. Values are cleared when the browser tab is closed.

```js
import { SessionStorage } from 'ferali/hooks';

const [value, setValue] = SessionStorage('my-session-key', defaultValue);
```
