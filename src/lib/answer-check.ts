// Checks typed German answers (pending.md §4 "Fill in the blank").
//  - trims and collapses whitespace, ignores final punctuation (. ! ? …)
//  - ignores case, except that nouns must be capitalised (not the first word of a sentence)
//  - accepts ae/oe/ue/ss for ä/ö/ü/ß, but the UI still shows the correct spelling

export type CheckReason = 'noun-capital';

export interface CheckResult {
  correct: boolean;
  /** The accepted answer that was matched (or the first one, if nothing matched). */
  canonical: string;
  /** True when the answer is right but spelled with ae/oe/ue/ss, so the UI should show `canonical`. */
  spellingNote: boolean;
  /** Set when the answer is wrong only because a noun was not capitalised. */
  reason?: CheckReason;
}

export interface CheckOptions {
  /**
   * Whether the first word is a sentence start (and so may be written in any case).
   * Defaults to true for answers of several words and false for a single word.
   */
  sentenceStart?: boolean;
}

export function normalize(text: string): string {
  return text
    .normalize('NFC')
    .replace(/[\u00a0\u2009\u202f]/g, ' ')
    .replace(/[‘’‚`´]/g, "'")
    .replace(/[“”„«»]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?…]+$/, '')
    .trim();
}

/** Lower-case and replace umlauts/ß with their ae/oe/ue/ss spellings. */
export function fold(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
}

function startsUpper(word: string): boolean {
  const letter = word.match(/\p{L}/u)?.[0];
  return letter !== undefined && letter !== letter.toLowerCase();
}

export function checkAnswer(
  input: string,
  accepted: string[],
  options: CheckOptions = {},
): CheckResult {
  const user = normalize(input);
  let capitalMiss: string | undefined;

  if (user !== '') {
    for (const raw of accepted) {
      const target = normalize(raw);
      if (fold(user) !== fold(target)) continue;

      const userWords = user.split(' ');
      const targetWords = target.split(' ');
      const exemptFirst = options.sentenceStart ?? targetWords.length > 1;
      const capitalsOk = targetWords.every(
        (word, i) => (i === 0 && exemptFirst) || !startsUpper(word) || startsUpper(userWords[i]),
      );

      if (capitalsOk) {
        return {
          correct: true,
          canonical: raw,
          spellingNote: user.toLowerCase() !== target.toLowerCase(),
        };
      }
      capitalMiss ??= raw;
    }
  }

  if (capitalMiss !== undefined) {
    return { correct: false, canonical: capitalMiss, spellingNote: false, reason: 'noun-capital' };
  }
  return { correct: false, canonical: accepted[0] ?? '', spellingNote: false };
}

/** Sentence-ordering: the built words must match the answer exactly (the words are given, nothing to type). */
export function checkOrder(built: string[], answer: string): boolean {
  return built.join(' ') === answer.replace(/\s+/g, ' ').trim();
}
