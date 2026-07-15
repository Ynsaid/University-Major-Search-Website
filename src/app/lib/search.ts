import { programs, type Program } from "../data/programs";
import { CONCEPTS, ETB_TAGS } from "./synonyms";
import { inferStreams, type StreamCode } from "./streams";

/** Normalize a string: lowercase, strip French accents, collapse spaces, and
 *  normalize Arabic (strip diacritics, unify alef/hamza/taa marbuta). */
export function normalize(input: string): string {
  let s = input.toLowerCase().trim();
  // Latin accents -> base letters (accent-insensitive French search)
  s = s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  // Arabic diacritics (tashkeel) removal
  s = s.replace(/[ً-ٰٟ]/g, "");
  // Arabic letter unification
  s = s
    .replace(/[أإآٱ]/g, "ا") // alef variants -> alef
    .replace(/ة/g, "ه") // taa marbuta -> haa
    .replace(/ى/g, "ي"); // alef maqsura -> yaa
  s = s.replace(/\s+/g, " ");
  return s;
}

export interface Filters {
  wilaya: string;
  institution: string;
  stream: string;
  minAvg: number;
  maxAvg?: number;
  sort: "relevance" | "avgAsc" | "avgDesc";
}

export interface Result extends Program {
  score: number;
  streams: StreamCode[];
}

// Pre-normalize the concept/establishment knowledge base once.
const CONCEPTS_N = CONCEPTS.map((c) => ({
  match: c.match.map(normalize),
  alias: normalize(c.alias.join(" ")),
}));
const ETB_TAGS_N = ETB_TAGS.map((t) => ({
  etbMatch: t.etbMatch.map(normalize),
  alias: normalize(t.alias.join(" ")),
}));

/** Build the extra searchable phrasings (synonyms) for one program. */
function aliasesFor(p: Program): string {
  const majorN = normalize(p.major);
  const etbN = normalize(p.etb);
  const parts: string[] = [];
  for (const c of CONCEPTS_N) {
    if (c.match.some((m) => majorN.includes(m))) parts.push(c.alias);
  }
  for (const tag of ETB_TAGS_N) {
    if (tag.etbMatch.some((m) => etbN.includes(m))) parts.push(tag.alias);
  }
  return parts.join(" ");
}

/** Precomputed searchable haystacks for speed. */
const index = programs.map((p) => {
  const majorNorm = normalize(p.major);
  const aliasNorm = aliasesFor(p);
  return {
    p,
    streams: inferStreams(p.major),
    // haystack includes the program name, Arabic label, institution, code AND
    // every synonym/phrasing a student might type (Arabic, French, slang).
    hay: `${majorNorm} ${normalize(p.majorAr)} ${normalize(p.etb)} ${normalize(
      p.code
    )} ${aliasNorm}`,
    majorNorm,
    majorArNorm: normalize(p.majorAr),
    aliasNorm,
  };
});

// ---- Typo tolerance -------------------------------------------------------
// Vocabulary of all searchable tokens, used to snap misspelled query terms to
// the nearest known word (edit distance).
const vocab: string[] = (() => {
  const set = new Set<string>();
  for (const it of index)
    for (const tok of it.hay.split(" ")) if (tok.length >= 3) set.add(tok);
  return Array.from(set);
})();

function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      best = Math.min(best, cur[j]);
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Snap one query term to the closest known vocabulary word if it's a typo. */
function correctTerm(term: string): string {
  if (term.length < 4) return term;
  // already a real (sub)word? keep it
  for (const v of vocab) if (v.includes(term)) return term;
  const max = term.length >= 7 ? 2 : 1;
  let best = term;
  let bestD = max + 1;
  for (const v of vocab) {
    if (Math.abs(v.length - term.length) > max) continue;
    const d = editDistance(term, v, max);
    if (d < bestD) {
      bestD = d;
      best = v;
      if (d === 1) break;
    }
  }
  return bestD <= max ? best : term;
}

/** Correct a full query; returns corrected string and whether it changed. */
export function correctQuery(query: string): { corrected: string; changed: boolean } {
  const terms = normalize(query).split(" ").filter(Boolean);
  const fixed = terms.map(correctTerm);
  const corrected = fixed.join(" ");
  return { corrected, changed: corrected !== terms.join(" ") };
}

// ---------------------------------------------------------------------------

export function search(query: string, filters: Filters): Result[] {
  const raw = normalize(query);
  // apply typo correction so approximate spellings still return results
  const q = raw ? correctQuery(query).corrected : "";
  const terms = q.split(" ").filter(Boolean);

  let rows: Result[] = index
    .map(({ p, hay, majorNorm, majorArNorm, aliasNorm, streams }) => {
      let score = 0;
      if (q) {
        // every term must appear somewhere (AND / partial match)
        const all = terms.every((tm) => hay.includes(tm));
        if (!all) return null;
        // scoring: prefix on major name > contains on major > synonym > elsewhere
        if (majorNorm.startsWith(q) || majorArNorm.startsWith(q)) score += 100;
        else if (majorNorm.includes(q) || majorArNorm.includes(q)) score += 60;
        else if (aliasNorm.includes(q)) score += 40;
        else score += 20;
        // shorter major name = more precise match
        score -= majorNorm.length * 0.05;
      }
      return { ...p, score, streams };
    })
    .filter((r): r is Result => r !== null);

  // Filters
  if (filters.wilaya) rows = rows.filter((r) => r.wilaya === filters.wilaya);
  if (filters.institution) rows = rows.filter((r) => r.etb === filters.institution);
  if (filters.stream)
    rows = rows.filter((r) => r.streams.includes(filters.stream as StreamCode));
  if (filters.minAvg > 0)
    rows = rows.filter((r) => r.cutoff !== null && r.cutoff >= filters.minAvg);

  // Sort
  if (filters.sort === "avgAsc")
    rows.sort((a, b) => (a.cutoff ?? 99) - (b.cutoff ?? 99));
  else if (filters.sort === "avgDesc")
    rows.sort((a, b) => (b.cutoff ?? -1) - (a.cutoff ?? -1));
  else rows.sort((a, b) => b.score - a.score || a.major.localeCompare(b.major));

  return rows;
}

/** Autocomplete: distinct major names matching the query prefix/contains. */
export function suggestions(
  query: string,
  limit = 6
): { major: string; majorAr: string; count: number }[] {
  const q = normalize(query);
  if (!q) return [];
  const map = new Map<string, { major: string; majorAr: string; count: number }>();
  for (const { p, majorNorm, majorArNorm, aliasNorm } of index) {
    if (majorNorm.includes(q) || majorArNorm.includes(q) || aliasNorm.includes(q)) {
      const key = p.major;
      const existing = map.get(key);
      if (existing) existing.count++;
      else map.set(key, { major: p.major, majorAr: p.majorAr, count: 1 });
    }
  }
  return Array.from(map.values())
    .sort((a, b) => {
      const ap = normalize(a.major).startsWith(q) ? 0 : 1;
      const bp = normalize(b.major).startsWith(q) ? 0 : 1;
      return ap - bp || b.count - a.count;
    })
    .slice(0, limit);
}

/** All institutions offering the exact same specialization (across wilayas). */
export function sameMajor(prog: Program): Program[] {
  return programs
    .filter((p) => p.id !== prog.id && p.major === prog.major)
    .sort((a, b) => (a.cutoff ?? 99) - (b.cutoff ?? 99));
}

/** Related programs: same major elsewhere, then same institution. */
export function related(prog: Program, limit = 6): Program[] {
  const out = sameMajor(prog).slice(0, limit);
  if (out.length < limit) {
    for (const p of programs) {
      if (out.length >= limit) break;
      if (p.id !== prog.id && p.etb === prog.etb && p.major !== prog.major)
        out.push(p);
    }
  }
  return out.slice(0, limit);
}

export const WILAYAS = Array.from(
  new Set(programs.map((p) => p.wilaya).filter((w) => w && w !== "—"))
).sort();

export const INSTITUTIONS = Array.from(
  new Set(programs.map((p) => p.etb).filter(Boolean))
).sort();

export const TOTAL = programs.length;



export function isAverageQuery(value: string): boolean {
  const trimmed = value.trim().replace(",", ".");
  if (trimmed === "") return false;
  if (!/^\d{1,2}(\.\d{1,2})?$/.test(trimmed)) return false;
  const num = parseFloat(trimmed);
  return !isNaN(num) && num >= 0 && num <= 20;
}

export function parseAverage(value: string): number {
  return parseFloat(value.trim().replace(",", "."));
}
