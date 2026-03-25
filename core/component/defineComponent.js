/**
 * @fileoverview The `defineComponent` factory function.
 * The primary public API for creating a Ferali component instance from a config object.
 */

import Component from './component.js';

/**
 * Defines and returns a new Ferali component instance.
 *
 * @param {{ render: Function, style?: { path: string } }} config - The component configuration.
 *   - `render`: A function that returns a blueprint (via `useTemplate` or raw `h` calls).
 *   - `style`: (optional) An object with a `path` to an external CSS file to manage automatically.
 * @returns {Component} A new `Component` instance ready to be mounted or embedded.
 *
 * @example
 * const MyButton = defineComponent({
 *   style: { path: 'src/css/button.css' },
 *   render() {
 *     const [label, setLabel] = State('Click me');
 *     return useTemplate(`<button>{{ label }}</button>`, { label });
 *   }
 * });
 */
export default function defineComponent(config) {
  return new Component(config);
}
