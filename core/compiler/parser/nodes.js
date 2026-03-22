import { parseJsBlock } from './jsBlock.js';
import { parseInterpolation } from './interpolation.js';
import { parseComponent } from './component.js';
import { parseElement } from './element.js';
import { parseText } from './text.js';

import { TEXT } from '../../node/identity.js';

export function parseNodes(scanner, endToken = null) {
  const nodes = [];
  while (!scanner.eof()) {
    if (endToken && scanner.peek(endToken.length) === endToken) break;

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
      nodes.push(parseElement(scanner));
    } else {
      const Text = parseText(scanner, endToken);
      if (Text.content.trim() != 0) {
        nodes.push(Text);
      }
    }
  }
  return nodes;
}
