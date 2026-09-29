"use client";

import Link from "next/link";
import { ArrowRight, Flame, RotateCcw, Sparkles, Target, Trophy, Zap } from "lucide-react";
import { Bar, Btn, Card, GermanWord } from "@/components/ui";
import { computeStats, lastNDays, stat, useStore } from "@/lib/store";
import { continueTarget } from "@/lib/nav";

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return ["Guten Morgen", "Good morning"];
  if (h < 18) return ["Guten Tag", "Good afternoon"];
  return ["Guten Abend", "Good evening"];
}

export default function Home() {
  const { state } = useStore();
  const st = computeStats(state);
  const cont = continueTarget(state);
  const [g, gEn] = greeting();
  const week = lastNDays(state, 7);
  const goalPct = Math.min(100, Math.round((st.today / state.dailyGoal) * 100));
  const reviewN = st.weak.length + st.due.length;

  return (
    <div className="anim-up">
      {/* Hero */}
      <div className="rounded-b-3xl bg-gradient-to-br from-teal-600 to-teal-700 px-5 pb-6 pt-7 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-teal-100">{gEn}</p>
            <h1 className="text-2xl font-bold">{g}{state.name ? `, ${state.name}` : ""}! 👋</h1>
          </div>
          <Link href="/progress" className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold ring-1 ring-white/30" aria-label="Current level">
            {state.level}
          </Link>
        </div>
        <p className="mt-1 text-sm text-teal-100">🎯 {state.goal}</p>

        <div className="mt-5 grid grid-cols-[auto_1fr] items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
          <div className="flex flex-col items-center">
            <Flame className={`h-8 w-8 ${st.streak > 0 ? "fill-amber-300 text-amber-300" : "text-teal-200"}`} />
            <p className="text-xl font-bold leading-none" data-testid="streak">{st.streak}</p>
            <p className="text-[10px] uppercase tracking-wide text-teal-100">day streak</p>
          </div>
          <div>
            <div className="flex justify-between text-xs text-teal-50">
              <span>Today&apos;s goal</span>
              <span className="font-semibold" data-testid="today">{st.today}/{state.dailyGoal} answers</span>
            </div>
            <Bar value={goalPct} className="bg-amber-300" track="bg-white/20" />
            <div className="mt-3 flex justify-between">
              {week.map((d) => (
                <div key={d.key} className="flex flex-col items-center gap-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${d.answers > 0 ? "bg-amber-300" : "bg-white/25"} ${d.isToday ? "ring-2 ring-white/70 ring-offset-1 ring-offset-teal-700" : ""}`} />
                  <span className="text-[10px] text-teal-100">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 pt-5">
        {/* Continue learning */}
        {cont ? (
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Continue learning</p>
            <div className="mt-2 flex items-center gap-3">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${cont.cat.color}`}>{cont.cat.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">{cont.cat.name}</p>
                <p className="text-sm text-slate-500">Next: <span className="font-medium text-slate-700">{cont.step.label}</span> · {cont.step.sub}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Bar value={cont.path.pct} />
              <span className="text-xs font-semibold text-slate-500">{cont.path.pct}%</span>
            </div>
            <Btn href={cont.href} className="mt-4 w-full">
              Continue <ArrowRight className="h-4 w-4" />
            </Btn>
          </Card>
        ) : (
          <Card className="text-center">
            <Trophy className="mx-auto h-8 w-8 text-amber-500" />
            <p className="mt-2 font-bold">All topics completed at {state.level}!</p>
            <p className="text-sm text-slate-500">Keep your words fresh with daily review{state.level === "A1" ? " – or switch to A2 for more words." : "."}</p>
          </Card>
        )}

        {/* Daily review */}
        <Card className={reviewN > 0 ? "ring-rose-200" : ""}>
          <div className="flex items-start gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${reviewN > 0 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>
              <RotateCcw className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-bold text-slate-900">Daily review</p>
              {reviewN > 0 ? (
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-rose-600" data-testid="weak-count">{st.weak.length} weak</span>
                  {st.due.length > 0 && <> · {st.due.length} due to refresh</>} – fix them while they&apos;re fresh.
                </p>
              ) : (
                <p className="text-sm text-slate-500">Nothing to review right now. Mistakes you make in practice will appear here.</p>
              )}
            </div>
          </div>
          {reviewN > 0 ? (
            <Btn href="/practice/session?review=1" variant="danger" className="mt-4 w-full">
              Review {Math.min(10, reviewN)} word{Math.min(10, reviewN) === 1 ? "" : "s"} now
            </Btn>
          ) : (
            <Btn href="/practice/session?mode=mixed" variant="secondary" className="mt-4 w-full">
              <Zap className="h-4 w-4 text-amber-500" /> Quick mixed practice
            </Btn>
          )}
        </Card>

        {/* Weak words */}
        {st.weak.length > 0 && (
          <Card>
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-900">Words to revisit</p>
              <Link href="/review" className="text-sm font-semibold text-teal-700">See all</Link>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {st.weak.slice(0, 6).map((w) => (
                <li key={w.id} className="rounded-full bg-rose-50 px-3 py-1.5 text-sm ring-1 ring-rose-100">
                  <GermanWord w={w} className="font-semibold" />
                  <span className="text-slate-500"> · {w.en}</span>
                  <span className="ml-1 text-xs text-rose-500">×{stat(state, w.id).wrong}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Progress snapshot */}
        <Card>
          <div className="flex items-center justify-between">
            <p className="font-bold text-slate-900">Your progress</p>
            <Link href="/progress" className="text-sm font-semibold text-teal-700">Details</Link>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Mini icon={<Sparkles className="h-4 w-4" />} value={`${st.learned}/${st.total}`} label="Words learned" testid="learned" />
            <Mini icon={<Target className="h-4 w-4" />} value={st.answers ? `${st.accuracy}%` : "–"} label="Accuracy" testid="accuracy" />
            <Mini icon={<Trophy className="h-4 w-4" />} value={String(st.sessions)} label="Sessions" testid="sessions" />
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-slate-500"><span>Course progress (words mastered)</span><span>{st.mastered}/{st.total}</span></div>
            <Bar value={(st.mastered / st.total) * 100} />
          </div>
        </Card>

        <Btn href="/practice" variant="ghost" className="w-full">Choose a practice mode <ArrowRight className="h-4 w-4" /></Btn>
      </div>
    </div>
  );
}

function Mini({ icon, value, label, testid }: { icon: React.ReactNode; value: string; label: string; testid?: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2 py-3">
      <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-700">{icon}</div>
      <p className="mt-1 text-lg font-bold text-slate-900" data-testid={testid}>{value}</p>
      <p className="text-[11px] leading-tight text-slate-500">{label}</p>
    </div>
  );
}
