import { z } from 'zod';
import { CHAPTER_COUNT } from '../lib/chapters';

// Zod schemas for chapter content (pending.md §6). Used by Astro's content collections
// (src/content.config.ts) and by scripts/validate-content.ts.

const text = z.string().trim().min(1, 'must not be empty');

export const levelSchema = z.enum(['A1', 'A2', 'B1', 'B2']);

export const genderSchema = z.enum(['der', 'die', 'das']).nullable();

export const vocabItemSchema = z.object({
  id: z.string().regex(/^ch\d{2}-l\d{2}-[a-z0-9_-]+$/, 'must look like "ch01-l02-hallo" (ASCII)'),
  de: text,
  gender: genderSchema,
  plural: text.optional(),
  gu: text,
  pron_gu: text.optional(),
  example_de: text,
  example_gu: text,
  level: levelSchema,
  tags: z.array(text).optional(),
});

const grammarTableSchema = z
  .object({
    headers: z.array(text).min(1),
    rows: z.array(z.array(z.string())).min(1),
  })
  .refine((table) => table.rows.every((row) => row.length === table.headers.length), {
    message: 'every row must have as many cells as there are headers',
    path: ['rows'],
  });

export const grammarBlockSchema = z.object({
  title_gu: text,
  explanation_gu: text,
  tables: z.array(grammarTableSchema).optional(),
  examples: z.array(z.object({ de: text, gu: text, note_gu: text.optional() })).min(1),
});

// Every exercise needs explain_gu (pending.md §7 rule 6), including types that §6 lists without it.
// topic_gu (optional) names the topic for the weak-topics list on the progress page.
const explain = { explain_gu: text, topic_gu: text.optional() };

const mcqSchema = z
  .object({
    type: z.literal('mcq'),
    prompt_gu: text,
    prompt_de: text.optional(),
    options: z.array(text).min(2),
    answer: z.number().int().min(0),
    ...explain,
  })
  .refine((q) => q.answer < q.options.length, {
    message: 'answer must be an index into options',
    path: ['answer'],
  });

const fillSchema = z.object({
  type: z.literal('fill'),
  sentence_de: text.refine((s) => s.includes('___'), 'must contain a ___ gap'),
  answers: z.array(text).min(1),
  hint_gu: text.optional(),
  ...explain,
});

const articleSchema = z.object({
  type: z.literal('article'),
  noun: text,
  answer: z.enum(['der', 'die', 'das']),
  ...explain,
});

const matchSchema = z.object({
  type: z.literal('match'),
  pairs: z.array(z.object({ de: text, gu: text })).min(2),
  ...explain,
});

const words = (s: string) => s.split(/\s+/).filter(Boolean).sort();

const orderSchema = z
  .object({
    type: z.literal('order'),
    words: z.array(text).min(2),
    answer: text,
    gu: text,
    ...explain,
  })
  .refine((q) => words(q.words.join(' ')).join('\u0000') === words(q.answer).join('\u0000'), {
    message: 'words must be exactly the words of answer, just in a different order',
    path: ['words'],
  });

const listenSchema = z
  .object({
    type: z.literal('listen'),
    audio_text_de: text,
    question_gu: text,
    options: z.array(text).min(2).optional(),
    answer: z.union([text, z.number().int().min(0)]),
    ...explain,
  })
  .refine(
    (q) =>
      q.options
        ? typeof q.answer === 'number' && q.answer < q.options.length
        : typeof q.answer === 'string',
    {
      message:
        'with options, answer must be an index into options; without options, answer must be the text to type',
      path: ['answer'],
    },
  );

const translateSchema = z.object({
  type: z.literal('translate'),
  gu: text,
  answers_de: z.array(text).min(1),
  ...explain,
});

const speakSchema = z.object({
  type: z.literal('speak'),
  text_de: text,
  gu: text,
  ...explain,
});

const trueFalseSchema = z.object({
  type: z.literal('truefalse'),
  text_de: text,
  statements: z.array(z.object({ de: text, answer: z.boolean() })).min(1),
  ...explain,
});

export const exerciseSchema = z.discriminatedUnion('type', [
  mcqSchema,
  fillSchema,
  articleSchema,
  matchSchema,
  orderSchema,
  listenSchema,
  translateSchema,
  speakSchema,
  trueFalseSchema,
]);

export const lessonSchema = z.object({
  id: z.string().regex(/^ch\d{2}-l\d{2}$/, 'must look like "ch01-l02"'),
  number: z.number().int().min(1),
  title_gu: text,
  goal_gu: text,
  vocab: z.array(vocabItemSchema),
  grammar: z.array(grammarBlockSchema),
  dialogue: z
    .object({ lines: z.array(z.object({ speaker: text, de: text, gu: text })).min(1) })
    .optional(),
  exercises: z.array(exerciseSchema),
  speaking: z.object({ shadowing: z.array(text).min(1), prompt_gu: text }),
  writing: z.object({
    task_gu: text,
    model_answer_de: text,
    checklist_gu: z.array(text).min(1),
  }),
  summary_gu: z.array(text).min(1),
});

export const chapterMetaSchema = z.object({
  number: z.number().int().min(1).max(CHAPTER_COUNT),
  level: levelSchema,
  title_gu: text,
  description_gu: text,
  can_do_gu: z.array(text).min(1),
  estimated_hours: z.number().positive(),
  lessons: z.array(z.string().regex(/^ch\d{2}-l\d{2}$/)).min(1),
});

// Not in pending.md §6: the shape of test.json (chapter test, §4)
export const chapterTestSchema = z.object({
  chapter: z.number().int().min(1).max(CHAPTER_COUNT),
  pass_mark: z.number().min(1).max(100).default(70),
  exercises: z.array(exerciseSchema),
});

// Not in pending.md §6: the sounds shown on the pronunciation page (src/content-shared/sounds.json)
export const soundSchema = z.object({
  id: z.string().regex(/^[a-z-]+$/, 'must be lowercase letters and dashes'),
  letters: text,
  helper_gu: text,
  /** True when the Gujarati helper is only an approximation (ö, ü, r). */
  approx: z.boolean().optional(),
  tip_gu: text,
  examples: z.array(z.object({ de: text, pron_gu: text, gu: text })).min(1),
});

export const soundsSchema = z.object({
  groups: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z-]+$/),
        title_gu: text,
        intro_gu: text,
        sounds: z.array(soundSchema).min(1),
      }),
    )
    .min(1),
  quiz: z.array(exerciseSchema),
});

export type Exercise = z.infer<typeof exerciseSchema>;
export type Sound = z.infer<typeof soundSchema>;
export type Sounds = z.infer<typeof soundsSchema>;
export type VocabItem = z.infer<typeof vocabItemSchema>;
export type GrammarBlock = z.infer<typeof grammarBlockSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type ChapterMeta = z.infer<typeof chapterMetaSchema>;
export type ChapterTest = z.infer<typeof chapterTestSchema>;
