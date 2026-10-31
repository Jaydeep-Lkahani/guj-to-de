import { useState } from 'react';
import { checkAnswer } from '../../lib/answer-check';
import { t } from '../../lib/t';
import type { ExerciseProps } from './types';
import { CheckButton, GermanInput } from './ui';

export function describeCheck(result: ReturnType<typeof checkAnswer>): string | undefined {
  if (result.correct && result.spellingNote) {
    return `${t('practice.spelling')}: ${result.canonical}`;
  }
  if (result.reason === 'noun-capital') return t('practice.nounCapital');
  return undefined;
}

export default function Fill({ exercise, locked, onCheck }: ExerciseProps<'fill'>) {
  const [value, setValue] = useState('');
  const [before, ...rest] = exercise.sentence_de.split('___');
  const after = rest.join('___');
  const sentenceStart = before.trim() === '';

  const submit = () => {
    if (value.trim() === '') return;
    const result = checkAnswer(value, exercise.answers, { sentenceStart });
    onCheck({ correct: result.correct, note: describeCheck(result) });
  };

  return (
    <div>
      {exercise.hint_gu && <p className="mb-2 text-sm text-muted">{exercise.hint_gu}</p>}
      <p lang="de" className="mb-3 text-xl">
        {before}
        <span className="mx-1 inline-block min-w-16 border-b-2 border-brand text-center">
          {value.trim() || ' '}
        </span>
        {after}
      </p>
      <GermanInput value={value} onChange={setValue} onEnter={submit} disabled={locked} />
      {!locked && <CheckButton disabled={value.trim() === ''} onClick={submit} />}
    </div>
  );
}
