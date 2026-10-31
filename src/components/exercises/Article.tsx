import { useState } from 'react';
import type { ExerciseProps } from './types';
import { CheckButton } from './ui';

const articles = [
  { value: 'der', on: 'border-der bg-der-soft text-der' },
  { value: 'die', on: 'border-die bg-die-soft text-die' },
  { value: 'das', on: 'border-das bg-das-soft text-das' },
] as const;

export default function Article({ exercise, locked, onCheck }: ExerciseProps<'article'>) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div>
      <p lang="de" className="mb-3 text-2xl font-bold">
        ___ {exercise.noun}
      </p>
      <div role="radiogroup" className="grid grid-cols-3 gap-2" lang="de">
        {articles.map(({ value, on }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected === value}
            disabled={locked}
            onClick={() => setSelected(value)}
            className={`min-h-12 rounded-lg border-2 text-lg font-bold transition ${
              selected === value ? on : 'border-line bg-surface hover:border-brand'
            }`}
          >
            {value}
          </button>
        ))}
      </div>
      {!locked && (
        <CheckButton
          disabled={selected === null}
          onClick={() => onCheck({ correct: selected === exercise.answer })}
        />
      )}
    </div>
  );
}
