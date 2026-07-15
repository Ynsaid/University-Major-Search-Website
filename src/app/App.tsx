import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, GraduationCap } from "lucide-react";
import { Lang, t } from "./lib/i18n";
import { search, correctQuery, Filters, TOTAL } from "./lib/search";
import { Program } from "./data/programs";
import { Header } from "./components/Header";
import { SearchBar } from "./components/SearchBar";
import { ProgramCard } from "./components/ProgramCard";
import { FilterPanel } from "./components/FilterPanel";
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

const EXAMPLES = ["Informatique", "طب", "Architecture", "Langue anglaise", "لغة وادب عربي"];
const PAGE = 40;

export default function App() {
  const [lang, setLang] = useState<Lang>("fr");
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [selected, setSelected] = useState<Program | null>(null);
  const [visible, setVisible] = useState(PAGE);
  const [filters, setFilters] = useState<Filters>({
    wilaya: "",
    institution: "",
    stream: "",
    minAvg: 0,
    sort: "relevance",
  });

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const searching = submitted !== null;

  const results = useMemo(() => {
    if (!searching) return [];
    return search(submitted!, filters);
  }, [submitted, filters, searching]);

  useEffect(() => setVisible(PAGE), [submitted, filters]);

  const runSearch = (v: string) => {
    setSubmitted(v);
  };

  const goHome = () => {
    setSubmitted(null);
    setQuery("");
    setFilters({ wilaya: "", institution: "", stream: "", minAvg: 0, sort: "relevance" });
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
        /* ---------- HOME ---------- */
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
        /* ---------- RESULTS ---------- */
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
              {/* Sidebar filters (desktop) */}
              <aside className="hidden w-64 shrink-0 lg:block">
                <div className="sticky top-36 rounded-xl border border-border bg-card p-5">
                  <div className="mb-4 flex items-center gap-2 text-foreground">
                    <SlidersHorizontal className="h-4 w-4" />
                    {t(lang, "filters")}
                  </div>
                  <FilterPanel lang={lang} filters={filters} onChange={setFilters} />
                </div>
              </aside>

              <section className="min-w-0 flex-1">
                {/* Toolbar */}
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-muted-foreground">
                    {t(lang, results.length === 1 ? "resultsCountOne" : "resultsCount", {
                      count: results.length,
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    <Select
                      value={filters.sort}
                      onValueChange={(v) => setFilters({ ...filters, sort: v as Filters["sort"] })}
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

                    {/* Mobile filters */}
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
                          <FilterPanel lang={lang} filters={filters} onChange={setFilters} />
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
                      submitted && correctQuery(submitted).changed
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
                          {lang === "ar" ? "عرض المزيد" : "Afficher plus"} (
                          {results.length - visible})
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
