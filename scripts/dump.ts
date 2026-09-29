import { WORDS } from "../src/data/vocab";
import { blankOf } from "../src/lib/engine";
const out = { deToEn: {} as Record<string,string>, enToDe: {} as Record<string,string>, sentToBlank: {} as Record<string,string>, pos: {} as Record<string,string> };
for (const w of WORDS) {
  out.deToEn[w.de] = w.en; out.enToDe[w.en] = w.de; out.pos[w.en] = w.pos;
  for (const lv of ["A1","A2"] as const) { const b = blankOf(w, lv); out.sentToBlank[b.en] = b.blank; }
}
console.log(JSON.stringify(out));
