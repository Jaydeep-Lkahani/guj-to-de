import { useEffect, useRef, useState } from 'react';
import { t } from '../lib/t';
import AudioButton from './AudioButton';
import { Btn } from './exercises/ui';

type State = 'idle' | 'recording' | 'recorded';

/** Record yourself and play it back; with `modelText`, also play the model audio to compare. */
export default function Recorder({ modelText }: { modelText?: string }) {
  const [state, setState] = useState<State>('idle');
  const [url, setUrl] = useState<string>();
  const [error, setError] = useState<string>();
  const [supported, setSupported] = useState(true);
  const recorder = useRef<MediaRecorder | undefined>(undefined);
  const urlRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    setSupported(typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia);
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      recorder.current?.stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const start = async () => {
    setError(undefined);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType }));
        setUrl(urlRef.current);
        setState('recorded');
      };
      recorder.current = rec;
      rec.start();
      setState('recording');
    } catch {
      setError(t('speech.micDenied'));
      setState('idle');
    }
  };

  if (!supported) return <p className="text-sm text-muted">{t('speech.noRecorder')}</p>;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {state === 'recording' ? (
          <Btn variant="secondary" onClick={() => recorder.current?.stop()}>
            <span
              className="mr-2 inline-block size-3 animate-pulse rounded-full bg-bad"
              aria-hidden="true"
            />
            {t('speech.stopRecording')}
          </Btn>
        ) : (
          <Btn variant={state === 'recorded' ? 'ghost' : 'primary'} onClick={start}>
            {state === 'recorded' ? t('speech.recordAgain') : `● ${t('speech.record')}`}
          </Btn>
        )}
        {state === 'recording' && (
          <span className="text-sm text-muted">{t('speech.recording')}</span>
        )}
      </div>
      {error && (
        <p role="alert" className="text-bad">
          {error}
        </p>
      )}
      {state === 'recorded' && url && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">{t('speech.yourRecording')}</p>
          <audio controls src={url} className="w-full" />
          {modelText && (
            <div className="flex items-center gap-3">
              <AudioButton text={modelText} />
              <span lang="de">{modelText}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
