/* eslint-disable @typescript-eslint/no-explicit-any -- these tests edit arbitrary JSON */
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { validateContent } from './content-rules';

const SAMPLE = 'scripts/fixtures/sample';
const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** Copy the valid sample to a temp folder so a test can break it. */
function sampleCopy() {
  const dir = mkdtempSync(join(tmpdir(), 'guj-de-content-'));
  tempDirs.push(dir);
  cpSync(SAMPLE, dir, { recursive: true });
  return dir;
}

function edit(file: string, change: (json: any) => void) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  change(data);
  writeFileSync(file, JSON.stringify(data, null, 2));
}

/** Break the lesson (or another file) in the sample and return the error messages. */
function errorsAfter(change: (lesson: any) => void, file = 'ch01/lessons/l01.json') {
  const dir = sampleCopy();
  edit(join(dir, file), change);
  return validateContent(dir).errors.map((e) => e.message);
}

describe('validateContent: valid content', () => {
  it('accepts the sample chapter', () => {
    const report = validateContent(SAMPLE);
    expect(report.errors).toEqual([]);
    expect(report.chapters).toBe(1);
    expect(report.lessons).toBe(1);
  });

  it('accepts an empty content folder', () => {
    const dir = mkdtempSync(join(tmpdir(), 'guj-de-empty-'));
    tempDirs.push(dir);
    expect(validateContent(dir).errors).toEqual([]);
  });
});

describe('validateContent: broken content fails with a clear message', () => {
  it('reports invalid JSON syntax', () => {
    const dir = sampleCopy();
    writeFileSync(join(dir, 'ch01/lessons/l01.json'), '{ "id": "ch01-l01", ');
    const [error] = validateContent(dir).errors;
    expect(error.file).toContain('l01.json');
    expect(error.message).toMatch(/^invalid JSON:/);
  });

  it('reports a missing content folder', () => {
    expect(validateContent('does/not/exist').errors[0].message).toBe('content folder not found');
  });

  it('reports an mcq answer outside the options, naming the exercise', () => {
    expect(errorsAfter((l) => (l.exercises[0].answer = 7))).toContain(
      'exercises[0] (mcq).answer: answer must be an index into options',
    );
  });

  it('reports an exercise without an explanation', () => {
    const errors = errorsAfter((l) => delete l.exercises[1].explain_gu);
    expect(errors.some((m) => m.startsWith('exercises[1] (fill).explain_gu'))).toBe(true);
  });

  it('reports a blank explanation', () => {
    const errors = errorsAfter((l) => (l.exercises[2].explain_gu = '   '));
    expect(errors.some((m) => m.startsWith('exercises[2] (fill).explain_gu'))).toBe(true);
  });

  it('reports a fill exercise without a gap', () => {
    const errors = errorsAfter((l) => (l.exercises[1].sentence_de = 'Ich bin Raj.'));
    expect(errors).toContain('exercises[1] (fill).sentence_de: must contain a ___ gap');
  });

  it('reports an unknown exercise type', () => {
    const errors = errorsAfter((l) => (l.exercises[0].type = 'quiz'));
    expect(errors.some((m) => m.startsWith('exercises[0]'))).toBe(true);
  });

  it('reports an order exercise whose words do not match the answer', () => {
    const errors = errorsAfter((l) => (l.exercises[6].words = ['bin', 'Ich', 'Priya.']));
    expect(errors.some((m) => m.includes('exercises[6] (order).words'))).toBe(true);
  });

  it('reports a listen answer that does not fit its options', () => {
    const errors = errorsAfter((l) => (l.exercises[8].answer = 'Lukas'));
    expect(errors.some((m) => m.includes('exercises[8] (listen).answer'))).toBe(true);
  });

  it('reports a grammar table row with the wrong number of cells', () => {
    const errors = errorsAfter((l) => l.grammar[0].tables[0].rows[0].push('extra'));
    expect(errors.some((m) => m.includes('grammar[0].tables[0]'))).toBe(true);
  });

  it('reports a lesson with fewer than 10 exercises', () => {
    const errors = errorsAfter((l) => (l.exercises = l.exercises.slice(0, 4)));
    expect(errors).toContain('exercises: has 4, every lesson needs at least 10');
  });

  it('reports duplicate vocabulary ids', () => {
    const errors = errorsAfter((l) => l.vocab.push({ ...l.vocab[0] }));
    expect(errors.some((m) => m.includes('duplicate id ch01-l01-hallo'))).toBe(true);
  });

  it('reports a vocabulary id from another lesson', () => {
    const errors = errorsAfter((l) => (l.vocab[0].id = 'ch01-l02-hallo'));
    expect(errors).toContain('vocab[0].id: ch01-l02-hallo must start with ch01-l01-');
  });

  it('reports the banned word "phase" and its Gujarati form', () => {
    expect(errorsAfter((l) => (l.goal_gu = 'Phase 1 પૂર્ણ કરો.')).join()).toContain('banned word');
    expect(errorsAfter((l) => (l.goal_gu = 'પહેલો તબક્કો.')).join()).toContain('banned word');
  });

  it('reports a lesson id that does not match its file name', () => {
    const errors = errorsAfter((l) => (l.id = 'ch01-l05'));
    expect(errors).toContain('id is ch01-l05 but the file name says ch01-l01');
  });

  it('reports a wrong CEFR level for the chapter', () => {
    const errors = errorsAfter((m) => (m.level = 'B2'), 'ch01/meta.json');
    expect(errors).toContain('level is B2 but chapter 1 is A1');
  });

  it('reports a chapter number that does not match its folder', () => {
    const errors = errorsAfter((m) => (m.number = 2), 'ch01/meta.json');
    expect(errors).toContain('number is 2 but the folder is ch01');
  });

  it('reports a lesson listed in meta.json but missing on disk', () => {
    const errors = errorsAfter((m) => m.lessons.push('ch01-l02'), 'ch01/meta.json');
    expect(errors).toContain('lessons: ch01-l02 is listed but lessons/l02.json is missing');
  });

  it('reports a lesson file that meta.json does not list', () => {
    const errors = errorsAfter((m) => (m.lessons = ['ch01-l09']), 'ch01/meta.json');
    expect(errors).toContain('lessons: ch01-l01 exists on disk but is not listed');
  });

  it('reports a chapter test with too few questions', () => {
    const dir = sampleCopy();
    const { exercises } = JSON.parse(readFileSync(join(dir, 'ch01/lessons/l01.json'), 'utf8'));
    writeFileSync(join(dir, 'ch01/test.json'), JSON.stringify({ chapter: 1, exercises }));
    const messages = validateContent(dir).errors.map((e) => e.message);
    expect(messages).toContain(`exercises: has ${exercises.length}, a chapter test needs 25–40`);

    const padded = Array.from({ length: 25 }, (_, i) => exercises[i % exercises.length]);
    writeFileSync(join(dir, 'ch01/test.json'), JSON.stringify({ chapter: 1, exercises: padded }));
    expect(validateContent(dir).errors).toEqual([]);
  });

  it('reports a folder that is not a chapter', () => {
    const dir = sampleCopy();
    writeFileSync(join(dir, 'notes.txt'), 'hello');
    expect(validateContent(dir).errors[0].message).toMatch(/unexpected entry/);
  });
});

describe('npm run validate:content (CLI)', () => {
  const run = (...args: string[]) =>
    spawnSync('npx', ['tsx', 'scripts/validate-content.ts', ...args], { encoding: 'utf8' });

  it('exits 0 for the sample', () => {
    const result = run(SAMPLE);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Content OK');
  });

  it('exits 1 and prints file + problem for broken content', () => {
    const dir = sampleCopy();
    edit(join(dir, 'ch01/lessons/l01.json'), (l) => (l.exercises[0].answer = 7));
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('l01.json');
    expect(result.stderr).toContain(
      'exercises[0] (mcq).answer: answer must be an index into options',
    );
  });
});
