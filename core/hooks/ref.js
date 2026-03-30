/**
 * @fileoverview Implements the `Ref` hook for Ferali.
 * Provides a persistent, mutable `{ current: value }` container whose mutations
 * do NOT trigger component re-renders.
 */

import { STORAGE, currentComponent } from './storage.js';

/**
 * Returns a mutable object that persists across renders.
 *
 * @template T
 * @param {T} [initialValue=null] - The initial value to store in `.current`.
 * @returns {{ current: T }} The mutable reference object.
 */
export function Ref(initialValue = null) {
  const comp = currentComponent.component;
  const id = comp.instanceID;

  if (!STORAGE.REF.has(id)) {
    STORAGE.REF.set(id, { hookIndex: 0, data: [] });
  }

  const storage = STORAGE.REF.get(id);
  const currentIndex = storage.hookIndex++;

  if (storage.data[currentIndex] === undefined) {
    storage.data[currentIndex] = { current: initialValue };
  }

  return storage.data[currentIndex];
}
