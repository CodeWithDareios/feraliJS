import { parseNodes } from './nodes.js';

export function parseHtmlInJs(scanner, outerStopTokens = []) {
  scanner.consume(2); // Consume '<{'
  const nodes = parseNodes(scanner, ['}>', ...outerStopTokens]); // Recursively use normal parser
  scanner.consume(2); // Consume '}>'
  return { type: 'html_in_js', nodes };
}
