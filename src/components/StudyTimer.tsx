import { useEffect } from 'react';
import { addStudySeconds, localDate } from '../lib/progress-logic';
import { updateProgress } from '../lib/progress-store';

const TICK_SECONDS = 10;
const IDLE_AFTER_MS = 2 * 60_000; // no touch/key/scroll for 2 minutes = not studying

/** Renders nothing. Counts study time while the tab is visible and the learner is active. */
export default function StudyTimer() {
  useEffect(() => {
    let lastActive = Date.now();
    const touch = () => {
      lastActive = Date.now();
    };
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));

    const timer = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastActive > IDLE_AFTER_MS) return;
      updateProgress((d) => addStudySeconds(d, localDate(), TICK_SECONDS));
    }, TICK_SECONDS * 1000);

    return () => {
      clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, touch));
    };
  }, []);
  return null;
}
