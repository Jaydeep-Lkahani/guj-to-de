import { describe, expect, it } from 'vitest';
import { checkAnswer, checkOrder, fold, normalize } from './answer-check';

describe('normalize', () => {
  it('trims, collapses spaces and drops final punctuation', () => {
    expect(normalize('  Ich   bin\tRaj. ')).toBe('Ich bin Raj');
    expect(normalize('Wie geht es dir?!')).toBe('Wie geht es dir');
    expect(normalize('Hallo …')).toBe('Hallo');
  });

  it('keeps punctuation inside the sentence', () => {
    expect(normalize('Hallo, ich bin Anna.')).toBe('Hallo, ich bin Anna');
  });

  it('unifies decomposed umlauts and non-breaking spaces', () => {
    expect(normalize('Männer')).toBe('Männer');
    expect(normalize('ich bin')).toBe('ich bin');
  });
});

describe('fold', () => {
  it('maps umlauts and ß to their two-letter spellings', () => {
    expect(fold('Äpfel Öl Übung Straße')).toBe('aepfel oel uebung strasse');
  });
});

describe('checkAnswer: basics', () => {
  it('accepts the exact answer', () => {
    expect(checkAnswer('bin', ['bin'])).toMatchObject({ correct: true, spellingNote: false });
  });

  it('rejects a wrong answer and reports the first accepted one', () => {
    expect(checkAnswer('bist', ['bin'])).toEqual({
      correct: false,
      canonical: 'bin',
      spellingNote: false,
    });
  });

  it('rejects empty input', () => {
    expect(checkAnswer('   ', ['bin']).correct).toBe(false);
  });

  it('matches any of several accepted answers', () => {
    const result = checkAnswer('Ich komme aus Indien', [
      'Ich komme aus Gujarat',
      'Ich komme aus Indien.',
    ]);
    expect(result).toMatchObject({ correct: true, canonical: 'Ich komme aus Indien.' });
  });

  it('ignores final punctuation, extra spaces and surrounding whitespace', () => {
    expect(checkAnswer('  ich   bin Raj ', ['Ich bin Raj.']).correct).toBe(true);
    expect(checkAnswer('Ich bin Raj!!', ['Ich bin Raj.']).correct).toBe(true);
  });

  it('keeps a comma inside the sentence significant', () => {
    expect(checkAnswer('Hallo ich bin Anna', ['Hallo, ich bin Anna.']).correct).toBe(false);
  });
});

describe('checkAnswer: case', () => {
  it('ignores case for non-nouns', () => {
    expect(checkAnswer('BIN', ['bin']).correct).toBe(true);
    expect(checkAnswer('du BIST Priya', ['Du bist Priya.']).correct).toBe(true);
  });

  it('lets the first word of a sentence be lower-case', () => {
    expect(checkAnswer('ich bin Raj', ['Ich bin Raj.']).correct).toBe(true);
  });

  it('requires nouns inside a sentence to be capitalised', () => {
    const result = checkAnswer('ich bin raj', ['Ich bin Raj.']);
    expect(result).toMatchObject({
      correct: false,
      reason: 'noun-capital',
      canonical: 'Ich bin Raj.',
    });
  });

  it('requires a single-word noun answer to be capitalised', () => {
    expect(checkAnswer('tisch', ['Tisch'])).toMatchObject({
      correct: false,
      reason: 'noun-capital',
    });
    expect(checkAnswer('Tisch', ['Tisch']).correct).toBe(true);
  });

  it('lets a gap at the start of a sentence be lower-case via sentenceStart', () => {
    expect(checkAnswer('ich', ['Ich'], { sentenceStart: true }).correct).toBe(true);
    expect(checkAnswer('ich', ['Ich'], { sentenceStart: false }).correct).toBe(false);
  });

  it('accepts an all-capitals answer only where capitals are allowed anyway', () => {
    expect(checkAnswer('ICH BIN RAJ', ['Ich bin Raj.']).correct).toBe(true);
  });
});

describe('checkAnswer: umlauts', () => {
  it('accepts ae/oe/ue/ss and asks the UI to show the correct spelling', () => {
    const result = checkAnswer('Maenner', ['Männer']);
    expect(result).toEqual({ correct: true, canonical: 'Männer', spellingNote: true });
    expect(checkAnswer('Strasse', ['Straße'])).toMatchObject({ correct: true, spellingNote: true });
    expect(checkAnswer('schoen', ['schön'])).toMatchObject({ correct: true, spellingNote: true });
    expect(checkAnswer('fuer', ['für'])).toMatchObject({ correct: true, spellingNote: true });
  });

  it('shows no spelling note when the umlaut is typed correctly', () => {
    expect(checkAnswer('Männer', ['Männer']).spellingNote).toBe(false);
  });

  it('does not accept a missing umlaut', () => {
    expect(checkAnswer('Manner', ['Männer']).correct).toBe(false);
    expect(checkAnswer('fur', ['für']).correct).toBe(false);
  });

  it('accepts the ae spelling inside a sentence', () => {
    expect(checkAnswer('Ich esse Aepfel', ['Ich esse Äpfel.'])).toMatchObject({
      correct: true,
      spellingNote: true,
    });
  });

  it('still enforces noun capitals on the ae spelling', () => {
    expect(checkAnswer('Ich esse aepfel', ['Ich esse Äpfel.'])).toMatchObject({
      correct: false,
      reason: 'noun-capital',
    });
  });
});

describe('checkOrder', () => {
  it('compares the built words with the answer', () => {
    expect(checkOrder(['Ich', 'bin', 'Raj.'], 'Ich bin Raj.')).toBe(true);
    expect(checkOrder(['bin', 'Ich', 'Raj.'], 'Ich bin Raj.')).toBe(false);
  });

  it('handles words that contain a space', () => {
    expect(checkOrder(['Ich', 'bin', 'zu Hause.'], 'Ich bin zu Hause.')).toBe(true);
  });
});
