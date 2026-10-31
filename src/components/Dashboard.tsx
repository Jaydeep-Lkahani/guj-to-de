import { chapterSlug } from '../lib/chapters';
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
import { t } from '../lib/t';
import { useProgress } from './use-progress';

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const linkButton =
  'mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand px-4 py-2 font-semibold text-brand-fg hover:opacity-90';

/** The home page: today's task, streak, today's study time, days to the exam, current chapter. */
export default function Dashboard({ catalog }: { catalog: Catalog }) {
  const { data, ready } = useProgress();
  if (!ready) return <div className="h-96" aria-hidden="true" />;

  const today = localDate();
  const task = nextTask(data, catalog);
  const chapter = catalog.find((c) => c.number === (task?.chapter ?? 1));
  const streak = computeStreak(data, today);
  const minutes = studyMinutes(data, today);
  const goal = data.settings.dailyGoalMinutes;
  const goalPercent = Math.min(100, Math.round((minutes / goal) * 100));
  const exam = daysUntil(data.settings.examDate, today);
  const slug = task ? chapterSlug(task.chapter) : '';
  const progress = chapter ? chapterProgress(chapter, data) : undefined;

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl border border-brand bg-brand-soft p-5">
        <h2 className="text-sm font-semibold text-brand">{t('dashboard.today')}</h2>
        {task?.kind === 'lesson' && (
          <>
            <p className="mt-1 text-sm text-muted">
              {t('words.chapter')} {task.chapter} · {t('words.lesson')} {task.lesson.number}
            </p>
            <p className="text-xl font-bold">{task.lesson.title}</p>
            <a
              href={`/chapters/${slug}/l${String(task.lesson.number).padStart(2, '0')}/`}
              className={linkButton}
            >
              {t('words.start')}
            </a>
          </>
        )}
        {task?.kind === 'test' && (
          <>
            <p className="mt-1 text-xl font-bold">
              {t('words.chapter')} {task.chapter} · {t('words.chapterTest')}
            </p>
            <a href={`/chapters/${slug}/test/`} className={linkButton}>
              {t('dashboard.takeTest')}
            </a>
          </>
        )}
        {!task && <p className="mt-1 text-lg">{t('dashboard.allDone')}</p>}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Tile label={t('dashboard.streak')}>
          <p className="text-2xl font-bold tabular-nums">
            {streak} <span className="text-base font-normal text-muted">{t('dashboard.day')}</span>
          </p>
        </Tile>
        <Tile label={t('dashboard.wordsLearned')}>
          <p className="text-2xl font-bold tabular-nums">{wordsLearned(data, catalog)}</p>
        </Tile>
        <Tile label={t('dashboard.studiedToday')}>
          <p className="text-lg font-bold">{formatMinutes(minutes)}</p>
          <div
            role="progressbar"
            aria-label={t('dashboard.studiedToday')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={goalPercent}
            className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2"
          >
            <div className="h-full rounded-full bg-brand" style={{ width: `${goalPercent}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted">
            {t('dashboard.goal')}: {formatMinutes(goal)}
          </p>
        </Tile>
        <Tile label={t('dashboard.daysToExam')}>
          {exam === null ? (
            <a href="/settings/" className="text-sm font-semibold text-brand underline">
              {t('dashboard.setExam')}
            </a>
          ) : exam < 0 ? (
            <p className="text-sm font-semibold">{t('dashboard.examPast')}</p>
          ) : exam === 0 ? (
            <p className="text-lg font-bold">{t('dashboard.examToday')}</p>
          ) : (
            <p className="text-2xl font-bold tabular-nums">
              {exam} <span className="text-base font-normal text-muted">{t('dashboard.day')}</span>
            </p>
          )}
        </Tile>
      </div>

      {chapter && progress && progress.units > 0 && (
        <a
          href={`/chapters/${chapterSlug(chapter.number)}/`}
          className="block rounded-xl border border-line bg-surface p-4 transition hover:border-brand"
        >
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
            className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2"
          >
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="mt-1 text-sm text-muted tabular-nums">{progress.percent}%</p>
        </a>
      )}
    </div>
  );
}
