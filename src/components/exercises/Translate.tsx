import { useState } from 'react';
import { checkAnswer } from '../../lib/answer-check';
import { describeCheck } from './Fill';
import type { ExerciseProps } from './types';
import { CheckButton, GermanInput } from './ui';

export default function Translate({ exercise, locked, onCheck }: ExerciseProps<'translate'>) {
  const [value, setValue] = useState('');

  const submit = () => {
    if (value.trim() === '') return;
    const result = checkAnswer(value, exercise.answers_de, { sentenceStart: true });
    onCheck({ correct: result.correct, note: describeCheck(result) });
  };

  return (
    <div>
      <p className="mb-3 text-lg font-semibold">{exercise.gu}</p>
      <GermanInput value={value} onChange={setValue} onEnter={submit} disabled={locked} />
      {!locked && <CheckButton disabled={value.trim() === ''} onClick={submit} />}
    </div>
  );
}
