"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, HeartPulse, Stethoscope } from "lucide-react";
import { Btn } from "@/components/ui";
import { useStore } from "@/lib/store";
import { Level, wordsForLevel } from "@/data/vocab";

const LEVELS: { id: Level; title: string; sub: string; sample: string; sampleEn: string }[] = [
  { id: "A1", title: "A1 · Beginner", sub: "I know basic greetings and simple sentences.", sample: "Mein Kopf tut weh.", sampleEn: "My head hurts." },
  { id: "A2", title: "A2 · Elementary", sub: "I can talk about simple everyday situations.", sample: "Der Patient hat starke Kopfschmerzen.", sampleEn: "The patient has a bad headache." },
];

const GOALS = [
  { n: 10, label: "Relaxed", sub: "10 answers a day · ~3 min" },
  { n: 20, label: "Regular", sub: "20 answers a day · ~6 min" },
  { n: 40, label: "Intensive", sub: "40 answers a day · ~12 min" },
];

export default function Onboarding() {
  const { completeOnboarding, state } = useStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(state.name);
  const [level, setLevel] = useState<Level>(state.level);
  const [dailyGoal, setDailyGoal] = useState(state.dailyGoal);

  const finish = () => {
    completeOnboarding({ name: name.trim(), level, dailyGoal });
    router.replace("/");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-teal-50 to-slate-50 px-5 pb-8 pt-6">
      <div className="mb-6 flex items-center gap-3">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="rounded-full p-2 text-slate-600 hover:bg-white" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : <div className="h-9 w-9" />}
        <div className="flex flex-1 gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-teal-600" : "bg-teal-100"}`} />
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="anim-up flex flex-1 flex-col">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-teal-600 text-white shadow-lg shadow-teal-600/30">
              <Stethoscope className="h-12 w-12" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">SkillCase</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Medical German<br />for Nurses</h1>
            <p className="mt-4 max-w-xs text-slate-600">
              Learn the German words you need on the ward – body parts, symptoms, conditions and patient care. Simple A1/A2 German, explained in English.
            </p>
            <div className="mt-8 w-full max-w-xs rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">How it works</p>
              <ol className="mt-2 space-y-1.5 text-sm text-slate-700">
                {["Learn words with examples", "Practise in 3 different ways", "Get simple feedback on mistakes", "Review your weak words until they stick"].map((t, i) => (
                  <li key={t} className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-700">{i + 1}</span>{t}</li>
                ))}
              </ol>
            </div>
          </div>
          <Btn onClick={() => setStep(1)} className="w-full">Get started</Btn>
        </div>
      )}

      {step === 1 && (
        <div className="anim-up flex flex-1 flex-col">
          <h2 className="text-2xl font-bold text-slate-900">Your goal</h2>
          <p className="mt-1 text-slate-600">Everything in this course is chosen for this goal.</p>
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-teal-600 p-4 text-white shadow-md">
            <HeartPulse className="mt-0.5 h-6 w-6 shrink-0" />
            <div>
              <p className="font-semibold">Prepare for nursing work in Germany</p>
              <p className="mt-1 text-sm text-teal-50">Understand patients, describe symptoms and give simple instructions in German.</p>
            </div>
            <Check className="ml-auto h-5 w-5 shrink-0" />
          </div>
          <label className="mt-8 block text-sm font-semibold text-slate-700" htmlFor="name">What should we call you? <span className="font-normal text-slate-400">(optional)</span></label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya"
            maxLength={30}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
          <div className="flex-1" />
          <Btn onClick={() => setStep(2)} className="mt-8 w-full">Continue</Btn>
        </div>
      )}

      {step === 2 && (
        <div className="anim-up flex flex-1 flex-col">
          <h2 className="text-2xl font-bold text-slate-900">Your German level</h2>
          <p className="mt-1 text-slate-600">You can change this later in Progress.</p>
          <div className="mt-6 space-y-3" role="radiogroup">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                role="radio"
                aria-checked={level === l.id}
                onClick={() => setLevel(l.id)}
                className={`w-full rounded-2xl bg-white p-4 text-left ring-2 transition ${level === l.id ? "ring-teal-600 shadow-md" : "ring-slate-200"}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-slate-900">{l.title}</p>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full ${level === l.id ? "bg-teal-600 text-white" : "ring-2 ring-slate-300"}`}>
                    {level === l.id && <Check className="h-4 w-4" />}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{l.sub}</p>
                <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-sm font-medium text-slate-800">„{l.sample}“</p>
                  <p className="text-xs text-slate-500">{l.sampleEn}</p>
                </div>
                <p className="mt-2 text-xs font-medium text-teal-700">{wordsForLevel(l.id).length} words · 4 topics</p>
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <Btn onClick={() => setStep(3)} className="mt-8 w-full">Continue</Btn>
        </div>
      )}

      {step === 3 && (
        <div className="anim-up flex flex-1 flex-col">
          <h2 className="text-2xl font-bold text-slate-900">Daily practice goal</h2>
          <p className="mt-1 text-slate-600">A little every day works better than a lot once a week.</p>
          <div className="mt-6 space-y-3">
            {GOALS.map((g) => (
              <button
                key={g.n}
                onClick={() => setDailyGoal(g.n)}
                className={`flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left ring-2 transition ${dailyGoal === g.n ? "ring-teal-600 shadow-md" : "ring-slate-200"}`}
              >
                <div>
                  <p className="font-bold text-slate-900">{g.label}</p>
                  <p className="text-sm text-slate-500">{g.sub}</p>
                </div>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${dailyGoal === g.n ? "bg-teal-600 text-white" : "ring-2 ring-slate-300"}`}>
                  {dailyGoal === g.n && <Check className="h-4 w-4" />}
                </span>
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <Btn onClick={finish} className="mt-8 w-full">Start learning</Btn>
        </div>
      )}
    </div>
  );
}
