import type { Exercise } from '../content/schemas';
import { recordPractice } from '../lib/progress-logic';
import { updateProgress } from '../lib/progress-store';
import ExerciseRunner from './ExerciseRunner';

/** A lesson's practice: results are saved to the learner's progress when they finish. */
export default function LessonPractice({
  lessonId,
  lessonTitle,
  exercises,
}: {
  lessonId: string;
  lessonTitle: string;
  exercises: Exercise[];
}) {
  return (
    <ExerciseRunner
      exercises={exercises}
      fallbackTopic={lessonTitle}
      onComplete={(result) =>
        updateProgress((d) => recordPractice(d, lessonId, result, new Date()))
      }
    />
  );
}
