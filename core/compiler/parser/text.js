export function parseText(scanner, stopTokens = []) {
  if (typeof stopTokens === 'string') stopTokens = [stopTokens];
  let content = '';
  const breaks = ['<?', '{{', '<', '@', ...stopTokens];

  while (!scanner.eof()) {
    if (breaks.some(b => scanner.peek(b.length) === b)) break;
    content += scanner.consume(1);
  }
  return { type: 'text', content };
}