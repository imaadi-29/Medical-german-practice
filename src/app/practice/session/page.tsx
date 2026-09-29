"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check, CircleAlert, Lightbulb, PartyPopper, RotateCcw, X } from "lucide-react";
import { Bar, Btn, Card, GermanWord, ListenButton, Sentence } from "@/components/ui";
import { CATEGORIES, CategoryId, categoryById, exampleFor } from "@/data/vocab";
import { Feedback, MODE_INFO, Question, SessionSpec, buildSession, checkChoice, checkTyped, makeQuestion } from "@/lib/engine";
import { Mode, PASS, categoryPath, useStore, weakWords } from "@/lib/store";
import { stepHref } from "@/lib/nav";

export default function SessionPage() {
  return (
    <Suspense fallback={null}>
      <SessionLoader />
    </Suspense>
  );
}

function SessionLoader() {
  const sp = useSearchParams();
  const [run, setRun] = useState(0);
  const review = sp.get("review") === "1";
  const rawMode = sp.get("mode") as Mode | null;
  const mode: Mode = review ? "mixed" : rawMode && ["de-en", "en-de", "fill", "mixed"].includes(rawMode) ? rawMode : "mixed";
  const rawCat = sp.get("cat");
  const cat = rawCat && categoryById(rawCat) ? (rawCat as CategoryId) : undefined;
  const spec: SessionSpec = { mode, cat, review };
  return <Session key={`${run}-${sp.toString()}`} spec={spec} onAgain={() => setRun((r) => r + 1)} />;
}

interface Result { q: Question; fb: Feedback; given: string; becameWeak: boolean; fixed: boolean }

function Session({ spec, onAgain }: { spec: SessionSpec; onAgain: () => void }) {
  const { state, recordAnswer, finishSession } = useStore();
  const [queue, setQueue] = useState<Question[]>(() => buildSession(state, spec));
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"answer" | "feedback" | "done">("answer");
  const [typed, setTyped] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const retried = useRef(new Set<string>());
  const inputRef = useRef<HTMLInputElement>(null);

  const q = queue[idx];
  const current = results.length > idx ? results[idx] : null;
  const title = spec.review ? "Review weak words" : MODE_INFO[spec.mode].title;
  const catName = spec.cat ? categoryById(spec.cat)!.name : spec.review ? "Your weak words" : "All topics";

  useEffect(() => {
    if (phase === "answer" && q?.mode === "en-de") inputRef.current?.focus();
  }, [phase, q]);

  const submit = (given: string) => {
    if (phase !== "answer" || !q) return;
    const fb = q.mode === "en-de" ? checkTyped(q, given) : checkChoice(q, given);
    const r = recordAnswer(q.word.id, q.mode, fb.countsCorrect, given);
    setPicked(given);
    setResults((rs) => [...rs, { q, fb, given, ...r }]);
    setPhase("feedback");
  };

  const next = () => {
    const last = results[results.length - 1];
    let nq = queue;
    // Wrong answers come back once at the end of the round – immediate second chance.
    if (last && !last.fb.countsCorrect && !retried.current.has(last.q.word.id)) {
      retried.current.add(last.q.word.id);
      nq = [...queue, makeQuestion(last.q.word, last.q.mode, state.level, true)];
      setQueue(nq);
    }
    if (idx + 1 >= nq.length) {
      const correct = results.filter((r) => r.fb.countsCorrect).length;
      finishSession({ mode: spec.mode, source: spec.review ? "review" : spec.cat ? "category" : "all", cat: spec.cat, correct, total: results.length });
      setPhase("done");
    } else {
      setIdx(idx + 1);
      setTyped("");
      setPicked(null);
      setPhase("answer");
    }
  };

  // keyboard: 1–4 choose, Enter continue
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "feedback" && e.key === "Enter") { e.preventDefault(); next(); }
      if (phase === "answer" && q?.options && /^[1-4]$/.test(e.key) && document.activeElement?.tagName !== "INPUT") submit(q.options[+e.key - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (queue.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
        <PartyPopper className="h-12 w-12 text-teal-600" />
        <h1 className="mt-4 text-xl font-bold">Nothing to review right now</h1>
        <p className="mt-2 text-slate-500">You have no weak words. Practise new words – any mistakes will be saved here for review.</p>
        <Btn href="/practice/session?mode=mixed" className="mt-6 w-full">Start mixed practice</Btn>
        <Btn href="/" variant="ghost" className="mt-2 w-full">Back home</Btn>
      </div>
    );
  }

  if (phase === "done") return <Summary spec={spec} results={results} onAgain={onAgain} />;

  const progress = ((idx + (phase === "feedback" ? 1 : 0)) / queue.length) * 100;

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-10 bg-slate-50/95 px-4 pb-3 pt-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/" className="rounded-full p-1.5 text-slate-500 hover:bg-white" aria-label="Exit practice"><X className="h-5 w-5" /></Link>
          <Bar value={progress} />
          <span className="whitespace-nowrap text-xs font-semibold text-slate-500" data-testid="counter">{Math.min(idx + 1, queue.length)}/{queue.length}</span>
        </div>
        <p className="mt-2 text-center text-xs font-medium text-slate-500">{title} · {catName}</p>
      </div>

      <div key={q.key} className="anim-up flex-1 px-5 pb-72 pt-4">
        {q.retry && (
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            <RotateCcw className="h-3.5 w-3.5" /> Second chance – you missed this one
          </p>
        )}
        <QuestionView q={q} level={state.level} phase={phase} picked={picked} typed={typed} setTyped={setTyped} submit={submit} inputRef={inputRef} verdict={current?.fb.verdict} />
      </div>

      {phase === "feedback" && current && <FeedbackSheet r={current} level={state.level} onNext={next} isLast={idx + 1 >= queue.length && (current.fb.countsCorrect || retried.current.has(current.q.word.id))} />}
    </div>
  );
}

function QuestionView({
  q, level, phase, picked, typed, setTyped, submit, inputRef, verdict,
}: {
  q: Question; level: "A1" | "A2"; phase: string; picked: string | null; typed: string; setTyped: (s: string) => void;
  submit: (s: string) => void; inputRef: React.RefObject<HTMLInputElement | null>; verdict?: string;
}) {
  const locked = phase !== "answer";

  const Options = () => (
    <div className="mt-6 grid gap-3" role="list">
      {q.options!.map((o, i) => {
        const isAnswer = o === q.answer;
        const isPicked = o === picked;
        let cls = "bg-white ring-slate-200 hover:ring-teal-400";
        if (locked && isAnswer) cls = "bg-emerald-50 ring-emerald-500 text-emerald-900";
        else if (locked && isPicked) cls = "bg-rose-50 ring-rose-500 text-rose-900 anim-shake";
        else if (locked) cls = "bg-white ring-slate-200 opacity-50";
        return (
          <button
            key={o}
            disabled={locked}
            onClick={() => submit(o)}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-base font-medium ring-2 transition active:scale-[0.99] ${cls}`}
            data-testid="option"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
              {locked && isAnswer ? <Check className="h-4 w-4 text-emerald-600" /> : locked && isPicked ? <X className="h-4 w-4 text-rose-600" /> : i + 1}
            </span>
            {o}
          </button>
        );
      })}
    </div>
  );

  if (q.mode === "de-en") {
    return (
      <div>
        <p className="text-sm font-semibold text-slate-500">What does this mean?</p>
        <div className="mt-4 rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-4xl font-bold text-slate-900" data-testid="prompt"><GermanWord w={q.word} /></p>
          <div className="mt-3"><ListenButton text={q.word.de} /></div>
        </div>
        <Options />
      </div>
    );
  }

  if (q.mode === "fill") {
    const s = q.sentence!;
    return (
      <div>
        <p className="text-sm font-semibold text-slate-500">Complete the sentence</p>
        <div className="mt-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-2xl font-semibold leading-relaxed text-slate-900" data-testid="prompt">
            {s.before}
            <span className={`mx-1 inline-block min-w-20 rounded-lg border-b-4 px-2 text-center ${locked ? (verdict === "correct" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-rose-500 bg-rose-50 text-rose-800") : "border-teal-400 bg-teal-50 text-transparent"}`}>
              {locked ? q.answer : "____"}
            </span>
            {s.after}
          </p>
          <p className="mt-3 text-sm text-slate-500">🇬🇧 {s.en}</p>
        </div>
        <Options />
      </div>
    );
  }

  // en-de typed recall
  const addChar = (c: string) => { setTyped(typed + c); inputRef.current?.focus(); };
  return (
    <div>
      <p className="text-sm font-semibold text-slate-500">Write it in German</p>
      <div className="mt-4 rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
        <p className="text-3xl font-bold text-slate-900" data-testid="prompt">{q.word.en}</p>
        <p className="mt-2 text-xs text-slate-500">{q.word.pos === "noun" ? "Noun – include der / die / das" : q.word.pos === "verb" ? "Verb – infinitive form" : "Adjective"}</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); submit(typed); }} className="mt-6">
        <input
          ref={inputRef}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          disabled={locked}
          placeholder={q.word.pos === "noun" ? "e.g. der Kopf" : "Type the German word"}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          className={`w-full rounded-2xl border-2 bg-white px-4 py-4 text-lg outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 ${locked ? (verdict === "correct" ? "border-emerald-500 bg-emerald-50" : verdict === "almost" ? "border-amber-500 bg-amber-50" : "border-rose-500 bg-rose-50") : "border-slate-200"}`}
          data-testid="answer-input"
        />
        {!locked && (
          <>
            <div className="mt-3 flex gap-2">
              {["ä", "ö", "ü", "ß"].map((c) => (
                <button key={c} type="button" onClick={() => addChar(c)} className="h-10 w-10 rounded-xl bg-white text-lg font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">{c}</button>
              ))}
              {q.word.pos === "noun" && ["der ", "die ", "das "].map((c) => (
                <button key={c} type="button" onClick={() => { setTyped(c + typed.replace(/^(der|die|das)\s+/i, "")); inputRef.current?.focus(); }} className="h-10 rounded-xl bg-white px-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">{c.trim()}</button>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-[auto_1fr] gap-3">
              <Btn variant="secondary" onClick={() => submit("")}>I don&apos;t know</Btn>
              <Btn type="submit" disabled={!typed.trim()}>Check</Btn>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

function FeedbackSheet({ r, level, onNext, isLast }: { r: Result; level: "A1" | "A2"; onNext: () => void; isLast: boolean }) {
  const { fb, q } = r;
  const [de, en] = exampleFor(q.word, level);
  const tone = fb.verdict === "correct"
    ? { box: "bg-emerald-50 ring-emerald-200", head: "text-emerald-700", icon: <Check className="h-5 w-5" />, iconBg: "bg-emerald-600", btn: "!bg-emerald-600 hover:!bg-emerald-700" }
    : fb.verdict === "almost"
      ? { box: "bg-amber-50 ring-amber-200", head: "text-amber-700", icon: <CircleAlert className="h-5 w-5" />, iconBg: "bg-amber-500", btn: "!bg-amber-600 hover:!bg-amber-700" }
      : { box: "bg-rose-50 ring-rose-200", head: "text-rose-700", icon: <X className="h-5 w-5" />, iconBg: "bg-rose-600", btn: "!bg-rose-600 hover:!bg-rose-700" };

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md" role="status" aria-live="polite" data-testid="feedback" data-verdict={fb.verdict}>
      <div className={`anim-up max-h-[70dvh] overflow-y-auto rounded-t-3xl p-5 shadow-2xl ring-1 ${tone.box}`}>
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 items-center justify-center rounded-full text-white ${tone.iconBg}`}>{tone.icon}</span>
          <div>
            <p className={`text-lg font-bold ${tone.head}`}>{fb.title}</p>
            {!fb.countsCorrect && r.given && <p className="text-xs text-slate-500">Your answer: <span className="line-through">{r.given}</span></p>}
          </div>
        </div>

        {!fb.countsCorrect && (
          <div className="mt-3 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Correct answer</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-base font-bold text-slate-900" data-testid="correct-answer">
                {q.mode === "fill" ? q.answer : <GermanWord w={q.word} />} <span className="font-normal text-slate-500">— {q.word.en}</span>
              </p>
              <ListenButton text={q.mode === "fill" ? q.answer : q.word.de} label="" className="!px-2" />
            </div>
          </div>
        )}

        <p className="mt-3 text-sm leading-relaxed text-slate-700" data-testid="explanation">{fb.explanation}</p>
        {fb.tip && <p className="mt-2 flex gap-2 text-sm text-slate-600"><Lightbulb className="h-4 w-4 shrink-0 text-amber-500" />{fb.tip}</p>}

        <div className="mt-3 rounded-xl bg-white/70 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Example</p>
          <p className="text-sm font-medium text-slate-900"><Sentence de={de} /></p>
          <p className="text-xs text-slate-500">{en}</p>
        </div>

        {r.becameWeak && <p className="mt-3 text-xs font-semibold text-rose-700">➕ Saved to your Review list – you&apos;ll see this word again.</p>}
        {!r.becameWeak && !fb.countsCorrect && <p className="mt-3 text-xs font-semibold text-rose-700">Still weak – keep practising, it&apos;s coming back again.</p>}
        {r.fixed && <p className="mt-3 text-xs font-semibold text-emerald-700">🎉 2 correct in a row – removed from your weak words!</p>}

        <Btn onClick={onNext} className={`mt-4 w-full ${tone.btn}`}>{isLast ? "See results" : "Continue"} <ArrowRight className="h-4 w-4" /></Btn>
      </div>
    </div>
  );
}

function Summary({ spec, results, onAgain }: { spec: SessionSpec; results: Result[]; onAgain: () => void }) {
  const { state } = useStore();
  const correct = results.filter((r) => r.fb.countsCorrect).length;
  const pct = results.length ? Math.round((correct / results.length) * 100) : 0;
  const mistakes = useMemo(() => {
    const seen = new Map<string, Result>();
    results.filter((r) => !r.fb.countsCorrect).forEach((r) => seen.set(r.q.word.id, r));
    return [...seen.values()];
  }, [results]);
  const fixed = results.filter((r) => r.fixed);
  const weakNow = weakWords(state).length;

  const path = spec.cat ? categoryPath(state, spec.cat) : null;
  const passed = spec.mode !== "mixed" && !spec.review && pct >= PASS;
  const nextStep = path?.next && spec.cat ? { label: path.next.label, href: stepHref(spec.cat, path.next.key) } : null;
  const cat = spec.cat ? CATEGORIES.find((c) => c.id === spec.cat) : null;

  const msg = pct === 100 ? "Perfekt! 🌟" : pct >= 80 ? "Sehr gut! 💪" : pct >= 60 ? "Gut gemacht! 👍" : "Weiter üben! Keep going 🌱";

  return (
    <div className="anim-up min-h-dvh px-5 pb-10 pt-8">
      <div className="text-center">
        <div className="relative mx-auto h-36 w-36">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={pct >= PASS ? "#0d9488" : "#f59e0b"} strokeWidth="3" strokeDasharray={`${pct} 100`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold" data-testid="score">{pct}%</p>
            <p className="text-xs text-slate-500">{correct}/{results.length} correct</p>
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-bold">{msg}</h1>
        <p className="mt-1 text-sm text-slate-500">{spec.review ? "Review round" : MODE_INFO[spec.mode].title}{cat ? ` · ${cat.name}` : ""} complete</p>
        {passed && cat && <p className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">✓ {MODE_INFO[spec.mode].stage} step passed</p>}
        {!passed && spec.mode !== "mixed" && !spec.review && cat && <p className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Reach {PASS}% to pass this step</p>}
      </div>

      <div className="mt-6 space-y-3">
        {mistakes.length > 0 && (
          <Card className="ring-rose-200">
            <p className="font-bold text-slate-900">Words to review ({mistakes.length})</p>
            <p className="text-xs text-slate-500">Saved to your Review list.</p>
            <ul className="mt-3 divide-y divide-slate-100">
              {mistakes.map((r) => (
                <li key={r.q.word.id} className="flex items-center justify-between py-2 text-sm">
                  <span><GermanWord w={r.q.word} className="font-semibold" /> <span className="text-slate-500">· {r.q.word.en}</span></span>
                  {r.given && <span className="text-xs text-rose-500 line-through">{r.given}</span>}
                </li>
              ))}
            </ul>
          </Card>
        )}
        {fixed.length > 0 && (
          <Card className="ring-emerald-200">
            <p className="font-bold text-emerald-700">🎉 Fixed {fixed.length} weak word{fixed.length > 1 ? "s" : ""}</p>
            <p className="mt-1 text-sm text-slate-600">{fixed.map((r) => r.q.word.de).join(", ")}</p>
          </Card>
        )}
        {mistakes.length === 0 && (
          <Card className="text-center ring-emerald-200">
            <p className="font-semibold text-emerald-700">No mistakes this round!</p>
          </Card>
        )}
      </div>

      <div className="mt-6 grid gap-2">
        {weakNow > 0 && (
          <Btn href="/practice/session?review=1" variant="danger" className="w-full"><RotateCcw className="h-4 w-4" /> Review weak words now ({weakNow})</Btn>
        )}
        {passed && nextStep && (
          <Btn href={nextStep.href} className="w-full">Next step: {nextStep.label} <ArrowRight className="h-4 w-4" /></Btn>
        )}
        <Btn onClick={onAgain} variant={passed || weakNow > 0 ? "secondary" : "primary"} className="w-full">Practise again</Btn>
        <Btn href="/" variant="ghost" className="w-full">Back to home</Btn>
      </div>
    </div>
  );
}
