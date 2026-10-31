import { describe, expect, it } from 'vitest';
import { findBannedWords, scanDir } from './banned-words';

describe('findBannedWords', () => {
  it('flags English and Gujarati forms', () => {
    expect(findBannedWords('Phase 1')).toHaveLength(1);
    expect(findBannedWords('પહેલો તબક્કો')).toHaveLength(1);
  });

  it('passes clean text', () => {
    expect(findBannedWords('પ્રકરણ 1 · પાઠ 2')).toEqual([]);
  });
});

describe('src tree', () => {
  it('contains no banned words', () => {
    expect(scanDir('src')).toEqual([]);
  });
});
