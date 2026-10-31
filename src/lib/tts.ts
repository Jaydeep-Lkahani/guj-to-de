// Minimal German text-to-speech via the browser. Step 5 adds voice picking, 0.7×/1× speed and fallbacks.

export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text: string, rate = 1): void {
  if (!isTtsSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = rate;
  const german = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith('de'));
  if (german) utterance.voice = german;
  synth.speak(utterance);
}
