export class VNode {
  constructor(tag, props, children) {
    this.tag = tag;
    this.props = props || {};
    this.children = children;
    this.ell = null;
  }
}

export function createVNode(tag, props, children) {
  return new VNode(tag, props, children);
}
