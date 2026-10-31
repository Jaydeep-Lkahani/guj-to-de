import { t } from '../lib/t';
import AudioButton from './AudioButton';
import { useRecognitionSupported } from './hooks';
import SpeechChecker from './SpeechChecker';

/** Sentences to repeat: listen, then say them and get word-by-word feedback. */
export default function ShadowingList({ lines }: { lines: string[] }) {
  const supported = useRecognitionSupported();
  return (
    <div>
      {supported === false && <p className="mb-3 text-sm text-muted">{t('speech.fallbackNote')}</p>}
      <ol className="grid gap-3">
        {lines.map((line) => (
          <li key={line} className="rounded-lg bg-surface-2 p-3">
            <div className="flex items-center gap-3">
              <AudioButton text={line} />
              <p lang="de" className="text-lg">
                {line}
              </p>
            </div>
            <div className="mt-3">
              <SpeechChecker text={line} showFallbackNote={false} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
