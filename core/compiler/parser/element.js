import { parseAttributes } from './attributes.js';
import { parseNodes } from './nodes.js';

export function parseElement(scanner, outerStopTokens = []) {
  scanner.consume(1); // Consume '<'

  let tag = '';
  while (!scanner.eof() && !/\s|>/.test(scanner.peek(1))) {
    tag += scanner.consume(1);
  }

  let attrsStr = '';
  while (!scanner.eof() && scanner.peek(1) !== '>') {
    attrsStr += scanner.consume(1);
  }
  scanner.consume(1); // Consume '>'

  const voidElements = [
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ];

  let children = [];
  if (!voidElements.includes(tag.toLowerCase())) {
    const stopToken = `</${tag}>`;
    // Pass both the current stop token AND any outer stop tokens (like ?> or }>)
    children = parseNodes(scanner, [stopToken, ...outerStopTokens]); 
    
    // Only consume the closing tag if we actually stopped for it
    if (scanner.peek(stopToken.length) === stopToken) {
       scanner.consumeUntil('>'); 
    }
  }

  return {
    type: 'element',
    tag,
    attributes: parseAttributes(attrsStr),
    children,
  };
}
