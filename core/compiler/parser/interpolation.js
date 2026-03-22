export function parseInterpolation(scanner) {
  //example: {{ path.to.value }}

  scanner.consume(2);
  const path = scanner.consumeUntil('}}').trim();
  return { type: 'interpolation', path: path };
}
