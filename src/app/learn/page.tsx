"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Bar, PageHeader } from "@/components/ui";
import { CATEGORIES } from "@/data/vocab";
import { categoryPath, useStore } from "@/lib/store";

export default function LearnIndex() {
  const { state } = useStore();
  return (
    <div className="anim-up">
      <PageHeader title="Learn" sub={`Medical vocabulary · Level ${state.level}`} />
      <div className="mx-5 mb-4 rounded-2xl bg-teal-50 p-4 text-sm text-teal-900 ring-1 ring-teal-100">
        <p className="font-semibold">Your learning path for each topic</p>
        <p className="mt-1 text-teal-800">Vocabulary → Recognition → Recall → Sentence use → Review</p>
      </div>
      <ul className="space-y-3 px-5">
        {CATEGORIES.map((c) => {
          const p = categoryPath(state, c.id);
          return (
            <li key={c.id}>
              <Link href={`/learn/${c.id}`} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 transition hover:ring-teal-300 active:scale-[0.99]">
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl ${c.color}`}>{c.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-bold text-slate-900">{c.name}</p>
                    <span className="text-xs text-slate-400">{p.words.length} words</span>
                  </div>
                  <p className="truncate text-sm text-slate-500">{c.de} · {c.blurb}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Bar value={p.pct} />
                    <span className="w-9 text-right text-xs font-semibold text-slate-500">{p.pct}%</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {p.next ? <>Next: <span className="font-medium text-teal-700">{p.next.label}</span></> : <span className="font-medium text-emerald-600">✓ Topic complete</span>}
                    {p.weakN > 0 && <span className="ml-2 text-rose-600">· {p.weakN} weak</span>}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
