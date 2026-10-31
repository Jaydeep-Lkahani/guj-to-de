# CLAUDE.md — rules for working on this project

Gujarati-language website that teaches German from A0 to B2. Full plan: `pending.md` (read it at the start of every session, then pick the first unticked task in §8).

## Hard rules (pending.md §1)

- UI and explanations are in **Gujarati**; German example text stays German (`lang="de"` on German spans, `<html lang="gu">`).
- **Never** write "phase" or "તબક્કો" anywhere. Use **પ્રકરણ** (chapter) and **પાઠ** (lesson). `npm run validate:content` enforces this.
- CEFR labels (A1, A2, B1, B2) are allowed as badges.
- Fonts: Noto Sans Gujarati for Gujarati, Inter for German. ä ö ü ß must render correctly.
- No hard-coded UI strings in components once `ui-gu.json` exists (Step 2); use `t()`.
- Use the standard UI words in pending.md §5 consistently.

## Content quality rules (pending.md §7)

1. German must be correct Hochdeutsch: check verb position, cases, genders, adjective endings, spelling (ß, umlauts, noun capitals).
2. Gujarati must be simple, natural, everyday Gujarati (a good teacher speaking, not a formal textbook).
3. Examples and exercises use only grammar taught in earlier lessons (unless marked new).
4. Vocabulary follows the official Goethe lists per level; no rare words before B2.
5. Write original texts. Never copy from Goethe/telc papers, textbooks or websites.
6. Every exercise has `explain_gu`, saying why the answer is right.
7. Use Indian-relevant contexts where natural (Raj, Priya next to Lukas, Anna).
8. Run `npm run validate:content` after every content change.

## Stack

Astro (static) + React islands, TypeScript strict, Tailwind CSS v4 (via `@tailwindcss/vite`), Zod for content schemas, Vitest, ESLint + Prettier. Progress is stored in `localStorage` (no backend).

## Commands

| Command                    | What it does                            |
| -------------------------- | --------------------------------------- |
| `npm run dev`              | Dev server (http://localhost:4321)      |
| `npm run build`            | `astro check` + production build        |
| `npm test`                 | Vitest                                  |
| `npm run lint`             | ESLint                                  |
| `npm run validate:content` | Content checks (schemas + banned words) |

## How to work (pending.md §9)

1. Read `pending.md` and this file first.
2. Take the first unticked task in §8 unless the owner says otherwise. One chapter per session for content work.
3. Before finishing: `npm run validate:content && npm test && npm run build` must all pass.
4. Tick the boxes in `pending.md`, add a Change Log line, commit with a clear message.
5. If something in the plan is unclear, add it to §0 Open Questions and ask the owner. Don't guess on important things.
