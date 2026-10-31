import { describe, expect, it } from 'vitest';
import ui from '../content-shared/ui-gu.json';
import { t } from './t';

function leaves(node: unknown, path = ''): [string, unknown][] {
  if (typeof node === 'object' && node !== null) {
    return Object.entries(node).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k));
  }
  return [[path, node]];
}

describe('t()', () => {
  it('returns the standard Gujarati words from pending.md §5', () => {
    expect(t('words.chapter')).toBe('પ્રકરણ');
    expect(t('words.lesson')).toBe('પાઠ');
    expect(t('words.checkAnswer')).toBe('જવાબ તપાસો');
  });

  it('has a non-empty string for every key', () => {
    for (const [key, value] of leaves(ui)) {
      expect(typeof value, key).toBe('string');
      expect((value as string).trim(), key).not.toBe('');
    }
  });

  it('throws for an unknown key', () => {
    // @ts-expect-error deliberately invalid key
    expect(() => t('nope.missing')).toThrow();
  });
});
