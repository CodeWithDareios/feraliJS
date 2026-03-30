/**
 * @fileoverview Implements the `SessionStorage` hook.
 * A drop-in replacement for `State` that automatically syncs its value to `window.sessionStorage`.
 */

import { State } from './state.js';

/**
 * Creates a reactive state variable that persists to session storage.
 * 
 * @param {string} key - The sessionStorage key.
 * @param {any} initialValue - The fallback value if none is stored.
 * @returns {[Proxy<any>, Function]} A tuple of the state proxy and the sync setter.
 */
export function SessionStorage(key, initialValue) {
  let storedValue = sessionStorage.getItem(key);
  
  if (storedValue !== null) {
    try {
      storedValue = JSON.parse(storedValue);
    } catch (e) {
      // Keep as string if parsing fails
    }
  } else {
    storedValue = initialValue;
    sessionStorage.setItem(key, typeof storedValue === 'string' ? storedValue : JSON.stringify(storedValue));
  }

  const [valueProxy, setInternalState] = State(storedValue);

  const setStorageState = (newValue) => {
    sessionStorage.setItem(key, typeof newValue === 'string' ? newValue : JSON.stringify(newValue));
    setInternalState(newValue);
  };

  return [valueProxy, setStorageState];
}
