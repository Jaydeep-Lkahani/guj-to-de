import { useEffect, useState } from 'react';
import {
  buildSession,
  deckCounts,
  deckWords,
  NEW_PER_SESSION,
  wordsForMode,
  type DeckWord,
} from '../lib/deck';
import { localDate } from '../lib/progress-logic';
import type { ReviewMode } from '../lib/progress-schema';
import { t, tf, type UiKey } from '../lib/t';
import ReviewSession from './ReviewSession';
import { useProgress } from './use-progress';

const modes: { mode: ReviewMode; title: UiKey; help: UiKey }[] = [
  { mode: 'de-gu', title: 'review.modeDeGu', help: 'review.modeDeGuHelp' },
  { mode: 'gu-de', title: 'review.modeGuDe', help: 'review.modeGuDeHelp' },
  { mode: 'article', title: 'review.modeArticle', help: 'review.modeArticleHelp' },
];

/** Flashcards: choose a mode, then study the words that are due (and a few new ones). */
export default function ReviewView() {
  const { data, ready } = useProgress();
  const [words, setWords] = useState<DeckWord[] | 'error' | null>(null);
  const [session, setSession] = useState<{ mode: ReviewMode; queue: DeckWord[]; id: number }>();

  useEffect(() => {
    let live = true;
    fetch('/deck.json')
      .then((r) =>
        r.ok ? (r.json() as Promise<DeckWord[]>) : Promise.reject(new Error(r.statusText)),
      )
      .then((list) => live && setWords(list))
      .catch(() => live && setWords('error'));
    return () => {
      live = false;
    };
  }, []);

  if (words === 'error') return <p className="card p-5">{t('review.loadError')}</p>;
  if (!ready || words === null) {
    return (
      <p className="text-muted" role="status">
        {t('review.loading')}
      </p>
    );
  }

  const start = (mode: ReviewMode) =>
    setSession((old) => ({
      mode,
      queue: buildSession(words, data, mode, localDate()),
      id: (old?.id ?? 0) + 1,
    }));

  if (session) {
    return (
      <ReviewSession
        key={session.id}
        mode={session.mode}
        initial={session.queue}
        words={words}
        onExit={() => setSession(undefined)}
        onMore={() => start(session.mode)}
      />
    );
  }

  if (deckWords(words, data).length === 0) {
    return (
      <div className="card flex flex-col items-start gap-4 p-6">
        <p className="font-semibold">{t('review.noWords')}</p>
        <a
          href="/chapters/"
          className="inline-flex min-h-11 items-center rounded-xl bg-brand px-5 py-2 font-bold text-brand-fg shadow-soft"
        >
          {t('review.toChapters')}
        </a>
      </div>
    );
  }

  const today = localDate();
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted">{t('review.intro')}</p>
      <h2 className="section-title">{t('review.chooseMode')}</h2>
      <ul className="grid gap-3 sm:grid-cols-3">
        {modes.map(({ mode, title, help }) => {
          const counts = deckCounts(words, data, mode, today);
          const available = counts.due + Math.min(counts.fresh, NEW_PER_SESSION);
          const noNouns = wordsForMode(deckWords(words, data), mode).length === 0;
          return (
            <li key={mode} className="card flex flex-col gap-3 p-5">
              <div>
                <h3 className="text-lg font-extrabold">{t(title)}</h3>
                <p className="mt-1 text-sm text-muted">{t(help)}</p>
              </div>
              {noNouns ? (
                <p className="text-sm text-muted">{t('review.noNouns')}</p>
              ) : (
                <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold tabular-nums">
                  <span className="text-accent-text">
                    {tf('review.dueCount', { n: counts.due })}
                  </span>
                  <span className="text-brand">{tf('review.newCount', { n: counts.fresh })}</span>
                  <span className="text-muted">
                    {tf('review.learnedCount', { n: counts.learned })}
                  </span>
                </p>
              )}
              <div className="mt-auto">
                {!noNouns && available === 0 && (
                  <p className="mb-2 text-sm text-muted">{t('review.nothingToday')}</p>
                )}
                <button
                  type="button"
                  disabled={available === 0}
                  onClick={() => start(mode)}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-5 py-2 font-bold text-brand-fg shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('words.start')}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
