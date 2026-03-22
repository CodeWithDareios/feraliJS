export function parsePath(pathString) {
  //example path: "a.b.c" -> ["a", "b", "c"]
  return pathString
    .split('.')
    .map((p) => p.trim())
    .filter(Boolean);
}
