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
      chunks.push(parseHtmlInJs(scanner));
    } else {
      currentText += scanner.consume(1);
    }
  }
  return { type: 'js_block', chunks };
}