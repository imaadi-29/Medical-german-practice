"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CategoryId, Level, WORDS, wordsForLevel } from "@/data/vocab";

export type QMode = "de-en" | "en-de" | "fill";
export type Mode = QMode | "mixed";

export interface WordStat {
  seen: number;
  correct: number;
  wrong: number;
  box: number; // 0–5, Leitner-style strength
  streak: number; // correct answers in a row
  weak: boolean;
  studied: boolean; // opened in Learn
  lastAt: number;
  due: number; // timestamp when it should be reviewed
  lastMistake?: string; // what the learner typed/picked last time they were wrong
  fixedAt?: number;
}

export interface SessionLog {
  id: string;
  at: number;
  mode: Mode;
  source: "category" | "all" | "review";
  cat?: CategoryId;
  correct: number;
  total: number;
}

export interface AppState {
  v: 1;
  onboarded: boolean;
  name: string;
  level: Level;
  goal: string;
  dailyGoal: number; // answers per day
  words: Record<string, WordStat>;
  sessions: SessionLog[];
  daily: Record<string, { answers: number; correct: number }>;
  modeStats: Record<QMode, { correct: number; total: number }>;
  catBest: Partial<Record<CategoryId, Partial<Record<QMode, number>>>>;
  lastCategory?: CategoryId;
}

const KEY = "skillcase.medgerman.v1";
const DAY = 24 * 60 * 60 * 1000;
const INTERVALS = [0, 1, 2, 4, 7, 14].map((d) => d * DAY);

export const initialState = (): AppState => ({
  v: 1,
  onboarded: false,
  name: "",
  level: "A1",
  goal: "Prepare for nursing work in Germany",
  dailyGoal: 20,
  words: {},
  sessions: [],
  daily: {},
  modeStats: { "de-en": { correct: 0, total: 0 }, "en-de": { correct: 0, total: 0 }, fill: { correct: 0, total: 0 } },
  catBest: {},
});

export const emptyStat = (): WordStat => ({ seen: 0, correct: 0, wrong: 0, box: 0, streak: 0, weak: false, studied: false, lastAt: 0, due: 0 });

export const dayKey = (t: number | Date = Date.now()) => new Date(t).toLocaleDateString("en-CA");

interface Ctx {
  state: AppState;
  hydrated: boolean;
  completeOnboarding: (p: { name: string; level: Level; dailyGoal: number }) => void;
  setLevel: (l: Level) => void;
  markStudied: (id: string, cat: CategoryId) => void;
  recordAnswer: (id: string, mode: QMode, correct: boolean, given?: string) => { becameWeak: boolean; fixed: boolean };
  finishSession: (s: Omit<SessionLog, "id" | "at">) => void;
  reset: () => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({ ...initialState(), ...parsed });
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full / blocked */
    }
  }, [state, hydrated]);

  const completeOnboarding = useCallback((p: { name: string; level: Level; dailyGoal: number }) => {
    setState((s) => ({ ...s, ...p, onboarded: true }));
  }, []);

  const setLevel = useCallback((level: Level) => setState((s) => ({ ...s, level })), []);

  const markStudied = useCallback((id: string, cat: CategoryId) => {
    setState((s) => {
      const cur = s.words[id] ?? emptyStat();
      if (cur.studied && s.lastCategory === cat) return s;
      return { ...s, lastCategory: cat, words: { ...s.words, [id]: { ...cur, studied: true } } };
    });
  }, []);

  const recordAnswer = useCallback((id: string, mode: QMode, correct: boolean, given?: string) => {
    const now = Date.now();
    const prev = stateRef.current.words[id] ?? emptyStat();
    const w: WordStat = { ...prev, seen: prev.seen + 1, lastAt: now };
    let becameWeak = false;
    let fixed = false;
    if (correct) {
      w.correct++;
      w.streak++;
      w.box = Math.min(5, w.box + 1);
      if (w.weak && w.streak >= 2) {
        w.weak = false;
        w.fixedAt = now;
        fixed = true;
      }
      w.due = now + INTERVALS[w.box];
    } else {
      w.wrong++;
      w.streak = 0;
      w.box = 0;
      becameWeak = !w.weak;
      w.weak = true;
      w.due = now;
      w.lastMistake = given;
    }
    const k = dayKey(now);
    setState((s) => {
      const d = s.daily[k] ?? { answers: 0, correct: 0 };
      const m = s.modeStats[mode];
      return {
        ...s,
        words: { ...s.words, [id]: w },
        daily: { ...s.daily, [k]: { answers: d.answers + 1, correct: d.correct + (correct ? 1 : 0) } },
        modeStats: { ...s.modeStats, [mode]: { correct: m.correct + (correct ? 1 : 0), total: m.total + 1 } },
      };
    });
    return { becameWeak, fixed };
  }, []);

  const finishSession = useCallback((log: Omit<SessionLog, "id" | "at">) => {
    setState((s) => {
      const entry: SessionLog = { ...log, id: Math.random().toString(36).slice(2), at: Date.now() };
      const catBest = { ...s.catBest };
      if (log.source === "category" && log.cat && log.mode !== "mixed" && log.total > 0) {
        const pct = Math.round((log.correct / log.total) * 100);
        const cur = { ...(catBest[log.cat] ?? {}) };
        cur[log.mode] = Math.max(cur[log.mode] ?? 0, pct);
        catBest[log.cat] = cur;
      }
      return { ...s, sessions: [entry, ...s.sessions].slice(0, 200), catBest, lastCategory: log.cat ?? s.lastCategory };
    });
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setState(initialState());
  }, []);

  const value = useMemo(
    () => ({ state, hydrated, completeOnboarding, setLevel, markStudied, recordAnswer, finishSession, reset }),
    [state, hydrated, completeOnboarding, setLevel, markStudied, recordAnswer, finishSession, reset]
  );
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}

// ─────────── derived selectors ───────────

export function stat(s: AppState, id: string): WordStat {
  return s.words[id] ?? emptyStat();
}

export function isLearned(st: WordStat) {
  return st.studied || st.correct > 0;
}

export function computeStats(s: AppState) {
  const words = wordsForLevel(s.level);
  const learned = words.filter((w) => isLearned(stat(s, w.id))).length;
  const mastered = words.filter((w) => stat(s, w.id).box >= 3).length;
  const weak = weakWords(s);
  const now = Date.now();
  const due = words.filter((w) => {
    const st = stat(s, w.id);
    return !st.weak && st.box > 0 && st.due <= now;
  });
  const totals = Object.values(s.modeStats).reduce((a, m) => ({ c: a.c + m.correct, t: a.t + m.total }), { c: 0, t: 0 });
  const accuracy = totals.t ? Math.round((totals.c / totals.t) * 100) : 0;
  const today = s.daily[dayKey()]?.answers ?? 0;
  return { total: words.length, learned, mastered, weak, due, accuracy, answers: totals.t, sessions: s.sessions.length, today, streak: streak(s), bestStreak: bestStreak(s) };
}

export function weakWords(s: AppState) {
  return wordsForLevel(s.level)
    .filter((w) => stat(s, w.id).weak)
    .sort((a, b) => stat(s, b.id).wrong - stat(s, a.id).wrong || stat(s, b.id).lastAt - stat(s, a.id).lastAt);
}

function activeDays(s: AppState) {
  return new Set(Object.entries(s.daily).filter(([, d]) => d.answers > 0).map(([k]) => k));
}

export function streak(s: AppState) {
  const days = activeDays(s);
  let t = Date.now();
  if (!days.has(dayKey(t))) t -= DAY; // today not done yet – streak still alive from yesterday
  let n = 0;
  while (days.has(dayKey(t))) {
    n++;
    t -= DAY;
  }
  return n;
}

function bestStreak(s: AppState) {
  const keys = [...activeDays(s)].sort();
  let best = 0, run = 0, prev = 0;
  for (const k of keys) {
    const t = new Date(k + "T12:00:00").getTime();
    run = prev && Math.round((t - prev) / DAY) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t;
  }
  return best;
}

export function lastNDays(s: AppState, n = 7) {
  const out: { key: string; label: string; answers: number; isToday: boolean }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const t = Date.now() - i * DAY;
    const key = dayKey(t);
    out.push({ key, label: new Date(t).toLocaleDateString("en-GB", { weekday: "narrow" }), answers: s.daily[key]?.answers ?? 0, isToday: i === 0 });
  }
  return out;
}

export const PATH_STEPS: { key: "learn" | QMode | "review"; label: string; sub: string }[] = [
  { key: "learn", label: "Words", sub: "Study the word cards" },
  { key: "de-en", label: "Recognise", sub: "German → English" },
  { key: "en-de", label: "Recall", sub: "English → German" },
  { key: "fill", label: "Sentences", sub: "Fill in the blank" },
  { key: "review", label: "Review", sub: "Fix your weak words" },
];
export const PASS = 70;

export function categoryPath(s: AppState, cat: CategoryId) {
  const words = wordsForLevel(s.level).filter((w) => w.cat === cat);
  const studied = words.filter((w) => stat(s, w.id).studied).length;
  const weakN = words.filter((w) => stat(s, w.id).weak).length;
  const best = s.catBest[cat] ?? {};
  const practisedAll = (["de-en", "en-de", "fill"] as QMode[]).every((m) => (best[m] ?? 0) >= PASS);
  const done: Record<string, boolean> = {
    learn: studied === words.length,
    "de-en": (best["de-en"] ?? 0) >= PASS,
    "en-de": (best["en-de"] ?? 0) >= PASS,
    fill: (best.fill ?? 0) >= PASS,
    review: practisedAll && weakN === 0,
  };
  const next = PATH_STEPS.find((p) => !done[p.key]) ?? null;
  const pct = Math.round((PATH_STEPS.filter((p) => done[p.key]).length / PATH_STEPS.length) * 100);
  const mastered = words.filter((w) => stat(s, w.id).box >= 3).length;
  return { words, studied, weakN, best, done, next, pct, mastered };
}

export function totalWordCount() {
  return WORDS.length;
}
