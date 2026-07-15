import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, GraduationCap } from "lucide-react";
import { Lang, t } from "./lib/i18n";
import { correctQuery, TOTAL, isAverageQuery, parseAverage } from "./lib/search";
import { Program, programs } from "./data/programs";
import { Header } from "./components/Header";
import { SearchBar } from "./components/SearchBar";
import { ProgramCard } from "./components/ProgramCard";
import { FilterPanel, BacStreamFilter } from "./components/FilterPanel";
import { EmptyState } from "./components/EmptyState";
import { DetailDrawer } from "./components/DetailDrawer";
import { ContactButton } from "./components/ContactButton";
import { Button } from "./components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";

const EXAMPLES = ["Informatique", "طب", "Architecture", "Langue anglaise", "استاذ لغة عربية"];
const PAGE = 40;

export type ExtendedFilters = {
  wilaya: string;
  institution: string;
  bacStream: BacStreamFilter;
  minAvg?: number;
  maxAvg?: number;
  sort: "relevance" | "avgAsc" | "avgDesc";
};

const DEFAULT_FILTERS: ExtendedFilters = {
  wilaya: "",
  institution: "",
  bacStream: "",
  minAvg: undefined,
  maxAvg: undefined,
  sort: "relevance",
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesText(program: Program, query: string) {
  const q = normalizeText(query);
  if (!q) return true;

  const haystacks = [
    program.major,
    program.majorAr,
    program.etb,
    program.wilaya,
    program.code,
  ]
    .filter(Boolean)
    .map(normalizeText);

  const tokens = q.split(" ").filter(Boolean);
  return tokens.every((token) => haystacks.some((field) => field.includes(token)));
}

function matchesBacStream(program: Program, bacStream: BacStreamFilter) {
  if (!bacStream) return true;

  const code = (program.code || "").toUpperCase();
  const major = normalizeText(program.major || "");
  const etb = normalizeText(program.etb || "");

  switch (bacStream) {
    case "sc-exp":
      return (
        code.startsWith("A") ||
        code.startsWith("B") ||
        code.startsWith("C") ||
        code.startsWith("D") ||
        code.startsWith("E") ||
        code.startsWith("P") ||
        major.includes("sciences") ||
        major.includes("informatique") ||
        major.includes("mathematiques") ||
        major.includes("physique") ||
        major.includes("chimie")
      );

    case "math":
      return (
        code.startsWith("C") ||
        code.startsWith("A") ||
        major.includes("mathematiques") ||
        major.includes("informatique") ||
        major.includes("intelligence artificielle")
      );

    case "tech-math":
      return (
        code.startsWith("A") ||
        code.startsWith("N") ||
        major.includes("genie") ||
        major.includes("electro") ||
        major.includes("mecanique") ||
        major.includes("telecommunication") ||
        major.includes("automatique") ||
        major.includes("architecture") ||
        major.includes("hydraulique") ||
        etb.includes("polytechnique")
      );

    case "letters-philo":
      return (
        code.startsWith("G") ||
        code.startsWith("I") ||
        code.startsWith("L") ||
        code.startsWith("K") ||
        major.includes("droit") ||
        major.includes("sciences humaines") ||
        major.includes("sciences sociales") ||
        major.includes("philos") ||
        major.includes("litterature") ||
        major.includes("arts")
      );

    case "foreign-languages":
      return (
        code.startsWith("H") ||
        major.includes("langue") ||
        major.includes("traduction") ||
        major.includes("interpretariat")
      );

    case "management-economy":
      return (
        code.startsWith("F") ||
        major.includes("economie") ||
        major.includes("gestion") ||
        major.includes("commerce") ||
        major.includes("management")
      );

    default:
      return true;
  }
}

function applyFilters(
  list: Program[],
  filters: ExtendedFilters,
  query: string,
  isAvgMode: boolean,
  searchedAvg?: number
) {
  let result = [...list];

  result = result.filter((p) => matchesText(p, query));

  if (filters.wilaya) {
    result = result.filter((p) => p.wilaya === filters.wilaya);
  }

  if (filters.institution) {
    result = result.filter((p) => p.etb === filters.institution);
  }

  if (filters.bacStream) {
    result = result.filter((p) => matchesBacStream(p, filters.bacStream));
  }

  const hasMin = typeof filters.minAvg === "number" && !Number.isNaN(filters.minAvg);
  const hasMax = typeof filters.maxAvg === "number" && !Number.isNaN(filters.maxAvg);

  if (hasMin || hasMax || isAvgMode) {
    result = result.filter((p) => p.cutoff !== null && p.cutoff !== undefined);
  }

  if (hasMin) {
    result = result.filter((p) => (p.cutoff as number) >= (filters.minAvg as number));
  }

  if (hasMax) {
    result = result.filter((p) => (p.cutoff as number) <= (filters.maxAvg as number));
  }

  if (isAvgMode && typeof searchedAvg === "number") {
    result = result.filter((p) => (p.cutoff as number) <= searchedAvg);
  }

  switch (filters.sort) {
    case "avgAsc":
      result.sort((a, b) => {
        const av = a.cutoff ?? Number.POSITIVE_INFINITY;
        const bv = b.cutoff ?? Number.POSITIVE_INFINITY;
        return av - bv;
      });
      break;

    case "avgDesc":
      result.sort((a, b) => {
        const av = a.cutoff ?? Number.NEGATIVE_INFINITY;
        const bv = b.cutoff ?? Number.NEGATIVE_INFINITY;
        return bv - av;
      });
      break;

    case "relevance":
    default:
      if (isAvgMode && typeof searchedAvg === "number") {
        result.sort((a, b) => {
          const av = a.cutoff ?? Number.NEGATIVE_INFINITY;
          const bv = b.cutoff ?? Number.NEGATIVE_INFINITY;
          return bv - av;
        });
      } else if (query.trim()) {
        const q = normalizeText(query);
        result.sort((a, b) => {
          const aExact =
            normalizeText(a.major) === q || normalizeText(a.majorAr) === q ? 1 : 0;
          const bExact =
            normalizeText(b.major) === q || normalizeText(b.majorAr) === q ? 1 : 0;

          if (aExact !== bExact) return bExact - aExact;

          const aStarts =
            normalizeText(a.major).startsWith(q) || normalizeText(a.majorAr).startsWith(q) ? 1 : 0;
          const bStarts =
            normalizeText(b.major).startsWith(q) || normalizeText(b.majorAr).startsWith(q) ? 1 : 0;

          if (aStarts !== bStarts) return bStarts - aStarts;

          const aCutoff = a.cutoff ?? -1;
          const bCutoff = b.cutoff ?? -1;
          return bCutoff - aCutoff;
        });
      } else {
        result.sort((a, b) => {
          const av = a.cutoff ?? Number.POSITIVE_INFINITY;
          const bv = b.cutoff ?? Number.POSITIVE_INFINITY;
          return av - bv;
        });
      }
      break;
  }

  return result;
}

export default function App() {
  const [lang, setLang] = useState<Lang>("fr");
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [isAvgMode, setIsAvgMode] = useState(false);
  const [selected, setSelected] = useState<Program | null>(null);
  const [visible, setVisible] = useState(PAGE);
  const [filters, setFilters] = useState<ExtendedFilters>(DEFAULT_FILTERS);

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const searching = submitted !== null;

  const searchedAvg = useMemo(() => {
    if (!submitted || !isAvgMode) return undefined;
    return parseAverage(submitted);
  }, [submitted, isAvgMode]);

  const effectiveQuery = useMemo(() => {
    if (!submitted) return "";
    if (isAvgMode) return "";
    return submitted;
  }, [submitted, isAvgMode]);

  const results = useMemo(() => {
    if (!searching) return [];
    return applyFilters(programs, filters, effectiveQuery, isAvgMode, searchedAvg);
  }, [searching, filters, effectiveQuery, isAvgMode, searchedAvg]);

  useEffect(() => {
    setVisible(PAGE);
  }, [submitted, filters, isAvgMode]);

  const runSearch = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      setSubmitted("");
      setIsAvgMode(false);
      return;
    }

    if (isAverageQuery(trimmed)) {
      setIsAvgMode(true);
      setSubmitted(trimmed);
    } else {
      setIsAvgMode(false);
      setSubmitted(trimmed);
    }
  };

  const goHome = () => {
    setSubmitted(null);
    setQuery("");
    setIsAvgMode(false);
    setFilters(DEFAULT_FILTERS);
  };

  const openProgram = (p: Program) => setSelected(p);

  return (
    <div className="min-h-screen w-full bg-background text-foreground" dir={dir}>
      <Header
        lang={lang}
        onLangChange={setLang}
        dark={dark}
        onToggleDark={() => setDark((d) => !d)}
        onLogoClick={goHome}
        compact={searching}
      />

      {!searching ? (
        <main className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-24 pt-16 sm:pt-28">
          <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <GraduationCap className="h-8 w-8" />
          </span>

          <h1 className="text-center text-foreground" style={{ fontSize: "2rem", lineHeight: 1.2 }}>
            {t(lang, "heroTitle")}
          </h1>

          <p className="mt-3 max-w-xl text-center text-muted-foreground">
            {t(lang, "heroSubtitle", { count: TOTAL })}
          </p>

          <div className="mt-8 w-full">
            <SearchBar
              lang={lang}
              value={query}
              onChange={setQuery}
              onSubmit={runSearch}
              autoFocus
              size="hero"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">{t(lang, "examples")}</span>
            {EXAMPLES.map((e) => (
              <button
                key={e}
                onClick={() => {
                  setQuery(e);
                  runSearch(e);
                }}
                className="rounded-full border border-border bg-card px-3 py-1 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
              >
                {e}
              </button>
            ))}
          </div>
        </main>
      ) : (
        <>
          <div className="sticky top-16 z-20 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="mx-auto max-w-5xl px-4 py-3">
              <SearchBar
                lang={lang}
                value={query}
                onChange={setQuery}
                onSubmit={runSearch}
                size="compact"
              />
            </div>
          </div>

          <main className="mx-auto max-w-5xl px-4 py-6">
            <div className="flex gap-8">
              <aside className="hidden w-72 shrink-0 lg:block">
                <div className="sticky top-36 rounded-xl border border-border bg-card p-5">
                  <div className="mb-4 flex items-center gap-2 text-foreground">
                    <SlidersHorizontal className="h-4 w-4" />
                    {t(lang, "filters")}
                  </div>

                  <FilterPanel
                    lang={lang}
                    filters={filters}
                    onChange={setFilters}
                  />
                </div>
              </aside>

              <section className="min-w-0 flex-1">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-muted-foreground">
                    {isAvgMode && typeof searchedAvg === "number"
                      ? `${results.length} ${t(lang, "programsAt")} ≤ ${searchedAvg}`
                      : t(lang, results.length === 1 ? "resultsCountOne" : "resultsCount", {
                          count: results.length,
                        })}
                  </p>

                  <div className="flex items-center gap-2">
                    <Select
                      value={filters.sort}
                      onValueChange={(v) =>
                        setFilters((prev) => ({ ...prev, sort: v as ExtendedFilters["sort"] }))
                      }
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">{t(lang, "sortRelevance")}</SelectItem>
                        <SelectItem value="avgDesc">{t(lang, "sortAvgDesc")}</SelectItem>
                        <SelectItem value="avgAsc">{t(lang, "sortAvgAsc")}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="lg:hidden">
                          <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>

                      <SheetContent side={lang === "ar" ? "right" : "left"} className="w-80">
                        <SheetHeader>
                          <SheetTitle className="text-start">{t(lang, "filters")}</SheetTitle>
                        </SheetHeader>

                        <div className="p-4">
                          <FilterPanel
                            lang={lang}
                            filters={filters}
                            onChange={setFilters}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>

                {results.length === 0 ? (
                  <EmptyState
                    lang={lang}
                    mode="none"
                    suggestion={
                      submitted && !isAvgMode && correctQuery(submitted).changed
                        ? correctQuery(submitted).corrected
                        : undefined
                    }
                    onSuggestion={(s) => {
                      setQuery(s);
                      runSearch(s);
                    }}
                  />
                ) : (
                  <div className="space-y-3">
                    {results.slice(0, visible).map((r) => (
                      <ProgramCard key={r.id} lang={lang} prog={r} onOpen={openProgram} />
                    ))}

                    {visible < results.length && (
                      <div className="pt-2 text-center">
                        <Button variant="outline" onClick={() => setVisible((v) => v + PAGE)}>
                          {lang === "ar" ? "عرض المزيد" : "Afficher plus"} ({results.length - visible})
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          </main>
        </>
      )}

      <DetailDrawer
        lang={lang}
        prog={selected}
        onClose={() => setSelected(null)}
        onOpen={openProgram}
      />

      <ContactButton lang={lang} />
    </div>
  );
}
