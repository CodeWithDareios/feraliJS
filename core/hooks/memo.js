/**
 * @fileoverview Implements the `Memo` hook for Ferali.
 * Memoizes a computed value, recalculating it only when its dependencies change.
 */

import { State } from './state.js';
import { Effect } from './effect.js';

/**
 * Returns a reactive state proxy containing a computed value.
 *
 * @template T
 * @param {() => T} computeFn - The function that calculates the derived value.
 * @param {Array<any>} dependencies - Ferali State proxies to watch for changes.
 * @returns {Proxy<T>} A reactive proxy representing the latest computed value.
 */
export function Memo(computeFn, dependencies = []) {
  const [computedValue, setComputedValue] = State(computeFn());

  Effect(() => {
    setComputedValue(computeFn());
  }, dependencies);

  return computedValue;
}
