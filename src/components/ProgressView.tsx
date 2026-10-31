import { formatMinutes } from '../lib/format';
import {
  chapterProgress,
  computeStreak,
  lessonDone,
  localDate,
  recentStudy,
  totalStudySeconds,
  weakTopics,
  wordsLearned,
  type Catalog,
} from '../lib/progress-logic';
import { t } from '../lib/t';
import { CheckIcon } from './icons';
import StudyChart from './StudyChart';
import { useProgress } from './use-progress';

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums">{value}</p>
    </div>
  );
}

/** The progress page: totals, scores per chapter, weak topics and the last two weeks of study. */
export default function ProgressView({ catalog }: { catalog: Catalog }) {
  const { data, ready } = useProgress();
  if (!ready) return <div className="h-96" aria-hidden="true" />;

  const today = localDate();
  const allLessons = catalog.flatMap((c) => c.lessons);
  const doneLessons = allLessons.filter((l) => lessonDone(data, l.id)).length;
  const withContent = catalog.filter((c) => c.lessons.length > 0 || c.hasTest);
  const weak = weakTopics(data);
  const answered = Object.values(data.topics).reduce((sum, topic) => sum + topic.total, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3">
        <Tile
          label={t('progressPage.totalStudy')}
          value={formatMinutes(Math.floor(totalStudySeconds(data) / 60))}
        />
        <Tile label={t('dashboard.wordsLearned')} value={String(wordsLearned(data, catalog))} />
        <Tile
          label={t('progressPage.lessonsCompleted')}
          value={`${doneLessons} / ${allLessons.length}`}
        />
        <Tile
          label={t('dashboard.streak')}
          value={`${computeStreak(data, today)} ${t('dashboard.day')}`}
        />
      </div>

      <section>
        <h2 className="section-title">{t('progressPage.chapterScores')}</h2>
        {withContent.length === 0 ? (
          <p className="text-muted">{t('progressPage.noContent')}</p>
        ) : (
          <ul className="grid gap-3">
            {withContent.map((chapter) => {
              const test = data.tests[String(chapter.number)];
              const { done, units } = chapterProgress(chapter, data);
              return (
                <li key={chapter.number} className="card p-4">
                  <p className="font-semibold">
                    {t('words.chapter')} {chapter.number} · {chapter.title}
                  </p>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-muted">{t('progressPage.lessonsDone')}</dt>
                      <dd className="font-semibold tabular-nums">
                        {chapter.lessons.filter((l) => lessonDone(data, l.id)).length} /{' '}
                        {chapter.lessons.length}
                      </dd>
                    </div>
                    {chapter.hasTest && (
                      <div>
                        <dt className="text-muted">{t('progressPage.testBest')}</dt>
                        <dd className="font-semibold">
                          {test ? (
                            <>
                              <span className="tabular-nums">{Math.round(test.bestPct)}%</span>{' '}
                              <span className={test.passed ? 'text-ok' : 'text-bad'}>
                                {test.passed ? (
                                  <span className="inline-flex items-center gap-1">
                                    <CheckIcon size={16} /> {t('progressPage.passed')}
                                  </span>
                                ) : (
                                  t('progressPage.notPassed')
                                )}
                              </span>
                            </>
                          ) : (
                            <span className="font-normal text-muted">
                              {t('progressPage.notTaken')}
                            </span>
                          )}
                        </dd>
                      </div>
                    )}
                  </dl>
                  <span className="sr-only">
                    {done} / {units}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="section-title">{t('progressPage.weakTopics')}</h2>
        {weak.length > 0 ? (
          <>
            <p className="mb-3 text-muted">{t('progressPage.weakHint')}</p>
            <ul className="grid gap-2">
              {weak.map((topic) => (
                <li key={topic.topic} className="card p-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold">{topic.topic}</span>
                    <span className="text-sm text-bad tabular-nums">{topic.percent}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand to-accent"
                      style={{ width: `${topic.percent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted tabular-nums">
                    {topic.total} {t('progressPage.answers')}
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-muted">
            {answered < 3 ? t('progressPage.needMoreData') : t('progressPage.noWeak')}
          </p>
        )}
      </section>

      <section>
        <h2 className="section-title">{t('progressPage.studyChart')}</h2>
        <StudyChart days={recentStudy(data, today, 14)} />
      </section>
    </div>
  );
}
