import { fold } from './answer-check';

// Compares what the speech recogniser heard with the sentence the learner should say.
// Word-level: each target word counts if a similar word was heard in the right order.

export interface WordMatch {
  word: string;
  ok: boolean;
}

export interface SpeechComparison {
  /** Share of target words that were heard (0–1). */
  score: number;
  passed: boolean;
  words: WordMatch[];
  /** The recogniser alternative that matched best. */
  heard: string;
}

export const PASS_SCORE = 0.8;

const DIGIT_WORDS = [
  'null',
  'eins',
  'zwei',
  'drei',
  'vier',
  'fünf',
  'sechs',
  'sieben',
  'acht',
  'neun',
  'zehn',
  'elf',
  'zwölf',
  'dreizehn',
  'vierzehn',
  'fünfzehn',
  'sechzehn',
  'siebzehn',
  'achtzehn',
  'neunzehn',
  'zwanzig',
];

/** Lower-case words without punctuation, umlaut-folded. Recognisers often write numbers as digits. */
export function tokens(text: string, spellOutDigits = false): string[] {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      spellOutDigits && /^\d{1,2}$/.test(word) && Number(word) <= 20
        ? DIGIT_WORDS[Number(word)]
        : word,
    )
    .map(fold);
}

export function levenshtein(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[b.length];
}

/** 1 = identical, 0 = nothing in common. */
export function similarity(a: string, b: string): number {
  const longest = Math.max(a.length, b.length);
  return longest === 0 ? 1 : 1 - levenshtein(a, b) / longest;
}

/** Short words must match exactly; longer words may differ a little (recognisers are not perfect). */
function sameWord(a: string, b: string): boolean {
  if (a === b) return true;
  return Math.min(a.length, b.length) >= 4 && similarity(a, b) >= 0.75;
}

function compareOne(target: string[], heard: string[]): boolean[] {
  // Longest common subsequence with fuzzy word equality, so word order counts
  const n = target.length;
  const m = heard.length;
  const lcs = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = sameWord(target[i], heard[j])
        ? lcs[i + 1][j + 1] + 1
        : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const ok = new Array<boolean>(n).fill(false);
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (sameWord(target[i], heard[j]) && lcs[i][j] === lcs[i + 1][j + 1] + 1) {
      ok[i++] = true;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) i++;
    else j++;
  }
  return ok;
}

/** Compare the target sentence with the recogniser's alternatives and keep the best one. */
export function compareSpeech(target: string, alternatives: string[]): SpeechComparison {
  const targetWords = target.normalize('NFC').split(/\s+/).filter(Boolean);
  const targetTokens = targetWords.map((w) => tokens(w)[0] ?? '');
  let best: SpeechComparison = {
    score: 0,
    passed: false,
    words: targetWords.map((word) => ({ word, ok: false })),
    heard: alternatives[0] ?? '',
  };

  for (const alternative of alternatives) {
    const ok = compareOne(targetTokens, tokens(alternative, true));
    const score = targetTokens.length === 0 ? 0 : ok.filter(Boolean).length / targetTokens.length;
    if (score > best.score || (score === best.score && best.heard === '')) {
      best = {
        score,
        passed: score >= PASS_SCORE,
        words: targetWords.map((word, k) => ({ word, ok: ok[k] })),
        heard: alternative,
      };
    }
  }
  return best;
}
