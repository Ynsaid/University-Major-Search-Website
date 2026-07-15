import { ChangeEvent } from "react";
import { Lang } from "../lib/i18n";
import { programs } from "../data/programs";

export type BacStreamFilter =
  | ""
  | "sc-exp"
  | "math"
  | "tech-math"
  | "letters-philo"
  | "foreign-languages"
  | "management-economy";

type Filters = {
  wilaya: string;
  institution: string;
  bacStream: BacStreamFilter;
  minAvg?: number;
  maxAvg?: number;
  sort: "relevance" | "avgAsc" | "avgDesc";
};

type Props = {
  lang: Lang;
  filters: Filters;
  onChange: (filters: Filters) => void;
};

const unique = (arr: string[]) =>
  [...new Set(arr)]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

const wilayas = unique(programs.map((p) => p.wilaya));
const institutions = unique(programs.map((p) => p.etb));

const bacStreams = [
  { value: "", ar: "كل الشعب", fr: "Toutes les séries" },
  { value: "sc-exp", ar: "علوم تجريبية", fr: "Sciences expérimentales" },
  { value: "math", ar: "رياضيات", fr: "Mathématiques" },
  { value: "tech-math", ar: "تقني رياضي", fr: "Technique mathématique" },
  { value: "letters-philo", ar: "آداب وفلسفة", fr: "Lettres et philosophie" },
  { value: "foreign-languages", ar: "لغات أجنبية", fr: "Langues étrangères" },
  { value: "management-economy", ar: "تسيير واقتصاد", fr: "Gestion et économie" },
] as const;

export function FilterPanel({ lang, filters, onChange }: Props) {
  const isAr = lang === "ar";

  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const handleNumber =
    (key: "minAvg" | "maxAvg") => (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.trim();

      if (raw === "") {
        update(key, undefined as Filters[typeof key]);
        return;
      }

      const parsed = Number(raw);
      if (Number.isNaN(parsed)) return;

      update(key, parsed as Filters[typeof key]);
    };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">
          {isAr ? "الولاية" : "Wilaya"}
        </label>
        <select
          className="w-full rounded-md border border-border bg-background px-3 py-2"
          value={filters.wilaya}
          onChange={(e) => update("wilaya", e.target.value)}
        >
          <option value="">{isAr ? "كل الولايات" : "Toutes les wilayas"}</option>
          {wilayas.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {isAr ? "المؤسسة" : "Établissement"}
        </label>
        <select
          className="w-full rounded-md border border-border bg-background px-3 py-2"
          value={filters.institution}
          onChange={(e) => update("institution", e.target.value)}
        >
          <option value="">{isAr ? "كل المؤسسات" : "Tous les établissements"}</option>
          {institutions.map((etb) => (
            <option key={etb} value={etb}>
              {etb}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {isAr ? "شعبة البكالوريا" : "Série du bac"}
        </label>
        <select
          className="w-full rounded-md border border-border bg-background px-3 py-2"
          value={filters.bacStream}
          onChange={(e) => update("bacStream", e.target.value as BacStreamFilter)}
        >
          {bacStreams.map((s) => (
            <option key={s.value} value={s.value}>
              {isAr ? s.ar : s.fr}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {isAr ? "المعدل الأدنى" : "Moyenne minimale"}
        </label>
        <input
          type="number"
          min="0"
          max="20"
          step="0.01"
          className="w-full rounded-md border border-border bg-background px-3 py-2"
          value={filters.minAvg ?? ""}
          onChange={handleNumber("minAvg")}
          placeholder={isAr ? "مثال 12" : "Ex: 12"}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {isAr ? "المعدل الأقصى" : "Moyenne maximale"}
        </label>
        <input
          type="number"
          min="0"
          max="20"
          step="0.01"
          className="w-full rounded-md border border-border bg-background px-3 py-2"
          value={filters.maxAvg ?? ""}
          onChange={handleNumber("maxAvg")}
          placeholder={isAr ? "مثال 15" : "Ex: 15"}
        />
      </div>
    </div>
  );
}
