import { normalize } from "./search";

/**
 * BAC stream (série du baccalauréat) modeling.
 *
 * The PDF exposes admission minimums as Min1 / Min2 / Min3. These represent the
 * "ordre de priorité" (admission priority tiers) used by the Algerian
 * orientation system: Priorité 1 is the primary/first-choice minimum, Priorité
 * 2 and 3 are subsequent tiers. We surface them explicitly as priority levels.
 *
 * The PDF does NOT carry an explicit stream column, so relevant BAC streams are
 * *inferred* from the specialization name (heuristic, shown as "suggested"),
 * covering the common Algerian streams below.
 */
export const STREAMS = {
  SE: { code: "SE", fr: "Sciences expérimentales", ar: "علوم تجريبية" },
  M: { code: "M", fr: "Mathématiques", ar: "رياضيات" },
  TM: { code: "TM", fr: "Technique mathématique", ar: "تقني رياضي" },
  GE: { code: "GE", fr: "Gestion et économie", ar: "تسيير واقتصاد" },
  LP: { code: "LP", fr: "Lettres et philosophie", ar: "آداب وفلسفة" },
  LE: { code: "LE", fr: "Langues étrangères", ar: "لغات أجنبية" },
} as const;

export type StreamCode = keyof typeof STREAMS;
export const STREAM_LIST = Object.values(STREAMS);

// keyword (normalized French substring) -> streams it is relevant to
const RULES: { match: string[]; streams: StreamCode[] }[] = [
  { match: ["medecine", "pharmacie", "dentaire", "biologie", "nature et de la vie", "veterinaire", "infirmier", "sante", "agronom", "biotechnologie", "chimie"], streams: ["SE", "M"] },
  { match: ["mathematiques", "informatique", "systemes d information"], streams: ["M", "TM", "SE"] },
  { match: ["physique", "sciences de la matiere"], streams: ["SE", "M", "TM"] },
  { match: ["sciences et technologies", "genie", "architecture", "electro", "mecanique", "civil", "procedes", "hydraulique", "aeronautique", "mines", "automatique", "telecommunication", "industriel", "technologie"], streams: ["M", "TM", "SE"] },
  { match: ["sciences de la terre", "geologie"], streams: ["SE", "M", "TM"] },
  { match: ["sciences economiques", "economie", "gestion", "commercial", "comptabilite", "finance", "commerciales"], streams: ["GE", "M", "SE", "LP"] },
  { match: ["droit", "sciences politiques", "sciences islamiques", "histoire", "philosophie", "sociologie", "psychologie", "sciences humaines", "sciences sociales", "litterature arab", "langue arab", "bibliothe", "information et communication", "journalisme", "archeologie", "arts"], streams: ["LP", "GE", "LE"] },
  { match: ["langue francais", "langue anglais", "langue espagnol", "langue allemand", "traduction", "amazigh", "litterature francais", "litterature anglais"], streams: ["LE", "LP"] },
  { match: ["education physique", "activites physiques", "staps"], streams: ["SE", "M", "TM", "GE", "LP", "LE"] },
];

const cache = new Map<string, StreamCode[]>();

/** Infer the BAC streams most relevant to a specialization name. */
export function inferStreams(major: string): StreamCode[] {
  if (cache.has(major)) return cache.get(major)!;
  const m = normalize(major);
  const set = new Set<StreamCode>();
  for (const r of RULES) {
    if (r.match.some((k) => m.includes(k))) r.streams.forEach((s) => set.add(s));
  }
  const out = Array.from(set);
  cache.set(major, out);
  return out;
}
