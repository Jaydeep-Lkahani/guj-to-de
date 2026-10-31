import { describe, expect, it } from 'vitest';
import { shuffle, shuffleDifferent } from './shuffle';

describe('shuffle', () => {
  it('keeps all items', () => {
    expect(shuffle([1, 2, 3, 4, 5]).sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('shuffleDifferent never returns the original order', () => {
    const words = ['Ich', 'bin', 'Raj.'];
    for (let i = 0; i < 50; i++) expect(shuffleDifferent(words)).not.toEqual(words);
  });

  it('shuffleDifferent copes with identical items', () => {
    expect(shuffleDifferent(['a', 'a'])).toEqual(['a', 'a']);
  });
});
