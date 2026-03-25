/**
 * @fileoverview Defines the VNode (Virtual DOM Node) class and its factory function.
 * VNodes are the building blocks of Ferali's virtual DOM tree.
 */

/**
 * Represents a node in the Virtual DOM tree.
 */
export class VNode {
  /**
   * @param {string} tag - The HTML tag name (e.g., 'div', 'span') or a special identity symbol.
   * @param {Object|null} props - An object of HTML attributes and event listeners.
   * @param {VNode[]|string} children - Child VNodes, or a plain string for text nodes.
   */
  constructor(tag, props, children) {
    this.tag = tag;
    this.props = props || {};
    this.children = children;
    /** @type {HTMLElement|Text|null} The real DOM element corresponding to this VNode, set during build. */
    this.ell = null;
  }
}

/**
 * Creates a new VNode instance.
 * @param {string} tag - The HTML tag name.
 * @param {Object|null} props - Props object.
 * @param {VNode[]|string} children - Children array or text string.
 * @returns {VNode}
 */
export function createVNode(tag, props, children) {
  return new VNode(tag, props, children);
}
