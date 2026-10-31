// Usage: npm run validate:content [content-folder]   (default: src/content/chapters)
import { resolve } from 'node:path';
import { scanDir } from './banned-words';
import { validateContent } from './content-rules';

const root = process.argv[2] ?? 'src/content/chapters';

const report = validateContent(root);
const errors = report.errors.map(({ file, message }) => `${file}\n    ${message}`);

// The banned-word rule also covers UI strings, pages and components (pending.md §1)
for (const { file, word } of scanDir('src')) {
  errors.push(`${file}\n    contains banned word /${word}/`);
}

if (errors.length > 0) {
  console.error(`\nContent check failed with ${errors.length} problem(s):\n`);
  console.error(errors.map((e) => `  ✗ ${e}`).join('\n\n'));
  process.exit(1);
}
console.log(
  `Content OK: ${report.chapters} chapter(s), ${report.lessons} lesson(s) in ${resolve(root)}`,
);
