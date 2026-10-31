import { t } from '../lib/t';
import { CheckIcon } from './icons';
import { useProgress } from './use-progress';

interface Item {
  id: string;
  number: number;
  title: string;
  href: string;
}

/** The lessons of a chapter, with a tick for finished ones and the last practice score. */
export default function ChapterLessons({ lessons }: { lessons: Item[] }) {
  const { data, ready } = useProgress();
  return (
    <ul className="grid gap-3">
      {lessons.map((lesson) => {
        const record = ready ? data.lessons[lesson.id] : undefined;
        return (
          <li key={lesson.id}>
            <a
              href={lesson.href}
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-brand hover:shadow-lift"
            >
              <span
                aria-hidden="true"
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                  record?.completedOn ? 'bg-ok-soft text-ok' : 'bg-brand-soft text-brand'
                }`}
              >
                {record?.completedOn ? <CheckIcon size={20} /> : lesson.number}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-muted">
                  {t('words.lesson')} {lesson.number}
                  {record?.completedOn && ` · ${t('words.completed')}`}
                </span>
                <span className="block font-semibold">{lesson.title}</span>
                {record?.practice && (
                  <span className="block text-sm text-muted">
                    {t('chapter.practiceScore')}: {record.practice.correct}/{record.practice.total}
                  </span>
                )}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
