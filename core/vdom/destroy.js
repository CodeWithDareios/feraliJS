/**
 * @fileoverview VDOM destruction pass — recursively removes a VNode subtree
 * from the DOM and nullifies all references to aid garbage collection.
 */

/**
 * Recursively destroys a VNode and all its children. Removes event listeners,
 * attributes, and DOM elements. For component nodes, delegates to the
 * component's own `destroy()` lifecycle method.
 *
 * @param {import('../node/vnode.js').VNode} dom - The VNode to destroy.
 * @returns {Promise<void>}
 */
export async function DESTROY_DOM(dom) {
  if (dom.isComponent) {
    dom.props = null;
    await dom.component.destroy();
    dom.component = null;
  } else {
    if (typeof dom.children === 'string') {
      dom.ell = null;
    } else {
      for (const attribute of Object.keys(dom.props)) {
        if (attribute.startsWith('on') && typeof dom.props[attribute] === 'function') {
          dom.ell.removeEventListener(
            attribute.replace('on', '').toLowerCase(),
            dom.props[attribute]
          );
        } else {
          dom.ell.removeAttribute(attribute);
        }
      }

      for (let i = 0; i < dom.children.length; i++) {
        const child = dom.children[i];
        const domNode = child.isComponent ? child.component.getCurrentDOM().ell : child.ell;
        if (domNode) domNode.remove();
        await DESTROY_DOM(child);
      }
    }
  }
}
