"use client";

import { useState } from "react";
import { ArrowRight, Eye, Keyboard, Shuffle, TextCursorInput } from "lucide-react";
import { Btn, Card, PageHeader } from "@/components/ui";
import { CATEGORIES, CategoryId } from "@/data/vocab";
import { MODE_INFO } from "@/lib/engine";
import { Mode, computeStats, useStore } from "@/lib/store";

const MODES: { id: Mode; icon: React.ElementType; color: string }[] = [
  { id: "de-en", icon: Eye, color: "bg-sky-100 text-sky-700" },
  { id: "en-de", icon: Keyboard, color: "bg-violet-100 text-violet-700" },
  { id: "fill", icon: TextCursorInput, color: "bg-amber-100 text-amber-700" },
  { id: "mixed", icon: Shuffle, color: "bg-teal-100 text-teal-700" },
];

export default function PracticeHub() {
  const { state } = useStore();
  const st = computeStats(state);
  const [mode, setMode] = useState<Mode>("de-en");
  const [cat, setCat] = useState<CategoryId | "all">("all");

  const href = `/practice/session?mode=${mode}${cat !== "all" ? `&cat=${cat}` : ""}`;

  return (
    <div className="anim-up">
      <PageHeader title="Practice" sub="8 questions per round · instant feedback" />
      <div className="space-y-5 px-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">1. Choose a mode</p>
          <div className="grid grid-cols-2 gap-3" role="radiogroup">
            {MODES.map(({ id, icon: Icon, color }) => {
              const info = MODE_INFO[id];
              const ms = id !== "mixed" ? state.modeStats[id] : null;
              return (
                <button
                  key={id}
                  role="radio"
                  aria-checked={mode === id}
                  onClick={() => setMode(id)}
                  className={`rounded-2xl bg-white p-3.5 text-left ring-2 transition ${mode === id ? "ring-teal-600 shadow-md" : "ring-slate-200"}`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{info.stage}</p>
                  <p className="text-sm font-bold leading-tight text-slate-900">{info.title}</p>
                  <p className="mt-1 text-xs leading-snug text-slate-500">{info.sub}</p>
                  {ms && ms.total > 0 && <p className="mt-1.5 text-[11px] font-semibold text-teal-700">{Math.round((ms.correct / ms.total) * 100)}% accuracy</p>}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">2. Choose a topic</p>
          <div className="flex flex-wrap gap-2">
            {[{ id: "all" as const, name: "All topics", emoji: "📚" }, ...CATEGORIES].map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`rounded-full px-3.5 py-2 text-sm font-medium ring-1 transition ${cat === c.id ? "bg-teal-600 text-white ring-teal-600" : "bg-white text-slate-700 ring-slate-200"}`}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        </div>

        {st.weak.length > 0 && (
          <p className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-800 ring-1 ring-rose-100">
            🔁 Up to 3 of your <b>{st.weak.length} weak words</b> will be mixed into this round automatically.
          </p>
        )}

        <Btn href={href} className="w-full">Start practice <ArrowRight className="h-4 w-4" /></Btn>

        <Card>
          <p className="font-bold text-slate-900">Only weak words?</p>
          <p className="mt-1 text-sm text-slate-500">A focused round with just the words you got wrong, in all three question types.</p>
          <Btn href="/review" variant="secondary" className="mt-3 w-full">Go to Review ({st.weak.length})</Btn>
        </Card>
      </div>
    </div>
  );
}
