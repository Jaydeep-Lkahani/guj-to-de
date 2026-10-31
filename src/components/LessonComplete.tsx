import { completeLesson } from '../lib/progress-logic';
import { updateProgress } from '../lib/progress-store';
import { t } from '../lib/t';
import { Btn } from './exercises/ui';
import { useProgress } from './use-progress';

/** "Mark lesson as done" button at the end of a lesson. */
export default function LessonComplete({ lessonId }: { lessonId: string }) {
  const { data, ready } = useProgress();
  const done = Boolean(data.lessons[lessonId]?.completedOn);

  if (!ready) return <div className="h-11" />;
  return done ? (
    <p className="flex min-h-11 items-center font-semibold text-ok" role="status">
      ✓ {t('chapter.lessonCompleted')}
    </p>
  ) : (
    <Btn onClick={() => updateProgress((d) => completeLesson(d, lessonId, new Date()))}>
      {t('chapter.completeLesson')}
    </Btn>
  );
}
