export function cloneObject(val) {
  // 1. Handle non-objects (null, strings, numbers, etc.)
  if (val === null || typeof val !== 'object') {
    return val;
  }

  // 2. Handle Dates and Regex (Optional but safe)
  if (val instanceof Date) return new Date(val.getTime());
  if (val instanceof RegExp) return new RegExp(val.source, val.flags);

  // 3. Handle Arrays
  if (Array.isArray(val)) {
    const cloneArr = [];
    for (let i = 0; i < val.length; i++) {
      cloneArr[i] = cloneObject(val[i]);
    }
    return cloneArr;
  }

  // 4. Handle Objects
  const cloneObj = {};
  for (const key in val) {
    cloneObj[key] = cloneObject(val[key]);
  }

  return cloneObj;
}
