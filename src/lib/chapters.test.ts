import { describe, expect, it } from 'vitest';
import { chapterNumber, chapterSlug, levelOf } from './chapters';

describe('chapters', () => {
  it('maps chapters to CEFR levels at the boundaries', () => {
    expect([1, 6, 7, 12, 13, 18, 19, 26].map(levelOf)).toEqual([
      'A1',
      'A1',
      'A2',
      'A2',
      'B1',
      'B1',
      'B2',
      'B2',
    ]);
  });

  it('rejects chapters outside 1–26', () => {
    expect(() => levelOf(0)).toThrow();
    expect(() => levelOf(27)).toThrow();
  });

  it('round-trips slugs', () => {
    expect(chapterSlug(3)).toBe('ch03');
    expect(chapterNumber('ch26')).toBe(26);
    expect(() => chapterNumber('ch1')).toThrow();
  });
});
