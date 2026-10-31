import { addDays } from './progress-logic';
import type { CardState } from './progress-schema';

// Spaced repetition: the SM-2 algorithm (SuperMemo 2). Pure functions, dates are local "YYYY-MM-DD".
//  - a correct answer pushes the next review further away (1 day, 6 days, then interval × ease)
//  - a wrong answer ("again") starts the word over: due tomorrow, and it counts as a lapse
//  - ease says how fast the interval grows; "easy" raises it, "hard" lowers it (never below 1.3)

export type Grade = 'again' | 'hard' | 'good' | 'easy';
export const GRADES: Grade[] = ['again', 'hard', 'good', 'easy'];

export const START_EASE = 2.5;
export const MIN_EASE = 1.3;

/** SM-2 answer quality (0–5) for each button. */
const QUALITY: Record<Grade, number> = { again: 1, hard: 3, good: 4, easy: 5 };

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Days until the next review if `card` (undefined = a new word) is answered with `grade`. */
export function nextInterval(card: CardState | undefined, grade: Grade): number {
  if (grade === 'again') return 1;
  const reps = (card?.reps ?? 0) + 1;
  if (reps === 1) return 1;
  if (reps === 2) return 6;
  return Math.round((card?.interval ?? 0) * (card?.ease ?? START_EASE));
}

/** The new state after answering. `today` is the day of the answer. */
export function reviewCard(card: CardState | undefined, grade: Grade, today: string): CardState {
  const ease = card?.ease ?? START_EASE;
  const interval = nextInterval(card, grade);

  if (grade === 'again') {
    return {
      ease,
      interval,
      reps: 0,
      // a word that was never answered correctly cannot "relapse"
      lapses: (card?.lapses ?? 0) + ((card?.reps ?? 0) > 0 ? 1 : 0),
      due: addDays(today, interval),
    };
  }

  const q = QUALITY[grade];
  const nextEase = Math.max(MIN_EASE, ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  return {
    ease: round2(nextEase),
    interval,
    reps: (card?.reps ?? 0) + 1,
    lapses: card?.lapses ?? 0,
    due: addDays(today, interval),
  };
}

/** Is a reviewed word due today (or overdue)? Words never reviewed are "new", not due. */
export function isDue(card: CardState, today: string): boolean {
  return card.due <= today;
}
