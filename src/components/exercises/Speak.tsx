import { useState } from 'react';
import { t } from '../../lib/t';
import AudioButton from '../AudioButton';
import { useRecognitionSupported } from '../hooks';
import SpeechChecker from '../SpeechChecker';
import type { ExerciseProps } from './types';
import { Btn } from './ui';

// The browser listens and checks the words. Where that is impossible (Safari, mic blocked),
// the learner records themself in SpeechChecker and marks the sentence as spoken.
export default function Speak({ exercise, locked, onCheck }: ExerciseProps<'speak'>) {
  const supported = useRecognitionSupported();
  const [problem, setProblem] = useState(false);

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
      <div className="mt-4">
        <SpeechChecker
          text={exercise.text_de}
          disabled={locked}
          onProblem={() => setProblem(true)}
          onResult={(r) => onCheck({ correct: r.passed })}
        />
      </div>
      {!locked && (supported === false || problem) && (
        <Btn className="mt-4" variant="secondary" onClick={() => onCheck({ correct: true })}>
          {t('practice.spoken')}
        </Btn>
      )}
    </div>
  );
}
