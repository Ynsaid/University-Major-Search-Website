import { Lang, t } from "../lib/i18n";
import { Filters, WILAYAS, INSTITUTIONS } from "../lib/search";
import { STREAM_LIST } from "../lib/streams";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";

interface Props {
  lang: Lang;
  filters: Filters;
  onChange: (f: Filters) => void;
}

export function FilterPanel({ lang, filters, onChange }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const active =
    !!filters.wilaya || !!filters.institution || !!filters.stream || filters.minAvg > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{t(lang, "wilaya")}</Label>
        <Select
          value={filters.wilaya || "all"}
          onValueChange={(v) => set({ wilaya: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t(lang, "allWilayas")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t(lang, "allWilayas")}</SelectItem>
            {WILAYAS.map((w) => (
              <SelectItem key={w} value={w}>
                {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t(lang, "stream")}</Label>
        <Select
          value={filters.stream || "all"}
          onValueChange={(v) => set({ stream: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t(lang, "allStreams")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t(lang, "allStreams")}</SelectItem>
            {STREAM_LIST.map((s) => (
              <SelectItem key={s.code} value={s.code}>
                {lang === "ar" ? s.ar : s.fr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t(lang, "institution")}</Label>
        <Select
          value={filters.institution || "all"}
          onValueChange={(v) => set({ institution: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t(lang, "allInstitutions")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t(lang, "allInstitutions")}</SelectItem>
            {INSTITUTIONS.map((i) => (
              <SelectItem key={i} value={i}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t(lang, "minAverage")}</Label>
          <span className="tabular-nums text-sm text-primary">
            {filters.minAvg > 0 ? `≥ ${filters.minAvg.toFixed(1)}` : "—"}
          </span>
        </div>
        <Slider
          min={0}
          max={18}
          step={0.5}
          value={[filters.minAvg]}
          onValueChange={([v]) => set({ minAvg: v })}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>10</span>
          <span>18</span>
        </div>
      </div>

      {active && (
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={() => set({ wilaya: "", institution: "", stream: "", minAvg: 0 })}
        >
          {t(lang, "clearFilters")}
        </Button>
      )}
    </div>
  );
}
