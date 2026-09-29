import { CATEGORIES, CategoryId } from "@/data/vocab";
import { AppState, PATH_STEPS, categoryPath } from "./store";

export function stepHref(cat: CategoryId, key: (typeof PATH_STEPS)[number]["key"]) {
  if (key === "learn") return `/learn/${cat}`;
  if (key === "review") return `/review`;
  return `/practice/session?mode=${key}&cat=${cat}`;
}

/** Which topic + step should "Continue learning" point to? */
export function continueTarget(s: AppState) {
  const order = s.lastCategory ? [s.lastCategory, ...CATEGORIES.map((c) => c.id).filter((c) => c !== s.lastCategory)] : CATEGORIES.map((c) => c.id);
  for (const id of order) {
    const p = categoryPath(s, id);
    if (p.next) return { cat: CATEGORIES.find((c) => c.id === id)!, path: p, step: p.next, href: stepHref(id, p.next.key) };
  }
  return null;
}
