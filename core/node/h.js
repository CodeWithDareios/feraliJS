import { isArray, isString, isNumber } from '../utils/utils.js';

import { FRAGMENT, TEXT } from './identity.js';
import { createVNode } from './vnode.js';

export function h(tag, props = null, children = null) {
  if (tag === TEXT) return createVNode(TEXT, props, String(children));

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
  children = processedChildren;

  return createVNode(tag, props, children);
}
