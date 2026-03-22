export function parseComponent(scanner) {
  scanner.consume(1); // Consume '@'
  let name = '';
  while (!scanner.eof() && scanner.peek(1) !== '(') {
    name += scanner.consume(1);
  }
  scanner.consume(1); // Consume '('
  const props = scanner.consumeUntil(')');
  return { type: 'component', name, props };
}
