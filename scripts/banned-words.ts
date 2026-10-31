import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// The site must never say "phase" (English) or "તબક્કો" (Gujarati). See pending.md §1.
const BANNED = [/phase/i, /તબક્કો/];

export function findBannedWords(text: string): string[] {
  return BANNED.filter((re) => re.test(text)).map((re) => re.source);
}

export function scanDir(dir: string): { file: string; word: string }[] {
  const hits: { file: string; word: string }[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      hits.push(...scanDir(path));
    } else if (/\.(astro|tsx?|json|md|css)$/.test(name)) {
      for (const word of findBannedWords(readFileSync(path, 'utf8'))) {
        hits.push({ file: path, word });
      }
    }
  }
  return hits;
}
