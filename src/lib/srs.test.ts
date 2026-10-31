import { describe, expect, it } from 'vitest';
import type { CardState } from './progress-schema';
import { isDue, MIN_EASE, nextInterval, reviewCard, START_EASE } from './srs';

const today = '2026-10-31';
const card = (over: Partial<CardState> = {}): CardState => ({
  ease: START_EASE,
  interval: 6,
  reps: 2,
  lapses: 0,
  due: today,
  ...over,
});

describe('reviewCard: first reviews', () => {
  it('a new word answered "good" is due tomorrow', () => {
    expect(reviewCard(undefined, 'good', today)).toEqual({
      ease: 2.5,
      interval: 1,
      reps: 1,
      lapses: 0,
      due: '2026-11-01',
    });
  });

  it('the second correct answer waits 6 days', () => {
    const first = reviewCard(undefined, 'good', today);
    expect(reviewCard(first, 'good', '2026-11-01')).toMatchObject({
      interval: 6,
      reps: 2,
      due: '2026-11-07',
    });
  });

  it('after that the interval grows by the ease factor', () => {
    expect(reviewCard(card({ interval: 6, reps: 2 }), 'good', today)).toMatchObject({
      interval: 15, // 6 × 2.5
      reps: 3,
      due: '2026-11-15',
    });
    expect(reviewCard(card({ interval: 15, reps: 3 }), 'good', today).interval).toBe(38); // 37.5 rounds up
  });
});

describe('reviewCard: grades', () => {
  it('"good" keeps the ease, "easy" raises it, "hard" lowers it', () => {
    expect(reviewCard(card(), 'good', today).ease).toBe(2.5);
    expect(reviewCard(card(), 'easy', today).ease).toBe(2.6);
    expect(reviewCard(card(), 'hard', today).ease).toBe(2.36);
  });

  it('never lets the ease fall below 1.3', () => {
    let c = card();
    for (let i = 0; i < 30; i++) c = reviewCard(c, 'hard', today);
    expect(c.ease).toBe(MIN_EASE);
  });

  it('"again" starts over: due tomorrow, reps reset, lapse counted, ease kept', () => {
    expect(reviewCard(card({ interval: 40, reps: 5, ease: 2.2 }), 'again', today)).toEqual({
      ease: 2.2,
      interval: 1,
      reps: 0,
      lapses: 1,
      due: '2026-11-01',
    });
  });

  it('failing a brand-new word is not a lapse', () => {
    expect(reviewCard(undefined, 'again', today)).toMatchObject({ reps: 0, lapses: 0 });
    // failing it again before ever getting it right is not a lapse either
    const failed = reviewCard(undefined, 'again', today);
    expect(reviewCard(failed, 'again', today).lapses).toBe(0);
  });

  it('after a lapse the word is relearned from 1 day, then 6', () => {
    const lapsed = reviewCard(card({ interval: 40, reps: 5 }), 'again', today);
    const next = reviewCard(lapsed, 'good', '2026-11-01');
    expect(next).toMatchObject({ interval: 1, reps: 1, lapses: 1 });
    expect(reviewCard(next, 'good', '2026-11-02').interval).toBe(6);
  });

  it('does not change the saved state it was given', () => {
    const before = card();
    const copy = { ...before };
    reviewCard(before, 'easy', today);
    expect(before).toEqual(copy);
  });
});

describe('nextInterval (for the button labels)', () => {
  it('matches what reviewCard does', () => {
    for (const grade of ['again', 'hard', 'good', 'easy'] as const) {
      expect(nextInterval(card(), grade)).toBe(reviewCard(card(), grade, today).interval);
      expect(nextInterval(undefined, grade)).toBe(reviewCard(undefined, grade, today).interval);
    }
  });
});

describe('isDue', () => {
  it('is due on the due date and after, not before', () => {
    expect(isDue(card({ due: '2026-10-30' }), today)).toBe(true);
    expect(isDue(card({ due: today }), today)).toBe(true);
    expect(isDue(card({ due: '2026-11-01' }), today)).toBe(false);
  });
});
