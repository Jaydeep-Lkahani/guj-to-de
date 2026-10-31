import { describe, expect, it } from 'vitest';
import {
  buildSession,
  deckCounts,
  deckWords,
  dueOn,
  recordReview,
  wordsForMode,
  type DeckWord,
} from './deck';
import { addDays, completeLesson } from './progress-logic';
import { emptyProgress, type ProgressData } from './progress-schema';
import type { Grade } from './srs';

function word(lesson: string, name: string, gender: DeckWord['gender'] = 'der'): DeckWord {
  return {
    id: `${lesson}-${name}`,
    lessonId: lesson,
    de: name,
    gender,
    gu: `gu-${name}`,
    example_de: `Das ist ${name}.`,
    example_gu: `gu-ex-${name}`,
  };
}

const words = [
  word('ch01-l01', 'hallo', null),
  word('ch01-l01', 'mann'),
  word('ch01-l01', 'frau', 'die'),
  word('ch01-l02', 'haus', 'das'),
  word('ch01-l02', 'danke', null),
];

const day0 = '2026-10-31';
const at = (date: string) => new Date(`${date}T10:00:00`);
const withLesson = (data: ProgressData, lesson: string, date = day0) =>
  completeLesson(data, lesson, at(date));

describe('deckWords', () => {
  it('is empty until a lesson is completed', () => {
    expect(deckWords(words, emptyProgress())).toEqual([]);
  });

  it('adds the words of a lesson when it is completed', () => {
    const data = withLesson(emptyProgress(), 'ch01-l01');
    expect(deckWords(words, data).map((w) => w.de)).toEqual(['hallo', 'mann', 'frau']);
    const both = withLesson(data, 'ch01-l02');
    expect(deckWords(words, both)).toHaveLength(5);
  });
});

describe('wordsForMode', () => {
  it('article mode keeps only nouns', () => {
    expect(wordsForMode(words, 'article').map((w) => w.de)).toEqual(['mann', 'frau', 'haus']);
    expect(wordsForMode(words, 'de-gu')).toHaveLength(5);
  });
});

describe('deckCounts and buildSession', () => {
  it('shows new words first, capped per session', () => {
    const data = withLesson(withLesson(emptyProgress(), 'ch01-l01'), 'ch01-l02');
    expect(deckCounts(words, data, 'de-gu', day0)).toEqual({ due: 0, fresh: 5, learned: 0 });
    expect(buildSession(words, data, 'de-gu', day0, 2).map((w) => w.de)).toEqual(['hallo', 'mann']);
  });

  it('keeps the modes separate', () => {
    let data = withLesson(emptyProgress(), 'ch01-l01');
    data = recordReview(data, 'de-gu', 'ch01-l01-mann', 'good', day0);
    expect(deckCounts(words, data, 'de-gu', day0).learned).toBe(1);
    expect(deckCounts(words, data, 'gu-de', day0).learned).toBe(0);
  });

  it('puts due words before new ones, most overdue first', () => {
    let data = withLesson(emptyProgress(), 'ch01-l01');
    data = recordReview(data, 'de-gu', 'ch01-l01-frau', 'again', '2026-10-29'); // due 10-30
    data = recordReview(data, 'de-gu', 'ch01-l01-mann', 'again', '2026-10-27'); // due 10-28
    expect(buildSession(words, data, 'de-gu', day0).map((w) => w.de)).toEqual([
      'mann',
      'frau',
      'hallo',
    ]);
    expect(deckCounts(words, data, 'de-gu', day0)).toEqual({ due: 2, fresh: 1, learned: 2 });
  });

  it('does not show words that are not due yet', () => {
    let data = withLesson(emptyProgress(), 'ch01-l01');
    for (const w of ['hallo', 'mann', 'frau']) {
      data = recordReview(data, 'de-gu', `ch01-l01-${w}`, 'good', day0);
    }
    expect(buildSession(words, data, 'de-gu', day0)).toEqual([]);
    expect(buildSession(words, data, 'de-gu', '2026-11-01')).toHaveLength(3);
  });

  it('article session has nouns only', () => {
    const data = withLesson(emptyProgress(), 'ch01-l01');
    expect(buildSession(words, data, 'article', day0).map((w) => w.de)).toEqual(['mann', 'frau']);
  });

  it('ignores schedules of words that no longer exist', () => {
    let data = withLesson(emptyProgress(), 'ch01-l01');
    data = recordReview(data, 'de-gu', 'ch01-l01-gone', 'again', '2026-10-01');
    expect(buildSession(words, data, 'de-gu', day0).map((w) => w.de)).toEqual([
      'hallo',
      'mann',
      'frau',
    ]);
  });
});

describe('due cards over simulated days', () => {
  /** Study every day: answer everything in the session with `grade`, return the words shown per day. */
  function simulate(days: number, grade: Grade) {
    let data = withLesson(emptyProgress(), 'ch01-l01');
    const shown: string[][] = [];
    for (let i = 0; i < days; i++) {
      const today = addDays(day0, i);
      const session = buildSession(words, data, 'de-gu', today);
      shown.push(session.map((w) => w.de));
      for (const w of session) data = recordReview(data, 'de-gu', w.id, grade, today);
    }
    return shown;
  }

  it('answering "good" every time: day 0 new, day 1, day 7, day 22 …', () => {
    const shown = simulate(40, 'good');
    const daysWithCards = shown.flatMap((s, i) => (s.length > 0 ? [i] : []));
    // day 0 new → +1 day → +6 days → +15 days (6 × 2.5) → +38 days
    expect(daysWithCards).toEqual([0, 1, 7, 22]);
    expect(shown[1]).toEqual(['hallo', 'mann', 'frau']);
  });

  it('a word answered "again" comes back the next day, others wait', () => {
    let data = withLesson(emptyProgress(), 'ch01-l01');
    data = recordReview(data, 'de-gu', 'ch01-l01-hallo', 'good', day0);
    data = recordReview(data, 'de-gu', 'ch01-l01-mann', 'again', day0);
    data = recordReview(data, 'de-gu', 'ch01-l01-frau', 'good', day0);
    // both are due tomorrow in SM-2 (first good = 1 day, again = 1 day) …
    expect(dueOn(data, 'de-gu', '2026-11-01')).toBe(3);
    // … but after a successful second review the good words move to 6 days, the failed one to 1 day
    for (const [id, grade] of [
      ['ch01-l01-hallo', 'good'],
      ['ch01-l01-mann', 'good'],
      ['ch01-l01-frau', 'good'],
    ] as const) {
      data = recordReview(data, 'de-gu', id, grade, '2026-11-01');
    }
    expect(data.cards['de-gu']['ch01-l01-hallo']!.due).toBe('2026-11-07');
    expect(data.cards['de-gu']['ch01-l01-mann']!.due).toBe('2026-11-02');
  });

  it('overdue words stay due until they are reviewed', () => {
    const data = recordReview(
      withLesson(emptyProgress(), 'ch01-l01'),
      'de-gu',
      'ch01-l01-mann',
      'good',
      day0,
    );
    expect(buildSession(words, data, 'de-gu', '2026-12-31').map((w) => w.de)).toContain('mann');
  });
});

describe('recordReview', () => {
  it('does not change the data it was given', () => {
    const before = emptyProgress();
    const after = recordReview(before, 'article', 'x', 'good', day0);
    expect(before.cards.article).toEqual({});
    expect(after.cards.article.x).toBeDefined();
  });
});
