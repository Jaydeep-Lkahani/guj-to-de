// Speech recognition (learner speaks German) via the browser's SpeechRecognition API.
// Works in Chrome / Edge / Android Chrome. Safari and Firefox get the record-and-compare fallback.

export type SpeechErrorCode =
  'unsupported' | 'not-allowed' | 'no-speech' | 'network' | 'audio-capture' | 'other';

export class SpeechError extends Error {
  constructor(public code: SpeechErrorCode) {
    super(code);
  }
}

// Minimal typings: lib.dom does not describe the (prefixed) recognition API
interface RecognitionResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

/** Safari (and iOS browsers) expose the API but it is unreliable, so they use the fallback. */
export function isSafari(userAgent: string): boolean {
  return (
    /safari/i.test(userAgent) && !/chrome|chromium|crios|fxios|edg|android|opr/i.test(userAgent)
  );
}

function getCtor(): RecognitionCtor | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function isRecognitionSupported(): boolean {
  return getCtor() !== undefined && !isSafari(navigator.userAgent);
}

function toCode(error: string): SpeechErrorCode {
  if (error === 'not-allowed' || error === 'service-not-allowed') return 'not-allowed';
  if (error === 'no-speech' || error === 'network' || error === 'audio-capture') return error;
  return 'other';
}

export interface Listening {
  /** Resolves with the recogniser's alternatives (best first); rejects with a SpeechError. */
  result: Promise<string[]>;
  /** Stop listening and use what was heard so far. */
  stop: () => void;
}

export function listen(): Listening {
  const Ctor = getCtor();
  if (!Ctor || isSafari(navigator.userAgent)) {
    return { result: Promise.reject(new SpeechError('unsupported')), stop: () => {} };
  }
  const recognition = new Ctor();
  recognition.lang = 'de-DE';
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 3;

  const result = new Promise<string[]>((resolve, reject) => {
    let heard: string[] = [];
    recognition.onresult = (e) => {
      const last = e.results[e.results.length - 1];
      heard = Array.from(last, (alternative) => alternative.transcript);
    };
    recognition.onerror = (e) => reject(new SpeechError(toCode(e.error)));
    recognition.onend = () =>
      heard.length > 0 ? resolve(heard) : reject(new SpeechError('no-speech'));
    try {
      recognition.start();
    } catch {
      reject(new SpeechError('other'));
    }
  });
  return { result, stop: () => recognition.stop() };
}
