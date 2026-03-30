/**
 * @fileoverview Implements the `Fetch` hook.
 * An asynchronous initialization hook that provides reactive 
 * `data`, `loading`, and `error` states for network requests.
 */

import { State } from './state.js';
import { currentComponent } from './storage.js';

/**
 * Runs an async fetch request on component mount and manages reactive response states.
 * 
 * @param {string|Request} url - The resource to fetch.
 * @param {RequestInit} [options={}] - Fetch configuration options.
 * @returns {{ data: Proxy<any>, loading: Proxy<boolean>, error: Proxy<Error|null> }} The reactive state cluster.
 */
export function Fetch(url, options = {}) {
  const [data, setData] = State(null);
  const [loading, setLoading] = State(true);
  const [error, setError] = State(null);

  const comp = currentComponent.component;

  comp.addLifeCycleHook('onMounted', async () => {
    try {
      setLoading(true);
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  });

  return { data, loading, error };
}
