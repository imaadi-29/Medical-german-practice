import { WORDS } from "../src/data/vocab";
import { blankOf, makeQuestion, checkTyped } from "../src/lib/engine";
let bad = 0;
const ids = new Set<string>();
for (const w of WORDS) {
  if (ids.has(w.id)) { console.log("dup id", w.id); bad++; } ids.add(w.id);
  for (const lv of ["A1", "A2"] as const) {
    const ex = lv === "A1" ? w.a1 : w.a2;
    if (!/\{.+?\}/.test(ex[0])) { console.log("no blank", w.id, lv); bad++; }
    const q = makeQuestion(w, "fill", lv);
    if (new Set(q.options).size !== 4) { console.log("fill opts", w.id, lv, q.options); bad++; }
    const q2 = makeQuestion(w, "de-en", lv);
    if (new Set(q2.options).size !== 4) { console.log("de-en opts", w.id, q2.options); bad++; }
  }
  const q = makeQuestion(w, "en-de", "A2");
  if (!checkTyped(q, w.de).countsCorrect) { console.log("self check fails", w.id); bad++; }
}
const kopf = makeQuestion(WORDS[0], "en-de", "A1");
for (const t of ["der Kopf", "Kopf", "die Kopf", "der kopf", "der Kopp", "Bauch", "xyz", ""]) {
  const f = checkTyped(kopf, t); console.log(JSON.stringify(t), f.verdict, "|", f.title);
}
const r = makeQuestion(WORDS.find(w=>w.id==="ruecken")!, "en-de", "A1");
for (const t of ["der Ruecken", "der Rucken"]) { const f = checkTyped(r, t); console.log(t, f.verdict, f.title); }
console.log(WORDS.length, "words;", WORDS.filter(w=>w.level==="A1").length, "A1; problems:", bad);
