import { CategoryId, GENDER_LABEL, Level, WORDS, Word, articleOf, bareNoun, exampleFor, plain, wordsForLevel } from "@/data/vocab";
import { AppState, Mode, QMode, stat } from "./store";

export interface Question {
  key: string;
  word: Word;
  mode: QMode;
  options?: string[]; // for multiple choice (de-en, fill)
  answer: string; // the correct option / expected text
  sentence?: { before: string; after: string; en: string };
  retry?: boolean;
}

export type Verdict = "correct" | "almost" | "wrong";

export interface Feedback {
  verdict: Verdict;
  countsCorrect: boolean;
  title: string;
  explanation: string;
  tip?: string;
}

const shuffle = <T,>(a: T[]): T[] => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

const MODES: QMode[] = ["de-en", "fill", "en-de"];

export function blankOf(w: Word, level: Level) {
  const [de, en] = exampleFor(w, level);
  const m = de.match(/^(.*)\{(.+?)\}(.*)$/);
  if (!m) return { before: plain(de), blank: bareNoun(w), after: "", en };
  return { before: m[1], blank: m[2], after: m[3], en };
}

function pickDistractors<T>(target: Word, level: Level, map: (w: Word) => T, n = 3): T[] {
  const pool = wordsForLevel(level).filter((w) => w.id !== target.id);
  const tv = map(target);
  const tiers = [
    pool.filter((w) => w.cat === target.cat && w.pos === target.pos),
    pool.filter((w) => w.pos === target.pos),
    pool,
  ];
  const out: T[] = [];
  for (const tier of tiers) {
    for (const w of shuffle(tier)) {
      const v = map(w);
      if (out.length >= n) break;
      if (v !== tv && !out.includes(v)) out.push(v);
    }
  }
  return out.slice(0, n);
}

export function makeQuestion(word: Word, mode: QMode, level: Level, retry = false): Question {
  const key = `${word.id}-${mode}-${Math.random().toString(36).slice(2, 7)}`;
  if (mode === "de-en") {
    const options = shuffle([word.en, ...pickDistractors(word, level, (w) => w.en)]);
    return { key, word, mode, options, answer: word.en, retry };
  }
  if (mode === "fill") {
    const b = blankOf(word, level);
    const options = shuffle([b.blank, ...pickDistractors(word, level, (w) => blankOf(w, level).blank)]);
    return { key, word, mode, options, answer: b.blank, sentence: { before: b.before, after: b.after, en: b.en }, retry };
  }
  return { key, word, mode, answer: word.de, retry };
}

export interface SessionSpec {
  mode: Mode;
  cat?: CategoryId;
  review?: boolean;
  size?: number;
}

/**
 * Builds a session. Weak words are always prioritised: in review mode they are the
 * whole session, in normal practice up to 3 weak words are mixed in first.
 */
export function buildSession(s: AppState, spec: SessionSpec): Question[] {
  const size = spec.size ?? (spec.review ? 10 : 8);
  const levelWords = wordsForLevel(s.level);
  const now = Date.now();
  let chosen: Word[];

  if (spec.review) {
    const weak = levelWords
      .filter((w) => stat(s, w.id).weak)
      .sort((a, b) => stat(s, b.id).wrong - stat(s, a.id).wrong);
    const due = levelWords
      .filter((w) => { const st = stat(s, w.id); return !st.weak && st.box > 0 && st.due <= now; })
      .sort((a, b) => stat(s, a.id).box - stat(s, b.id).box);
    chosen = [...weak, ...due].slice(0, size);
  } else {
    const pool = spec.cat ? levelWords.filter((w) => w.cat === spec.cat) : levelWords;
    const weakFirst = shuffle(pool.filter((w) => stat(s, w.id).weak)).slice(0, 3);
    const rest = pool
      .filter((w) => !weakFirst.includes(w))
      .map((w) => {
        const st = stat(s, w.id);
        // lower score = practise sooner. Studied-but-unpractised and low-strength words first.
        const score = st.box * 10 + (st.studied || spec.cat ? 0 : 15) + (st.due > now ? 8 : 0) + Math.random() * 6;
        return { w, score };
      })
      .sort((a, b) => a.score - b.score)
      .map((x) => x.w);
    chosen = shuffle([...weakFirst, ...rest.slice(0, size - weakFirst.length)]);
  }

  return chosen.map((w, i) => {
    let mode: QMode;
    if (spec.mode !== "mixed" && !spec.review) mode = spec.mode;
    else mode = MODES[(i + stat(s, w.id).box) % 3];
    return makeQuestion(w, mode, s.level);
  });
}

// ─────────── answer checking ───────────

const fold = (s: string) =>
  s.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[.,!?]/g, "").replace(/\s+/g, " ").trim();
const stripUmlaut = (s: string) => fold(s).replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u");

function lev(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

function splitArticle(s: string): [string | null, string] {
  const parts = fold(s).split(" ");
  if (["der", "die", "das"].includes(parts[0]) && parts.length > 1) return [parts[0], parts.slice(1).join(" ")];
  return [null, parts.join(" ")];
}

const hasUmlaut = (s: string) => /[äöüß]/i.test(s);
const genderWhy = (w: Word) =>
  w.gender === "pl" ? `${bareNoun(w)} is used in the plural here, so it's "${w.de}".` : `${bareNoun(w)} is ${GENDER_LABEL[w.gender!]}, so it's "${w.de}".`;

export function checkTyped(q: Question, input: string): Feedback {
  const w = q.word;
  const raw = input.trim();
  const tip = w.tip;
  if (!raw)
    return { verdict: "wrong", countsCorrect: false, title: "Skipped", explanation: `No problem – this word is now in your Review list. "${w.en}" in German is "${w.de}".`, tip };

  const expected = [w.de, ...(w.alts ?? [])];
  const [inArt, inNoun] = splitArticle(raw);

  for (const exp of expected) {
    const [exArt, exNoun] = splitArticle(exp);
    if (inNoun === exNoun) {
      if (!exArt || inArt === exArt) {
        const usedAlt = exp !== w.de;
        return {
          verdict: "correct",
          countsCorrect: true,
          title: "Richtig! Correct",
          explanation: usedAlt ? `"${raw}" is correct. The main form we practise is "${w.de}".` : `"${w.de}" means "${w.en}".`,
          tip: !hasUmlaut(raw) && hasUmlaut(w.de) ? `Nice – typing ae/oe/ue/ss is fine. The real spelling is "${w.de}".` : tip,
        };
      }
      if (!inArt)
        return { verdict: "correct", countsCorrect: true, title: "Correct – add the article!", explanation: `The word is right. Always learn nouns with der / die / das: "${w.de}".`, tip: genderWhy(w) };
      return {
        verdict: "wrong",
        countsCorrect: false,
        title: "Right word, wrong article",
        explanation: `You wrote "${inArt}", but ${genderWhy(w)} The article is important in German – it changes the grammar of the whole sentence.`,
        tip: "Tip: learn every noun together with its colour: der = blue, die = red, das = green.",
      };
    }
  }

  const exNoun = splitArticle(w.de)[1];
  if (stripUmlaut(inNoun) === stripUmlaut(exNoun))
    return { verdict: "almost", countsCorrect: false, title: "Almost! Check the umlaut", explanation: `You wrote "${raw}". The correct spelling is "${w.de}" – with the dots (ä, ö, ü). If your keyboard has no umlaut, type ae / oe / ue.`, tip };

  const dist = lev(inNoun, fold(exNoun));
  if (dist <= (exNoun.length > 5 ? 2 : 1))
    return { verdict: "almost", countsCorrect: false, title: "Almost! Small spelling mistake", explanation: `You wrote "${raw}". Compare carefully: "${w.de}". Only ${dist} letter${dist > 1 ? "s" : ""} different.`, tip };

  const other = WORDS.find((o) => o.id !== w.id && splitArticle(o.de)[1] === inNoun);
  if (other)
    return { verdict: "wrong", countsCorrect: false, title: "That's a different word", explanation: `"${other.de}" means "${other.en}". For "${w.en}" we say "${w.de}".`, tip };

  return { verdict: "wrong", countsCorrect: false, title: "Not quite", explanation: `"${w.en}" in German is "${w.de}". Say it out loud a few times: ${w.pron}.`, tip };
}

export function checkChoice(q: Question, choice: string): Feedback {
  const w = q.word;
  if (choice === q.answer) {
    return {
      verdict: "correct",
      countsCorrect: true,
      title: "Richtig! Correct",
      explanation: q.mode === "fill" ? `"${q.answer}" fits: ${q.sentence!.en}` : `"${w.de}" means "${w.en}".`,
      tip: w.tip,
    };
  }
  if (q.mode === "de-en") {
    const other = wordsForLevelAll().find((o) => o.en === choice);
    return {
      verdict: "wrong",
      countsCorrect: false,
      title: "Not quite",
      explanation: other
        ? `"${choice}" is "${other.de}" in German. "${w.de}" means "${w.en}".`
        : `"${w.de}" means "${w.en}".`,
      tip: w.tip,
    };
  }
  // fill
  const other = wordsForLevelAll().find((o) => blankOf(o, "A1").blank === choice || blankOf(o, "A2").blank === choice || bareNoun(o) === choice);
  return {
    verdict: "wrong",
    countsCorrect: false,
    title: "Doesn't fit here",
    explanation: `${other ? `"${choice}" means "${other.en}". ` : ""}The sentence says "${q.sentence!.en}" – so we need "${q.answer}" (${w.en}).`,
    tip: w.tip,
  };
}

const wordsForLevelAll = () => WORDS;

export function articleColor(w: Word) {
  const a = articleOf(w);
  if (a === "der") return "text-blue-600";
  if (a === "die") return w.gender === "pl" ? "text-violet-600" : "text-rose-600";
  if (a === "das") return "text-emerald-600";
  return "text-slate-500";
}

export const MODE_INFO: Record<Mode, { title: string; sub: string; stage: string }> = {
  "de-en": { title: "German → English", sub: "See the German word, pick the meaning", stage: "Recognition" },
  "en-de": { title: "English → German", sub: "Type the German word with its article", stage: "Recall" },
  fill: { title: "Fill in the blank", sub: "Complete a real ward sentence", stage: "Sentence use" },
  mixed: { title: "Mixed practice", sub: "All three question types together", stage: "All stages" },
};
