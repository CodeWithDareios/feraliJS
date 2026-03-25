import { createScanner } from './scanner.js';
import { parseNodes } from './parser/nodes.js';
import { generateRoot } from './ast/root.js';

export function compile(templateString, keys = []) {
  // 1. Scan and parse the template into an AST
  const scanner = createScanner(templateString);
  const ast = parseNodes(scanner);

  // 2. Generate the core javascript return string
  const returnedCodeString = generateRoot(ast);

  // 3. Wrap it in the requested function structure
  // Using __h and __useComponent to avoid collisions with destructured user variables.
  const destructuring = keys.length > 0
    ? `const { ${keys.join(', ')} } = contextObject;`
    : '';

  const functionBody = `
    return function bluePrint(contextObject, __h, __useComponent) {
      ${destructuring}
      return ${returnedCodeString};
    };
  `;

  // 4. Instantiate and return the executable function closure
  return new Function(functionBody)();
}
