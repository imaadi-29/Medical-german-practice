"use client";

import { ArrowRight, CheckCircle2, Clock, RotateCcw } from "lucide-react";
import { Btn, Card, GermanWord, ListenButton, PageHeader, Sentence, StrengthDots } from "@/components/ui";
import { categoryById, exampleFor, wordsForLevel } from "@/data/vocab";
import { computeStats, stat, useStore } from "@/lib/store";

export default function ReviewPage() {
  const { state } = useStore();
  const st = computeStats(state);
  const fixed = wordsForLevel(state.level)
    .filter((w) => { const s = stat(state, w.id); return !s.weak && s.fixedAt; })
    .sort((a, b) => (stat(state, b.id).fixedAt ?? 0) - (stat(state, a.id).fixedAt ?? 0))
    .slice(0, 8);
  const total = st.weak.length + st.due.length;

  return (
    <div className="anim-up">
      <PageHeader title="Review again" sub="Your mistakes become your practice plan" />
      <div className="space-y-4 px-5">
        {total > 0 && (<Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white ring-0">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20"><RotateCcw className="h-6 w-6" /></span>
            <div>
              <p className="text-2xl font-bold leading-none" data-testid="review-weak">{st.weak.length} <span className="text-base font-medium">weak word{st.weak.length === 1 ? "" : "s"}</span></p>
              <p className="mt-1 text-sm text-rose-100">{st.due.length} more due for a refresh</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-rose-50">Answer a weak word correctly <b>2 times in a row</b> to remove it from this list. Weakest words come first.</p>
          <Btn href="/practice/session?review=1" variant="secondary" className="mt-4 w-full !text-rose-700" disabled={total === 0}>
            {total > 0 ? <>Start review round ({Math.min(10, total)}) <ArrowRight className="h-4 w-4" /></> : "Nothing to review yet"}
          </Btn>
        </Card>)}

        {st.weak.length === 0 && (<>
          <p className="sr-only" data-testid="review-weak">0 weak words</p>
          <Card className="text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <p className="mt-2 font-bold">No weak words 🎉</p>
            <p className="mt-1 text-sm text-slate-500">When you make a mistake in practice, the word is saved here so you can practise it again later.</p>
            <Btn href="/practice" variant="secondary" className="mt-4 w-full">Go to practice</Btn>
            {st.due.length > 0 && <Btn href="/practice/session?review=1" className="mt-2 w-full">Refresh {st.due.length} due word{st.due.length === 1 ? "" : "s"}</Btn>}
          </Card>
        </>)}

        {st.weak.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Weak words · most mistakes first</p>
            <ul className="space-y-2.5" data-testid="weak-list">
              {st.weak.map((w) => {
                const s = stat(state, w.id);
                const [de, en] = exampleFor(w, state.level);
                return (
                  <li key={w.id}>
                    <Card className="!p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold"><GermanWord w={w} /> <span className="font-normal text-slate-500">· {w.en}</span></p>
                          <p className="text-xs text-slate-400">{categoryById(w.cat)?.name} · 🗣 {w.pron}</p>
                        </div>
                        <ListenButton text={w.de} label="" className="!px-2" />
                      </div>
                      <p className="mt-2 text-sm text-slate-700"><Sentence de={de} /> <span className="text-slate-400">– {en}</span></p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span className="font-semibold text-rose-600">✗ {s.wrong} mistake{s.wrong > 1 ? "s" : ""}</span>
                        {s.lastMistake && <span className="text-slate-500">last answer: <span className="line-through">{s.lastMistake}</span></span>}
                        <span className="ml-auto flex items-center gap-1 text-slate-500">
                          fix progress
                          <span className={`h-2 w-4 rounded-full ${s.streak >= 1 ? "bg-emerald-500" : "bg-slate-200"}`} />
                          <span className={`h-2 w-4 rounded-full ${s.streak >= 2 ? "bg-emerald-500" : "bg-slate-200"}`} />
                        </span>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {st.due.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700"><Clock className="h-4 w-4" /> Due for a refresh</p>
            <Card className="!p-0">
              <ul className="divide-y divide-slate-100">
                {st.due.map((w) => (
                  <li key={w.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span><GermanWord w={w} className="font-semibold" /> <span className="text-slate-500">· {w.en}</span></span>
                    <StrengthDots box={stat(state, w.id).box} />
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {fixed.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-emerald-700">✓ Recently fixed</p>
            <div className="flex flex-wrap gap-2">
              {fixed.map((w) => (
                <span key={w.id} className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-800 ring-1 ring-emerald-100"><GermanWord w={w} /></span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
