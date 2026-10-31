import { describe, expect, it } from 'vitest';
import { addStudySeconds, completeLesson, recordPractice, recordTest } from './progress-logic';
import {
  CURRENT_VERSION,
  emptyProgress,
  exportProgress,
  importProgress,
  migrateProgress,
  ProgressError,
} from './progress-schema';

const now = new Date('2026-10-31T10:00:00');

function filled() {
  let d = emptyProgress();
  d = completeLesson(d, 'ch01-l01', now);
  d = recordPractice(
    d,
    'ch01-l01',
    { correct: 8, total: 10, topics: [{ topic: 'sein', correct: true }] },
    now,
  );
  d = recordTest(d, 1, { correct: 18, total: 25, passMark: 70, topics: [] }, now);
  d = addStudySeconds(d, '2026-10-31', 1500);
  return {
    ...d,
    settings: {
      ...d.settings,
      examDate: '2027-05-01',
      dailyGoalMinutes: 180,
      lockChapters: false,
      pronHelper: false,
    },
  };
}

describe('emptyProgress', () => {
  it('has the defaults from pending.md', () => {
    expect(emptyProgress()).toMatchObject({
      version: CURRENT_VERSION,
      settings: { examDate: null, dailyGoalMinutes: 240, lockChapters: true, pronHelper: true },
    });
  });
});

describe('migrateProgress', () => {
  it('accepts valid data unchanged', () => {
    const data = filled();
    expect(migrateProgress(JSON.parse(JSON.stringify(data)))).toEqual(data);
  });

  it('fills in missing settings with defaults', () => {
    const raw = { ...emptyProgress(), settings: { examDate: '2027-05-01' } };
    expect(migrateProgress(raw).settings).toEqual({
      examDate: '2027-05-01',
      dailyGoalMinutes: 240,
      lockChapters: true,
      pronHelper: true,
    });
  });

  it('rejects non-objects and missing versions', () => {
    expect(() => migrateProgress(null)).toThrow(ProgressError);
    expect(() => migrateProgress('x')).toThrow('not a progress object');
    expect(() => migrateProgress({})).toThrow('missing version');
  });

  it('rejects data from a newer app version with a clear message', () => {
    expect(() => migrateProgress({ ...emptyProgress(), version: CURRENT_VERSION + 1 })).toThrow(
      /newer version/,
    );
  });

  it('rejects data it cannot upgrade', () => {
    expect(() => migrateProgress({ version: 0 })).toThrow('cannot upgrade from version 0');
  });

  it('names the field that is wrong', () => {
    const bad = { ...emptyProgress(), studySeconds: { 'not-a-date': 5 } };
    expect(() => migrateProgress(bad)).toThrow(/studySeconds/);
    const bad2 = { ...emptyProgress(), settings: { dailyGoalMinutes: -5 } };
    expect(() => migrateProgress(bad2)).toThrow(/settings\.dailyGoalMinutes/);
  });
});

describe('export / import', () => {
  it('round-trips everything', () => {
    const data = filled();
    expect(importProgress(exportProgress(data, now))).toEqual(data);
  });

  it('writes a readable backup with the app name and date', () => {
    const file = JSON.parse(exportProgress(emptyProgress(), now));
    expect(file).toMatchObject({ app: 'guj-de-progress', exportedAt: now.toISOString() });
  });

  it('rejects files that are not backups from this app', () => {
    expect(() => importProgress('not json')).toThrow('not a JSON file');
    expect(() => importProgress('{"hello":1}')).toThrow('not a progress backup');
    expect(() => importProgress('null')).toThrow('not a progress backup');
  });

  it('rejects a backup whose progress is damaged', () => {
    const file = JSON.parse(exportProgress(filled(), now));
    file.progress.lessons['ch01-l01'].completedOn = 'yesterday';
    expect(() => importProgress(JSON.stringify(file))).toThrow(/completedOn/);
  });
});
