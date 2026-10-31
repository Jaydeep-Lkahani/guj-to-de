import { useState } from 'react';
import { checkAnswer } from '../../lib/answer-check';
import AudioButton from '../AudioButton';
import { describeCheck } from './Fill';
import type { ExerciseProps } from './types';
import { CheckButton, GermanInput, optionClass } from './ui';

export default function Listen({ exercise, locked, onCheck }: ExerciseProps<'listen'>) {
  const [selected, setSelected] = useState<number | null>(null);
  const [value, setValue] = useState('');
  const { options } = exercise;

  const submitText = () => {
    if (value.trim() === '') return;
    const result = checkAnswer(value, [String(exercise.answer)], { sentenceStart: true });
    onCheck({ correct: result.correct, note: describeCheck(result) });
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <AudioButton text={exercise.audio_text_de} />
        <p className="font-semibold">{exercise.question_gu}</p>
      </div>
      {options ? (
        <>
          <div role="radiogroup" className="mt-3 grid gap-2">
            {options.map((option, i) => (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={selected === i}
                disabled={locked}
                onClick={() => setSelected(i)}
                className={optionClass(selected === i)}
              >
                {option}
              </button>
            ))}
          </div>
          {!locked && (
            <CheckButton
              disabled={selected === null}
              onClick={() => onCheck({ correct: selected === exercise.answer })}
            />
          )}
        </>
      ) : (
        <div className="mt-3">
          <GermanInput value={value} onChange={setValue} onEnter={submitText} disabled={locked} />
          {!locked && <CheckButton disabled={value.trim() === ''} onClick={submitText} />}
        </div>
      )}
    </div>
  );
}
