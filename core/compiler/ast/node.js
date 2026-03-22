import { generatePathRef } from './pathRef.js';
import { generateAttributes } from './attributes.js';
import { generateRoot } from './root.js';
import { compileProps } from '../parser/props.js';

export function generateNode(node, isInsideJsBlock = false) {
  switch (node.type) {
    case 'element':
      const attrs = generateAttributes(node.attributes, isInsideJsBlock);
      const children = node.children.map(n => generateNode(n, isInsideJsBlock)).join(', ');
      return `h('${node.tag}', {${attrs}}, [${children}])`;

    case 'text':
      // Escape backticks and newlines for safe template literals
      const safeText = node.content.replace(/`/g, '\\`').replace(/\n/g, '\\n');
      return `\`${safeText}\``;

    case 'interpolation':
      return `\`\${${generatePathRef(node.path, isInsideJsBlock)}}\``;

    case 'component':
      const props = compileProps(node.props.trim() || '{}', isInsideJsBlock);
      const compName = isInsideJsBlock ? node.name : `contextObject['${node.name}']`;
      return `useComponent(${compName}, ${props})`;

    case 'js_block':
      const jsContent = node.chunks
        .map((chunk) => {
          if (chunk.type === 'js_text') return chunk.content.trim();
          if (chunk.type === 'html_in_js') {
            return generateRoot(chunk.nodes, true);
          }
        })
        .join('');
      return `(function(contextObject){
        with(contextObject) {
          return ${jsContent} 
        }
      }).call(contextObject, contextObject)`; // Auto-run function

    default:
      return 'null';
  }
}
