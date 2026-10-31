import { useState } from 'react';
import { t } from '../../lib/t';
import type { ExerciseProps } from './types';
import { CheckButton, optionClass } from './ui';

export default function TrueFalse({ exercise, locked, onCheck }: ExerciseProps<'truefalse'>) {
  const [answers, setAnswers] = useState<(boolean | undefined)[]>([]);
  const complete = exercise.statements.every((_, i) => answers[i] !== undefined);

  return (
    <div>
      <p lang="de" className="mb-4 rounded-lg bg-surface-2 p-3 text-lg">
        {exercise.text_de}
      </p>
      <ul className="grid gap-3">
        {exercise.statements.map((statement, i) => (
          <li key={i}>
            <p lang="de" className="mb-1 font-semibold">
              {statement.de}
            </p>
            <div role="radiogroup" className="grid grid-cols-2 gap-2">
              {[true, false].map((value) => (
                <button
                  key={String(value)}
                  type="button"
                  role="radio"
                  aria-checked={answers[i] === value}
                  disabled={locked}
                  onClick={() =>
                    setAnswers((a) => {
                      const next = [...a];
                      next[i] = value;
                      return next;
                    })
                  }
                  className={`${optionClass(answers[i] === value)} text-center`}
                >
                  {value ? t('words.correct') : t('words.wrong')}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {!locked && (
        <CheckButton
          disabled={!complete}
          onClick={() =>
            onCheck({ correct: exercise.statements.every((s, i) => answers[i] === s.answer) })
          }
        />
      )}
    </div>
  );
}
