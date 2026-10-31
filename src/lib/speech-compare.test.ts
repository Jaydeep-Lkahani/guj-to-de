import { describe, expect, it } from 'vitest';
import { compareSpeech, levenshtein, similarity, tokens } from './speech-compare';

describe('tokens', () => {
  it('lower-cases, strips punctuation and folds umlauts', () => {
    expect(tokens('Hallo, ich bin Anna!')).toEqual(['hallo', 'ich', 'bin', 'anna']);
    expect(tokens('Ich heiße Müller.')).toEqual(['ich', 'heisse', 'mueller']);
  });

  it('can spell out digits the recogniser wrote as numbers', () => {
    expect(tokens('ich habe 2 Brüder', true)).toEqual(['ich', 'habe', 'zwei', 'brueder']);
    expect(tokens('ich habe 2 Brüder')).toContain('2');
    expect(tokens('es ist 25', true)).toContain('25');
  });
});

describe('levenshtein / similarity', () => {
  it('counts edits', () => {
    expect(levenshtein('haus', 'haus')).toBe(0);
    expect(levenshtein('haus', 'maus')).toBe(1);
    expect(levenshtein('', 'abc')).toBe(3);
  });

  it('scores similarity from 0 to 1', () => {
    expect(similarity('haus', 'haus')).toBe(1);
    expect(similarity('abc', 'xyz')).toBe(0);
    expect(similarity('', '')).toBe(1);
  });
});

describe('compareSpeech', () => {
  it('passes an exact match regardless of case and punctuation', () => {
    const r = compareSpeech('Hallo, ich bin Raj.', ['hallo ich bin raj']);
    expect(r.score).toBe(1);
    expect(r.passed).toBe(true);
    expect(r.words.every((w) => w.ok)).toBe(true);
  });

  it('keeps the target spelling in the word list', () => {
    expect(compareSpeech('Ich heiße Anna.', ['ich heisse anna']).words.map((w) => w.word)).toEqual([
      'Ich',
      'heiße',
      'Anna.',
    ]);
  });

  it('marks the words that were missed', () => {
    const r = compareSpeech('Ich komme aus Indien', ['ich komme aus']);
    expect(r.words.map((w) => w.ok)).toEqual([true, true, true, false]);
    expect(r.score).toBe(0.75);
    expect(r.passed).toBe(false);
  });

  it('tolerates one missed word in a long sentence', () => {
    const r = compareSpeech('Ich wohne seit zwei Jahren in Berlin', [
      'ich wohne seit zwei jahren berlin',
    ]);
    expect(r.score).toBeCloseTo(6 / 7);
    expect(r.passed).toBe(true);
  });

  it('ignores extra words that were heard', () => {
    expect(compareSpeech('Ich bin Raj', ['ähm ich bin raj ja']).passed).toBe(true);
  });

  it('forgives small recogniser slips in longer words but not in short ones', () => {
    expect(compareSpeech('Ich wohne in Frankfurt', ['ich wohne in frankfurter']).passed).toBe(true);
    expect(compareSpeech('Ich bin Raj', ['ich bist raj']).passed).toBe(false);
  });

  it('counts word order', () => {
    const r = compareSpeech('Ich bin Raj', ['raj bin ich']);
    expect(r.score).toBeLessThan(1);
    expect(r.passed).toBe(false);
  });

  it('keeps the best of several alternatives', () => {
    const r = compareSpeech('Ich bin Raj', ['ich bin rage', 'ich bin raj']);
    expect(r.heard).toBe('ich bin raj');
    expect(r.passed).toBe(true);
  });

  it('accepts digits for number words', () => {
    expect(compareSpeech('Ich habe zwei Brüder', ['ich habe 2 brüder']).passed).toBe(true);
  });

  it('fails on nothing heard', () => {
    const r = compareSpeech('Hallo', []);
    expect(r).toMatchObject({ score: 0, passed: false, heard: '' });
    expect(compareSpeech('Hallo', ['']).passed).toBe(false);
  });
});
