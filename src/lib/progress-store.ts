import { atom } from 'nanostores';
import { emptyProgress, type ProgressData } from './progress-schema';
import { readProgress, STORAGE_KEY, writeProgress } from './progress-storage';

// The progress store used by the React islands. Saved in localStorage, shared between islands
// on a page and (through the `storage` event) between browser tabs.

export const $progress = atom<ProgressData>(emptyProgress());
/** False until saved progress has been read, so pages can avoid flashing an empty state. */
export const $ready = atom(false);
/** False when the browser would not let us save (private mode …): the learner should export a backup. */
export const $canSave = atom(true);

function applySettings(data: ProgressData) {
  document.documentElement.dataset.pron = data.settings.pronHelper ? 'on' : 'off';
}

let started = false;

/** Read saved progress once per page. Safe to call from every island. */
export function initProgress(): void {
  if (started || typeof window === 'undefined') return;
  started = true;
  const data = readProgress(localStorage);
  $progress.set(data);
  $ready.set(true);
  applySettings(data);
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      const next = readProgress(localStorage);
      $progress.set(next);
      applySettings(next);
    }
  });
}

/** Change progress with a pure function from progress-logic.ts and save the result. */
export function updateProgress(change: (data: ProgressData) => ProgressData): void {
  initProgress();
  const next = change($progress.get());
  $progress.set(next);
  $canSave.set(writeProgress(localStorage, next));
  applySettings(next);
}

/** Replace everything, e.g. after importing a backup. */
export function replaceProgress(data: ProgressData): void {
  updateProgress(() => data);
}

/** Forget all progress but keep the settings. */
export function resetProgress(): void {
  updateProgress((d) => ({ ...emptyProgress(), settings: d.settings }));
}
