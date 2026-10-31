import { useState } from 'react';
import type { Exercise } from '../content/schemas';
import { correctAnswerText } from '../lib/exercise-utils';
import { t } from '../lib/t';
import Article from './exercises/Article';
import Feedback, { type FeedbackState } from './exercises/Feedback';
import Fill from './exercises/Fill';
import Listen from './exercises/Listen';
import Match from './exercises/Match';
import Mcq from './exercises/Mcq';
import Order from './exercises/Order';
import Speak from './exercises/Speak';
import Translate from './exercises/Translate';
import TrueFalse from './exercises/TrueFalse';
import type { CheckOutcome } from './exercises/types';
import { Btn } from './exercises/ui';

type Status = 'answering' | FeedbackState;

function renderExercise(ex: Exercise, locked: boolean, onCheck: (o: CheckOutcome) => void) {
  const props = { locked, onCheck };
  switch (ex.type) {
    case 'mcq':
      return <Mcq exercise={ex} {...props} />;
    case 'fill':
      return <Fill exercise={ex} {...props} />;
    case 'article':
      return <Article exercise={ex} {...props} />;
    case 'match':
      return <Match exercise={ex} {...props} />;
    case 'order':
      return <Order exercise={ex} {...props} />;
    case 'listen':
      return <Listen exercise={ex} {...props} />;
    case 'translate':
      return <Translate exercise={ex} {...props} />;
    case 'speak':
      return <Speak exercise={ex} {...props} />;
    case 'truefalse':
      return <TrueFalse exercise={ex} {...props} />;
  }
}

/** Plays a list of exercises one at a time: check → feedback → retry / next. Score = right on first try. */
export default function ExerciseRunner({ exercises }: { exercises: Exercise[] }) {
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<Status>('answering');
  const [note, setNote] = useState<string>();
  const [attempt, setAttempt] = useState(0); // bumping it remounts the exercise, clearing its input
  const [missed, setMissed] = useState(false); // had a wrong attempt on the current exercise
  const [results, setResults] = useState<boolean[]>([]); // first-try result per finished exercise
  const [summary, setSummary] = useState(false);
  const [round, setRound] = useState(0); // bumping it restarts the whole run

  const total = exercises.length;
  const exercise = exercises[index];
  const isLast = index === total - 1;

  const resetExercise = () => {
    setStatus('answering');
    setNote(undefined);
    setAttempt(0);
    setMissed(false);
  };

  const onCheck = ({ correct, note }: CheckOutcome) => {
    setNote(note);
    if (correct) {
      setStatus('right');
      setResults((r) => [...r, !missed]);
    } else {
      setMissed(true);
      setStatus('wrong');
    }
  };

  const onRetry = () => {
    setNote(undefined);
    setStatus('answering');
    setAttempt((a) => a + 1);
  };

  const onShowAnswer = () => {
    setStatus('revealed');
    setResults((r) => [...r, false]);
  };

  const onNext = () => {
    if (isLast) {
      setSummary(true);
      return;
    }
    setIndex(index + 1);
    resetExercise();
  };

  const restart = () => {
    setIndex(0);
    setResults([]);
    setSummary(false);
    setRound((r) => r + 1);
    resetExercise();
  };

  if (summary) {
    const score = results.filter(Boolean).length;
    return (
      <div className="rounded-xl border border-line bg-surface p-5 text-center">
        <p className="text-lg font-bold">{t('practice.done')}</p>
        <p className="mt-2 text-3xl font-bold text-brand">
          {score} / {total}
        </p>
        <p className="text-muted">{t('practice.score')}</p>
        <Btn className="mt-4" onClick={restart}>
          {t('practice.again')}
        </Btn>
      </div>
    );
  }

  return (
    <div key={round}>
      <div className="mb-3 flex items-center gap-3">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={index + 1}
          className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2"
        >
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <span className="text-sm text-muted tabular-nums">
          {index + 1} / {total}
        </span>
      </div>
      <div className="rounded-xl border border-line bg-surface p-4">
        <div key={`${index}-${attempt}`}>
          {renderExercise(exercise, status !== 'answering', onCheck)}
        </div>
        {status !== 'answering' && (
          <Feedback
            state={status}
            explain={exercise.explain_gu}
            note={note}
            answerText={correctAnswerText(exercise)}
            isLast={isLast}
            onRetry={onRetry}
            onShowAnswer={onShowAnswer}
            onNext={onNext}
          />
        )}
      </div>
    </div>
  );
}
