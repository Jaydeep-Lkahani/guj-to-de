import { useEffect } from 'react';
import { blockingChapter, type Catalog } from '../lib/progress-logic';
import { t, tf } from '../lib/t';
import { useProgress } from './use-progress';

/**
 * Put on chapter, lesson and test pages. When the chapter is locked it shows why and hides the
 * element marked `data-gated` (the page content).
 */
export default function ChapterGate({ chapter, catalog }: { chapter: number; catalog: Catalog }) {
  const { data, ready } = useProgress();
  const blocker = ready ? blockingChapter(chapter, data, catalog) : null;

  useEffect(() => {
    const content = document.querySelector<HTMLElement>('[data-gated]');
    if (content) content.hidden = blocker !== null;
  }, [blocker]);

  if (blocker === null) return null;
  const blocking = catalog.find((c) => c.number === blocker);
  const slug = `ch${String(blocker).padStart(2, '0')}`;
  return (
    <div role="alert" className="mb-6 rounded-lg border-l-4 border-warn bg-warn-soft p-4">
      <p className="font-bold">🔒 {t('chapter.lockedTitle')}</p>
      <p className="mt-1">
        {tf('chapter.lockedBody', { n: blocker, pass: blocking?.passMark ?? 70 })}
      </p>
      <a
        href={`/chapters/${slug}/test/`}
        className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-brand px-4 py-2 font-semibold text-brand-fg"
      >
        {t('chapter.goToTest')}
      </a>
    </div>
  );
}
