import { marked } from 'marked';

/** Render authored Gujarati markdown (lesson explanations) to HTML. Content is our own, not user input. */
export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false });
}
