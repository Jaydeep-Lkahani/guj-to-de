import motivation from '../content-shared/motivation.json';
import { LEVELS, chapterSlug } from '../lib/chapters';
import { formatMinutes } from '../lib/format';
import {
  chapterProgress,
  computeStreak,
  daysUntil,
  localDate,
  nextTask,
  studyMinutes,
  wordsLearned,
  type Catalog,
} from '../lib/progress-logic';
import { t, tf } from '../lib/t';
import { ArrowIcon, BookIcon, CheckIcon, FlameIcon, Ring, SparkIcon, TargetIcon } from './icons';
import { useProgress } from './use-progress';

function greeting(hour: number): { de: string; gu: string } {
  if (hour < 12) return { de: 'Guten Morgen', gu: t('home.greetMorning') };
  if (hour < 18) return { de: 'Guten Tag', gu: t('home.greetAfternoon') };
  return { de: 'Guten Abend', gu: t('home.greetEvening') };
}

/** The same phrase all day, a new one tomorrow. */
function phraseOfDay(today: string) {
  const day = Math.floor(new Date(`${today}T00:00:00Z`).getTime() / 86_400_000);
  return motivation[day % motivation.length]!;
}

function Stat({
  icon,
  label,
  tone,
  children,
  index,
}: {
  icon: React.ReactNode;
  label: string;
  tone: 'accent' | 'brand' | 'ok';
  children: React.ReactNode;
  index: number;
}) {
  const tones = {
    accent: 'bg-accent-soft text-accent-text',
    brand: 'bg-brand-soft text-brand',
    ok: 'bg-ok-soft text-ok',
  };
  return (
    <div
      className="rise rounded-2xl border border-line bg-surface p-4 shadow-soft"
      style={{ '--i': index } as React.CSSProperties}
    >
      <span className={`grid size-9 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span>
      <div className="mt-3">{children}</div>
      <p className="mt-0.5 text-sm text-muted">{label}</p>
    </div>
  );
}

const bigNumber = 'text-3xl leading-none font-extrabold tracking-tight tabular-nums';

/** The home page: a welcome, today's task, streak, daily goal, words learned and the road to B2. */
export default function Dashboard({ catalog }: { catalog: Catalog }) {
  const { data, ready } = useProgress();
  if (!ready) return <div className="h-96" aria-hidden="true" />;

  const now = new Date();
  const today = localDate(now);
  const task = nextTask(data, catalog);
  const chapter = catalog.find((c) => c.number === (task?.chapter ?? 1));
  const streak = computeStreak(data, today);
  const minutes = studyMinutes(data, today);
  const goal = data.settings.dailyGoalMinutes;
  const goalPercent = Math.min(100, Math.round((minutes / goal) * 100));
  const exam = daysUntil(data.settings.examDate, today);
  const slug = task ? chapterSlug(task.chapter) : '';
  const progress = chapter ? chapterProgress(chapter, data) : undefined;
  const words = wordsLearned(data, catalog);
  const hello = greeting(now.getHours());
  const phrase = phraseOfDay(today);

  const doneChapters = catalog.filter((c) => {
    const p = chapterProgress(c, data);
    return p.units > 0 && p.done === p.units;
  });
  const isNew = words === 0 && streak === 0 && doneChapters.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <section className="hero rise rounded-3xl p-6 sm:p-8">
        <p className="text-sm font-semibold text-white/75">
          <span lang="de" className="text-lg font-bold text-[#ffc247]">
            {hello.de}!
          </span>{' '}
          · {hello.gu}
        </p>

        {task?.kind === 'lesson' && (
          <>
            <p className="mt-5 text-sm font-semibold text-white/70">
              {isNew ? t('home.newTitle') : t('dashboard.today')} · {t('words.chapter')}{' '}
              {task.chapter} · {t('words.lesson')} {task.lesson.number}
            </p>
            <h2 className="mt-1 text-3xl leading-snug font-extrabold sm:text-4xl">
              {task.lesson.title}
            </h2>
            <p className="mt-2 max-w-md text-white/75">
              {isNew ? t('home.newBody') : t('home.keepGoing')}
            </p>
            <a
              href={`/chapters/${slug}/l${String(task.lesson.number).padStart(2, '0')}/`}
              className="btn-accent mt-6"
            >
              {isNew ? t('words.start') : t('home.continue')}
              <ArrowIcon size={20} />
            </a>
          </>
        )}
        {task?.kind === 'test' && (
          <>
            <h2 className="mt-5 text-3xl leading-snug font-extrabold sm:text-4xl">
              {t('words.chapter')} {task.chapter} · {t('words.chapterTest')}
            </h2>
            <a href={`/chapters/${slug}/test/`} className="btn-accent mt-6">
              {t('dashboard.takeTest')}
              <ArrowIcon size={20} />
            </a>
          </>
        )}
        {!task && <p className="mt-5 text-xl font-semibold">{t('dashboard.allDone')}</p>}

        <figure className="mt-7 max-w-md border-l-2 border-[#ffc247]/70 pl-4">
          <figcaption className="text-xs font-semibold tracking-wide text-white/60">
            {t('home.phraseOfDay')}
          </figcaption>
          <blockquote>
            <p lang="de" className="mt-1 text-lg font-semibold">
              „{phrase.de}“
            </p>
            <p className="text-sm text-white/75">{phrase.gu}</p>
          </blockquote>
        </figure>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          index={1}
          tone="accent"
          icon={<FlameIcon size={20} className={streak > 0 ? 'flame' : ''} />}
          label={t('dashboard.streak')}
        >
          <p className={bigNumber}>
            {streak}{' '}
            <span className="text-base font-semibold text-muted">{t('dashboard.day')}</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            {streak > 0 ? t('home.streakKeep') : t('home.streakStart')}
          </p>
        </Stat>

        <div
          className="rise flex flex-col gap-3 rounded-2xl sm:flex-row sm:items-center sm:gap-4 border border-line bg-surface p-4 shadow-soft"
          style={{ '--i': 2 } as React.CSSProperties}
        >
          <div className="text-brand">
            <Ring percent={goalPercent} size={72} stroke={8} label={t('dashboard.studiedToday')}>
              {goalPercent >= 100 ? (
                <CheckIcon size={26} className="text-ok" />
              ) : (
                <TargetIcon size={24} />
              )}
            </Ring>
          </div>
          <div className="min-w-0">
            <p className="text-lg leading-tight font-extrabold">{formatMinutes(minutes)}</p>
            <p className="text-sm text-muted">{t('dashboard.studiedToday')}</p>
            <p className="mt-1 text-xs text-muted">
              {goalPercent >= 100
                ? t('home.goalDone')
                : tf('home.goalLeft', { n: Math.max(1, goal - minutes) })}
            </p>
          </div>
        </div>

        <Stat
          index={3}
          tone="brand"
          icon={<BookIcon size={20} />}
          label={t('dashboard.wordsLearned')}
        >
          <p className={bigNumber}>{words}</p>
        </Stat>

        <Stat index={4} tone="ok" icon={<SparkIcon size={20} />} label={t('dashboard.daysToExam')}>
          {exam === null ? (
            <a href="/settings/" className="text-sm font-semibold text-brand underline">
              {t('dashboard.setExam')}
            </a>
          ) : exam < 0 ? (
            <p className="text-sm font-semibold">{t('dashboard.examPast')}</p>
          ) : exam === 0 ? (
            <p className="text-lg font-extrabold">{t('dashboard.examToday')}</p>
          ) : (
            <p className={bigNumber}>
              {exam}{' '}
              <span className="text-base font-semibold text-muted">{t('dashboard.day')}</span>
            </p>
          )}
        </Stat>
      </div>

      <section
        className="rise rounded-2xl border border-line bg-surface p-5 shadow-soft"
        style={{ '--i': 5 } as React.CSSProperties}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-extrabold">{t('home.journey')}</h2>
          <p className="text-sm text-muted tabular-nums">
            {tf('home.chaptersDone', { n: doneChapters.length, total: catalog.length })}
          </p>
        </div>

        <ol className="mt-4 grid grid-cols-4 gap-2">
          {LEVELS.map(({ level, from, to }) => {
            const chapters = catalog.filter((c) => c.number >= from && c.number <= to);
            const done = chapters.filter((c) => doneChapters.includes(c)).length;
            const percent = Math.round((done / chapters.length) * 100);
            const active = chapter && chapter.number >= from && chapter.number <= to;
            return (
              <li key={level}>
                <div
                  className={`h-2 overflow-hidden rounded-full ${active ? 'bg-brand-soft' : 'bg-surface-2'}`}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-accent"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p
                  lang="de"
                  className={`mt-2 text-sm font-bold ${active ? 'text-brand' : 'text-muted'}`}
                >
                  {level}
                </p>
              </li>
            );
          })}
        </ol>

        {chapter && progress && progress.units > 0 && (
          <a
            href={`/chapters/${chapterSlug(chapter.number)}/`}
            className="group mt-4 flex items-center gap-4 rounded-xl bg-surface-2 p-4 transition hover:bg-brand-soft"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted">{t('dashboard.currentChapter')}</p>
              <p className="font-bold">
                {t('words.chapter')} {chapter.number} · {chapter.title}
              </p>
              <div
                role="progressbar"
                aria-label={t('dashboard.currentChapter')}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress.percent}
                className="mt-2 h-2 overflow-hidden rounded-full bg-surface"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand to-accent"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
            <span className="text-lg font-extrabold text-brand tabular-nums">
              {progress.percent}%
            </span>
            <ArrowIcon size={20} className="text-muted transition group-hover:translate-x-1" />
          </a>
        )}
      </section>
    </div>
  );
}
