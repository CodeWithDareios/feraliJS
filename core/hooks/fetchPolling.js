/**
 * @fileoverview Implements the `FetchPolling` hook.
 * An asynchronous hook that repeatedly fetches a resource at a given interval,
 * providing reactive states and cleaning up automatically on unmount.
 */

import { State } from './state.js';
import { currentComponent } from './storage.js';

/**
 * Runs an async fetch request on an interval.
 * 
 * @param {string|Request} url - The resource to fetch.
 * @param {number} [intervalMs=5000] - The polling interval in milliseconds.
 * @param {RequestInit} [options={}] - Fetch configuration options.
 * @returns {{ data: Proxy<any>, loading: Proxy<boolean>, error: Proxy<Error|null> }} The reactive state cluster.
 */
export function FetchPolling(url, intervalMs = 5000, options = {}) {
  const [data, setData] = State(null);
  const [loading, setLoading] = State(true);
  const [error, setError] = State(null);

  const comp = currentComponent.component;
  let intervalId = null;

  const performFetch = async () => {
    try {
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
  };

  comp.addLifeCycleHook('onMounted', () => {
    performFetch(); // Initial execution
    intervalId = setInterval(performFetch, intervalMs);
  });

  comp.addLifeCycleHook('onDestroy', () => {
    if (intervalId) clearInterval(intervalId);
  });

  return { data, loading, error };
}
