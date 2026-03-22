import { parsePath } from '../parser/objectPath.js';

export function generatePathRef(pathString, isInsideJsBlock = false) {
  if (isInsideJsBlock) {
    return pathString;
  }
  const parts = parsePath(pathString);
  return 'contextObject' + parts.map((p) => `['${p}']`).join('');
}
