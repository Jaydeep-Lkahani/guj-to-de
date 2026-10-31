import { emptyProgress, migrateProgress, type ProgressData } from './progress-schema';

// Reading and writing progress in a Storage-like object (localStorage in the browser, a fake in tests).

export const STORAGE_KEY = 'guj-de:progress';
export const CORRUPT_KEY = 'guj-de:progress:corrupt';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

/**
 * Load saved progress. Anything unreadable is copied to a backup key (so it is never silently lost)
 * and the learner starts fresh.
 */
export function readProgress(storage: StorageLike): ProgressData {
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return emptyProgress(); // storage blocked
  }
  if (raw === null) return emptyProgress();
  try {
    return migrateProgress(JSON.parse(raw));
  } catch {
    try {
      storage.setItem(CORRUPT_KEY, raw);
    } catch {
      // nothing more we can do
    }
    return emptyProgress();
  }
}

/** Returns false when the browser refuses to store it (private mode, full disk …). */
export function writeProgress(storage: StorageLike, data: ProgressData): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
