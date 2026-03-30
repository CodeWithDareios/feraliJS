/**
 * @fileoverview Implements the `Provide` and `Inject` hooks for Ferali.
 * Allows passing data implicitly down the component tree without prop-drilling.
 */

import { COMPONENT_STACK, STORAGE } from './storage.js';

/**
 * Provides a value to all descendant components.
 * 
 * @param {string|symbol} key - The unique identifier for this context.
 * @param {any} value - The data to provide to descendants.
 */
export function Provide(key, value) {
  if (COMPONENT_STACK.length === 0) return;
  
  const comp = COMPONENT_STACK[COMPONENT_STACK.length - 1];
  
  if (!STORAGE.CONTEXT.has(comp)) {
    STORAGE.CONTEXT.set(comp, new Map());
  }
  
  STORAGE.CONTEXT.get(comp).set(key, value);
}

/**
 * Injects a value provided by an ancestor component.
 * 
 * @param {string|symbol} key - The unique identifier for the context.
 * @returns {any} The provided value, or undefined if no ancestor provided it.
 */
export function Inject(key) {
  // Traverse up the active component stack (from closest parent to root)
  for (let i = COMPONENT_STACK.length - 1; i >= 0; i--) {
    const ancestor = COMPONENT_STACK[i];
    if (STORAGE.CONTEXT.has(ancestor)) {
      const contextMap = STORAGE.CONTEXT.get(ancestor);
      if (contextMap.has(key)) {
        return contextMap.get(key);
      }
    }
  }
  return undefined;
}
