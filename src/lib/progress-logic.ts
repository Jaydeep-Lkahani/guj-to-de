import type { Level } from './chapters';
import type { ProgressData } from './progress-schema';

// Pure functions over ProgressData. Nothing here touches the browser, so all of it is unit-tested.

// ── Catalog: what content exists (built from the content collections at build time) ──────────

export interface CatalogLesson {
  id: string;
  number: number;
  title: string;
  vocabCount: number;
}

export interface CatalogChapter {
  number: number;
  level: Level;
  title: string;
  lessons: CatalogLesson[];
  hasTest: boolean;
  passMark: number;
}

export type Catalog = CatalogChapter[];

// ── Dates (local time, "YYYY-MM-DD") ────────────────────────────────────────────────────────

export function localDate(d: Date = new Date()): string {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function parseDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, 12); // noon avoids daylight-saving edge cases
}

export function addDays(date: string, days: number): string {
  const d = parseDate(date);
  d.setDate(d.getDate() + days);
  return localDate(d);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86_400_000);
}

/** Whole days until the exam (0 = today, negative = already past), or null if no date is set. */
export function daysUntil(examDate: string | null, today: string): number | null {
  return examDate ? daysBetween(today, examDate) : null;
}

// ── Recording progress ──────────────────────────────────────────────────────────────────────

export interface TopicResult {
  topic: string;
  correct: boolean;
}

export interface PracticeResult {
  correct: number;
  total: number;
  topics: TopicResult[];
}

const pct = (correct: number, total: number) => (total === 0 ? 0 : (correct / total) * 100);

function withTopics(data: ProgressData, topics: TopicResult[]): ProgressData['topics'] {
  const out = { ...data.topics };
  for (const { topic, correct } of topics) {
    const old = out[topic] ?? { correct: 0, total: 0 };
    out[topic] = { correct: old.correct + (correct ? 1 : 0), total: old.total + 1 };
  }
  return out;
}

export function completeLesson(data: ProgressData, lessonId: string, now: Date): ProgressData {
  const old = data.lessons[lessonId] ?? {};
  if (old.completedOn) return data; // keep the first completion date
  return {
    ...data,
    lessons: { ...data.lessons, [lessonId]: { ...old, completedOn: localDate(now) } },
  };
}

export function recordPractice(
  data: ProgressData,
  lessonId: string,
  result: PracticeResult,
  now: Date,
): ProgressData {
  const old = data.lessons[lessonId] ?? {};
  const score = pct(result.correct, result.total);
  return {
    ...data,
    topics: withTopics(data, result.topics),
    lessons: {
      ...data.lessons,
      [lessonId]: {
        ...old,
        practice: { correct: result.correct, total: result.total, at: now.toISOString() },
        bestPct: Math.max(old.bestPct ?? 0, score),
      },
    },
  };
}

export function recordTest(
  data: ProgressData,
  chapter: number,
  result: PracticeResult & { passMark: number },
  now: Date,
): ProgressData {
  const old = data.tests[String(chapter)];
  const score = pct(result.correct, result.total);
  return {
    ...data,
    topics: withTopics(data, result.topics),
    tests: {
      ...data.tests,
      [String(chapter)]: {
        attempts: (old?.attempts ?? 0) + 1,
        bestPct: Math.max(old?.bestPct ?? 0, score),
        last: { correct: result.correct, total: result.total, at: now.toISOString() },
        passed: (old?.passed ?? false) || score >= result.passMark, // once passed, stays passed
      },
    },
  };
}

export function addStudySeconds(data: ProgressData, date: string, seconds: number): ProgressData {
  return {
    ...data,
    studySeconds: { ...data.studySeconds, [date]: (data.studySeconds[date] ?? 0) + seconds },
  };
}

// ── Study time and streak ───────────────────────────────────────────────────────────────────

/** A day counts towards the streak after 1 minute of study, or when a lesson was completed. */
export const STREAK_MIN_SECONDS = 60;

function isStudyDay(data: ProgressData, date: string): boolean {
  if ((data.studySeconds[date] ?? 0) >= STREAK_MIN_SECONDS) return true;
  return Object.values(data.lessons).some((l) => l.completedOn === date);
}

/** Consecutive study days. Today not yet studied does not break the streak until the day ends. */
export function computeStreak(data: ProgressData, today: string): number {
  let day = isStudyDay(data, today) ? today : addDays(today, -1);
  let streak = 0;
  while (isStudyDay(data, day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

export function studyMinutes(data: ProgressData, date: string): number {
  return Math.floor((data.studySeconds[date] ?? 0) / 60);
}

export function recentStudy(
  data: ProgressData,
  today: string,
  days = 14,
): { date: string; minutes: number }[] {
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(today, i - (days - 1));
    return { date, minutes: studyMinutes(data, date) };
  });
}

export function totalStudySeconds(data: ProgressData): number {
  return Object.values(data.studySeconds).reduce((sum, s) => sum + s, 0);
}

// ── Chapters: unlocking, progress, next task ────────────────────────────────────────────────

export function lessonDone(data: ProgressData, lessonId: string): boolean {
  return Boolean(data.lessons[lessonId]?.completedOn);
}

export function testPassed(data: ProgressData, chapter: number): boolean {
  return data.tests[String(chapter)]?.passed ?? false;
}

export interface ChapterProgress {
  done: number;
  units: number; // lessons plus the test, if there is one
  percent: number;
}

export function chapterProgress(chapter: CatalogChapter, data: ProgressData): ChapterProgress {
  const done =
    chapter.lessons.filter((l) => lessonDone(data, l.id)).length +
    (chapter.hasTest && testPassed(data, chapter.number) ? 1 : 0);
  const units = chapter.lessons.length + (chapter.hasTest ? 1 : 0);
  return { done, units, percent: units === 0 ? 0 : Math.round((done / units) * 100) };
}

export type Task =
  { kind: 'lesson'; chapter: number; lesson: CatalogLesson } | { kind: 'test'; chapter: number };

/** What to do next: the first unfinished lesson, then the chapter test, then the next chapter. */
export function nextTask(data: ProgressData, catalog: Catalog): Task | null {
  for (const chapter of catalog) {
    if (chapter.lessons.length === 0) continue;
    const lesson = chapter.lessons.find((l) => !lessonDone(data, l.id));
    if (lesson) return { kind: 'lesson', chapter: chapter.number, lesson };
    if (chapter.hasTest && !testPassed(data, chapter.number)) {
      return { kind: 'test', chapter: chapter.number };
    }
  }
  return null;
}

export function wordsLearned(data: ProgressData, catalog: Catalog): number {
  return catalog
    .flatMap((c) => c.lessons)
    .filter((l) => lessonDone(data, l.id))
    .reduce((sum, l) => sum + l.vocabCount, 0);
}

export interface WeakTopic {
  topic: string;
  percent: number;
  total: number;
}

/** Topics with the lowest accuracy; ignores topics with too few answers to say anything. */
export function weakTopics(
  data: ProgressData,
  { minAnswers = 3, below = 85, limit = 5 } = {},
): WeakTopic[] {
  return Object.entries(data.topics)
    .map(([topic, s]) => ({ topic, total: s.total, percent: Math.round(pct(s.correct, s.total)) }))
    .filter((t) => t.total >= minAnswers && t.percent < below)
    .sort((a, b) => a.percent - b.percent || b.total - a.total || a.topic.localeCompare(b.topic))
    .slice(0, limit);
}
