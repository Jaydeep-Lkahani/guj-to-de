/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Shuffle, but never return the original order (so a puzzle is never already solved). */
export function shuffleDifferent<T>(items: readonly T[], random: () => number = Math.random): T[] {
  if (items.length < 2 || new Set(items).size < 2) return [...items];
  let out = shuffle(items, random);
  while (out.every((item, i) => item === items[i])) out = shuffle(items, random);
  return out;
}
