import type { Exercise } from '../../content/schemas';

export type ExerciseOf<K extends Exercise['type']> = Extract<Exercise, { type: K }>;

/** What an exercise reports back when the learner checks (or completes) it. */
export interface CheckOutcome {
  correct: boolean;
  /** Extra Gujarati line for the feedback box, e.g. the correct spelling. */
  note?: string;
}

export interface ExerciseProps<K extends Exercise['type']> {
  exercise: ExerciseOf<K>;
  /** True once the answer has been checked: inputs are disabled and the Check button is hidden. */
  locked: boolean;
  onCheck: (outcome: CheckOutcome) => void;
}
