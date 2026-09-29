"use client";

import { useState } from "react";
import Link from "next/link";
import { BookCheck, Flame, Target, Trophy, TriangleAlert, Award } from "lucide-react";
import { Bar, Btn, Card, PageHeader } from "@/components/ui";
import { CATEGORIES, categoryById } from "@/data/vocab";
import { MODE_INFO } from "@/lib/engine";
import { QMode, categoryPath, computeStats, lastNDays, useStore } from "@/lib/store";

export default function ProgressPage() {
  const { state, setLevel, reset } = useStore();
  const st = computeStats(state);
  const week = lastNDays(state, 7);
  const maxDay = Math.max(state.dailyGoal, ...week.map((d) => d.answers));
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="anim-up">
      <PageHeader title="Progress" sub={`Level ${state.level} · ${state.goal}`} />
      <div className="space-y-4 px-5">
        <div className="grid grid-cols-2 gap-3">
          <Stat icon={<BookCheck className="h-5 w-5" />} color="bg-teal-100 text-teal-700" value={`${st.learned}`} unit={`/ ${st.total}`} label="Words learned" testid="p-learned" />
          <Stat icon={<Target className="h-5 w-5" />} color="bg-sky-100 text-sky-700" value={st.answers ? `${st.accuracy}%` : "–"} label={`Accuracy · ${st.answers} answers`} testid="p-accuracy" />
          <Stat icon={<TriangleAlert className="h-5 w-5" />} color="bg-rose-100 text-rose-700" value={`${st.weak.length}`} label="Weak words" href="/review" testid="p-weak" />
          <Stat icon={<Trophy className="h-5 w-5" />} color="bg-violet-100 text-violet-700" value={`${st.sessions}`} label="Sessions completed" testid="p-sessions" />
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className={`h-6 w-6 ${st.streak ? "fill-amber-400 text-amber-500" : "text-slate-300"}`} />
              <div>
                <p className="font-bold leading-tight">{st.streak} day streak</p>
                <p className="text-xs text-slate-500">Best: {st.bestStreak} day{st.bestStreak === 1 ? "" : "s"} · Goal {state.dailyGoal} answers/day</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-600">{st.today}/{state.dailyGoal} today</span>
          </div>
          <div className="mt-4 flex h-28 items-end justify-between gap-2" aria-label="Answers in the last 7 days">
            {week.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-slate-500">{d.answers || ""}</span>
                <div className="flex h-20 w-full items-end rounded-md bg-slate-100">
                  <div className={`w-full rounded-md ${d.answers >= state.dailyGoal ? "bg-amber-400" : "bg-teal-500"}`} style={{ height: `${(d.answers / maxDay) * 100}%` }} />
                </div>
                <span className={`text-[11px] ${d.isToday ? "font-bold text-slate-900" : "text-slate-400"}`}>{d.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Amber = daily goal reached</p>
        </Card>

        <Card>
          <p className="font-bold">Course mastery</p>
          <p className="text-xs text-slate-500">A word is mastered after 3 correct answers without a mistake.</p>
          <div className="mt-3 flex items-center gap-3">
            <Award className="h-8 w-8 text-teal-600" />
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-sm"><span>{st.mastered} of {st.total} words mastered</span><span className="font-semibold">{Math.round((st.mastered / st.total) * 100)}%</span></div>
              <Bar value={(st.mastered / st.total) * 100} />
            </div>
          </div>
          <ul className="mt-4 space-y-3">
            {CATEGORIES.map((c) => {
              const p = categoryPath(state, c.id);
              return (
                <li key={c.id}>
                  <Link href={`/learn/${c.id}`} className="block">
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{c.emoji} {c.name}</span>
                      <span className="text-xs text-slate-500">path {p.pct}% · {p.mastered}/{p.words.length} mastered</span>
                    </div>
                    <Bar value={p.pct} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <p className="font-bold">Accuracy by skill</p>
          <ul className="mt-3 space-y-3">
            {(["de-en", "en-de", "fill"] as QMode[]).map((m) => {
              const ms = state.modeStats[m];
              const pct = ms.total ? Math.round((ms.correct / ms.total) * 100) : 0;
              return (
                <li key={m}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{MODE_INFO[m].stage} <span className="text-slate-400">· {MODE_INFO[m].title}</span></span>
                    <span className="font-semibold">{ms.total ? `${pct}%` : "–"}</span>
                  </div>
                  <Bar value={pct} className={pct >= 70 ? "bg-emerald-500" : "bg-amber-400"} />
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <p className="font-bold">Recent sessions</p>
          {state.sessions.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No sessions yet. Finish a practice round to see it here.</p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-100" data-testid="session-list">
              {state.sessions.slice(0, 8).map((s) => {
                const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
                return (
                  <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <p className="font-medium">{s.source === "review" ? "Review round" : MODE_INFO[s.mode].title}</p>
                      <p className="text-xs text-slate-400">{s.cat ? categoryById(s.cat)?.name : s.source === "review" ? "Weak words" : "All topics"} · {new Date(s.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${pct >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{s.correct}/{s.total}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <p className="font-bold">Settings</p>
          <p className="mt-3 text-sm text-slate-600">German level</p>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {(["A1", "A2"] as const).map((l) => (
              <button key={l} onClick={() => setLevel(l)} className={`rounded-xl py-2.5 text-sm font-bold ring-2 ${state.level === l ? "bg-teal-600 text-white ring-teal-600" : "bg-white text-slate-700 ring-slate-200"}`}>
                {l} {l === "A1" ? "· Beginner" : "· Elementary"}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-400">A2 adds 15 more words and longer, more contextual example sentences. Your history is kept.</p>
          <div className="mt-4 border-t border-slate-100 pt-4">
            {!confirmReset ? (
              <button onClick={() => setConfirmReset(true)} className="text-sm font-semibold text-rose-600">Reset all progress…</button>
            ) : (
              <div className="rounded-xl bg-rose-50 p-3">
                <p className="text-sm text-rose-800">This deletes your words, sessions and streak. Are you sure?</p>
                <div className="mt-2 flex gap-2">
                  <Btn variant="danger" onClick={() => { reset(); setConfirmReset(false); }} className="!py-2">Yes, reset</Btn>
                  <Btn variant="secondary" onClick={() => setConfirmReset(false)} className="!py-2">Cancel</Btn>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ icon, color, value, unit, label, href, testid }: { icon: React.ReactNode; color: string; value: string; unit?: string; label: string; href?: string; testid?: string }) {
  const inner = (
    <div className="h-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>{icon}</span>
      <p className="mt-3 text-2xl font-bold text-slate-900"><span data-testid={testid}>{value}</span>{unit && <span className="text-sm font-medium text-slate-400"> {unit}</span>}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
