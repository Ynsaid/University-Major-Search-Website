import { Building2, MapPin, ChevronRight, Hash, Layers } from "lucide-react";
import { Lang, t } from "../lib/i18n";
import { Program } from "../data/programs";
import { inferStreams, STREAMS } from "../lib/streams";

export function avgTone(avg: number | null) {
  if (avg === null) return "bg-muted text-muted-foreground";
  if (avg >= 15) return "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300";
  if (avg >= 12) return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
}

interface Props {
  lang: Lang;
  prog: Program;
  onOpen: (p: Program) => void;
}

export function ProgramCard({ lang, prog, onOpen }: Props) {
  const streams = inferStreams(prog.major);
  return (
    <button
      onClick={() => onOpen(prog)}
      className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-start shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h3 className="truncate text-foreground">{prog.major}</h3>
          {prog.majorAr && (
            <span className="text-sm text-muted-foreground" dir="rtl">
              {prog.majorAr}
            </span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1.5">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{prog.etb}</span>
          </span>
          {prog.wilaya && prog.wilaya !== "—" && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" />
              {prog.wilaya}
            </span>
          )}
          <span className="flex items-center gap-1 font-mono text-xs opacity-70">
            <Hash className="h-3 w-3" />
            {prog.code}
          </span>
        </div>

        {(streams.length > 0 || prog.mins.length > 1) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {streams.map((s) => (
              <span
                key={s}
                className="rounded-md bg-accent px-1.5 py-0.5 text-[11px] text-accent-foreground"
                title={STREAMS[s].fr}
              >
                {s}
              </span>
            ))}
            {prog.mins.length > 1 && (
              <span className="flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-secondary-foreground">
                <Layers className="h-3 w-3" />
                {prog.mins.length} {t(lang, "priority")}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {t(lang, "cutoff")}
        </span>
        <span
          className={`rounded-lg px-2.5 py-1 tabular-nums ${avgTone(prog.cutoff)}`}
        >
          {prog.cutoff !== null ? prog.cutoff.toFixed(2) : "—"}
        </span>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
    </button>
  );
}
