import { getCollection } from 'astro:content';
import { CHAPTER_COUNT, chapterSlug, levelOf } from './chapters';
import type { Catalog } from './progress-logic';
import { t } from './t';

/** What content exists, for the islands that show progress. Built at build time from the content collections. */
let cached: Promise<Catalog> | undefined;

export function getCatalog(): Promise<Catalog> {
  cached ??= buildCatalog(); // pages share one result instead of re-reading the collections
  return cached;
}

async function buildCatalog(): Promise<Catalog> {
  const [metas, lessons, tests] = await Promise.all([
    getCollection('chapters'),
    getCollection('lessons'),
    getCollection('chapterTests'),
  ]);

  return Array.from({ length: CHAPTER_COUNT }, (_, i) => {
    const number = i + 1;
    const slug = chapterSlug(number);
    const test = tests.find((x) => x.id === `${slug}/test`)?.data;
    return {
      number,
      level: levelOf(number),
      title:
        metas.find((m) => m.id === `${slug}/meta`)?.data.title_gu ??
        `${t('words.chapter')} ${number}`,
      lessons: lessons
        .filter((l) => l.id.startsWith(`${slug}/`))
        .map((l) => ({
          id: l.data.id,
          number: l.data.number,
          title: l.data.title_gu,
          vocabCount: l.data.vocab.length,
        }))
        .sort((a, b) => a.number - b.number),
      hasTest: test !== undefined,
      passMark: test?.pass_mark ?? 70,
    };
  });
}
