import { t } from '../../lib/t';
import { CheckIcon, CrossIcon } from '../icons';
import { Btn } from './ui';

export type FeedbackState = 'right' | 'wrong' | 'revealed';

interface Props {
  state: FeedbackState;
  explain: string;
  note?: string;
  answerText?: string;
  isLast: boolean;
  onRetry: () => void;
  onShowAnswer: () => void;
  onNext: () => void;
}

export default function Feedback({
  state,
  explain,
  note,
  answerText,
  isLast,
  onRetry,
  onShowAnswer,
  onNext,
}: Props) {
  const right = state === 'right';
  return (
    <div
      role="status"
      className={`mt-4 rounded-xl border-l-4 p-4 ${right ? 'border-ok bg-ok-soft' : 'border-bad bg-bad-soft'}`}
    >
      <p
        className={`flex items-center gap-2 text-lg font-extrabold ${right ? 'text-ok' : 'text-bad'}`}
      >
        {right ? <CheckIcon size={22} /> : <CrossIcon size={22} />}
        {right ? t('words.correct') : t('words.wrong')}
      </p>
      {note && <p className="mt-1">{note}</p>}
      {state === 'revealed' && answerText && (
        <p className="mt-1">
          {t('practice.correctAnswer')}: <strong lang="de">{answerText}</strong>
        </p>
      )}
      <p className="mt-2">{explain}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {state === 'wrong' ? (
          <>
            <Btn onClick={onRetry}>{t('words.tryAgain')}</Btn>
            <Btn variant="secondary" onClick={onShowAnswer}>
              {t('practice.showAnswer')}
            </Btn>
          </>
        ) : (
          <Btn onClick={onNext}>{isLast ? t('practice.finish') : t('words.next')}</Btn>
        )}
      </div>
    </div>
  );
}
