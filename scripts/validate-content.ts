// Placeholder until Step 3 adds Zod schema checks. For now: enforce the banned-words rule.
import { scanDir } from './banned-words';

const hits = scanDir('src');
if (hits.length > 0) {
  for (const { file, word } of hits) console.error(`Banned word /${word}/ found in ${file}`);
  process.exit(1);
}
console.log('Content OK');
