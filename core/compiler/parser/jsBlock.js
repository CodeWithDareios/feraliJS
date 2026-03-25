/**
 * @fileoverview Parser for `<? ?>` JavaScript blocks in Ferali templates.
 *
 * JS blocks allow arbitrary JavaScript expressions to be embedded directly
 * in a template, e.g. `<? items.map(item => <{ <li>{{ item }}</li> }>) ?>`.
 *
 * **⚠ Strict-mode limitation:** The content of a `<? ?>` block is compiled
 * into an IIFE that uses `with(contextObject)` to expose template variables
 * without requiring an explicit `contextObject.` prefix. Because `with` is
 * forbidden in strict mode, **JS blocks are incompatible with `"use strict"`**.
 * Do not place `"use strict"` inside a `<? ?>` block, and be aware that
 * hosting environments that enforce strict mode globally may cause errors.
 *
 * **⚠ Variable scoping:** Any `let` or `const` declared inside one `<? ?>`
 * block is scoped to that block's IIFE and is **not** visible in sibling or
 * subsequent `<? ?>` blocks. Use the template context object to share data
 * across blocks.
 */
import {parseHtmlInJs} from './htmlInJS.js';

export function parseJsBlock(scanner) {
  scanner.consume(2); // Consume '<?js'
  const chunks = [];
  let currentText = '';

  while (!scanner.eof()) {
    if (scanner.peek(2) === '?>') {
      scanner.consume(2);
      if (currentText) chunks.push({ type: 'js_text', content: currentText });
      break;
    } else if (scanner.peek(2) === '<{') {
      if (currentText) chunks.push({ type: 'js_text', content: currentText });
      currentText = '';
      chunks.push(parseHtmlInJs(scanner, ['?>']));
    } else {
      currentText += scanner.consume(1);
    }
  }
  return { type: 'js_block', chunks };
}