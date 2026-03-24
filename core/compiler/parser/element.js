import { parseAttributes } from './attributes.js';
import { parseNodes } from './nodes.js';

export function parseElement(scanner) {
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
    children = parseNodes(scanner, `</${tag}>`); // Recursively parse children
    scanner.consumeUntil('>'); // Clear out the rest of the closing tag
  }

  return {
    type: 'element',
    tag,
    attributes: parseAttributes(attrsStr),
    children,
  };
}
