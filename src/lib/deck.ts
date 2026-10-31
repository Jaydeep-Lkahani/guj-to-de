import { lessonDone } from './progress-logic';
import type { ProgressData, ReviewMode } from './progress-schema';
import { isDue, reviewCard, type Grade } from './srs';

// The flashcard deck. A word is in the deck once its lesson is completed (nothing is copied, so
// lessons completed before flashcards existed count too). Its schedule is saved in progress.cards
// after the first review; a word without a schedule is "new".

/** One vocabulary item as the review page needs it (served as /deck.json). */
export interface DeckWord {
  id: string;
  lessonId: string;
  de: string;
  gender: 'der' | 'die' | 'das' | null;
  plural?: string;
  gu: string;
  pron_gu?: string;
  example_de: string;
  example_gu: string;
}

/** New words introduced per study session, so a big lesson does not bury the learner. */
export const NEW_PER_SESSION = 20;

/** Words from completed lessons, in lesson order. */
export function deckWords(words: DeckWord[], data: ProgressData): DeckWord[] {
  return words.filter((w) => lessonDone(data, w.lessonId));
}

/** The article mode only works for nouns. */
export function wordsForMode(words: DeckWord[], mode: ReviewMode): DeckWord[] {
  return mode === 'article' ? words.filter((w) => w.gender !== null) : words;
}

export interface DeckCounts {
  /** Reviewed before and due today or overdue. */
  due: number;
  /** Never reviewed in this mode. */
  fresh: number;
  /** Reviewed at least once. */
  learned: number;
}

export function deckCounts(
  words: DeckWord[],
  data: ProgressData,
  mode: ReviewMode,
  today: string,
): DeckCounts {
  const cards = data.cards[mode];
  const counts: DeckCounts = { due: 0, fresh: 0, learned: 0 };
  for (const word of wordsForMode(deckWords(words, data), mode)) {
    const card = cards[word.id];
    if (!card) counts.fresh++;
    else {
      counts.learned++;
      if (isDue(card, today)) counts.due++;
    }
  }
  return counts;
}

/** What to study now: every due word (most overdue first), then up to `newLimit` new words. */
export function buildSession(
  words: DeckWord[],
  data: ProgressData,
  mode: ReviewMode,
  today: string,
  newLimit: number = NEW_PER_SESSION,
): DeckWord[] {
  const cards = data.cards[mode];
  const inDeck = wordsForMode(deckWords(words, data), mode);
  const due = inDeck
    .filter((w) => cards[w.id] && isDue(cards[w.id]!, today))
    .sort((a, b) => cards[a.id]!.due.localeCompare(cards[b.id]!.due)); // stable: same day keeps lesson order
  const fresh = inDeck.filter((w) => !cards[w.id]).slice(0, newLimit);
  return [...due, ...fresh];
}

export function recordReview(
  data: ProgressData,
  mode: ReviewMode,
  wordId: string,
  grade: Grade,
  today: string,
): ProgressData {
  return {
    ...data,
    cards: {
      ...data.cards,
      [mode]: { ...data.cards[mode], [wordId]: reviewCard(data.cards[mode][wordId], grade, today) },
    },
  };
}

/** How many reviewed words are due on `date` (for "tomorrow: 12 cards"). */
export function dueOn(data: ProgressData, mode: ReviewMode, date: string): number {
  return Object.values(data.cards[mode]).filter((c) => c.due <= date).length;
}
