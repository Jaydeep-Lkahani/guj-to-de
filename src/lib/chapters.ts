export const CHAPTER_COUNT = 26;

export type Level = 'A1' | 'A2' | 'B1' | 'B2';

// Chapter ranges per CEFR level (pending.md §3)
export const LEVELS: { level: Level; from: number; to: number }[] = [
  { level: 'A1', from: 1, to: 6 },
  { level: 'A2', from: 7, to: 12 },
  { level: 'B1', from: 13, to: 18 },
  { level: 'B2', from: 19, to: 26 },
];

export function levelOf(chapter: number): Level {
  const found = LEVELS.find((l) => chapter >= l.from && chapter <= l.to);
  if (!found) throw new Error(`Chapter out of range: ${chapter}`);
  return found.level;
}

export function chapterSlug(chapter: number): string {
  return `ch${String(chapter).padStart(2, '0')}`;
}

export function chapterNumber(slug: string): number {
  const match = /^ch(\d{2})$/.exec(slug);
  if (!match) throw new Error(`Bad chapter slug: ${slug}`);
  return Number(match[1]);
}

export const chapterNumbers = Array.from({ length: CHAPTER_COUNT }, (_, i) => i + 1);
