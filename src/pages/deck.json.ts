import { getCollection } from 'astro:content';
import type { DeckWord } from '../lib/deck';

/**
 * Every vocabulary item, in lesson order, for the flashcard page. It is a separate file (not
 * page props) because it grows to thousands of words; the review page fetches it once.
 */
export async function GET() {
  const lessons = await getCollection('lessons');
  const words: DeckWord[] = lessons
    .sort((a, b) => a.data.id.localeCompare(b.data.id)) // "ch01-l02" sorts in lesson order
    .flatMap((lesson) =>
      lesson.data.vocab.map((v) => ({
        id: v.id,
        lessonId: lesson.data.id,
        de: v.de,
        gender: v.gender,
        plural: v.plural,
        gu: v.gu,
        pron_gu: v.pron_gu,
        example_de: v.example_de,
        example_gu: v.example_gu,
      })),
    );
  return new Response(JSON.stringify(words), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
