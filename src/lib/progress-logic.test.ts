import { describe, expect, it } from 'vitest';
import {
  addDays,
  blockingChapter,
  addStudySeconds,
  chapterProgress,
  completeLesson,
  computeStreak,
  daysBetween,
  daysUntil,
  isChapterUnlocked,
  localDate,
  nextTask,
  recentStudy,
  recordPractice,
  recordTest,
  studyMinutes,
  weakTopics,
  wordsLearned,
  type Catalog,
} from './progress-logic';
import { emptyProgress, type ProgressData } from './progress-schema';

const at = (iso: string) => new Date(`${iso}T10:00:00`);
const lesson = (chapter: number, n: number, vocabCount = 10) => ({
  id: `ch${String(chapter).padStart(2, '0')}-l${String(n).padStart(2, '0')}`,
  number: n,
  title: `પાઠ ${n}`,
  vocabCount,
});

const catalog: Catalog = [
  {
    number: 1,
    level: 'A1',
    title: 'એક',
    lessons: [lesson(1, 1), lesson(1, 2)],
    hasTest: true,
    passMark: 70,
  },
  { number: 2, level: 'A1', title: 'બે', lessons: [lesson(2, 1)], hasTest: true, passMark: 70 },
  { number: 3, level: 'A1', title: 'ત્રણ', lessons: [], hasTest: false, passMark: 70 },
];

const result = (correct: number, total: number, topic = 'sein') => ({
  correct,
  total,
  topics: Array.from({ length: total }, (_, i) => ({ topic, correct: i < correct })),
});

function withData(change: (d: ProgressData) => ProgressData): ProgressData {
  return change(emptyProgress());
}

describe('dates', () => {
  it('formats local dates', () => {
    expect(localDate(new Date(2026, 9, 31))).toBe('2026-10-31');
    expect(localDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('adds days across month and year ends', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('counts days between dates, also over daylight-saving changes', () => {
    expect(daysBetween('2026-10-31', '2026-11-30')).toBe(30);
    expect(daysBetween('2026-03-20', '2026-04-05')).toBe(16);
    expect(daysBetween('2026-10-31', '2026-10-30')).toBe(-1);
  });

  it('counts days to the exam', () => {
    expect(daysUntil('2027-05-01', '2026-10-31')).toBe(182);
    expect(daysUntil('2026-10-31', '2026-10-31')).toBe(0);
    expect(daysUntil('2026-10-01', '2026-10-31')).toBe(-30);
    expect(daysUntil(null, '2026-10-31')).toBeNull();
  });
});

describe('recording', () => {
  it('records the first lesson completion and keeps the date on repeats', () => {
    const first = completeLesson(emptyProgress(), 'ch01-l01', at('2026-10-30'));
    const again = completeLesson(first, 'ch01-l01', at('2026-11-02'));
    expect(again.lessons['ch01-l01'].completedOn).toBe('2026-10-30');
  });

  it('does not mutate the data it was given', () => {
    const before = emptyProgress();
    completeLesson(before, 'ch01-l01', at('2026-10-30'));
    expect(before.lessons).toEqual({});
  });

  it('stores the last practice score and the best percentage', () => {
    let d = recordPractice(emptyProgress(), 'ch01-l01', result(9, 10), at('2026-10-30'));
    d = recordPractice(d, 'ch01-l01', result(5, 10), at('2026-10-31'));
    expect(d.lessons['ch01-l01'].practice).toMatchObject({ correct: 5, total: 10 });
    expect(d.lessons['ch01-l01'].bestPct).toBe(90);
  });

  it('adds up topic answers over several runs', () => {
    let d = recordPractice(emptyProgress(), 'ch01-l01', result(2, 4, 'sein'), at('2026-10-30'));
    d = recordPractice(d, 'ch01-l01', result(4, 4, 'sein'), at('2026-10-31'));
    expect(d.topics['sein']).toEqual({ correct: 6, total: 8 });
  });

  it('marks a test passed at the pass mark and keeps it passed after a worse try', () => {
    let d = recordTest(emptyProgress(), 1, { ...result(6, 10), passMark: 70 }, at('2026-10-30'));
    expect(d.tests['1']).toMatchObject({ passed: false, attempts: 1, bestPct: 60 });
    d = recordTest(d, 1, { ...result(7, 10), passMark: 70 }, at('2026-10-31'));
    expect(d.tests['1']).toMatchObject({ passed: true, attempts: 2, bestPct: 70 });
    d = recordTest(d, 1, { ...result(2, 10), passMark: 70 }, at('2026-11-01'));
    expect(d.tests['1']).toMatchObject({ passed: true, attempts: 3, bestPct: 70 });
    expect(d.tests['1'].last.correct).toBe(2);
  });

  it('accumulates study seconds per day', () => {
    let d = addStudySeconds(emptyProgress(), '2026-10-31', 90);
    d = addStudySeconds(d, '2026-10-31', 45);
    expect(d.studySeconds['2026-10-31']).toBe(135);
    expect(studyMinutes(d, '2026-10-31')).toBe(2);
    expect(studyMinutes(d, '2026-10-30')).toBe(0);
  });
});

describe('streak', () => {
  const study = (d: ProgressData, ...dates: string[]) =>
    dates.reduce((acc, date) => addStudySeconds(acc, date, 120), d);

  it('is 0 with no study', () => {
    expect(computeStreak(emptyProgress(), '2026-10-31')).toBe(0);
  });

  it('counts consecutive days including today', () => {
    const d = study(emptyProgress(), '2026-10-29', '2026-10-30', '2026-10-31');
    expect(computeStreak(d, '2026-10-31')).toBe(3);
  });

  it("keeps yesterday's streak alive until today ends", () => {
    const d = study(emptyProgress(), '2026-10-29', '2026-10-30');
    expect(computeStreak(d, '2026-10-31')).toBe(2);
  });

  it('breaks after a missed day', () => {
    const d = study(emptyProgress(), '2026-10-28', '2026-10-30');
    expect(computeStreak(d, '2026-10-31')).toBe(1);
    expect(computeStreak(d, '2026-11-01')).toBe(0);
  });

  it('needs at least a minute of study to count', () => {
    const d = addStudySeconds(emptyProgress(), '2026-10-31', 59);
    expect(computeStreak(d, '2026-10-31')).toBe(0);
  });

  it('counts a day on which a lesson was completed, even with little study time', () => {
    const d = completeLesson(emptyProgress(), 'ch01-l01', at('2026-10-31'));
    expect(computeStreak(d, '2026-10-31')).toBe(1);
  });

  it('counts across month ends', () => {
    const d = study(emptyProgress(), '2026-10-30', '2026-10-31', '2026-11-01');
    expect(computeStreak(d, '2026-11-01')).toBe(3);
  });
});

describe('recent study', () => {
  it('lists the last days oldest first, ending today', () => {
    const d = addStudySeconds(emptyProgress(), '2026-10-31', 600);
    const days = recentStudy(d, '2026-10-31', 3);
    expect(days).toEqual([
      { date: '2026-10-29', minutes: 0 },
      { date: '2026-10-30', minutes: 0 },
      { date: '2026-10-31', minutes: 10 },
    ]);
  });
});

describe('unlocking', () => {
  it('always opens chapter 1', () => {
    expect(isChapterUnlocked(1, emptyProgress(), catalog)).toBe(true);
  });

  it('locks chapter 2 until the chapter 1 test is passed', () => {
    expect(isChapterUnlocked(2, emptyProgress(), catalog)).toBe(false);
    const failed = recordTest(
      emptyProgress(),
      1,
      { ...result(5, 10), passMark: 70 },
      at('2026-10-31'),
    );
    expect(isChapterUnlocked(2, failed, catalog)).toBe(false);
    const passed = recordTest(
      emptyProgress(),
      1,
      { ...result(7, 10), passMark: 70 },
      at('2026-10-31'),
    );
    expect(isChapterUnlocked(2, passed, catalog)).toBe(true);
  });

  it('keeps later chapters locked behind an unpassed chapter', () => {
    const passed1 = recordTest(
      emptyProgress(),
      1,
      { ...result(9, 10), passMark: 70 },
      at('2026-10-31'),
    );
    expect(isChapterUnlocked(3, passed1, catalog)).toBe(false); // chapter 2 test still open
  });

  it('does not let a chapter without a test yet hold the next one back', () => {
    const noTest: Catalog = [{ ...catalog[0], hasTest: false }, catalog[1]];
    expect(isChapterUnlocked(2, emptyProgress(), noTest)).toBe(true);
  });

  it('names the chapter whose test is blocking', () => {
    expect(blockingChapter(1, emptyProgress(), catalog)).toBeNull();
    expect(blockingChapter(2, emptyProgress(), catalog)).toBe(1);
    expect(blockingChapter(3, emptyProgress(), catalog)).toBe(1);
    const passed1 = recordTest(
      emptyProgress(),
      1,
      { ...result(9, 10), passMark: 70 },
      at('2026-10-31'),
    );
    expect(blockingChapter(3, passed1, catalog)).toBe(2);
  });

  it('opens everything when locking is switched off', () => {
    const d = withData((x) => ({ ...x, settings: { ...x.settings, lockChapters: false } }));
    expect(isChapterUnlocked(26, d, catalog)).toBe(true);
  });
});

describe('chapter progress and next task', () => {
  it('counts lessons and the test as units', () => {
    let d = completeLesson(emptyProgress(), 'ch01-l01', at('2026-10-31'));
    expect(chapterProgress(catalog[0], d)).toEqual({ done: 1, units: 3, percent: 33 });
    d = completeLesson(d, 'ch01-l02', at('2026-10-31'));
    d = recordTest(d, 1, { ...result(8, 10), passMark: 70 }, at('2026-10-31'));
    expect(chapterProgress(catalog[0], d)).toEqual({ done: 3, units: 3, percent: 100 });
  });

  it('reports 0% for a chapter without content', () => {
    expect(chapterProgress(catalog[2], emptyProgress())).toEqual({ done: 0, units: 0, percent: 0 });
  });

  it('starts with lesson 1, then lesson 2, then the test, then the next chapter', () => {
    let d = emptyProgress();
    expect(nextTask(d, catalog)).toMatchObject({
      kind: 'lesson',
      chapter: 1,
      lesson: { number: 1 },
    });
    d = completeLesson(d, 'ch01-l01', at('2026-10-31'));
    expect(nextTask(d, catalog)).toMatchObject({
      kind: 'lesson',
      chapter: 1,
      lesson: { number: 2 },
    });
    d = completeLesson(d, 'ch01-l02', at('2026-10-31'));
    expect(nextTask(d, catalog)).toEqual({ kind: 'test', chapter: 1 });
    d = recordTest(d, 1, { ...result(8, 10), passMark: 70 }, at('2026-10-31'));
    expect(nextTask(d, catalog)).toMatchObject({ kind: 'lesson', chapter: 2 });
  });

  it('returns null when everything available is done', () => {
    let d = emptyProgress();
    for (const c of catalog.slice(0, 2)) {
      for (const l of c.lessons) d = completeLesson(d, l.id, at('2026-10-31'));
      d = recordTest(d, c.number, { ...result(10, 10), passMark: 70 }, at('2026-10-31'));
    }
    expect(nextTask(d, catalog)).toBeNull();
  });
});

describe('words learned', () => {
  it('adds the vocabulary of completed lessons only', () => {
    let d = completeLesson(emptyProgress(), 'ch01-l01', at('2026-10-31'));
    expect(wordsLearned(d, catalog)).toBe(10);
    d = completeLesson(d, 'ch02-l01', at('2026-10-31'));
    expect(wordsLearned(d, catalog)).toBe(20);
    expect(wordsLearned(emptyProgress(), catalog)).toBe(0);
  });
});

describe('weak topics', () => {
  const topics = (entries: Record<string, [number, number]>): ProgressData =>
    withData((d) => ({
      ...d,
      topics: Object.fromEntries(
        Object.entries(entries).map(([k, [c, t]]) => [k, { correct: c, total: t }]),
      ),
    }));

  it('lists the lowest-scoring topics first', () => {
    const d = topics({ artikel: [3, 10], sein: [5, 10], umlaute: [4, 10] });
    expect(weakTopics(d).map((t) => [t.topic, t.percent])).toEqual([
      ['artikel', 30],
      ['umlaute', 40],
      ['sein', 50],
    ]);
  });

  it('ignores topics with too few answers and topics that are going well', () => {
    const d = topics({ few: [0, 2], good: [9, 10], weak: [1, 5] });
    expect(weakTopics(d).map((t) => t.topic)).toEqual(['weak']);
  });

  it('limits the list', () => {
    const entries = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`t${i}`, [0, 5]]));
    expect(
      weakTopics(topics(entries as Record<string, [number, number]>), { limit: 3 }),
    ).toHaveLength(3);
  });

  it('is empty without data', () => {
    expect(weakTopics(emptyProgress())).toEqual([]);
  });
});
