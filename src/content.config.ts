import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { chapterMetaSchema, chapterTestSchema, lessonSchema } from './content/schemas';

// Layout: src/content/chapters/ch01/{meta.json, lessons/l01.json …, test.json}
// Entry ids are the path without extension, e.g. "ch01/meta", "ch01/lessons/l01".
const base = './src/content/chapters';

const chapters = defineCollection({
  loader: glob({ pattern: '*/meta.json', base }),
  schema: chapterMetaSchema,
});

const lessons = defineCollection({
  loader: glob({ pattern: '*/lessons/*.json', base }),
  schema: lessonSchema,
});

const chapterTests = defineCollection({
  loader: glob({ pattern: '*/test.json', base }),
  schema: chapterTestSchema,
});

export const collections = { chapters, lessons, chapterTests };
