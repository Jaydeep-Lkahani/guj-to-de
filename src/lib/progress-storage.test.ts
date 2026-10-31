import { describe, expect, it } from 'vitest';
import { addStudySeconds, completeLesson } from './progress-logic';
import { emptyProgress } from './progress-schema';
import { CORRUPT_KEY, readProgress, STORAGE_KEY, writeProgress } from './progress-storage';

function fakeStorage(initial: Record<string, string> = {}) {
  const items = { ...initial };
  return {
    items,
    getItem: (k: string) => items[k] ?? null,
    setItem: (k: string, v: string) => {
      items[k] = v;
    },
  };
}

describe('progress storage', () => {
  it('starts empty when nothing is saved', () => {
    expect(readProgress(fakeStorage())).toEqual(emptyProgress());
  });

  it('reads back what was written (survives a reload)', () => {
    const storage = fakeStorage();
    let data = completeLesson(emptyProgress(), 'ch01-l01', new Date('2026-10-31T10:00:00'));
    data = addStudySeconds(data, '2026-10-31', 600);
    expect(writeProgress(storage, data)).toBe(true);
    expect(readProgress(storage)).toEqual(data); // a new read = a page reload
  });

  it('keeps unreadable data in a backup key instead of losing it', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: '{"version":1,"lessons":"broken"' });
    expect(readProgress(storage)).toEqual(emptyProgress());
    expect(storage.items[CORRUPT_KEY]).toBe('{"version":1,"lessons":"broken"');
  });

  it('also backs up data that parses but is invalid', () => {
    const bad = JSON.stringify({ ...emptyProgress(), studySeconds: { x: 1 } });
    const storage = fakeStorage({ [STORAGE_KEY]: bad });
    expect(readProgress(storage)).toEqual(emptyProgress());
    expect(storage.items[CORRUPT_KEY]).toBe(bad);
  });

  it('copes with storage that throws on read', () => {
    const blocked = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {},
    };
    expect(readProgress(blocked)).toEqual(emptyProgress());
  });

  it('reports a failed write instead of throwing', () => {
    const full = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    expect(writeProgress(full, emptyProgress())).toBe(false);
  });
});
