// Playback speed for German audio (pending.md §6: speed 0.7× / 1×). Remembered in localStorage;
// if storage is unavailable the choice just lasts for the page view.

export type AudioSpeed = 'normal' | 'slow';

export const RATES: Record<AudioSpeed, number> = { normal: 1, slow: 0.7 };

const KEY = 'audioSpeed';
const EVENT = 'audio-speed-change';

let inMemory: AudioSpeed | undefined;

export function getAudioSpeed(): AudioSpeed {
  if (inMemory) return inMemory;
  try {
    return localStorage.getItem(KEY) === 'slow' ? 'slow' : 'normal';
  } catch {
    return 'normal';
  }
}

export function setAudioSpeed(speed: AudioSpeed): void {
  inMemory = speed;
  try {
    localStorage.setItem(KEY, speed);
  } catch {
    // storage unavailable
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeAudioSpeed(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export function getRate(): number {
  return RATES[getAudioSpeed()];
}
