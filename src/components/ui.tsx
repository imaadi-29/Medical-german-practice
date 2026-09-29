"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BarChart3, BookOpen, Dumbbell, Home, RotateCcw, Volume2 } from "lucide-react";
import { useStore, weakWords } from "@/lib/store";
import { speak } from "@/lib/speech";
import { Word } from "@/data/vocab";
import { articleColor } from "@/lib/engine";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: Dumbbell },
  { href: "/review", label: "Review", icon: RotateCcw },
  { href: "/progress", label: "Progress", icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, hydrated } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const isOnboarding = pathname.startsWith("/onboarding");
  const isSession = pathname.startsWith("/practice/session");

  useEffect(() => {
    if (hydrated && !state.onboarded && !isOnboarding) router.replace("/onboarding");
  }, [hydrated, state.onboarded, isOnboarding, router]);

  if (!hydrated || (!state.onboarded && !isOnboarding)) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
      </div>
    );
  }

  const showNav = !isOnboarding && !isSession;
  return (
    <div className="relative mx-auto min-h-dvh max-w-md bg-slate-50 md:shadow-xl md:ring-1 md:ring-slate-200">
      <main className={showNav ? "pb-24" : ""}>{children}</main>
      {showNav && <BottomNav />}
    </div>
  );
}

function BottomNav() {
  const pathname = usePathname();
  const { state } = useStore();
  const weakN = weakWords(state).length;
  return (
    <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 border-t border-slate-200 bg-white/95 backdrop-blur" aria-label="Main">
      <ul className="grid grid-cols-5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${active ? "text-teal-700" : "text-slate-500"}`}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                {label}
                {href === "/review" && weakN > 0 && (
                  <span className="absolute right-[22%] top-1.5 min-w-4 rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-4 text-white">{weakN}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function PageHeader({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <header className="flex items-end justify-between gap-3 px-5 pb-4 pt-7">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-slate-500">{sub}</p>}
      </div>
      {right}
    </header>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 ${className}`}>{children}</section>;
}

export function Bar({ value, className = "bg-teal-500", track = "bg-slate-100" }: { value: number; className?: string; track?: string }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full ${track}`}>
      <div className={`h-full rounded-full transition-all duration-500 ${className}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function ListenButton({ text, className = "", label = "Listen" }: { text: string; className?: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); speak(text); }}
      className={`inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 ring-1 ring-teal-100 hover:bg-teal-100 active:scale-95 ${className}`}
      aria-label={`${label}: ${text}`}
    >
      <Volume2 className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

/** Renders "der Kopf" with the article coloured by gender. */
export function GermanWord({ w, className = "" }: { w: Word; className?: string }) {
  const parts = w.de.split(" ");
  const hasArt = w.pos === "noun" && ["der", "die", "das"].includes(parts[0]);
  return (
    <span className={className}>
      {hasArt && <span className={articleColor(w)}>{parts[0]} </span>}
      {hasArt ? parts.slice(1).join(" ") : w.de}
    </span>
  );
}

/** Example sentence with the target word highlighted. */
export function Sentence({ de, className = "" }: { de: string; className?: string }) {
  const m = de.match(/^(.*)\{(.+?)\}(.*)$/);
  if (!m) return <span className={className}>{de}</span>;
  return (
    <span className={className}>
      {m[1]}
      <mark className="rounded bg-amber-100 px-0.5 text-inherit">{m[2]}</mark>
      {m[3]}
    </span>
  );
}

export function Btn({
  children, href, onClick, variant = "primary", className = "", disabled, type = "button",
}: {
  children: React.ReactNode; href?: string; onClick?: () => void; variant?: "primary" | "secondary" | "ghost" | "danger"; className?: string; disabled?: boolean; type?: "button" | "submit";
}) {
  const styles = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-sm shadow-teal-600/20",
    secondary: "bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50",
    ghost: "text-teal-700 hover:bg-teal-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  }[variant];
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none ${styles} ${className}`;
  if (href && !disabled) return <Link href={href} className={cls}>{children}</Link>;
  return <button type={type} onClick={onClick} className={cls} disabled={disabled}>{children}</button>;
}

export function StrengthDots({ box }: { box: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`Strength ${box} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`h-1.5 w-1.5 rounded-full ${i <= box ? "bg-teal-500" : "bg-slate-200"}`} />
      ))}
    </span>
  );
}
