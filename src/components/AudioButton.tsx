import { useEffect, useRef, useState } from 'react';
import { speak, stopSpeaking } from '../lib/tts';
import { t } from '../lib/t';
import { useTtsStatus } from './hooks';

/** Speaker button that reads German text aloud at the chosen speed. */
export default function AudioButton({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const status = useTtsStatus();
  const [playing, setPlaying] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const onClick = async () => {
    if (playing) {
      stopSpeaking();
      return;
    }
    setPlaying(true);
    await speak(text);
    if (mounted.current) setPlaying(false);
  };

  const disabled = status !== 'ready';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={t('words.listen')}
      aria-pressed={playing}
      title={disabled ? t('audio.noVoiceTitle') : t('words.listen')}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full transition disabled:opacity-40 ${
        playing
          ? 'bg-brand text-brand-fg'
          : 'bg-brand-soft text-brand hover:bg-brand hover:text-brand-fg'
      } ${className}`}
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
