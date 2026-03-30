/**
 * @fileoverview Implements the `LocalStorage` hook.
 * A drop-in replacement for `State` that automatically syncs its value to `window.localStorage`.
 */

import { State } from './state.js';

/**
 * Creates a reactive state variable that persists to local storage.
 * 
 * @param {string} key - The localStorage key.
 * @param {any} initialValue - The fallback value if none is stored.
 * @returns {[Proxy<any>, Function]} A tuple of the state proxy and the sync setter.
 */
export function LocalStorage(key, initialValue) {
  let storedValue = localStorage.getItem(key);
  
  if (storedValue !== null) {
    try {
      storedValue = JSON.parse(storedValue);
    } catch (e) {
      // Keep as string if parsing fails
    }
  } else {
    storedValue = initialValue;
    localStorage.setItem(key, typeof storedValue === 'string' ? storedValue : JSON.stringify(storedValue));
  }

  const [valueProxy, setInternalState] = State(storedValue);

  const setStorageState = (newValue) => {
    localStorage.setItem(key, typeof newValue === 'string' ? newValue : JSON.stringify(newValue));
    setInternalState(newValue);
  };

  return [valueProxy, setStorageState];
}
