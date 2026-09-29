# SkillCase · Medical German for Nurses (MVP)

A mobile-first practice app for Indian nurses (A1/A2 German) preparing to work in Germany.
Core loop: **Learn → Practise → Make mistakes → Get feedback → Review → Improve → Keep practising.**

Stack: Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · lucide-react icons. No backend – all progress is stored in `localStorage` (`skillcase.medgerman.v1`).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
# or production
npm run build && npm start
```

Open it in a phone-sized window (or DevTools device mode) for the intended experience.

## What's inside

| Area | What it does |
|---|---|
| **Onboarding** | Welcome → goal ("Prepare for nursing work in Germany") + optional name → level A1/A2 (with sample sentence) → daily goal |
| **Home** | Greeting, level, streak + 7-day dots, today's goal bar, *Continue learning* (next step of the current topic), *Daily review* (weak + due words), weak-word chips, progress snapshot |
| **Learn** | 4 topics (Body Parts, Symptoms, Basic Conditions, Patient Care). Flashcards: German with colour-coded article (der/die/das), part of speech, pronunciation help, audio (browser TTS), English meaning, level-appropriate example sentence, memory tip. List view too. |
| **Learning path** | Each topic: Words → Recognise (DE→EN) → Recall (EN→DE) → Sentences (fill-in) → Review. A step passes at ≥70%. |
| **Practice** | 3 modes + mixed: German→English (multiple choice), English→German (typed, with ä ö ü ß and der/die/das helper keys), fill-in-the-blank (real ward sentences with English context). 8 questions/round; up to 3 weak words mixed in automatically. Wrong answers come back once at the end of the round ("second chance"). |
| **Feedback** | After every answer: green / amber ("almost") / red state, correct answer with audio, simple English explanation, tip, example sentence, and whether the word was saved to / removed from Review. Typed answers detect: wrong article, missing article, missing umlaut, small typo, a different vocab word, skipped. |
| **Review** | Weak words sorted by mistakes, with last wrong answer and "fix progress". A word leaves the list after **2 correct answers in a row**. Correct answers also schedule spaced refreshes (1, 2, 4, 7, 14 days) that show up as "due". |
| **Progress** | Words learned, accuracy, weak words, sessions, streak/best streak, 7-day activity chart, mastery per topic, accuracy per skill, recent sessions, level switch, reset. |

Content: 50 words (35 A1, +15 A2), each with pronunciation help, an A1 sentence ("Mein Kopf tut weh.") and a slightly more contextual A2 sentence ("Der Patient hat starke Kopfschmerzen."). Edit `src/data/vocab.ts` to add words – the `{braces}` in example sentences mark the fill-in-the-blank gap.

## Code map

- `src/data/vocab.ts` – categories and words
- `src/lib/store.tsx` – state, localStorage persistence, answer recording, weak/spaced-review logic, derived stats
- `src/lib/engine.ts` – session building (weak-word prioritisation), question generation, answer checking and mistake explanations
- `src/app/*` – screens (`/onboarding`, `/`, `/learn`, `/learn/[cat]`, `/practice`, `/practice/session`, `/review`, `/progress`)

## Tests

- `npx tsx tests/check-data.ts` – validates every word (blanks present, 4 distinct options, answer checker accepts its own answer) and prints checker behaviour for common mistakes.
- `tests/e2e.py` – Playwright (Python) journey test against a running server on :3000: onboarding → learn 10 cards → recognition round with a deliberate mistake → feedback checks → review twice until the word is fixed → progress numbers survive reload → recall round with a wrong article → fill-in round → mixed round → level switch. Fails on any console error.
