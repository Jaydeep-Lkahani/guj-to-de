import { useState } from 'react';
import type { ExerciseProps } from './types';
import { CheckButton, optionClass } from './ui';

export default function Mcq({ exercise, locked, onCheck }: ExerciseProps<'mcq'>) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div>
      <p className="font-semibold">{exercise.prompt_gu}</p>
      {exercise.prompt_de && (
        <p lang="de" className="mt-1 text-lg">
          {exercise.prompt_de}
        </p>
      )}
      <div role="radiogroup" className="mt-3 grid gap-2">
        {exercise.options.map((option, i) => (
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
    </div>
  );
}
