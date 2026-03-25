/**
 * @fileoverview Implements the `State` hook — Ferali's primary reactive primitive.
 * When the setter is called with a new value, it automatically triggers a component update.
 */

import { STORAGE, currentComponent } from './storage.js';

/**
 * Declares a reactive state variable for the current component.
 * Must be called during the component's render function.
 *
 * @template T
 * @param {T} initialValue - The starting value for this state slot.
 * @returns {[Proxy<T>, (newValue: T) => void]} A tuple of the reactive state proxy and its setter.
 *
 * @example
 * const [count, setCount] = State(0);
 * // In template: {{ count }} — will re-render when setCount is called.
 */
export function State(initialValue) {
  const comp = currentComponent.component;
  const id = comp.instanceID;

  if (!STORAGE.STATE.has(id)) {
    STORAGE.STATE.set(id, { hookIndex: 0, data: [] });
  }

  const storage = STORAGE.STATE.get(id);

  if (storage.data[storage.hookIndex] === undefined) {
    storage.data[storage.hookIndex] = initialValue;
  }

  const currentIndex = storage.hookIndex;
  storage.hookIndex++;

  const stateProxy = new Proxy(
    {},
    {
      get(target, prop) {
        if (
          prop === 'valueOf' ||
          prop === Symbol.toPrimitive ||
          prop === 'toString'
        ) {
          return () => storage.data[currentIndex];
        }
        if (prop === '__isState') return true;
        if (prop === '__raw') return storage.data[currentIndex];

        return storage.data[currentIndex][prop];
      },
    }
  );

  const updateState = (newValue) => {
    if (storage.data[currentIndex] !== newValue) {
      storage.data[currentIndex] = newValue;
      comp.update();
    }
  };

  return [stateProxy, updateState];
}
