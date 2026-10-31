import { LEVELS, chapterSlug } from '../lib/chapters';
import { chapterProgress, type Catalog } from '../lib/progress-logic';
import { t } from '../lib/t';
import { CheckIcon } from './icons';
import { useProgress } from './use-progress';

/** All 26 chapters grouped by level, with progress. Every chapter is always open. */
export default function ChaptersList({ catalog }: { catalog: Catalog }) {
  const { data, ready } = useProgress();

  return (
    <div>
      {LEVELS.map(({ level, from, to }) => (
        <section key={level} className="mb-8">
          <h2 className="mb-3 flex items-center gap-3">
            <span
              lang="de"
              className="inline-block rounded-full bg-gradient-to-r from-brand to-[#7a4be0] px-3 py-1 text-sm font-extrabold tracking-wide text-white"
            >
              {level}
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {catalog
              .filter((c) => c.number >= from && c.number <= to)
              .map((chapter) => {
                const { percent, units } = chapterProgress(chapter, data);
                const complete = ready && units > 0 && percent === 100;
                const body = (
                  <span className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className={`grid size-11 shrink-0 place-items-center rounded-xl text-lg font-extrabold tabular-nums ${
                        complete ? 'bg-ok-soft text-ok' : 'bg-brand-soft text-brand'
                      }`}
                    >
                      {complete ? <CheckIcon size={22} /> : chapter.number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-muted">
                          {t('words.chapter')} {chapter.number}
                        </span>
                        {ready && units > 0 && (
                          <span className="text-sm font-bold text-brand tabular-nums">
                            {percent}%
                          </span>
                        )}
                      </span>
                      {chapter.lessons.length > 0 && (
                        <span className="block font-bold">{chapter.title}</span>
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
                            className="block h-full rounded-full bg-gradient-to-r from-brand to-accent"
                            style={{ width: `${percent}%` }}
                          />
                        </span>
                      )}
                    </span>
                  </span>
                );
                return (
                  <li key={chapter.number}>
                    <a
                      href={`/chapters/${chapterSlug(chapter.number)}/`}
                      className="block rounded-2xl border border-line bg-surface p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-brand hover:shadow-lift"
                    >
                      {body}
                    </a>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
