/**
 * @fileoverview Implements the `Event` hook for Ferali.
 * Provides a clean way to attach global event listeners that are 
 * automatically removed when the component is destroyed.
 */

import { currentComponent } from './storage.js';

/**
 * Attaches an event listener to the given target (default window).
 * Automatically cleans up the listener when the component unmounts.
 * 
 * @param {string} eventName - The DOM event to listen for.
 * @param {Function} listener - The callback function.
 * @param {EventTarget} [target=window] - The DOM node or window to attach to.
 * @param {boolean|AddEventListenerOptions} [options] - Standard event listener options.
 */
export function Event(eventName, listener, target = window, options = false) {
  const comp = currentComponent.component;

  comp.addLifeCycleHook('onMounted', () => {
    target.addEventListener(eventName, listener, options);
  });

  comp.addLifeCycleHook('onDestroy', () => {
    target.removeEventListener(eventName, listener, options);
  });
}
