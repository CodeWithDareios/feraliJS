import { parseJsBlock } from './jsBlock.js';
import { parseInterpolation } from './interpolation.js';
import { parseComponent } from './component.js';
import { parseElement } from './element.js';
import { parseText } from './text.js';

import { TEXT } from '../../node/identity.js';

export function parseNodes(scanner, stopTokens = []) {
  if (typeof stopTokens === 'string') stopTokens = [stopTokens];
  const nodes = [];
  while (!scanner.eof()) {
    if (stopTokens.some(t => scanner.peek(t.length) === t)) break;

    if (scanner.peek(2) === '<?') {
      nodes.push(parseJsBlock(scanner));
    } else if (scanner.peek(2) === '{{') {
      nodes.push(parseInterpolation(scanner));
    } else if (scanner.peek(1) === '@') {
      nodes.push(parseComponent(scanner));
    } else if (
      scanner.peek(1) === '<' &&
      scanner.peek(2) !== '</' &&
      scanner.peek(2) !== '<{'
    ) {
      nodes.push(parseElement(scanner, stopTokens));
    } else {
      const Text = parseText(scanner, stopTokens);
      if (Text.content.trim().length > 0) {
        nodes.push(Text);
      }
    }
  }
  return nodes;
}
