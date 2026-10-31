import { describe, expect, it } from 'vitest';
import sounds from '../content-shared/sounds.json';
import { soundsSchema } from './schemas';

const parsed = soundsSchema.parse(sounds);
const all = parsed.groups.flatMap((g) => g.sounds);

describe('sounds.json (pronunciation page)', () => {
  it('matches the schema', () => {
    expect(all.length).toBeGreaterThan(0);
  });

  it('has unique sound ids', () => {
    const ids = all.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // pending.md §4: every sound of the pronunciation table must be taught in Chapter 1
  it('covers every sound of the Gujarati pronunciation table', () => {
    const required = [
      'w',
      'v',
      'z',
      'j',
      's',
      'sp-st',
      'ei',
      'ie',
      'eu',
      'ae',
      'oe',
      'ue',
      'ch-ach',
      'ch-ich',
      'er',
    ];
    const ids = new Set(all.map((s) => s.id));
    expect(required.filter((id) => !ids.has(id))).toEqual([]);
  });

  it('says clearly that ö and ü have no exact Gujarati sound', () => {
    for (const id of ['oe', 'ue']) {
      expect(all.find((s) => s.id === id)?.approx).toBe(true);
    }
  });

  it('has a quiz', () => {
    expect(parsed.quiz.length).toBeGreaterThanOrEqual(5);
  });
});
