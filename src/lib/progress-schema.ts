import { z } from 'zod';

// The learner's saved progress (pending.md §6: localStorage, versioned, export/import JSON).
// Bump CURRENT_VERSION and add an entry to `migrations` whenever the shape changes.

export const CURRENT_VERSION = 2;

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must look like 2026-10-31');
const count = z.number().int().min(0);
const attempt = z.object({ correct: count, total: z.number().int().min(1), at: z.string().min(1) });

/** The ways of reviewing a word. Each has its own schedule (German→Gujarati is easier than the reverse). */
export const REVIEW_MODES = ['de-gu', 'gu-de', 'article'] as const;
export type ReviewMode = (typeof REVIEW_MODES)[number];

/** SM-2 state of one word in one review mode. A word without a state has not been reviewed yet. */
export const cardStateSchema = z.object({
  ease: z.number().min(1.3).max(5),
  /** Days until the next review, as of the last review. */
  interval: count,
  /** Successful reviews in a row. */
  reps: count,
  lapses: count,
  due: date,
});
export type CardState = z.infer<typeof cardStateSchema>;

const deckSchema = z.record(z.string(), cardStateSchema);

export const settingsSchema = z.object({
  examDate: date.nullable().default(null),
  dailyGoalMinutes: z.number().int().min(1).max(1440).default(240), // pending.md Q2: 4 h/day
  lockChapters: z.boolean().default(true),
  pronHelper: z.boolean().default(true), // pending.md Q9
});

export const progressSchema = z.object({
  version: z.literal(CURRENT_VERSION),
  /** Keyed by lesson id, e.g. "ch01-l02". */
  lessons: z.record(
    z.string(),
    z.object({
      completedOn: date.optional(),
      practice: attempt.optional(),
      bestPct: z.number().min(0).max(100).optional(),
    }),
  ),
  /** Chapter tests, keyed by chapter number ("1" … "26"). */
  tests: z.record(
    z.string(),
    z.object({
      attempts: z.number().int().min(1),
      bestPct: z.number().min(0).max(100),
      last: attempt,
      passed: z.boolean(),
    }),
  ),
  /** Answers per topic (topic_gu of the exercise), for the weak-topics list. */
  topics: z.record(z.string(), z.object({ correct: count, total: count })),
  /** Seconds studied per local date. */
  studySeconds: z.record(date, z.number().min(0)),
  /** Flashcard schedules per review mode, keyed by vocab id (e.g. "ch01-l01-hallo"). */
  cards: z.object({ 'de-gu': deckSchema, 'gu-de': deckSchema, article: deckSchema }),
  settings: settingsSchema,
});

export type ProgressData = z.infer<typeof progressSchema>;
export type Settings = z.infer<typeof settingsSchema>;

export function emptyProgress(): ProgressData {
  return {
    version: CURRENT_VERSION,
    lessons: {},
    tests: {},
    topics: {},
    studySeconds: {},
    cards: { 'de-gu': {}, 'gu-de': {}, article: {} },
    settings: settingsSchema.parse({}),
  };
}

/** Upgrades older saved data step by step. Entry N turns version N data into version N+1. */
const migrations: Record<number, (data: Record<string, unknown>) => Record<string, unknown>> = {
  // 1 → 2: flashcards
  1: (data) => ({ ...data, version: 2, cards: { 'de-gu': {}, 'gu-de': {}, article: {} } }),
};

export class ProgressError extends Error {}

/** Validate saved or imported data, upgrading it to the current version. Throws ProgressError. */
export function migrateProgress(raw: unknown): ProgressData {
  if (typeof raw !== 'object' || raw === null) throw new ProgressError('not a progress object');
  let data = raw as Record<string, unknown>;
  if (typeof data.version !== 'number') throw new ProgressError('missing version');
  let version: number = data.version;
  if (version > CURRENT_VERSION) {
    throw new ProgressError(`saved with a newer version (${version}); update the app first`);
  }
  while (version < CURRENT_VERSION) {
    const step = migrations[version];
    if (!step) throw new ProgressError(`cannot upgrade from version ${version}`);
    data = step(data);
    version = Number(data.version);
  }
  const result = progressSchema.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new ProgressError(`${issue.path.join('.') || 'data'}: ${issue.message}`);
  }
  return result.data;
}

const EXPORT_APP = 'guj-de-progress';

export function exportProgress(data: ProgressData, now: Date = new Date()): string {
  return JSON.stringify(
    { app: EXPORT_APP, exportedAt: now.toISOString(), progress: data },
    null,
    2,
  );
}

/** Parse a backup file. Throws ProgressError with a plain message if it is not a valid backup. */
export function importProgress(text: string): ProgressData {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new ProgressError('not a JSON file');
  }
  const file = raw as { app?: unknown; progress?: unknown } | null;
  if (!file || file.app !== EXPORT_APP)
    throw new ProgressError('not a progress backup from this app');
  return migrateProgress(file.progress);
}
