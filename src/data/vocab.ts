export type Level = "A1" | "A2";
export type Pos = "noun" | "verb" | "adj";
export type Gender = "m" | "f" | "n" | "pl";
export type CategoryId = "body" | "symptoms" | "conditions" | "care";

/** Example sentence. The practice word is wrapped in {braces} – used for fill-in-the-blank. */
export type Example = [de: string, en: string];

export interface Word {
  id: string;
  cat: CategoryId;
  level: Level; // A1 words are shown to everyone, A2 words only to A2 learners
  de: string; // with article for nouns
  en: string;
  pos: Pos;
  gender?: Gender;
  pron: string; // simple pronunciation help for English speakers
  tip?: string; // memory hook / grammar note in simple English
  alts?: string[]; // other accepted German answers
  a1: Example;
  a2: Example;
}

export interface Category {
  id: CategoryId;
  name: string;
  de: string;
  emoji: string;
  blurb: string;
  color: string; // tailwind bg class for the icon tile
}

export const CATEGORIES: Category[] = [
  { id: "body", name: "Body Parts", de: "Der Körper", emoji: "🫁", blurb: "Head, arm, back – where does it hurt?", color: "bg-sky-100" },
  { id: "symptoms", name: "Symptoms", de: "Die Symptome", emoji: "🤒", blurb: "Pain, fever, cough, dizziness", color: "bg-rose-100" },
  { id: "conditions", name: "Basic Conditions", de: "Krankheiten", emoji: "🩺", blurb: "Cold, flu, allergy, diabetes", color: "bg-amber-100" },
  { id: "care", name: "Patient Care", de: "Die Pflege", emoji: "💊", blurb: "Everyday nursing words and instructions", color: "bg-emerald-100" },
];

export const WORDS: Word[] = [
  // ───────────── BODY PARTS ─────────────
  { id: "kopf", cat: "body", level: "A1", de: "der Kopf", en: "head", pos: "noun", gender: "m", pron: "kopf – short 'o' like in 'off'", tip: "Kopfschmerzen = Kopf + Schmerzen = headache.", a1: ["Mein {Kopf} tut weh.", "My head hurts."], a2: ["Der Patient hat starke {Kopf}schmerzen.", "The patient has a bad headache."] },
  { id: "bauch", cat: "body", level: "A1", de: "der Bauch", en: "stomach / belly", pos: "noun", gender: "m", pron: "bowkh – 'ch' like in Scottish 'loch'", tip: "Bauchschmerzen = stomach ache.", a1: ["Der {Bauch} tut weh.", "The stomach hurts."], a2: ["Die Patientin hat seit gestern Schmerzen im {Bauch}.", "The patient has had stomach pain since yesterday."] },
  { id: "arm", cat: "body", level: "A1", de: "der Arm", en: "arm", pos: "noun", gender: "m", pron: "arm – long 'a' like in 'father'", tip: "Same as English – just remember: der Arm.", a1: ["Heben Sie bitte den {Arm}.", "Please raise your arm."], a2: ["Der Patient kann den linken {Arm} nicht bewegen.", "The patient cannot move his left arm."] },
  { id: "bein", cat: "body", level: "A1", de: "das Bein", en: "leg", pos: "noun", gender: "n", pron: "bine – rhymes with 'wine'", tip: "'ei' in German sounds like English 'eye'.", a1: ["Mein {Bein} tut weh.", "My leg hurts."], a2: ["Nach dem Sturz hat sie Schmerzen im rechten {Bein}.", "After the fall she has pain in her right leg."] },
  { id: "hand", cat: "body", level: "A1", de: "die Hand", en: "hand", pos: "noun", gender: "f", pron: "hant – the 'd' at the end sounds like 't'", tip: "Plural: die Hände.", a1: ["Geben Sie mir bitte die {Hand}.", "Please give me your hand."], a2: ["Die {Hand} ist geschwollen und rot.", "The hand is swollen and red."] },
  { id: "ruecken", cat: "body", level: "A1", de: "der Rücken", en: "back", pos: "noun", gender: "m", pron: "RÜ-ken – say 'ee' with round lips for ü", tip: "Rückenschmerzen = back pain – very common on the ward!", a1: ["Mein {Rücken} tut weh.", "My back hurts."], a2: ["Legen Sie sich bitte auf den {Rücken}.", "Please lie on your back."] },
  { id: "auge", cat: "body", level: "A1", de: "das Auge", en: "eye", pos: "noun", gender: "n", pron: "OW-guh – 'au' like in 'ouch'", tip: "Plural: die Augen.", a1: ["Mein {Auge} ist rot.", "My eye is red."], a2: ["Bitte öffnen Sie das linke {Auge}.", "Please open your left eye."] },
  { id: "ohr", cat: "body", level: "A1", de: "das Ohr", en: "ear", pos: "noun", gender: "n", pron: "ohr – long 'o' like in 'oar'", a1: ["Mein {Ohr} tut weh.", "My ear hurts."], a2: ["Das Kind hat seit zwei Tagen Schmerzen im {Ohr}.", "The child has had ear pain for two days."] },
  { id: "hals", cat: "body", level: "A1", de: "der Hals", en: "throat / neck", pos: "noun", gender: "m", pron: "hals – like 'hulls'", tip: "Halsschmerzen = sore throat.", a1: ["Mein {Hals} ist rot.", "My throat is red."], a2: ["Sie kann nicht gut schlucken, der {Hals} tut weh.", "She can't swallow well, her throat hurts."] },
  { id: "fuss", cat: "body", level: "A1", de: "der Fuß", en: "foot", pos: "noun", gender: "m", pron: "foos – long 'oo'", tip: "ß sounds like 'ss'. You can type 'ss' if you have no ß key.", alts: ["der Fuss"], a1: ["Mein {Fuß} ist kalt.", "My foot is cold."], a2: ["Der linke {Fuß} ist nach dem Sturz geschwollen.", "The left foot is swollen after the fall."] },
  { id: "brust", cat: "body", level: "A2", de: "die Brust", en: "chest", pos: "noun", gender: "f", pron: "broost – short 'u'", a1: ["Haben Sie Schmerzen in der {Brust}?", "Do you have pain in your chest?"], a2: ["Der Patient hat plötzlich Schmerzen in der {Brust}.", "The patient suddenly has chest pain."] },
  { id: "herz", cat: "body", level: "A2", de: "das Herz", en: "heart", pos: "noun", gender: "n", pron: "hairts – 'z' sounds like 'ts'", a1: ["Das {Herz} schlägt schnell.", "The heart is beating fast."], a2: ["Die Ärztin hört das {Herz} ab.", "The doctor listens to the heart."] },
  { id: "knie", cat: "body", level: "A2", de: "das Knie", en: "knee", pos: "noun", gender: "n", pron: "k-NEE – say the 'k'!", tip: "Unlike English, the K is spoken: k-nee.", a1: ["Mein {Knie} tut weh.", "My knee hurts."], a2: ["Nach der Operation ist das {Knie} noch dick.", "After the operation the knee is still swollen."] },

  // ───────────── SYMPTOMS ─────────────
  { id: "schmerzen", cat: "symptoms", level: "A1", de: "die Schmerzen", en: "pain", pos: "noun", gender: "pl", pron: "SHMAIR-tsen", tip: "Usually plural in German: Ich habe Schmerzen.", alts: ["der Schmerz", "Schmerz"], a1: ["Haben Sie {Schmerzen}?", "Do you have pain?"], a2: ["Wie stark sind die {Schmerzen} von 1 bis 10?", "How strong is the pain from 1 to 10?"] },
  { id: "fieber", cat: "symptoms", level: "A1", de: "das Fieber", en: "fever", pos: "noun", gender: "n", pron: "FEE-ber", tip: "'ie' is always a long 'ee' sound.", a1: ["Ich habe {Fieber}.", "I have a fever."], a2: ["Der Patient hat seit gestern hohes {Fieber}.", "The patient has had a high fever since yesterday."] },
  { id: "husten", cat: "symptoms", level: "A1", de: "der Husten", en: "cough", pos: "noun", gender: "m", pron: "HOO-sten", a1: ["Ich habe {Husten}.", "I have a cough."], a2: ["Der {Husten} ist in der Nacht schlimmer.", "The cough is worse at night."] },
  { id: "schnupfen", cat: "symptoms", level: "A1", de: "der Schnupfen", en: "runny nose", pos: "noun", gender: "m", pron: "SHNOOP-fen", a1: ["Ich habe {Schnupfen}.", "I have a runny nose."], a2: ["Das Kind hat {Schnupfen} und Husten.", "The child has a runny nose and a cough."] },
  { id: "muede", cat: "symptoms", level: "A1", de: "müde", en: "tired", pos: "adj", pron: "MÜ-duh – round your lips for ü", a1: ["Ich bin sehr {müde}.", "I am very tired."], a2: ["Die Patientin ist heute sehr {müde} und schläft viel.", "The patient is very tired today and sleeps a lot."] },
  { id: "schwindelig", cat: "symptoms", level: "A1", de: "schwindelig", en: "dizzy", pos: "adj", pron: "SHVIN-deh-lish", tip: "We say 'Mir ist schwindelig' (not 'Ich bin').", a1: ["Mir ist {schwindelig}.", "I feel dizzy."], a2: ["Nach dem Aufstehen ist ihm {schwindelig}.", "He feels dizzy after getting up."] },
  { id: "durchfall", cat: "symptoms", level: "A1", de: "der Durchfall", en: "diarrhoea", pos: "noun", gender: "m", pron: "DOORKH-fal", a1: ["Ich habe {Durchfall}.", "I have diarrhoea."], a2: ["Der Patient hat seit zwei Tagen {Durchfall}.", "The patient has had diarrhoea for two days."] },
  { id: "uebel", cat: "symptoms", level: "A2", de: "übel", en: "sick / nauseous", pos: "adj", pron: "Ü-bel", tip: "'Mir ist übel' = I feel sick (want to vomit).", a1: ["Mir ist {übel}.", "I feel sick."], a2: ["Nach dem Essen ist ihr oft {übel}.", "She often feels sick after eating."] },
  { id: "erbrechen", cat: "symptoms", level: "A2", de: "erbrechen", en: "to vomit", pos: "verb", pron: "air-BREKH-en", a1: ["Ich muss {erbrechen}.", "I have to vomit."], a2: ["Hat der Patient heute {erbrochen}?", "Has the patient vomited today?"] },
  { id: "atemnot", cat: "symptoms", level: "A2", de: "die Atemnot", en: "shortness of breath", pos: "noun", gender: "f", pron: "AH-tem-note", tip: "Atem = breath, Not = need/emergency.", a1: ["Er hat {Atemnot}.", "He is short of breath."], a2: ["Der Patient hat {Atemnot} auf der Treppe.", "The patient is short of breath on the stairs."] },
  { id: "geschwollen", cat: "symptoms", level: "A2", de: "geschwollen", en: "swollen", pos: "adj", pron: "geh-SHVOL-en", a1: ["Das Knie ist {geschwollen}.", "The knee is swollen."], a2: ["Seit dem Sturz ist der Fuß {geschwollen}.", "The foot has been swollen since the fall."] },

  // ───────────── BASIC CONDITIONS ─────────────
  { id: "krank", cat: "conditions", level: "A1", de: "krank", en: "sick / ill", pos: "adj", pron: "krank – like 'crank'", tip: "das Krankenhaus = the hospital (house for sick people).", a1: ["Ich bin {krank}.", "I am sick."], a2: ["Der Patient ist seit einer Woche {krank}.", "The patient has been ill for a week."] },
  { id: "gesund", cat: "conditions", level: "A1", de: "gesund", en: "healthy", pos: "adj", pron: "geh-ZOONT", tip: "Opposite of krank. 'Gute Besserung!' = Get well soon!", a1: ["Sie ist wieder {gesund}.", "She is healthy again."], a2: ["Nach der Behandlung ist er wieder {gesund}.", "After the treatment he is healthy again."] },
  { id: "erkaeltung", cat: "conditions", level: "A1", de: "die Erkältung", en: "a cold", pos: "noun", gender: "f", pron: "air-KEL-toong", tip: "Nouns ending in -ung are always 'die'.", a1: ["Ich habe eine {Erkältung}.", "I have a cold."], a2: ["Wegen einer {Erkältung} bleibt sie heute zu Hause.", "Because of a cold she is staying at home today."] },
  { id: "grippe", cat: "conditions", level: "A1", de: "die Grippe", en: "flu", pos: "noun", gender: "f", pron: "GRIP-uh", a1: ["Er hat die {Grippe}.", "He has the flu."], a2: ["Im Winter haben viele Patienten die {Grippe}.", "In winter many patients have the flu."] },
  { id: "diabetes", cat: "conditions", level: "A1", de: "der Diabetes", en: "diabetes", pos: "noun", gender: "m", pron: "dee-a-BAY-tes", a1: ["Mein Vater hat {Diabetes}.", "My father has diabetes."], a2: ["Patienten mit {Diabetes} messen oft den Blutzucker.", "Patients with diabetes often measure their blood sugar."] },
  { id: "allergie", cat: "conditions", level: "A1", de: "die Allergie", en: "allergy", pos: "noun", gender: "f", pron: "a-lair-GEE", tip: "Stress is on the last part: -GIE.", a1: ["Haben Sie eine {Allergie}?", "Do you have an allergy?"], a2: ["Der Patient hat eine {Allergie} gegen Penizillin.", "The patient has an allergy to penicillin."] },
  { id: "wunde", cat: "conditions", level: "A1", de: "die Wunde", en: "wound", pos: "noun", gender: "f", pron: "VOON-duh – German 'w' sounds like English 'v'", a1: ["Die {Wunde} ist klein.", "The wound is small."], a2: ["Die Pflegekraft macht die {Wunde} jeden Tag sauber.", "The nurse cleans the wound every day."] },
  { id: "gebrochen", cat: "conditions", level: "A1", de: "gebrochen", en: "broken", pos: "adj", pron: "geh-BROKH-en", a1: ["Das Bein ist {gebrochen}.", "The leg is broken."], a2: ["Nach dem Sturz ist ihr Arm {gebrochen}.", "After the fall her arm is broken."] },
  { id: "bluthochdruck", cat: "conditions", level: "A2", de: "der Bluthochdruck", en: "high blood pressure", pos: "noun", gender: "m", pron: "BLOOT-hohkh-drook", tip: "Blut (blood) + hoch (high) + Druck (pressure).", a1: ["Er hat {Bluthochdruck}.", "He has high blood pressure."], a2: ["Die Patientin nimmt Tabletten gegen {Bluthochdruck}.", "The patient takes tablets for high blood pressure."] },
  { id: "infektion", cat: "conditions", level: "A2", de: "die Infektion", en: "infection", pos: "noun", gender: "f", pron: "in-fek-TSYOHN", tip: "Nouns ending in -ion are always 'die'.", a1: ["Die Wunde hat eine {Infektion}.", "The wound has an infection."], a2: ["Gegen die {Infektion} bekommt er ein Antibiotikum.", "He gets an antibiotic for the infection."] },
  { id: "asthma", cat: "conditions", level: "A2", de: "das Asthma", en: "asthma", pos: "noun", gender: "n", pron: "AST-ma – the 'h' is silent", a1: ["Sie hat {Asthma}.", "She has asthma."], a2: ["Bei {Asthma} ist das Atmen schwer.", "With asthma, breathing is difficult."] },

  // ───────────── PATIENT CARE / NURSING ─────────────
  { id: "patient", cat: "care", level: "A1", de: "der Patient", en: "patient", pos: "noun", gender: "m", pron: "pa-TSYENT – 'ti' sounds like 'tsy'", tip: "A female patient is 'die Patientin'.", alts: ["die Patientin"], a1: ["Der {Patient} liegt im Bett.", "The patient is lying in bed."], a2: ["Der {Patient} in Zimmer 5 braucht Hilfe.", "The patient in room 5 needs help."] },
  { id: "krankenschwester", cat: "care", level: "A1", de: "die Krankenschwester", en: "nurse", pos: "noun", gender: "f", pron: "KRANK-en-shves-ter", tip: "A male nurse is 'der Krankenpfleger'.", alts: ["der Krankenpfleger", "die Pflegekraft"], a1: ["Ich bin {Krankenschwester}.", "I am a nurse."], a2: ["Die {Krankenschwester} bringt das Frühstück.", "The nurse brings the breakfast."] },
  { id: "arzt", cat: "care", level: "A1", de: "der Arzt", en: "doctor", pos: "noun", gender: "m", pron: "artst", tip: "A female doctor is 'die Ärztin'.", alts: ["die Ärztin"], a1: ["Der {Arzt} kommt gleich.", "The doctor is coming soon."], a2: ["Ich rufe sofort den {Arzt}.", "I'll call the doctor immediately."] },
  { id: "tablette", cat: "care", level: "A1", de: "die Tablette", en: "tablet / pill", pos: "noun", gender: "f", pron: "ta-BLET-uh", a1: ["Nehmen Sie bitte die {Tablette}.", "Please take the tablet."], a2: ["Die {Tablette} nehmen Sie bitte nach dem Essen.", "Please take the tablet after the meal."] },
  { id: "medikament", cat: "care", level: "A1", de: "das Medikament", en: "medicine", pos: "noun", gender: "n", pron: "meh-dee-ka-MENT", a1: ["Hier ist Ihr {Medikament}.", "Here is your medicine."], a2: ["Haben Sie heute Ihr {Medikament} genommen?", "Have you taken your medicine today?"] },
  { id: "blutdruck", cat: "care", level: "A1", de: "der Blutdruck", en: "blood pressure", pos: "noun", gender: "m", pron: "BLOOT-drook", a1: ["Ich messe Ihren {Blutdruck}.", "I'm measuring your blood pressure."], a2: ["Ihr {Blutdruck} ist heute ein bisschen hoch.", "Your blood pressure is a little high today."] },
  { id: "messen", cat: "care", level: "A1", de: "messen", en: "to measure", pos: "verb", pron: "MESS-en", tip: "ich messe, du misst, er misst.", a1: ["Ich {messe} das Fieber.", "I'm taking the temperature."], a2: ["Ich {messe} jetzt Ihren Puls.", "I'm going to measure your pulse now."] },
  { id: "helfen", cat: "care", level: "A1", de: "helfen", en: "to help", pos: "verb", pron: "HEL-fen", tip: "'Kann ich Ihnen helfen?' – the most useful question on the ward.", a1: ["Kann ich Ihnen {helfen}?", "Can I help you?"], a2: ["Ich {helfe} Ihnen beim Aufstehen.", "I'll help you get up."] },
  { id: "bett", cat: "care", level: "A1", de: "das Bett", en: "bed", pos: "noun", gender: "n", pron: "bet", a1: ["Bleiben Sie bitte im {Bett}.", "Please stay in bed."], a2: ["Der Patient darf heute nicht aus dem {Bett}.", "The patient is not allowed out of bed today."] },
  { id: "trinken", cat: "care", level: "A1", de: "trinken", en: "to drink", pos: "verb", pron: "TRINK-en", a1: ["Bitte {trinken} Sie viel Wasser.", "Please drink a lot of water."], a2: ["Der Patient soll heute zwei Liter {trinken}.", "The patient should drink two litres today."] },
  { id: "pflegekraft", cat: "care", level: "A2", de: "die Pflegekraft", en: "nursing professional / carer", pos: "noun", gender: "f", pron: "PFLAY-guh-kraft – say the 'p' in 'pf'", tip: "Modern, gender-neutral word for a nurse. Always 'die'.", a1: ["Sie ist {Pflegekraft}.", "She is a nurse."], a2: ["Die {Pflegekraft} misst den Blutdruck.", "The nurse measures the blood pressure."] },
  { id: "waschen", cat: "care", level: "A2", de: "waschen", en: "to wash", pos: "verb", pron: "VASH-en", tip: "er wäscht – the vowel changes to ä.", a1: ["Ich {wasche} mir die Hände.", "I wash my hands."], a2: ["Die Pflegekraft {wäscht} den Patienten am Morgen.", "The nurse washes the patient in the morning."] },
  { id: "aufstehen", cat: "care", level: "A2", de: "aufstehen", en: "to get up", pos: "verb", pron: "OWF-shtay-en", tip: "Separable verb: Ich stehe auf.", a1: ["Können Sie {aufstehen}?", "Can you get up?"], a2: ["Bitte nicht allein {aufstehen}, rufen Sie mich.", "Please don't get up alone, call me."] },
  { id: "klingel", cat: "care", level: "A2", de: "die Klingel", en: "call bell", pos: "noun", gender: "f", pron: "KLING-el", a1: ["Hier ist die {Klingel}.", "Here is the call bell."], a2: ["Wenn Sie Hilfe brauchen, drücken Sie die {Klingel}.", "If you need help, press the call bell."] },
  { id: "spritze", cat: "care", level: "A2", de: "die Spritze", en: "injection", pos: "noun", gender: "f", pron: "SHPRIT-suh", a1: ["Sie bekommen eine {Spritze}.", "You are getting an injection."], a2: ["Vor dem Essen bekommt er eine {Spritze} Insulin.", "Before the meal he gets an insulin injection."] },
];

export const WORD_BY_ID: Record<string, Word> = Object.fromEntries(WORDS.map((w) => [w.id, w]));

export function wordsForLevel(level: Level): Word[] {
  return level === "A1" ? WORDS.filter((w) => w.level === "A1") : WORDS;
}

export function categoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function exampleFor(w: Word, level: Level): Example {
  return level === "A2" ? w.a2 : w.a1;
}

/** Remove the {blank} markers for display. */
export function plain(s: string): string {
  return s.replace(/[{}]/g, "");
}

export function articleOf(w: Word): string | null {
  if (w.pos !== "noun") return null;
  const a = w.de.split(" ")[0];
  return ["der", "die", "das"].includes(a) ? a : null;
}

export function bareNoun(w: Word): string {
  return articleOf(w) ? w.de.split(" ").slice(1).join(" ") : w.de;
}

export const GENDER_LABEL: Record<Gender, string> = { m: "masculine", f: "feminine", n: "neuter", pl: "plural" };
