import { setAudioSpeed, type AudioSpeed } from '../lib/audio-prefs';
import { t } from '../lib/t';
import { useAudioSpeed, useTtsStatus } from './hooks';

const speeds: { value: AudioSpeed; label: string }[] = [
  { value: 'normal', label: '1×' },
  { value: 'slow', label: '0.7×' },
];

/** Speed toggle (1× / 0.7×) plus a message when the device has no German voice. */
export default function AudioControls() {
  const speed = useAudioSpeed();
  const status = useTtsStatus();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted">{t('audio.speed')}</span>
        <div
          role="group"
          aria-label={t('audio.speed')}
          className="inline-flex rounded-lg border border-line bg-surface p-0.5"
        >
          {speeds.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={speed === value}
              onClick={() => setAudioSpeed(value)}
              className={`min-h-10 min-w-14 rounded-md px-3 font-semibold transition ${
                speed === value ? 'bg-brand text-brand-fg' : 'text-muted hover:text-fg'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {status !== 'ready' && (
        <div role="alert" className="rounded-lg border-l-4 border-warn bg-warn-soft p-4">
          <p className="font-bold">
            {status === 'unsupported' ? t('audio.unsupportedTitle') : t('audio.noVoiceTitle')}
          </p>
          <p className="mt-1 text-sm">
            {status === 'unsupported' ? t('audio.unsupportedBody') : t('audio.noVoiceBody')}
          </p>
        </div>
      )}
    </div>
  );
}
