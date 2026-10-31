import { useEffect, useRef, useState } from 'react';
import { listen, SpeechError, type SpeechErrorCode, type Listening } from '../lib/speech';
import { compareSpeech, type SpeechComparison } from '../lib/speech-compare';
import { t } from '../lib/t';
import { useRecognitionSupported } from './hooks';
import { Btn } from './exercises/ui';
import Recorder from './Recorder';

type State = 'idle' | 'listening' | 'done' | 'error';

const errorText: Record<SpeechErrorCode, () => string> = {
  unsupported: () => t('speech.failed'),
  'not-allowed': () => t('speech.micDenied'),
  'no-speech': () => t('speech.noSpeech'),
  network: () => t('speech.network'),
  'audio-capture': () => t('speech.micDenied'),
  other: () => t('speech.failed'),
};

interface Props {
  /** The German sentence the learner should say. */
  text: string;
  disabled?: boolean;
  /** Set to false when the parent already shows the "cannot recognise speech" note once. */
  showFallbackNote?: boolean;
  onResult?: (result: SpeechComparison) => void;
  /** Called when recognition cannot be used right now (mic blocked, no network …). */
  onProblem?: (code: SpeechErrorCode) => void;
}

/** "Say this sentence": the browser listens, and each target word is marked heard or missed. */
export default function SpeechChecker({
  text,
  disabled,
  showFallbackNote = true,
  onResult,
  onProblem,
}: Props) {
  const supported = useRecognitionSupported();
  const [state, setState] = useState<State>('idle');
  const [result, setResult] = useState<SpeechComparison>();
  const [error, setError] = useState<SpeechErrorCode>();
  const session = useRef<Listening | undefined>(undefined);

  useEffect(() => () => session.current?.stop(), []);

  if (supported === null) return null;
  if (!supported) {
    return (
      <div className="flex flex-col gap-3">
        {showFallbackNote && <p className="text-sm text-muted">{t('speech.fallbackNote')}</p>}
        <Recorder modelText={text} />
      </div>
    );
  }

  const start = async () => {
    if (state === 'listening') {
      session.current?.stop();
      return;
    }
    setState('listening');
    setError(undefined);
    const current = listen();
    session.current = current;
    try {
      const comparison = compareSpeech(text, await current.result);
      setResult(comparison);
      setState('done');
      onResult?.(comparison);
    } catch (e) {
      const code = e instanceof SpeechError ? e.code : 'other';
      setError(code);
      setState('error');
      onProblem?.(code);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Btn
        variant={state === 'listening' ? 'secondary' : 'primary'}
        disabled={disabled}
        onClick={start}
        className="self-start"
      >
        {state === 'listening' ? (
          <>
            <span
              className="mr-2 inline-block size-3 animate-pulse rounded-full bg-bad"
              aria-hidden="true"
            />
            {t('speech.listening')}
          </>
        ) : state === 'idle' ? (
          `🎤 ${t('words.speak')}`
        ) : (
          `🎤 ${t('words.tryAgain')}`
        )}
      </Btn>
      {state === 'error' && error && (
        <p role="alert" className="text-bad">
          {errorText[error]()}
        </p>
      )}
      {state === 'done' && result && (
        <div aria-live="polite">
          <p lang="de" className="flex flex-wrap gap-x-2 gap-y-1 text-lg font-semibold">
            {result.words.map((w, i) => (
              <span key={i} className={w.ok ? 'text-ok' : 'text-bad underline decoration-wavy'}>
                {w.word}
              </span>
            ))}
          </p>
          <p className="mt-1 text-sm text-muted">
            {t('speech.heard')}: <span lang="de">{result.heard || '—'}</span>
          </p>
          <p className={`mt-1 font-semibold ${result.passed ? 'text-ok' : 'text-bad'}`}>
            {result.passed ? t('speech.good') : t('speech.retry')}
          </p>
        </div>
      )}
    </div>
  );
}
