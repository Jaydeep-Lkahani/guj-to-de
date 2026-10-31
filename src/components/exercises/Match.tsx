import { useEffect, useState } from 'react';
import { shuffle } from '../../lib/shuffle';
import { t } from '../../lib/t';
import type { ExerciseProps } from './types';

export default function Match({ exercise, locked, onCheck }: ExerciseProps<'match'>) {
  const { pairs } = exercise;
  const [rightOrder] = useState(() => shuffle(pairs.map((_, i) => i)));
  const [picked, setPicked] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [miss, setMiss] = useState<{ left: number; right: number } | null>(null);
  const done = matched.length === pairs.length;

  useEffect(() => {
    if (done) onCheck({ correct: true });
  }, [done]);

  useEffect(() => {
    if (!miss) return;
    const timer = setTimeout(() => setMiss(null), 700);
    return () => clearTimeout(timer);
  }, [miss]);

  const tapRight = (pairIndex: number) => {
    if (picked === null) return;
    if (picked === pairIndex) setMatched((m) => [...m, pairIndex]);
    else setMiss({ left: picked, right: pairIndex });
    setPicked(null);
  };

  const cell = (state: 'matched' | 'picked' | 'miss' | 'idle') =>
    `min-h-11 w-full rounded-lg border px-3 py-2 text-left font-semibold transition ${
      state === 'matched'
        ? 'border-ok bg-ok-soft text-ok'
        : state === 'miss'
          ? 'border-bad bg-bad-soft text-bad'
          : state === 'picked'
            ? 'border-brand bg-brand-soft text-brand'
            : 'border-line bg-surface hover:border-brand'
    }`;

  return (
    <div>
      <p className="mb-3 text-sm text-muted">{t('practice.tapPairs')}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid content-start gap-2" lang="de">
          {pairs.map((pair, i) => (
            <button
              key={i}
              type="button"
              disabled={locked || matched.includes(i)}
              onClick={() => setPicked(i)}
              className={cell(
                matched.includes(i)
                  ? 'matched'
                  : miss?.left === i
                    ? 'miss'
                    : picked === i
                      ? 'picked'
                      : 'idle',
              )}
            >
              {pair.de}
            </button>
          ))}
        </div>
        <div className="grid content-start gap-2">
          {rightOrder.map((pairIndex) => (
            <button
              key={pairIndex}
              type="button"
              disabled={locked || matched.includes(pairIndex)}
              onClick={() => tapRight(pairIndex)}
              className={cell(
                matched.includes(pairIndex)
                  ? 'matched'
                  : miss?.right === pairIndex
                    ? 'miss'
                    : 'idle',
              )}
            >
              {pairs[pairIndex].gu}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
