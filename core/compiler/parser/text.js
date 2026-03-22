export function parseText(scanner, endToken) {
  let content = '';
  const breaks = ['<?js', '{{', '<{', '<', '@'];
  if (endToken) breaks.push(endToken);

  while (!scanner.eof()) {
    if (breaks.some(b => scanner.peek(b.length) === b)) break;
    content += scanner.consume(1);
  }
  return { type: 'text', content };
}