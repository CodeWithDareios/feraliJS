export function createScanner(input) {
  let pos = 0;
  return {
    eof: () => pos > input.length,
    peek: (len = 1) => input.substr(pos, len),
    consume: (len = 1) => {
      const str = input.substr(pos, len);
      pos += len;
      return str;
    },
    consumeUntil: (targetStr) => {
      const idx = input.indexOf(targetStr, pos);

      if (idx === -1) {
        const res = input.slice(pos);
        pos = input.length;
        return res;
      }
      const res = input.slice(pos, idx);
      pos = idx + targetStr.length;
      return res;
    },
  };
}
