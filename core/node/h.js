/**
 * @fileoverview The `h` (hyperscript) function — the core factory for building VNode trees.
 * Handles flattening, text-node merging, and normalization of children.
 */

import { isArray, isString, isNumber } from '../utils/utils.js';
import { FRAGMENT, TEXT } from './identity.js';
import { createVNode } from './vnode.js';
import { currentComponent } from '../hooks/storage.js';

/**
 * Creates a VNode descriptor. This is the core primitive used by the compiler
 * output to construct the virtual DOM tree.
 *
 * @param {string|symbol} tag - The element tag name or a special identity (TEXT, FRAGMENT).
 * @param {Object|null} props - HTML attributes and event listener map.
 * @param {any[]|null} children - Raw children, which may be strings, numbers, or nested VNodes.
 * @returns {import('./vnode.js').VNode}
 */
export function h(tag, props = null, children = null) {
  if (tag === TEXT) return createVNode(TEXT, props, String(children));

  // Auto-scoping for localized components (using componentID for shared scoping)
  const comp = currentComponent.component;
  if (comp && comp.getConfig()?.style?.localized) {
    props = props || {};
    props['ferali-cid'] = comp.INFO().__componentID;
  }

  if (children === null) children = [];
  else if (!isArray(children)) children = [children];

  const flattened = children.flat(Infinity);
  const processedChildren = [];
  let currentString = [];

  for (let i = 0; i < flattened.length; i++) {
    const child = flattened[i];
    if (isString(child) || isNumber(child)) {
      currentString.push(String(child));
    } else {
      if (currentString.length > 0) {
        processedChildren.push(createVNode(TEXT, null, currentString.join(' ')));
        currentString = [];
      }
      processedChildren.push(child);
    }
  }

  if (currentString.length > 0) {
    processedChildren.push(createVNode(TEXT, null, currentString.join(' ')));
  }

  return createVNode(tag, props, processedChildren);
}
