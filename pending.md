# pending.md — German (A0 → B2) Learning Website in Gujarati

> **Who reads this file:** the builder model (Claude Sonnet) and the project owner.
> **Status:** Planning done (by Opus). Building in progress — Steps 1–6 done, next is Step 7.
> **Rule:** Every time a task below is finished, tick its checkbox `[x]` and add a one-line note in the **Change Log** at the bottom.

---

## 0. Open Questions (owner must answer before/while building)

Defaults are already chosen so building can start. If the owner answers differently, update this file first.

| # | Question | Default used until answered |
|---|----------|-----------------------------|
| Q1 | What is the learner's current German level? | Absolute beginner (A0) |
| Q2 | How many hours per day can he study, realistically? | 4 hours/day, 6 days/week |
| Q3 | Which exam? Goethe B2, telc B2, telc Deutsch B1-B2 Pflege (nursing), ÖSD B2, or TestDaF? | Goethe-Zertifikat B2 |
| Q4 | Which job field? (IT, nursing, engineering, hospitality, other) | IT / general office |
| Q5 | Progress saved only on his device, or login + sync across phone & laptop? | Device only (browser storage) + export/import backup file |
| Q6 | Hosting & domain? | Free static hosting (GitHub Pages / Netlify / Vercel), no custom domain |
| Q7 | Mainly phone or laptop? | Phone first, must also work well on laptop |
| Q8 | Any paid services OK? (high-quality voice audio, AI writing feedback) | No — free browser features only in v1 |
| Q9 | Show German pronunciation written in Gujarati script? | Yes for Chapters 1–6, optional toggle after that |

---

## 1. Goal

Build a website, fully in **Gujarati** (UI + explanations), that takes the learner from **zero German to B2**, so he can:

1. Pass a **B2 German exam** (default: Goethe-Zertifikat B2).
2. Apply for and work in **German-speaking jobs** (job applications, interviews, workplace talk).

The website is organised into **chapters** (Gujarati: **પ્રકરણ**).

### Hard rules for the website

- **Never** use the word "phase" anywhere on the site (English or Gujarati — do **not** use **તબક્કો**). Use **પ્રકરણ** (chapter) and **પાઠ** (lesson).
- CEFR level labels (A1, A2, B1, B2) **may** be shown as small badges, because the exam uses them.
- All instructions, grammar explanations, meanings and UI text are in **Gujarati**. German example text stays in German.
- Gujarati font: **Noto Sans Gujarati** (Google Fonts). German text: a clean Latin font (e.g. Inter). Make sure ä ö ü ß render correctly.

---

## 2. Is 6 months realistic? (honest answer)

Research-based estimates for German (Goethe-Institut guidance) say **A0 → B2 needs about 600–750 hours** of study in total (lessons + self-study + practice).

| Daily study (6 days/week) | Hours per month | Time to B2 |
|---|---|---|
| **4–5 h/day (full-time)** | ~100–120 h | **6–7 months** ✅ |
| 3 h/day | ~75 h | 8–10 months |
| 2 h/day | ~50 h | 12–14 months |
| 1 h/day | ~25 h | 2+ years |

**Verdict:**
- **B2 exam in 6 months is possible only if he studies ~4 hours/day, 6 days/week**, consistently, and also gets real speaking practice (tutor or language partner). Plan for **6–7 months** and book the exam for **month 7** to have a buffer.
- If he is working/studying alongside, the realistic target is **9–12 months**.
- **"Native-like" is not realistic in 6 months.** B2 means "independent user": he can work, write emails, attend meetings and interviews, but with mistakes. Native-like is C1–C2 and takes 1–2+ years, usually after living/working in Germany. B2 is enough for many jobs (IT often accepts B1–B2; nursing recognition needs B2).
- A website alone is not enough for speaking. He needs **2–3 speaking sessions per week** with a tutor or tandem partner (e.g. italki, Preply, Tandem app, local Goethe-Zentrum/Max Mueller Bhavan classes).
- **Book the exam early.** Exam centres in India often fill up months ahead.

### Recommended daily routine (4 h) — shown on the site as "દૈનિક દિનચર્યા"

| Time | Activity |
|---|---|
| 30 min | Flashcard review (spaced repetition) |
| 60 min | New lesson (grammar + vocabulary) |
| 45 min | Listening (lesson audio + free external: DW "Nicos Weg", Easy German on YouTube, DW "Langsam gesprochene Nachrichten") |
| 30 min | Speaking: shadowing / reading aloud / recording himself |
| 30 min | Writing task |
| 30 min | Reading |

---

## 3. Curriculum — 26 Chapters

Timeline assumes 4 h/day. If hours are fewer, the chapter order stays the same, only the dates stretch.

| Level | Chapters | Weeks | Cumulative vocabulary target |
|---|---|---|---|
| A1 | 1–6 | 1–5 | ~650 words |
| A2 | 7–12 | 6–10 | ~1,300 words |
| B1 | 13–18 | 11–17 | ~2,400 words |
| B2 | 19–26 | 18–26 | ~4,000 words |

### A1 (Chapters 1–6)

| Ch | Gujarati title (suggested) | Grammar | Topics / Vocabulary | Skills |
|---|---|---|---|---|
| 1 | જર્મન ભાષાની શરૂઆત | Alphabet, pronunciation rules (ä, ö, ü, ß, ch, sch, ei/ie, eu, w/v/z/j, sp/st), personal pronouns, *sein* | Greetings, introducing yourself, countries, languages | Pronounce any German word, introduce yourself |
| 2 | સંખ્યા, સમય અને દિવસો | *haben*, W-questions, present tense regular verbs | Numbers 0–1000, time, days, months, dates | Ask/tell time, give phone number |
| 3 | નામ અને લિંગ (der/die/das) | Noun gender, definite/indefinite articles, plurals, *nicht* vs *kein* | Family, household objects, colours | Describe family and things |
| 4 | રોજિંદી દિનચર્યા | Irregular present verbs, verb-second word order, yes/no questions, separable verbs | Daily routine, food, drinks, shopping | Order food, describe your day |
| 5 | કર્મ (Akkusativ) અને સહાયક ક્રિયાપદો | Accusative, modal verbs (können, müssen, wollen, möchten, dürfen, sollen) | Appointments, hobbies, abilities | Make an appointment, say what you can/must do |
| 6 | શહેર, રસ્તો અને ભૂતકાળ | Perfekt (spoken past), possessive articles, imperative | City, directions, transport | Ask for directions; **A1 mock test** |

### A2 (Chapters 7–12)

| Ch | Grammar | Topics | Skills |
|---|---|---|---|
| 7 | Dative, dative prepositions, two-way prepositions (Wechselpräpositionen) | Home, flat, furniture, renting | Describe your flat, where things are |
| 8 | Präteritum of sein/haben/modals; *weil, dass, wenn* clauses | Health, body, doctor, pharmacy | Explain symptoms, give reasons |
| 9 | Adjective endings (intro), comparative & superlative | Clothes, shopping, weather | Compare products, complain politely |
| 10 | Reflexive verbs, verbs with prepositions, da-/wo- words | Leisure, travel, holidays | Talk about plans and experiences |
| 11 | Konjunktiv II for politeness (würde, hätte, wäre, könnte) | Work basics, phone calls, formal vs informal emails | Write a short formal email, phone call |
| 12 | Future (*werden*), relative clauses (intro), *zu* + infinitive (intro) | Education, plans, goals | **A2 mock test** |

### B1 (Chapters 13–18)

| Ch | Grammar | Topics | Skills |
|---|---|---|---|
| 13 | Full Präteritum, Plusquamperfekt, temporal connectors (als, wenn, während, nachdem, bevor, seitdem, bis) | Biography, life stories | Tell a story in the past |
| 14 | Passive voice (present, past, Perfekt) | Media, news, processes | Describe a process |
| 15 | Genitive, all relative clauses, n-declension | Environment, society | Describe and define things precisely |
| 16 | Connectors: obwohl, trotzdem, deshalb, damit, um…zu, ohne…zu, statt…zu | Opinions, discussions | Give and defend an opinion |
| 17 | Konjunktiv II past, indirect questions | Job search, CV (Lebenslauf) basics | Ask polite indirect questions |
| 18 | B1 review | B1 exam format (Lesen, Hören, Schreiben, Sprechen) | **B1 mock exam** (checkpoint) |

### B2 (Chapters 19–26)

| Ch | Grammar | Topics | Skills |
|---|---|---|---|
| 19 | Advanced passive (Zustandspassiv, passive with modals, passive alternatives), nominal style | Science, technology | Read formal texts |
| 20 | Konjunktiv I (reported speech), extended participle attributes | News, reports | Report what others said |
| 21 | Two-part connectors (sowohl…als auch, weder…noch, je…desto, zwar…aber), modal particles (doch, ja, mal, eben, halt) | Everyday spoken German, culture | Sound natural in conversation |
| 22 | Noun-verb combinations (Nomen-Verb-Verbindungen), formal register, argumentation phrases | Workplace: meetings, emails, small talk | Write an argumentative text (Forumsbeitrag / Erörterung) |
| 23 | Review of weak grammar points | **Job German**: Anschreiben, Lebenslauf, Vorstellungsgespräch, workplace culture, field vocabulary (from Q4) | Write a cover letter, do a mock interview |
| 24 | Review | **Living in Germany**: Anmeldung, bank, insurance, Ausländerbehörde, contracts | Handle official situations |
| 25 | Exam strategy | B2 exam module by module: Lesen, Hören, Schreiben, Sprechen — tips, timing, scoring | Exam technique |
| 26 | Final review | **2 full B2 mock exams** + review of mistakes | Exam readiness |

**Goethe B2 format (verify on goethe.de before building Ch 25–26):** 4 modules — Lesen (~65 min), Hören (~40 min), Schreiben (~75 min), Sprechen (~15 min); 60% needed per module; modules can be taken separately.

---

## 4. Structure of every chapter

Each chapter has **5–7 lessons (પાઠ)** + a chapter test. Each lesson ≈ one day of study.

Every lesson contains, in this order:

1. **ઉદ્દેશ (Goal)** — 2–3 lines in Gujarati: what he will be able to do.
2. **શબ્દભંડોળ (Vocabulary)** — 15–40 words. Each word: German, article (der/die/das colour-coded: der = blue, die = red, das = green), plural, Gujarati meaning, example sentence, audio button, Gujarati-script pronunciation (Ch 1–6).
3. **વ્યાકરણ (Grammar)** — explanation in simple Gujarati, comparison with Gujarati/English where it helps, tables, 5+ examples.
4. **સંવાદ (Dialogue)** — a short realistic German dialogue with Gujarati translation (toggle), audio.
5. **મહાવરો (Practice)** — 10–20 exercises mixed from the exercise types below.
6. **બોલવાનો મહાવરો (Speaking)** — sentences to repeat (shadowing) + one free-speaking prompt.
7. **લેખન (Writing)** — one writing task with a model answer and self-check list.
8. **સારાંશ (Summary)** — key points + new words added to flashcards automatically.

**Chapter test (પ્રકરણ કસોટી):** 25–40 questions. Pass mark 70%. Passing unlocks the next chapter (owner can switch locking off in settings).

### Exercise types (build each as a reusable component)

- Multiple choice
- Fill in the blank (typed answer; accept answers with/without umlaut alternatives like `ae` for `ä` but show the correct spelling)
- Choose the article (der/die/das)
- Match pairs (German ↔ Gujarati)
- Sentence ordering (drag/tap words into the right order)
- Listening: hear audio → choose/type answer (dictation)
- Translation Gujarati → German (typed, with accepted alternatives list)
- Speaking: say the sentence → browser speech recognition checks it (Chrome/Edge/Android); fallback = record & compare with model audio
- True / false (reading or listening text)

### Gujarati pronunciation convention (Ch 1–6)

Audio is always the source of truth; Gujarati script is only a helper.

| German | Gujarati helper | Example |
|---|---|---|
| w | વ | Wasser → વાસર |
| v | ફ | Vater → ફાટર |
| z | ત્સ | Zeit → ત્સાઇટ |
| j | ય | ja → યા |
| s (before vowel) | ઝ | Sonne → ઝોને |
| sp / st (word start) | શ્પ / શ્ટ | Straße → શ્ટ્રાસે |
| ei | આઇ | mein → માઇન |
| ie | ઈ | Liebe → લીબે |
| eu / äu | ઓય | heute → હોયટે |
| ä | એ | Mädchen → મેડશેન |
| ö | ્યો (approx., lips rounded) | schön → શ્યોન |
| ü | ્યૂ (approx., lips rounded) | für → ફ્યૂર |
| ch after a/o/u | ખ | Buch → બૂખ |
| ch after e/i/ä/ö/ü | શ (soft) | ich → ઇશ |
| final -er | અ / અર | Lehrer → લેહરર |

Chapter 1 must teach these with audio and say clearly that ö and ü have no exact Gujarati sound.

---

## 5. Website features

| Area | Gujarati name | What it does |
|---|---|---|
| Home / dashboard | મુખ્ય પાનું | Today's task, streak, hours studied, current chapter, days left to exam date |
| Chapters list | પ્રકરણો | All 26 chapters with level badge, progress %, locked/unlocked |
| Lesson page | પાઠ | Sections from §4 |
| Flashcards | પુનરાવર્તન | Spaced-repetition review of all learned words (SM-2 or simple FSRS) |
| Pronunciation | ઉચ્ચાર | Sound-by-sound practice from Chapter 1 |
| Mock exams | પરીક્ષા અભ્યાસ | A1, A2, B1, B2 mock tests with timer and score per module |
| Progress | પ્રગતિ | Chapter scores, weak grammar topics, words learned, study-hours chart |
| Grammar glossary | વ્યાકરણ શબ્દકોશ | German grammar terms explained in Gujarati, searchable |
| Word search | શબ્દ શોધ | Search all vocabulary (German or Gujarati) |
| How to study | અભ્યાસ કેવી રીતે કરવો | Daily routine, external free resources, exam booking tips |
| Settings | સેટિંગ્સ | Exam date, daily goal, chapter locking on/off, pronunciation helper on/off, audio speed, export/import progress |

### Standard UI words (use these consistently)

| English | Gujarati |
|---|---|
| Chapter | પ્રકરણ |
| Lesson | પાઠ |
| Vocabulary | શબ્દભંડોળ |
| Grammar | વ્યાકરણ |
| Dialogue | સંવાદ |
| Practice | મહાવરો |
| Test | કસોટી |
| Exam | પરીક્ષા |
| Progress | પ્રગતિ |
| Pronunciation | ઉચ્ચાર |
| Review | પુનરાવર્તન |
| Start | શરૂ કરો |
| Next | આગળ |
| Back | પાછળ |
| Check answer | જવાબ તપાસો |
| Correct / Wrong | સાચું / ખોટું |
| Try again | ફરી પ્રયાસ કરો |
| Completed | પૂર્ણ |
| Locked | લૉક |
| Listen | સાંભળો |
| Speak | બોલો |
| Write | લખો |
| Read | વાંચો |

---

## 6. Technical decisions

| Topic | Decision | Why |
|---|---|---|
| Framework | **Astro** (static site) + **React** islands for interactive parts | Content-heavy site, fast on phones, free hosting |
| Language | TypeScript (strict) | Catches content and code mistakes |
| Styling | Tailwind CSS | Fast, consistent, mobile-first |
| Content | JSON files in `src/content/`, validated with **Zod** schemas (Astro content collections) | Sonnet can generate content safely; build fails on bad content |
| State / progress | `localStorage` via a small store (nanostores), wrapped in try/catch, versioned | No backend needed; export/import JSON backup |
| Audio | Browser **Web Speech API** (`speechSynthesis`, voice `de-DE`), speed control | Free. Later (if Q8 = yes) swap for pre-generated audio files |
| Speech check | `webkitSpeechRecognition` with `lang = "de-DE"` where available; fallback MediaRecorder | Free; works on Chrome/Edge/Android |
| Offline | PWA (installable on phone, offline lessons) via `@vite-pwa/astro` | He can study without internet |
| Tests | Vitest for logic (SRS, answer checking, scoring) + content validation script | Keeps quality |
| Hosting | GitHub Pages / Netlify / Vercel (free) | No cost |
| Analytics | None | Privacy, simplicity |

### Folder structure

```
/
├── pending.md                  ← this file
├── CLAUDE.md                   ← short rules for Sonnet (create in Step 1)
├── astro.config.mjs
├── package.json
├── public/                     ← icons, manifest, (later) audio files
├── scripts/
│   ├── validate-content.ts     ← CLI: checks every chapter JSON against schemas + extra rules
│   ├── content-rules.ts        ← the cross-file rules (ids, counts, banned words …)
│   └── fixtures/sample/        ← small valid sample chapter used by tests
├── src/
│   ├── content.config.ts       ← Astro content collections (Astro 7 location)
│   ├── content/
│   │   ├── schemas.ts          ← Zod schemas (shared by Astro and validate-content)
│   │   └── chapters/
│   │       ├── ch01/
│   │       │   ├── meta.json
│   │       │   ├── lessons/l01.json … l06.json
│   │       │   └── test.json
│   │       └── ch02/ …
│   ├── content-shared/
│   │   ├── glossary.json       ← grammar terms
│   │   ├── ui-gu.json          ← all Gujarati UI strings (no hard-coded text in components)
│   │   └── mock-exams/a1.json, a2.json, b1.json, b2-1.json, b2-2.json
│   ├── components/
│   │   ├── exercises/          ← one component per exercise type
│   │   ├── VocabCard.tsx, AudioButton.tsx, Dialogue.tsx, GrammarTable.astro …
│   ├── lib/
│   │   ├── progress.ts         ← progress store, export/import, schema versioning
│   │   ├── srs.ts              ← spaced repetition
│   │   ├── answer-check.ts     ← normalisation (umlauts, case, punctuation)
│   │   ├── tts.ts, speech.ts
│   ├── layouts/
│   └── pages/
│       ├── index.astro
│       ├── chapters/index.astro
│       ├── chapters/[ch]/index.astro
│       ├── chapters/[ch]/[lesson].astro
│       ├── chapters/[ch]/test.astro
│       ├── review.astro, pronunciation.astro, exam/[id].astro
│       ├── progress.astro, glossary.astro, search.astro, how-to-study.astro, settings.astro
```

### Content schema (TypeScript shape — implement as Zod)

```ts
type Gender = "der" | "die" | "das" | null;

interface VocabItem {
  id: string;            // "ch01-l02-hallo"
  de: string;            // "Hallo"
  gender: Gender;
  plural?: string;       // "die Häuser"
  gu: string;            // Gujarati meaning
  pron_gu?: string;      // Gujarati-script helper (Ch 1–6)
  example_de: string;
  example_gu: string;
  level: "A1" | "A2" | "B1" | "B2";
  tags?: string[];       // "verb", "irregular", "work" …
}

interface GrammarBlock {
  title_gu: string;
  explanation_gu: string;   // markdown, Gujarati
  tables?: { headers: string[]; rows: string[][] }[];
  examples: { de: string; gu: string; note_gu?: string }[];
}

type Exercise =
  | { type: "mcq"; prompt_gu: string; prompt_de?: string; options: string[]; answer: number; explain_gu: string }
  | { type: "fill"; sentence_de: string /* uses ___ */; answers: string[]; hint_gu?: string; explain_gu: string }
  | { type: "article"; noun: string; answer: "der" | "die" | "das"; explain_gu: string }
  | { type: "match"; pairs: { de: string; gu: string }[] }
  | { type: "order"; words: string[]; answer: string; gu: string }
  | { type: "listen"; audio_text_de: string; question_gu: string; options?: string[]; answer: string | number }
  | { type: "translate"; gu: string; answers_de: string[] }
  | { type: "speak"; text_de: string; gu: string }
  | { type: "truefalse"; text_de: string; statements: { de: string; answer: boolean }[] };

interface Lesson {
  id: string; number: number;
  title_gu: string; goal_gu: string;
  vocab: VocabItem[];
  grammar: GrammarBlock[];
  dialogue?: { lines: { speaker: string; de: string; gu: string }[] };
  exercises: Exercise[];
  speaking: { shadowing: string[]; prompt_gu: string };
  writing: { task_gu: string; model_answer_de: string; checklist_gu: string[] };
  summary_gu: string[];
}

interface ChapterMeta {
  number: number; level: "A1" | "A2" | "B1" | "B2";
  title_gu: string; description_gu: string;
  can_do_gu: string[];        // "હું મારો પરિચય આપી શકું છું" …
  estimated_hours: number;
  lessons: string[];          // lesson ids in order
}
```

---

## 7. Content quality rules (very important)

1. **German must be correct, standard Hochdeutsch.** After writing each lesson, re-read every German sentence and check: verb position, case endings, article genders, adjective endings, spelling (ß vs ss, umlauts, noun capitalisation).
2. **Gujarati must be simple, natural, everyday Gujarati** — like a good teacher speaking, not formal textbook Gujarati. Use English grammar words in brackets when helpful, e.g. "કર્તા (Nominativ)".
3. Only use grammar already taught in earlier lessons inside examples and exercises (except clearly marked "new" items).
4. Vocabulary follows the official Goethe word lists for each level (A1, A2, B1) and common B2 topics. No rare words before B2.
5. **No copying** from Goethe/telc model papers, textbooks (Menschen, Netzwerk, Schritte, etc.) or websites. Write original texts. Link to official free practice material instead.
6. Every exercise has an explanation (`explain_gu`) of **why** the answer is right.
7. Use Indian-relevant contexts where natural (names like Raj, Priya next to Lukas, Anna; Indian food; moving from Gujarat to Germany).
8. Never use "phase" / "તબક્કો".
9. Run `npm run validate:content` after every content change; it must pass.

---

## 8. Build Plan (step by step, for Sonnet)

**Key principle:** Build the app + Chapter 1 first, so the learner can **start studying in week 1**. After that, content creation must always stay **at least 2 chapters ahead** of where he is.

Each step = one Sonnet session (or a few). At the end of every step: run build + tests, tick boxes, update the Change Log.

### Step 1 — Project setup
- [x] Create Astro + React + TypeScript (strict) + Tailwind project
- [x] Add Noto Sans Gujarati + Inter fonts; set `<html lang="gu">`; German text spans get `lang="de"`
- [x] Add Vitest, ESLint, Prettier; scripts: `dev`, `build`, `test`, `validate:content`
- [x] Create `CLAUDE.md` with the short version of §1 rules, §7 quality rules and "how to work" (§9)
- [x] `git init`, first commit
- **Done when:** `npm run build` and `npm test` pass, blank Gujarati home page renders on phone width

### Step 2 — Design system & layout
- [x] Mobile-first layout: top bar, bottom nav on phone (મુખ્ય, પ્રકરણો, પુનરાવર્તન, પ્રગતિ, સેટિંગ્સ), side nav on desktop
- [x] Light + dark mode
- [x] Article colours (der blue / die red / das green) as design tokens
- [x] `ui-gu.json` for all UI strings + small `t()` helper
- [x] Base components: Button, Card, ProgressBar, LevelBadge, Callout, Table
- **Done when:** all pages exist as empty shells with navigation working at 360px width

### Step 3 — Content schemas & validation
- [x] Zod schemas from §6 in `src/content/schemas.ts` (wired into Astro via `src/content.config.ts`)
- [x] `scripts/validate-content.ts`: schema check + rules (unique ids, every exercise has explanation, MCQ answer index in range, no "phase"/"તબક્કો" anywhere, every lesson has ≥10 exercises)
- [x] Sample tiny chapter to test the pipeline
- **Done when:** a broken JSON fails validation with a clear message

### Step 4 — Lesson page & exercise engine
- [x] Lesson page renders all sections from §4
- [x] Components for all 9 exercise types
- [x] `answer-check.ts`: trim, ignore case for non-nouns, accept `ae/oe/ue/ss` but show correct spelling, ignore final punctuation; unit tests
- [x] Feedback UI: correct/wrong + Gujarati explanation, retry
- **Done when:** sample lesson fully playable; answer-check tests pass

### Step 5 — Audio & speaking
- [x] `tts.ts`: pick best `de-DE` voice, speed 0.7× / 1× toggle, graceful message if no German voice
- [x] AudioButton on every German word/sentence
- [x] `speech.ts`: speech recognition (`de-DE`), compare with target (word-level similarity), fallback record & playback
- **Done when:** works on Chrome Android + desktop Chrome; Safari shows fallback

### Step 6 — Progress, unlocking & dashboard
- [x] `progress.ts`: lesson completion, exercise scores, chapter test scores, study minutes, streak; versioned schema; export/import JSON
- [x] Chapter unlocking at ≥70% (setting to disable)
- [x] Dashboard: today's task, streak, current chapter, days to exam date
- [x] Progress page: chapter scores, weak topics (tags with lowest scores), words learned
- **Done when:** progress survives reload; export → clear → import restores everything

### Step 7 — Flashcards (spaced repetition)
- [ ] `srs.ts` (SM-2 is fine) with unit tests
- [ ] Words from completed lessons enter the deck automatically
- [ ] Review page: German → Gujarati and Gujarati → German modes, article practice mode
- **Done when:** due cards appear correctly over simulated days in tests

### Step 8 — Chapter 1 (golden template) ⭐
- [ ] Full Chapter 1 content: pronunciation (all sounds from §4 table), greetings, introducing yourself, *sein*, pronouns
- [ ] Pronunciation page with sound-by-sound practice
- [ ] Chapter 1 test
- [ ] Owner + learner review Gujarati wording → fix
- **Done when:** learner can complete Chapter 1 end-to-end on his phone. **This chapter becomes the template for all others.**

### Step 9 — Deploy (learner starts studying)
- [ ] PWA: manifest, icons, offline caching of lessons
- [ ] Deploy to free hosting; share link with learner
- **Done when:** site installs on his phone and works offline

### Step 10 — Chapters 2–6 (A1) + A1 mock test
- [ ] Ch 2 [ ] Ch 3 [ ] Ch 4 [ ] Ch 5 [ ] Ch 6
- [ ] A1 mock exam (original content)

### Step 11 — Chapters 7–12 (A2) + A2 mock test
- [ ] Ch 7 [ ] Ch 8 [ ] Ch 9 [ ] Ch 10 [ ] Ch 11 [ ] Ch 12
- [ ] A2 mock exam

### Step 12 — Chapters 13–18 (B1) + B1 mock exam
- [ ] Ch 13 [ ] Ch 14 [ ] Ch 15 [ ] Ch 16 [ ] Ch 17 [ ] Ch 18
- [ ] Mock exam page: timer, 4 modules, score per module, 60% pass display

### Step 13 — Chapters 19–24 (B2 + job + life in Germany)
- [ ] Ch 19 [ ] Ch 20 [ ] Ch 21 [ ] Ch 22 [ ] Ch 23 (field from Q4) [ ] Ch 24

### Step 14 — Exam preparation (Ch 25–26)
- [ ] Verify current exam format on the official site (Q3) before writing
- [ ] Ch 25 module strategies
- [ ] Ch 26 + two full B2 mock exams with model answers for Schreiben and Sprechen evaluation checklists

### Step 15 — Extra pages & polish
- [ ] Grammar glossary, word search, "how to study" page with daily routine and free resources
- [ ] Accessibility pass (keyboard, contrast, screen-reader labels)
- [ ] Performance check on a low-end Android phone

### Later / optional (only if owner says yes to Q5/Q8)
- [ ] Login + cloud sync of progress
- [ ] Pre-generated high-quality audio files
- [ ] AI feedback on writing and speaking (needs a small backend + API key)

---

## 9. How Sonnet should work (session rules)

1. Start every session by reading `pending.md` and `CLAUDE.md`.
2. Pick the **first unticked task** in §8 (unless the owner says otherwise).
3. One chapter per session for content work. Before writing a chapter, read the previous chapter's meta and vocabulary so you do not repeat or skip.
4. After changes: `npm run validate:content && npm test && npm run build` — all must pass.
5. Tick the boxes, add a Change Log line, commit with a clear message.
6. If something in this plan is unclear or wrong, write it in **§0 Open Questions** and ask the owner — do not guess on important things.

### Prompt the owner can paste to start a Sonnet session

```
Read pending.md and CLAUDE.md. Continue with the first unticked task in §8.
Follow the content quality rules in §7. When finished, run validate/test/build,
tick the boxes, update the Change Log, and tell me what to check.
```

---

## 10. Change Log

| Date | What changed |
|---|---|
| 2026-10-31 | Plan created (Opus 5.5). Defaults chosen for open questions Q1–Q9. |
| 2026-10-31 | Step 1 done: Astro 7 + React + TS strict + Tailwind 4 project, fonts, Vitest/ESLint/Prettier, `CLAUDE.md`, banned-word check in `validate:content` (full Zod validation comes in Step 3). |
| 2026-10-31 | Step 2 done: light/dark theme tokens (incl. der/die/das colours), `ui-gu.json` + typed `t()`, phone bottom nav + desktop side nav, base components (Button, Card, ProgressBar, LevelBadge, Callout, Table), empty shells for all page routes. Lesson shells exist only for Chapter 1 until real content (Step 4/8); `/dev/design` showcase is dev-only. |
| 2026-10-31 | Step 3 done: Zod schemas in `src/content/schemas.ts` (all 9 exercise types), Astro collections in `src/content.config.ts`, `validate:content` with file + path + message errors, sample chapter fixture, 25 rule tests. **Decisions:** `explain_gu` is required on *every* exercise type (§7.6 says so; the §6 type listing omitted it for match/order/listen/translate/speak/truefalse). `test.json` shape is `{chapter, pass_mark (default 70), exercises}`, optional until a chapter is finished, 25–40 exercises when present. Astro 7 reads collections from `src/content.config.ts`, not `src/content/config.ts`. Astro warns "No files found" until Chapter 1 exists (Step 8). |
| 2026-10-31 | Step 4 done: lesson page (all §4 sections), 9 exercise components + `ExerciseRunner` (check → feedback → retry / show answer → score = first-try correct), `answer-check.ts` (23 tests), chapter page, chapter-test page, minimal `tts.ts`/`AudioButton` for listening exercises (Step 5 upgrades them). `src/content/chapters/ch01` currently holds a copy of the **sample chapter as placeholder content** — Step 8 replaces it with the real Chapter 1. Speak exercise is "I said it" self-check until Step 5 adds recognition. Answer rules: only *final* punctuation is ignored (commas matter); nouns must be capitalised except a sentence-initial word. Added ä ö ü ß keys under typed answers. Note: the banned-word check also scans code identifiers, so never name variables `phase`. |
| 2026-10-31 | Step 5 done: `tts.ts` (best de-DE voice: prefers de-DE, natural/online/Google, avoids compact + macOS novelty voices; waits for Chrome's async voice list; refuses to read German with a non-German voice), 1×/0.7× speed (`audio-prefs.ts`, remembered), `AudioButton` on every German word/sentence, no-voice notice with install steps, `speech.ts` recognition (`de-DE`, Safari forced to fallback), word-level `speech-compare.ts` (pass ≥ 80% of words, order counts, digits→number words), `SpeechChecker` with per-word marks, `Recorder` record-and-playback fallback, `ShadowingList`. **Verified in the app browser only:** real macOS German voices, a faked recogniser (error/fail/pass), a synthetic audio stream for the recorder. **Not yet verified on a real Android Chrome phone, with a real microphone, or in real Safari** — do this before relying on it (see Step 9). Audio speed also needs a control on the Settings page (Step 6). |
| 2026-10-31 | Step 6 done: versioned progress (`progress-schema.ts`, `progress-logic.ts`, `progress-storage.ts`, nanostores `progress-store.ts`; corrupt data is kept under `guj-de:progress:corrupt`), lesson completion button, practice and chapter-test scores, study timer (counts only while the tab is visible and the learner active), streak (≥ 1 min or a completed lesson), chapter unlocking at the test pass mark (soft gate: banner + content hidden, setting to switch off; a chapter whose test is not written yet does not block the next), dashboard, progress page (chapter scores, weak topics, 14-day study chart with table view), settings page (exam date, daily goal, lock, pronunciation helper, audio speed, export/import/reset). **Added `topic_gu` (optional) to every exercise** so weak topics can be listed; exercises without it count under their lesson title. **Verified in the app browser:** reload keeps progress; export → reset → import restores the saved data byte-for-byte; bad/damaged files are rejected with a message and change nothing. Unlock/lock was verified with a temporary 25-question test file (removed): Chapter 1 has **no `test.json` yet**, so nothing is locked on the live site until real tests exist. Theme and audio speed stay as device preferences outside the backup. |
