import { useEffect, useSyncExternalStore } from 'react';
import { emptyProgress } from '../lib/progress-schema';
import { $canSave, $progress, $ready, initProgress } from '../lib/progress-store';

// What the server renders: nothing saved yet. Hydration must start from this even when another
// island on the page has already loaded the real progress, otherwise React reports a mismatch.
const serverProgress = emptyProgress();

/** Saved progress for a React island. `ready` is false until it has been read from the browser. */
export function useProgress() {
  const data = useSyncExternalStore(
    (onChange) => $progress.listen(onChange),
    () => $progress.get(),
    () => serverProgress,
  );
  const ready = useSyncExternalStore(
    (onChange) => $ready.listen(onChange),
    () => $ready.get(),
    () => false,
  );
  const canSave = useSyncExternalStore(
    (onChange) => $canSave.listen(onChange),
    () => $canSave.get(),
    () => true,
  );
  useEffect(() => initProgress(), []);
  return { data, ready, canSave };
}
