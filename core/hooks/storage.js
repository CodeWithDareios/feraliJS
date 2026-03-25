/**
 * @fileoverview Global hook storage and the active component context pointer.
 * Hooks (`State`, `Effect`, etc.) rely on this module to associate their data
 * with the currently-rendering component instance.
 */

/**
 * Global storage for all component hook data, keyed by the component's instanceID.
 * - `STATE`: Stores arrays of state values indexed by hook call order.
 * - `EFFECT`: Reserved for `useEffect` cleanup functions and dependency lists.
 */
export const STORAGE = {
  STATE: new Map(),
  EFFECT: new Map(),
};

/**
 * A mutable pointer to the component instance that is currently executing its render function.
 * Set before calling `render()` and cleared immediately after. This is how hooks
 * know which component they belong to.
 *
 * @type {{ component: import('../component/component.js').default | null }}
 */
export let currentComponent = {
  component: null,
};
