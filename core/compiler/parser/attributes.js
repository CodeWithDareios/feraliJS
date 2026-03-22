export function parseAttributes(attrString) {
  const attrs = [];
  const regex = /(#?[a-zA-Z0-9_\-]+)="([^"]*)"/g;
  let match;
  while ((match = regex.exec(attrString)) !== null) {
    attrs.push({ name: match[1], value: match[2] });
  }
  return attrs;
}
