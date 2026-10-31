import { useEffect, useState } from 'react';
import { dueOn, deckCounts, recordReview, type DeckWord } from '../lib/deck';
import { addDays, localDate } from '../lib/progress-logic';
import type { ReviewMode } from '../lib/progress-schema';
import { nextInterval, type Grade } from '../lib/srs';
import { t, tf, type UiKey } from '../lib/t';
import { updateProgress } from '../lib/progress-store';
import AudioButton from './AudioButton';
import { Btn } from './exercises/ui';
import { CheckIcon, CrossIcon } from './icons';
import { useProgress } from './use-progress';

const articleStyle = {
  der: 'bg-der-soft text-der',
  die: 'bg-die-soft text-die',
  das: 'bg-das-soft text-das',
} as const;

const speakText = (w: DeckWord) => (w.gender ? `${w.gender} ${w.de}` : w.de);

/** The German word with its colour-coded article. `gap` shows ___ instead of the article. */
function GermanWord({ word, gap = false }: { word: DeckWord; gap?: boolean }) {
  return (
    <p
      lang="de"
      className="flex flex-wrap items-baseline justify-center gap-x-2 text-3xl font-extrabold"
    >
      {gap && word.gender && (
        <span aria-hidden="true" className="text-muted">
          ___
        </span>
      )}
      {!gap && word.gender && (
        <span className={`rounded-lg px-2 text-2xl ${articleStyle[word.gender]}`}>
          {word.gender}
        </span>
      )}
      <span>{word.de}</span>
    </p>
  );
}

function Extras({ word, showPron }: { word: DeckWord; showPron: boolean }) {
  return (
    <>
      {showPron && word.pron_gu && (
        <p className="pron-helper mt-1 text-sm text-muted">({word.pron_gu})</p>
      )}
      {word.plural && (
        <p className="mt-1 text-sm text-muted">
          {t('lesson.plural')}:{' '}
          <span lang="de" className="font-semibold text-fg">
            {word.plural}
          </span>
        </p>
      )}
      <div className="mt-4 flex items-center justify-center gap-2">
        <p lang="de" className="text-left text-sm">
          {word.example_de}
        </p>
        <AudioButton text={word.example_de} />
      </div>
      <p className="mt-1 text-sm text-muted">{word.example_gu}</p>
    </>
  );
}

const gradeStyle: Record<Grade, string> = {
  again: 'border-bad bg-bad-soft text-bad',
  hard: 'border-accent bg-accent-soft text-accent-text',
  good: 'border-ok bg-ok-soft text-ok',
  easy: 'border-brand bg-brand-soft text-brand',
};
const gradeLabel: Record<Grade, UiKey> = {
  again: 'review.gradeAgain',
  hard: 'review.gradeHard',
  good: 'review.gradeGood',
  easy: 'review.gradeEasy',
};

const intervalLabel = (days: number) =>
  days <= 1 ? t('review.nextTomorrow') : tf('review.nextInDays', { n: days });

interface CardProps {
  mode: ReviewMode;
  word: DeckWord;
  showPron: boolean;
}

/** Show one side, reveal the other, then the learner says how well they knew it. */
function FlipCard({
  mode,
  word,
  showPron,
  revealed,
  grades,
  intervals,
  onReveal,
  onGrade,
}: CardProps & {
  revealed: boolean;
  grades: Grade[];
  intervals: Partial<Record<Grade, number>>;
  onReveal: () => void;
  onGrade: (grade: Grade) => void;
}) {
  const forward = mode === 'de-gu';
  return (
    <>
      <div className="card p-6 text-center">
        <p className="text-sm font-semibold text-muted">
          {forward ? t('review.askMeaning') : t('review.askGerman')}
        </p>
        <div className="mt-4">
          {forward ? (
            <div className="flex items-center justify-center gap-3">
              <GermanWord word={word} />
              <AudioButton text={speakText(word)} />
            </div>
          ) : (
            <p className="text-3xl leading-snug font-extrabold">{word.gu}</p>
          )}
        </div>

        {revealed && (
          <div className="mt-5 border-t border-line pt-5">
            {forward ? (
              <p className="text-2xl leading-snug font-bold">{word.gu}</p>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <GermanWord word={word} />
                <AudioButton text={speakText(word)} />
              </div>
            )}
            <Extras word={word} showPron={showPron} />
          </div>
        )}
      </div>

      {!revealed ? (
        <Btn className="mt-4 w-full" autoFocus onClick={onReveal}>
          {t('review.showAnswer')}
        </Btn>
      ) : (
        <div className="mt-4">
          <p className="mb-2 text-center text-sm text-muted">{t('review.gradeHelp')}</p>
          <div
            className={`grid gap-2 ${grades.length > 2 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}
          >
            {grades.map((grade) => (
              <button
                key={grade}
                type="button"
                autoFocus={grade === 'good'}
                onClick={() => onGrade(grade)}
                className={`flex min-h-14 flex-col items-center justify-center rounded-xl border-2 px-2 py-2 text-center font-bold transition hover:-translate-y-0.5 ${gradeStyle[grade]}`}
              >
                <span>{t(gradeLabel[grade])}</span>
                {intervals[grade] !== undefined && (
                  <span className="text-xs font-semibold opacity-80">
                    {intervalLabel(intervals[grade])}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

const articles = [
  { value: 'der', on: 'border-der bg-der-soft text-der' },
  { value: 'die', on: 'border-die bg-die-soft text-die' },
  { value: 'das', on: 'border-das bg-das-soft text-das' },
] as const;

/** Pick der / die / das. Graded automatically: right = good, wrong = again. */
function ArticleCard({
  word,
  showPron,
  onAnswer,
  onNext,
}: {
  word: DeckWord;
  showPron: boolean;
  onAnswer: (grade: Grade) => void;
  onNext: (grade: Grade) => void;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const right = chosen === word.gender;
  const grade: Grade = right ? 'good' : 'again';
  return (
    <>
      <div className="card p-6 text-center">
        <p className="text-sm font-semibold text-muted">{t('review.askArticle')}</p>
        <div className="mt-4">
          <GermanWord word={word} gap={chosen === null} />
          <p className="mt-1 text-lg text-muted">{word.gu}</p>
        </div>

        <div
          role="radiogroup"
          aria-label={t('review.askArticle')}
          className="mt-5 grid grid-cols-3 gap-2"
          lang="de"
        >
          {articles.map(({ value, on }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={chosen === value}
              disabled={chosen !== null}
              onClick={() => {
                setChosen(value);
                onAnswer(value === word.gender ? 'good' : 'again');
              }}
              className={`min-h-12 rounded-xl border-2 text-lg font-bold transition ${
                chosen === value
                  ? on
                  : value === word.gender && chosen !== null
                    ? 'border-ok'
                    : 'border-line bg-surface hover:border-brand'
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        {chosen !== null && (
          <div
            role="status"
            className={`mt-5 rounded-xl border-l-4 p-4 text-left ${right ? 'border-ok bg-ok-soft' : 'border-bad bg-bad-soft'}`}
          >
            <p
              className={`flex items-center gap-2 text-lg font-extrabold ${right ? 'text-ok' : 'text-bad'}`}
            >
              {right ? <CheckIcon size={22} /> : <CrossIcon size={22} />}
              {right ? t('words.correct') : t('words.wrong')}
            </p>
            <p className="mt-1">
              {t('review.rightArticle')}:{' '}
              <strong lang="de">
                {word.gender} {word.de}
              </strong>
            </p>
            <div className="text-center">
              <Extras word={word} showPron={showPron} />
            </div>
          </div>
        )}
      </div>

      {chosen !== null && (
        <Btn className="mt-4 w-full" autoFocus onClick={() => onNext(grade)}>
          {t('words.next')}
        </Btn>
      )}
    </>
  );
}

/** A study session over a fixed list of words. Each answer is saved at once, so leaving is safe. */
export default function ReviewSession({
  mode,
  initial,
  words,
  onExit,
  onMore,
}: {
  mode: ReviewMode;
  initial: DeckWord[];
  /** The whole deck, to count what is left after this session. */
  words: DeckWord[];
  onExit: () => void;
  onMore: () => void;
}) {
  const { data } = useProgress();
  const [queue, setQueue] = useState(initial);
  const [step, setStep] = useState(0); // changes with every card shown, so a card never keeps old state
  const [revealed, setRevealed] = useState(false);
  // Words answered wrongly this session. They come back at the end; the repeat is not scored again.
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set());

  const word = queue[0];
  const relearning = word !== undefined && failed.has(word.id);

  const record = (grade: Grade) => {
    if (!word) return;
    if (!relearning) {
      updateProgress((d) => recordReview(d, mode, word.id, grade, localDate()));
    }
    if (grade === 'again') setFailed((f) => new Set(f).add(word.id));
  };
  const advance = (grade: Grade) => {
    setQueue((q) => (grade === 'again' ? [...q.slice(1), q[0]!] : q.slice(1)));
    setStep((s) => s + 1);
    setRevealed(false);
  };
  const answer = (grade: Grade) => {
    record(grade);
    advance(grade);
  };

  // Keys 1–4 grade a revealed card (desktop)
  useEffect(() => {
    if (mode === 'article' || !revealed || !word) return;
    const options: Grade[] = relearning ? ['again', 'good'] : ['again', 'hard', 'good', 'easy'];
    const onKey = (e: KeyboardEvent) => {
      const grade = options[Number(e.key) - 1];
      if (grade && !e.ctrlKey && !e.metaKey && !e.altKey) {
        record(grade);
        advance(grade);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const total = initial.length;
  const done = total - queue.length;
  const today = localDate();
  const showPron = data.settings.pronHelper;

  if (!word) {
    const left = deckCounts(words, data, mode, today).fresh;
    const tomorrow = dueOn(data, mode, addDays(today, 1));
    return (
      <div className="card p-6 text-center" role="status">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-ok-soft text-ok">
          <CheckIcon size={30} />
        </span>
        <h2 className="mt-3 text-2xl font-extrabold">{t('review.finishedTitle')}</h2>
        <p className="mt-2">{tf('review.finishedCount', { n: total })}</p>
        {failed.size > 0 && (
          <p className="text-sm text-muted">{tf('review.finishedRetry', { n: failed.size })}</p>
        )}
        {tomorrow > 0 && (
          <p className="mt-1 text-sm text-muted">
            {tf('review.finishedTomorrow', { n: tomorrow })}
          </p>
        )}
        {left > 0 && <p className="mt-1 text-sm text-muted">{tf('review.moreNew', { n: left })}</p>}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {left > 0 && <Btn onClick={onMore}>{t('review.studyMore')}</Btn>}
          <Btn variant="secondary" onClick={onExit}>
            {t('review.backToModes')}
          </Btn>
        </div>
      </div>
    );
  }

  const card = data.cards[mode][word.id];
  const grades: Grade[] = relearning ? ['again', 'good'] : ['again', 'hard', 'good', 'easy'];
  const intervals = relearning
    ? {}
    : Object.fromEntries(grades.map((g) => [g, nextInterval(card, g)]));

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div
          role="progressbar"
          aria-label={tf('review.cardOf', { done, total })}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
        <p className="text-sm text-muted tabular-nums">{tf('review.cardOf', { done, total })}</p>
        <Btn variant="ghost" className="min-h-9 px-3 text-sm" onClick={onExit}>
          {t('review.exit')}
        </Btn>
      </div>

      {mode === 'article' ? (
        <ArticleCard
          key={step}
          word={word}
          showPron={showPron}
          onAnswer={record}
          onNext={advance}
        />
      ) : (
        <FlipCard
          key={step}
          mode={mode}
          word={word}
          showPron={showPron}
          revealed={revealed}
          grades={grades}
          intervals={intervals}
          onReveal={() => setRevealed(true)}
          onGrade={answer}
        />
      )}
    </div>
  );
}
