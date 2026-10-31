import type { Exercise } from '../content/schemas';
import { recordTest } from '../lib/progress-logic';
import { updateProgress } from '../lib/progress-store';
import ExerciseRunner from './ExerciseRunner';

/** A chapter test: the score is saved, and passing (≥ pass mark) unlocks the next chapter. */
export default function ChapterTestRunner({
  chapter,
  chapterTitle,
  exercises,
  passMark,
  nextHref,
}: {
  chapter: number;
  chapterTitle: string;
  exercises: Exercise[];
  passMark: number;
  nextHref?: string;
}) {
  return (
    <ExerciseRunner
      exercises={exercises}
      fallbackTopic={chapterTitle}
      passMark={passMark}
      nextHref={nextHref}
      onComplete={(result) =>
        updateProgress((d) => recordTest(d, chapter, { ...result, passMark }, new Date()))
      }
    />
  );
}
