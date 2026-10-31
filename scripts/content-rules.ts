import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ZodType } from 'zod';
import { findBannedWords } from './banned-words';
import { levelOf } from '../src/lib/chapters';
import { chapterMetaSchema, chapterTestSchema, lessonSchema } from '../src/content/schemas';

export const MIN_LESSON_EXERCISES = 10; // pending.md §4: 10–20 exercises per lesson
export const MIN_TEST_EXERCISES = 25; // pending.md §4: 25–40 questions per chapter test
export const MAX_TEST_EXERCISES = 40;

export interface ContentError {
  file: string;
  message: string;
}

export interface ContentReport {
  errors: ContentError[];
  chapters: number;
  lessons: number;
}

type Json = unknown;

function pathToString(path: PropertyKey[], raw: Json): string {
  let out = '';
  let node: Json = raw;
  for (const part of path) {
    out += typeof part === 'number' ? `[${part}]` : out ? `.${String(part)}` : String(part);
    node = (node as Record<PropertyKey, Json> | undefined)?.[part];
    // Show which exercise type an error is in, e.g. exercises[3] (mcq).answer
    if (typeof part === 'number' && node && typeof node === 'object' && 'type' in node) {
      out += ` (${String((node as { type: unknown }).type)})`;
    }
  }
  return out;
}

class Collector {
  errors: ContentError[] = [];

  add(file: string, message: string) {
    this.errors.push({ file, message });
  }

  /** Read and parse a JSON file, checking it against a schema. Returns undefined if invalid. */
  load<T>(file: string, schema: ZodType<T>): T | undefined {
    const text = readFileSync(file, 'utf8');
    for (const word of findBannedWords(text)) {
      this.add(file, `contains banned word /${word}/ (use પ્રકરણ / પાઠ, never "phase" / "તબક્કો")`);
    }
    let raw: Json;
    try {
      raw = JSON.parse(text);
    } catch (e) {
      this.add(file, `invalid JSON: ${(e as Error).message}`);
      return undefined;
    }
    const result = schema.safeParse(raw);
    if (result.success) return result.data;
    for (const issue of result.error.issues) {
      const where = pathToString(issue.path, raw);
      this.add(file, where ? `${where}: ${issue.message}` : issue.message);
    }
    return undefined;
  }
}

const lessonFile = /^l(\d{2})\.json$/;

export function validateContent(root: string): ContentReport {
  const c = new Collector();
  const report: ContentReport = { errors: c.errors, chapters: 0, lessons: 0 };

  if (!existsSync(root)) {
    c.add(root, 'content folder not found');
    return report;
  }

  const vocabIds = new Map<string, string>(); // vocab id -> file that first used it

  for (const entry of readdirSync(root, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    if (entry.name.startsWith('.')) continue;
    const chapterDir = join(root, entry.name);
    if (!entry.isDirectory() || !/^ch\d{2}$/.test(entry.name)) {
      c.add(chapterDir, 'unexpected entry: chapter folders must be named ch01 … ch26');
      continue;
    }
    report.chapters++;
    const chapterNo = Number(entry.name.slice(2));

    // meta.json
    const metaFile = join(chapterDir, 'meta.json');
    const meta = existsSync(metaFile) ? c.load(metaFile, chapterMetaSchema) : undefined;
    if (!existsSync(metaFile)) c.add(metaFile, 'missing meta.json');
    if (meta) {
      if (meta.number !== chapterNo) {
        c.add(metaFile, `number is ${meta.number} but the folder is ${entry.name}`);
      }
      if (meta.number >= 1 && meta.number <= 26 && meta.level !== levelOf(meta.number)) {
        c.add(
          metaFile,
          `level is ${meta.level} but chapter ${meta.number} is ${levelOf(meta.number)}`,
        );
      }
      const seen = new Set<string>();
      for (const id of meta.lessons) {
        if (seen.has(id)) c.add(metaFile, `lessons: duplicate lesson id ${id}`);
        seen.add(id);
        if (!id.startsWith(`${entry.name}-`)) {
          c.add(metaFile, `lessons: ${id} does not belong to ${entry.name}`);
        }
      }
    }

    // lessons/*.json
    const lessonsDir = join(chapterDir, 'lessons');
    const files = existsSync(lessonsDir) ? readdirSync(lessonsDir).sort() : [];
    const onDisk = new Set<string>();
    for (const name of files) {
      const match = lessonFile.exec(name);
      const file = join(lessonsDir, name);
      if (!match) {
        c.add(file, 'unexpected file: lesson files must be named l01.json, l02.json …');
        continue;
      }
      report.lessons++;
      const expectedId = `${entry.name}-l${match[1]}`;
      onDisk.add(expectedId);
      const lesson = c.load(file, lessonSchema);
      if (!lesson) continue;

      if (lesson.id !== expectedId)
        c.add(file, `id is ${lesson.id} but the file name says ${expectedId}`);
      if (lesson.number !== Number(match[1])) {
        c.add(file, `number is ${lesson.number} but the file name says ${Number(match[1])}`);
      }
      if (lesson.exercises.length < MIN_LESSON_EXERCISES) {
        c.add(
          file,
          `exercises: has ${lesson.exercises.length}, every lesson needs at least ${MIN_LESSON_EXERCISES}`,
        );
      }
      lesson.vocab.forEach((v, i) => {
        if (!v.id.startsWith(`${lesson.id}-`)) {
          c.add(file, `vocab[${i}].id: ${v.id} must start with ${lesson.id}-`);
        }
        const first = vocabIds.get(v.id);
        if (first) c.add(file, `vocab[${i}].id: duplicate id ${v.id} (also used in ${first})`);
        else vocabIds.set(v.id, file);
      });
    }

    if (meta) {
      for (const id of meta.lessons) {
        if (!onDisk.has(id))
          c.add(metaFile, `lessons: ${id} is listed but lessons/${id.slice(5)}.json is missing`);
      }
      for (const id of onDisk) {
        if (!meta.lessons.includes(id))
          c.add(metaFile, `lessons: ${id} exists on disk but is not listed`);
      }
    }

    // test.json (optional until the chapter is finished)
    const testFile = join(chapterDir, 'test.json');
    if (existsSync(testFile)) {
      const test = c.load(testFile, chapterTestSchema);
      if (test) {
        if (test.chapter !== chapterNo) {
          c.add(testFile, `chapter is ${test.chapter} but the folder is ${entry.name}`);
        }
        const n = test.exercises.length;
        if (n < MIN_TEST_EXERCISES || n > MAX_TEST_EXERCISES) {
          c.add(
            testFile,
            `exercises: has ${n}, a chapter test needs ${MIN_TEST_EXERCISES}–${MAX_TEST_EXERCISES}`,
          );
        }
      }
    }
  }

  return report;
}
