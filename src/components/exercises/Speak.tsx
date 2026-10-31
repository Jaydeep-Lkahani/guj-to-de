import { t } from '../../lib/t';
import AudioButton from '../AudioButton';
import type { ExerciseProps } from './types';
import { Btn } from './ui';

// Step 5 adds speech recognition; until then the learner marks the sentence as spoken.
export default function Speak({ exercise, locked, onCheck }: ExerciseProps<'speak'>) {
  return (
    <div>
      <p className="mb-2 text-sm text-muted">{t('words.speak')}</p>
      <div className="flex items-center gap-3">
        <AudioButton text={exercise.text_de} />
        <div>
          <p lang="de" className="text-xl font-semibold">
            {exercise.text_de}
          </p>
          <p className="text-muted">{exercise.gu}</p>
        </div>
      </div>
      {!locked && (
        <Btn className="mt-4" onClick={() => onCheck({ correct: true })}>
          {t('practice.spoken')}
        </Btn>
      )}
    </div>
  );
}
