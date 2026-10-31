import { useStore } from '@nanostores/react';
import { useEffect } from 'react';
import { $canSave, $progress, $ready, initProgress } from '../lib/progress-store';

/** Saved progress for a React island. `ready` is false until it has been read from the browser. */
export function useProgress() {
  const data = useStore($progress);
  const ready = useStore($ready);
  const canSave = useStore($canSave);
  useEffect(() => initProgress(), []);
  return { data, ready, canSave };
}
