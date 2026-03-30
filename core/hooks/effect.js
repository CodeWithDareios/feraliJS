/**
 * @fileoverview Implements the `Effect` hook for Ferali.
 * Effects run after the component mounts, and re-run after every update
 * if any of their dependencies have changed.
 */

import { STORAGE, currentComponent } from './storage.js';

/**
 * Registers a side effect to run after rendering.
 *
 * @param {() => (void | (() => void))} callback - The effect to run. May return a cleanup function.
 * @param {Array<any>} [dependencies=[]] - Array of reactive state proxies. If omitted, the effect runs on every update.
 */
export function Effect(callback, dependencies) {
  const comp = currentComponent.component;
  const id = comp.instanceID;

  if (!STORAGE.EFFECT.has(id)) {
    STORAGE.EFFECT.set(id, { hookIndex: 0, data: [] });
  }

  const storage = STORAGE.EFFECT.get(id);
  const currentIndex = storage.hookIndex++;

  // Read current primitive values of dependencies using the internal __raw property.
  const getDepValues = () => dependencies ? dependencies.map(dep => dep && typeof dep === 'object' && '__raw' in dep ? dep.__raw : dep) : null;

  storage.data[currentIndex] = {
    callback,
    dependencies,
    lastValues: getDepValues(),
    cleanup: null,
    hasRun: false
  };

  const effectData = storage.data[currentIndex];

  const runEffect = () => {
    let shouldRun = !effectData.hasRun;

    if (effectData.hasRun && dependencies) {
      const currentValues = getDepValues();
      shouldRun = effectData.lastValues.some((val, i) => val !== currentValues[i]);
      if (shouldRun) {
        effectData.lastValues = currentValues;
      }
    } else if (effectData.hasRun && !dependencies) {
        shouldRun = true;
    }

    if (shouldRun) {
      if (effectData.cleanup) {
        try { effectData.cleanup(); } catch (e) { console.error('Effect cleanup error:', e); }
      }
      try {
        const cleanupFn = effectData.callback();
        effectData.cleanup = typeof cleanupFn === 'function' ? cleanupFn : null;
      } catch (e) {
        console.error('Effect execution error:', e);
      }
      effectData.hasRun = true;
    }
  };

  comp.addLifeCycleHook('onMounted', () => {
    runEffect();
  });

  comp.addLifeCycleHook('onUpdate', () => {
    runEffect();
  });

  comp.addLifeCycleHook('onDestroy', () => {
    if (effectData.cleanup) {
      try { effectData.cleanup(); } catch (e) { console.error('Effect cleanup error on destroy:', e); }
    }
  });
}
