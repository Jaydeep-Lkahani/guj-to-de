import { useEffect, useState } from 'react';
import { isTtsSupported, speak } from '../lib/tts';
import { t } from '../lib/t';

/** Speaker button that reads German text aloud. */
export default function AudioButton({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const [supported, setSupported] = useState(true);
  useEffect(() => setSupported(isTtsSupported()), []);

  return (
    <button
      type="button"
      onClick={() => speak(text)}
      disabled={!supported}
      aria-label={t('words.listen')}
      title={supported ? t('words.listen') : t('practice.noAudio')}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand hover:opacity-80 disabled:opacity-40 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
      </svg>
    </button>
  );
}
