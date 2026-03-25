/**
 * @fileoverview The `useTemplate` function — a declarative HTML template helper.
 * Compiles a static HTML template string at call-time and returns a reactive
 * blueprint function for use in component render functions.
 */

import { h } from '../node/h.js';
import { useComponent } from './useComponent.js';
import { compareObjects } from '../utils/utils.js';
import { compile as COMPILE } from '../compiler/compiler.js';

/**
 * Compiles an HTML template string and returns a blueprint function that
 * Ferali's rendering engine can call to produce a live VNode tree.
 *
 * @param {string} templateString - A valid Ferali template string (supports `{{ }}` interpolation, `@Component` syntax, and `<? ?>` JS blocks).
 * @param {Object} contextObject - A map of named values and component classes available inside the template.
 * @returns {(props?: Object) => import('../node/vnode.js').VNode} A blueprint function.
 *
 * @example
 * return useTemplate(`
 *   <h1>Hello {{ name }}</h1>
 *   @Button({})
 * `, { name: 'World', Button });
 */
/**
 * Extracts all property and method names from an object, including those
 * inherited from prototypes (e.g. class methods).
 * @param {Object} obj
 * @returns {string[]}
 */
const getAllKeys = (obj) => {
  let keys = new Set();
  let current = obj;
  while (current && current !== Object.prototype) {
    Reflect.ownKeys(current).forEach(k => {
      if (typeof k === 'string' && k !== 'constructor') keys.add(k);
    });
    current = Object.getPrototypeOf(current);
  }
  return Array.from(keys);
};

export function useTemplate(templateString, contextObject) {
  const keys = getAllKeys(contextObject);
  const result = COMPILE(templateString, keys);

  const blueprint = (props = contextObject.props || {}) => {
    if (!contextObject.props) contextObject.props = {};
    if (!compareObjects(props, contextObject.props)) {
      Object.assign(contextObject.props, props);
    }
    return result.call(contextObject, contextObject, h, useComponent);
  };

  return blueprint;
}
