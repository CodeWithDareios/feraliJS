import {generatePathRef} from './pathRef.js';

export function generateAttributes(attrs, isInsideJsBlock = false) {
  const mapped = attrs.map(attr => {
    if (attr.name.startsWith('#')) {
      let eventName = attr.name.substring(1).toLowerCase();
      if (eventName.startsWith('on')) eventName = eventName.substring(2);
      const key = 'on' + eventName;
      const rawValue = attr.value.replace(/\{\{/g, '').replace(/\}\}/g, '').trim();
      return `"${key}": ${generatePathRef(rawValue, isInsideJsBlock)}`; // Active reference
    }
    return `"${attr.name}": "${attr.value}"`; // Static string
  });
  return mapped.join(', ');
}