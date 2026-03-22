import {generatePathRef} from './pathRef.js';

export function generateAttributes(attrs, isInsideJsBlock = false) {
  const mapped = attrs.map(attr => {
    if (attr.name.startsWith('#')) {
      const key = attr.name.substring(1);
      const rawValue = attr.value.replace(/\{\{/g, '').replace(/\}\}/g, '').trim();
      return `"${key}": ${generatePathRef(rawValue, isInsideJsBlock)}`; // Active reference
    }
    return `"${attr.name}": "${attr.value}"`; // Static string
  });
  return mapped.join(', ');
}