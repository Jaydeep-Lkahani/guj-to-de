import { useEffect, useState, useSyncExternalStore } from 'react';
import { getAudioSpeed, subscribeAudioSpeed, type AudioSpeed } from '../lib/audio-prefs';
import { isRecognitionSupported } from '../lib/speech';
import { getTtsStatus, type TtsStatus } from '../lib/tts';

/** German voice availability. Starts as 'ready' so server-rendered buttons are enabled until we know. */
export function useTtsStatus(): TtsStatus {
  const [status, setStatus] = useState<TtsStatus>('ready');
  useEffect(() => {
    let live = true;
    getTtsStatus().then((s) => live && setStatus(s));
    return () => {
      live = false;
    };
  }, []);
  return status;
}

export function useAudioSpeed(): AudioSpeed {
  return useSyncExternalStore(subscribeAudioSpeed, getAudioSpeed, () => 'normal');
}

/** null while unknown (before mount), then true/false. */
export function useRecognitionSupported(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => setSupported(isRecognitionSupported()), []);
  return supported;
}
