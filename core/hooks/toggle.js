/**
 * @fileoverview Implements the `Toggle` hook.
 * A streamlined boolean State hook.
 */

import { State } from './state.js';

/**
 * Creates a reactive boolean state with a streamlined toggle setter.
 * 
 * @param {boolean} [initialValue=false] - The starting boolean value.
 * @returns {[Proxy<boolean>, Function]} A tuple of the state proxy and the toggle function.
 */
export function Toggle(initialValue = false) {
  const [value, setValue] = State(Boolean(initialValue));

  const toggleFn = () => {
    // Ferali state proxies implement a '__raw' property to safely bypass truthy evaluation.
    setValue(!value.__raw);
  };

  return [value, toggleFn];
}
