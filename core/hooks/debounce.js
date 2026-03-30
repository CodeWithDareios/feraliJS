/**
 * @fileoverview Implements the `Debounce` hook.
 * Wraps a State variable and delays applying updates until 
 * a specified quiet period has elapsed.
 */

import { State } from './state.js';
import { currentComponent } from './storage.js';

/**
 * Creates a debounced reactive state.
 * 
 * @template T
 * @param {T} initialValue - The starting state value.
 * @param {number} [delayMs=300] - The debounce duration in milliseconds.
 * @returns {[Proxy<T>, Function]} A tuple of the state proxy and the debounced setter.
 */
export function Debounce(initialValue, delayMs = 300) {
  const [value, setValue] = State(initialValue);
  const comp = currentComponent.component;
  
  // Store the timer ID globally to the hook instance
  let timeoutId = null;

  const setDebounced = (newValue) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      setValue(newValue);
    }, delayMs);
  };

  // Ensure any hanging timeouts are cleared if the component unmounts early
  comp.addLifeCycleHook('onDestroy', () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });

  return [value, setDebounced];
}
