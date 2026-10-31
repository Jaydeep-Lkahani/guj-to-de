import { useState } from 'react';
import { checkOrder } from '../../lib/answer-check';
import { shuffleDifferent } from '../../lib/shuffle';
import { t } from '../../lib/t';
import type { ExerciseProps } from './types';
import { Btn, CheckButton } from './ui';

export default function Order({ exercise, locked, onCheck }: ExerciseProps<'order'>) {
  const [tiles] = useState(() =>
    shuffleDifferent(exercise.words.map((word, id) => ({ id, word }))),
  );
  const [built, setBuilt] = useState<number[]>([]); // tile ids, in the order tapped
  const word = (id: number) => exercise.words[id];

  const tile =
    'min-h-11 rounded-xl border px-3 py-2 font-semibold transition disabled:cursor-default';

  return (
    <div>
      <p className="font-semibold">{exercise.gu}</p>
      <p className="mt-1 mb-3 text-sm text-muted">{t('practice.tapWords')}</p>
      <div
        lang="de"
        className="flex min-h-14 flex-wrap gap-2 rounded-xl border border-dashed border-line bg-surface-2 p-2"
      >
        {built.map((id) => (
          <button
            key={id}
            type="button"
            disabled={locked}
            onClick={() => setBuilt((b) => b.filter((x) => x !== id))}
            className={`${tile} border-brand bg-brand-soft text-brand`}
          >
            {word(id)}
          </button>
        ))}
      </div>
      <div lang="de" className="mt-3 flex flex-wrap gap-2">
        {tiles.map(({ id }) => (
          <button
            key={id}
            type="button"
            disabled={locked || built.includes(id)}
            onClick={() => setBuilt((b) => [...b, id])}
            className={`${tile} border-line bg-surface hover:border-brand disabled:opacity-30`}
          >
            {word(id)}
          </button>
        ))}
      </div>
      {!locked && (
        <div className="mt-4 flex flex-wrap gap-2">
          <CheckButton
            disabled={built.length !== exercise.words.length}
            onClick={() => onCheck({ correct: checkOrder(built.map(word), exercise.answer) })}
          />
          <Btn
            variant="ghost"
            className="mt-4"
            disabled={built.length === 0}
            onClick={() => setBuilt([])}
          >
            {t('practice.clear')}
          </Btn>
        </div>
      )}
    </div>
  );
}
