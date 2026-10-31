// German text-to-speech through the browser's speechSynthesis (free, no audio files).
import { getRate } from './audio-prefs';

export type TtsStatus = 'ready' | 'no-german-voice' | 'unsupported';

export interface VoiceLike {
  lang: string;
  name: string;
  default?: boolean;
}

export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Higher is better; -1 means "not a German voice". */
export function scoreVoice(voice: VoiceLike): number {
  const lang = voice.lang.replace('_', '-').toLowerCase();
  if (!lang.startsWith('de')) return -1;
  let score = lang === 'de-de' ? 100 : 50; // prefer Germany over Austria/Switzerland
  if (/natural|neural|premium|enhanced|online/i.test(voice.name)) score += 20;
  if (/google/i.test(voice.name)) score += 10;
  if (/compact/i.test(voice.name)) score -= 10; // low-quality macOS/iOS voices
  if (/\(German \(Germany\)\)$/.test(voice.name)) score -= 5; // macOS novelty voices (Eddy, Grandma …)
  if (voice.default) score += 1;
  return score;
}

export function pickBestVoice<T extends VoiceLike>(voices: T[]): T | undefined {
  let best: T | undefined;
  let bestScore = -1;
  for (const voice of voices) {
    const score = scoreVoice(voice);
    if (score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }
  return best;
}

/** Chrome fills the voice list asynchronously, so wait briefly for it. */
function loadVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  const now = synth.getVoices();
  if (now.length > 0) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => {
      synth.removeEventListener('voiceschanged', done);
      clearTimeout(timer);
      resolve(synth.getVoices());
    };
    const timer = setTimeout(done, timeoutMs);
    synth.addEventListener('voiceschanged', done);
  });
}

export async function getTtsStatus(): Promise<TtsStatus> {
  if (!isTtsSupported()) return 'unsupported';
  return pickBestVoice(await loadVoices()) ? 'ready' : 'no-german-voice';
}

// Chrome can garbage-collect an utterance before it ends; keep a reference while it plays.
let current: SpeechSynthesisUtterance | undefined;

export function stopSpeaking(): void {
  if (isTtsSupported()) window.speechSynthesis.cancel();
}

/** Speak German text; resolves when it ends (or is interrupted). Does nothing without a German voice. */
export async function speak(text: string, rate: number = getRate()): Promise<void> {
  if (!isTtsSupported()) return;
  const voice = pickBestVoice(await loadVoices());
  if (!voice) return; // reading German with an English voice would teach wrong sounds
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = rate;
  current = utterance;
  await new Promise<void>((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    synth.speak(utterance);
  });
  if (current === utterance) current = undefined;
}
