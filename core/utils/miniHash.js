export const miniHash = (input) => {
  let hash1 = 0,
    hash2 = 0;
  const str = String(input);

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);

    hash1 = (hash1 << 5) - hash1 + char;
    hash1 |= 0;

    hash2 = (hash2 << 7) - hash2 + char;
    hash2 |= 0;
  }

  const part1 = hash1.toString(36);
  const part2 = hash2.toString(36);

  return part1 + part2;
};
