import { LEVELS, chapterSlug } from '../lib/chapters';
import { chapterProgress, isChapterUnlocked, type Catalog } from '../lib/progress-logic';
import { t } from '../lib/t';
import { useProgress } from './use-progress';

/** All 26 chapters grouped by level, with progress and a lock on chapters that are not open yet. */
export default function ChaptersList({ catalog }: { catalog: Catalog }) {
  const { data, ready } = useProgress();

  return (
    <div>
      {LEVELS.map(({ level, from, to }) => (
        <section key={level} className="mb-8">
          <h2 className="mb-3">
            <span
              lang="de"
              className="inline-block rounded-md bg-brand-soft px-2 py-0.5 text-xs font-bold tracking-wide text-brand"
            >
              {level}
            </span>
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {catalog
              .filter((c) => c.number >= from && c.number <= to)
              .map((chapter) => {
                const locked = ready && !isChapterUnlocked(chapter.number, data, catalog);
                const { percent, units } = chapterProgress(chapter, data);
                const body = (
                  <>
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold">
                        {t('words.chapter')} {chapter.number}
                      </span>
                      {locked && (
                        <span className="text-sm text-muted">🔒 {t('chapter.locked')}</span>
                      )}
                      {!locked && ready && units > 0 && (
                        <span className="text-sm text-muted tabular-nums">{percent}%</span>
                      )}
                    </span>
                    {chapter.lessons.length > 0 && (
                      <span className="block text-muted">{chapter.title}</span>
                    )}
                    {ready && units > 0 && (
                      <span
                        role="progressbar"
                        aria-label={`${t('words.chapter')} ${chapter.number}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={percent}
                        className="mt-2 block h-2 w-full overflow-hidden rounded-full bg-surface-2"
                      >
                        <span
                          className="block h-full rounded-full bg-brand"
                          style={{ width: `${percent}%` }}
                        />
                      </span>
                    )}
                  </>
                );
                return (
                  <li key={chapter.number}>
                    {locked ? (
                      <div
                        aria-disabled="true"
                        className="block rounded-xl border border-line bg-surface-2 p-4 opacity-70"
                      >
                        {body}
                      </div>
                    ) : (
                      <a
                        href={`/chapters/${chapterSlug(chapter.number)}/`}
                        className="block rounded-xl border border-line bg-surface p-4 transition hover:border-brand"
                      >
                        {body}
                      </a>
                    )}
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
