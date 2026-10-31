import { describe, expect, it } from 'vitest';
import { formatMinutes } from './format';
import { tf } from './t';

describe('formatMinutes', () => {
  it('formats minutes, hours and both', () => {
    expect(formatMinutes(0)).toBe('0 મિનિટ');
    expect(formatMinutes(45)).toBe('45 મિનિટ');
    expect(formatMinutes(120)).toBe('2 કલાક');
    expect(formatMinutes(80)).toBe('1 કલાક 20 મિનિટ');
  });
});

describe('tf', () => {
  it('fills placeholders and leaves unknown ones alone', () => {
    expect(tf('chapter.testFailed', { n: 70 })).toContain('70%');
    expect(tf('chapter.lockedBody', { n: 3 })).toContain('{pass}');
  });
});
