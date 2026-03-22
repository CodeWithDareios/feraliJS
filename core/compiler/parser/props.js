import { generatePathRef } from '../ast/pathRef.js';

export function compileProps(propsString, isInsideJsBlock = false) {
  return propsString.replace(
    /\{\{(.*?)\}\}/g,
    (_, expr) =>
      `${generatePathRef(expr.replace('{{', '').replace('}}', '').trim(), isInsideJsBlock)}`
  );
}
