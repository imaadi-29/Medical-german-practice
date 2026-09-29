"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Layers, List, Lightbulb } from "lucide-react";
import { Bar, Btn, Card, GermanWord, ListenButton, Sentence, StrengthDots } from "@/components/ui";
import { GENDER_LABEL, categoryById, exampleFor } from "@/data/vocab";
import { PATH_STEPS, categoryPath, stat, useStore } from "@/lib/store";
import { stepHref } from "@/lib/nav";

export default function CategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = use(params);
  const category = categoryById(cat);
  const { state, markStudied } = useStore();
  const [view, setView] = useState<"cards" | "list">("cards");
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const path = category ? categoryPath(state, category.id) : null;
  const words = path?.words ?? [];
  const w = words[Math.min(i, words.length - 1)];
  const done = i >= words.length;

  useEffect(() => {
    if (revealed && w && category) markStudied(w.id, category.id);
  }, [revealed, w, category, markStudied]);

  if (!category || !path) {
    return (
      <div className="p-8 text-center">
        <p className="font-semibold">Topic not found.</p>
        <Btn href="/learn" className="mt-4">Back to topics</Btn>
      </div>
    );
  }

  const go = (d: number) => { setI((x) => Math.max(0, Math.min(words.length, x + d))); setRevealed(false); };

  return (
    <div className="anim-up">
      <div className="flex items-center gap-2 px-3 pt-4">
        <Link href="/learn" className="rounded-full p-2 text-slate-600 hover:bg-white" aria-label="Back to topics"><ArrowLeft className="h-5 w-5" /></Link>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-xl ${category.color}`}>{category.emoji}</span>
        <div className="flex-1">
          <h1 className="font-bold leading-tight text-slate-900">{category.name}</h1>
          <p className="text-xs text-slate-500">{category.de} · {words.length} words · {state.level}</p>
        </div>
        <div className="flex rounded-xl bg-white p-1 ring-1 ring-slate-200">
          <button onClick={() => setView("cards")} className={`rounded-lg p-1.5 ${view === "cards" ? "bg-teal-600 text-white" : "text-slate-500"}`} aria-label="Card view"><Layers className="h-4 w-4" /></button>
          <button onClick={() => setView("list")} className={`rounded-lg p-1.5 ${view === "list" ? "bg-teal-600 text-white" : "text-slate-500"}`} aria-label="List view"><List className="h-4 w-4" /></button>
        </div>
      </div>

      {/* learning path */}
      <div className="px-5 pt-4">
        <ol className="grid grid-cols-5 gap-1">
          {PATH_STEPS.map((p, idx) => {
            const isDone = path.done[p.key];
            const isNext = path.next?.key === p.key;
            const best = p.key !== "learn" && p.key !== "review" ? path.best[p.key] : undefined;
            return (
              <li key={p.key}>
                <Link
                  href={stepHref(category.id, p.key)}
                  className={`block h-full rounded-xl px-1 py-2 text-center ring-1 transition ${isDone ? "bg-emerald-50 ring-emerald-200" : isNext ? "bg-teal-600 text-white ring-teal-600" : "bg-white ring-slate-200"}`}
                >
                  <span className="flex items-center justify-center gap-0.5 text-[8.5px] font-semibold uppercase opacity-80">
                    {isDone ? <Check className="h-3 w-3 text-emerald-600" /> : null} Step {idx + 1}
                  </span>
                  <span className={`block text-[10px] font-bold tracking-tight ${isDone ? "text-emerald-700" : ""}`}>{p.label}</span>
                  <span className={`block text-[10px] ${isNext ? "text-teal-100" : "text-slate-400"}`}>
                    {p.key === "learn" ? `${path.studied}/${words.length}` : p.key === "review" ? (path.weakN ? `${path.weakN} weak` : "—") : best !== undefined ? `best ${best}%` : "pass 70%"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>

      {view === "cards" ? (
        <div className="px-5 pt-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <Bar value={(Math.min(i, words.length) / words.length) * 100} />
            <span className="whitespace-nowrap">{Math.min(i + 1, words.length)} / {words.length}</span>
          </div>

          {!done ? (
            <div key={w.id} className="anim-pop">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setRevealed(true)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setRevealed(true); }}
                className="relative w-full cursor-pointer rounded-3xl bg-white p-6 text-center shadow-md ring-1 ring-slate-200"
                aria-label="Show meaning"
                data-testid="flashcard"
              >
                <span className="absolute left-4 top-4 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                  {w.pos === "noun" ? `noun · ${GENDER_LABEL[w.gender!]}` : w.pos === "verb" ? "verb" : "adjective"}
                </span>
                {w.level === "A2" && <span className="absolute right-4 top-4 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">A2</span>}
                <p className="mt-6 text-4xl font-bold tracking-tight text-slate-900"><GermanWord w={w} /></p>
                <p className="mt-2 text-sm text-slate-500">🗣 {w.pron}</p>
                <div className="mt-3"><ListenButton text={w.de} /></div>

                {revealed ? (
                  <div className="anim-up mt-5 border-t border-dashed border-slate-200 pt-5 text-left">
                    <p className="text-center text-xl font-semibold text-teal-700" data-testid="meaning">{w.en}</p>
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-base font-medium text-slate-900"><Sentence de={exampleFor(w, state.level)[0]} /></p>
                        <ListenButton text={exampleFor(w, state.level)[0]} label="" className="shrink-0 !px-2" />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{exampleFor(w, state.level)[1]}</p>
                    </div>
                    {w.tip && (
                      <p className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><Lightbulb className="h-4 w-4 shrink-0 text-amber-500" />{w.tip}</p>
                    )}
                  </div>
                ) : (
                  <p className="mt-6 rounded-xl border-2 border-dashed border-slate-200 py-4 text-sm font-medium text-slate-400">Try to guess the meaning – then tap to reveal</p>
                )}
              </div>
              <div className="mt-4 grid grid-cols-[auto_1fr] gap-3">
                <Btn variant="secondary" onClick={() => go(-1)} disabled={i === 0} className="!px-3" ><ChevronLeft className="h-5 w-5" /></Btn>
                {revealed ? (
                  <Btn onClick={() => go(1)}>{i === words.length - 1 ? "Finish" : "Next word"} <ArrowRight className="h-4 w-4" /></Btn>
                ) : (
                  <Btn onClick={() => setRevealed(true)}>Show meaning</Btn>
                )}
              </div>
            </div>
          ) : (
            <Card className="anim-pop text-center">
              <p className="text-4xl">🎉</p>
              <p className="mt-2 text-lg font-bold">You studied all {words.length} words!</p>
              <p className="mt-1 text-sm text-slate-500">Now test yourself. Recognition first: see the German word, choose the meaning.</p>
              <Btn href={`/practice/session?mode=de-en&cat=${category.id}`} className="mt-5 w-full">Start Recognition practice <ArrowRight className="h-4 w-4" /></Btn>
              <Btn variant="ghost" onClick={() => { setI(0); setRevealed(false); }} className="mt-2 w-full">Go through the cards again</Btn>
            </Card>
          )}
        </div>
      ) : (
        <ul className="space-y-3 px-5 pt-4">
          {words.map((x) => {
            const s = stat(state, x.id);
            const [de, en] = exampleFor(x, state.level);
            return (
              <li key={x.id}>
                <Card>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-bold"><GermanWord w={x} /></p>
                      <p className="text-sm font-medium text-teal-700">{x.en}</p>
                      <p className="text-xs text-slate-500">🗣 {x.pron}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <ListenButton text={x.de} label="" className="!px-2" />
                      <StrengthDots box={s.box} />
                      {s.weak && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600">weak</span>}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-800"><Sentence de={de} /></p>
                  <p className="text-xs text-slate-500">{en}</p>
                </Card>
              </li>
            );
          })}
          <li><Btn href={`/practice/session?mode=mixed&cat=${category.id}`} className="w-full">Practise this topic</Btn></li>
        </ul>
      )}
      <div className="h-4" />
    </div>
  );
}

