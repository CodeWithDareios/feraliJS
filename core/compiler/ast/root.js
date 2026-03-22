import { generateNode } from './node.js';

export function generateRoot(nodes, isInsideJsBlock = false) {
  // Ignore empty whitespace nodes at the root level to prevent false multi-roots
  const validNodes = nodes.filter(
    (n) => !(n.type === 'text' && !n.content.trim())
  );

  if (validNodes.length === 1) {
    return generateNode(validNodes[0], isInsideJsBlock);
  } else if (validNodes.length > 1) {
    const childrenStr = validNodes.map(n => generateNode(n, isInsideJsBlock)).join(', ');
    return `h('div', null, [${childrenStr}])`;
  }
  return `null`;
}
