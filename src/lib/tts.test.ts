import { afterEach, describe, expect, it, vi } from 'vitest';
import { pickBestVoice, scoreVoice, speak, getTtsStatus } from './tts';
import { RATES } from './audio-prefs';

const voice = (name: string, lang: string, extra: object = {}) => ({ name, lang, ...extra });

describe('scoreVoice / pickBestVoice', () => {
  it('ignores non-German voices', () => {
    expect(scoreVoice(voice('Samantha', 'en-US'))).toBe(-1);
    expect(pickBestVoice([voice('Samantha', 'en-US')])).toBeUndefined();
    expect(pickBestVoice([])).toBeUndefined();
  });

  it('prefers de-DE over Austrian and Swiss German', () => {
    const picked = pickBestVoice([
      voice('Sepp', 'de-AT'),
      voice('Anna', 'de-DE'),
      voice('Vreni', 'de-CH'),
    ]);
    expect(picked?.name).toBe('Anna');
  });

  it('accepts underscore language tags (some Android versions)', () => {
    expect(scoreVoice(voice('Deutsch', 'de_DE'))).toBeGreaterThanOrEqual(100);
  });

  it('prefers natural/online voices and avoids compact ones', () => {
    const picked = pickBestVoice([
      voice('Anna (Compact)', 'de-DE'),
      voice('Katja', 'de-DE'),
      voice('Microsoft Katja Online (Natural) - German (Germany)', 'de-DE'),
    ]);
    expect(picked?.name).toContain('Natural');
    expect(scoreVoice(voice('Anna (Compact)', 'de-DE'))).toBeLessThan(
      scoreVoice(voice('Katja', 'de-DE')),
    );
  });

  it('prefers the standard macOS voice to its novelty voices, whatever the list order', () => {
    const picked = pickBestVoice([
      voice('Eddy (German (Germany))', 'de-DE'),
      voice('Grandma (German (Germany))', 'de-DE'),
      voice('Anna', 'de-DE'),
    ]);
    expect(picked?.name).toBe('Anna');
  });

  it('takes a German voice over a better-named voice in another language', () => {
    expect(pickBestVoice([voice('Google US English', 'en-US'), voice('Hans', 'de-DE')])?.name).toBe(
      'Hans',
    );
  });

  it('prefers Google Deutsch to an unlabelled de-DE voice', () => {
    expect(pickBestVoice([voice('Hans', 'de-DE'), voice('Google Deutsch', 'de-DE')])?.name).toBe(
      'Google Deutsch',
    );
  });
});

/** A fake speechSynthesis that records what is spoken. */
function fakeSpeech(voices: object[]) {
  const spoken: { text: string; rate: number; lang: string; voice: unknown }[] = [];
  const synth = {
    getVoices: () => voices,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    cancel: vi.fn(),
    speak: (u: { text: string; rate: number; lang: string; voice: unknown; onend: () => void }) => {
      spoken.push({ text: u.text, rate: u.rate, lang: u.lang, voice: u.voice });
      u.onend();
    },
  };
  class Utterance {
    onend: () => void = () => {};
    onerror: () => void = () => {};
    voice: unknown;
    lang = '';
    rate = 1;
    constructor(public text: string) {}
  }
  vi.stubGlobal('window', { speechSynthesis: synth, localStorage: undefined });
  vi.stubGlobal('SpeechSynthesisUtterance', Utterance);
  return { spoken, synth };
}

afterEach(() => vi.unstubAllGlobals());

describe('speak / getTtsStatus', () => {
  it('speaks with the best German voice at the given rate', async () => {
    const { spoken } = fakeSpeech([voice('Samantha', 'en-US'), voice('Anna', 'de-DE')]);
    await speak('Guten Tag', RATES.slow);
    expect(spoken).toEqual([
      { text: 'Guten Tag', rate: 0.7, lang: 'de-DE', voice: voice('Anna', 'de-DE') },
    ]);
  });

  it('does not speak when there is no German voice', async () => {
    const { spoken } = fakeSpeech([voice('Samantha', 'en-US')]);
    await speak('Guten Tag');
    expect(spoken).toEqual([]);
  });

  it('reports the status', async () => {
    fakeSpeech([voice('Anna', 'de-DE')]);
    expect(await getTtsStatus()).toBe('ready');
    fakeSpeech([voice('Samantha', 'en-US')]);
    vi.useFakeTimers();
    const status = getTtsStatus();
    await vi.advanceTimersByTimeAsync(0);
    expect(await status).toBe('no-german-voice');
    vi.useRealTimers();
  });

  it('reports unsupported browsers', async () => {
    vi.stubGlobal('window', {});
    expect(await getTtsStatus()).toBe('unsupported');
  });
});
