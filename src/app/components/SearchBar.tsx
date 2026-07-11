import { useEffect, useRef, useState } from "react";
import { Search, X, CornerDownLeft } from "lucide-react";
import { Lang, t } from "../lib/i18n";
import { suggestions } from "../lib/search";

interface Props {
  lang: Lang;
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  autoFocus?: boolean;
  size?: "hero" | "compact";
}

export function SearchBar({ lang, value, onChange, onSubmit, autoFocus, size = "hero" }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [sugs, setSugs] = useState<ReturnType<typeof suggestions>>([]);
  const ref = useRef<HTMLDivElement>(null);
  const hero = size === "hero";

  useEffect(() => {
    setSugs(suggestions(value));
    setActive(-1);
  }, [value]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (v: string) => {
    onChange(v);
    onSubmit(v);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open || sugs.length === 0) {
      if (e.key === "Enter") submit(value);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, sugs.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      submit(active >= 0 ? sugs[active].major : value);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative w-full">
      <div
        className={`flex items-center gap-3 rounded-2xl border border-border bg-card shadow-sm transition-shadow focus-within:border-primary focus-within:shadow-md ${
          hero ? "px-5 py-4" : "px-4 py-2.5"
        }`}
      >
        <Search className={`shrink-0 text-muted-foreground ${hero ? "h-6 w-6" : "h-5 w-5"}`} />
        <input
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder={t(lang, "searchPlaceholder")}
          className={`w-full bg-transparent outline-none placeholder:text-muted-foreground ${
            hero ? "text-lg" : "text-base"
          }`}
        />
        {value && (
          <button
            onClick={() => {
              onChange("");
              submit("");
            }}
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {hero && (
          <button
            onClick={() => submit(value)}
            className="shrink-0 rounded-xl bg-primary px-5 py-2 text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t(lang, "searchButton")}
          </button>
        )}
      </div>

      {open && sugs.length > 0 && (
        <ul className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          {sugs.map((s, i) => (
            <li key={s.major}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => submit(s.major)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-start transition-colors ${
                  active === i ? "bg-accent" : "hover:bg-accent"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-foreground">{s.major}</span>
                  {s.majorAr && (
                    <span className="truncate text-sm text-muted-foreground" dir="rtl">
                      {s.majorAr}
                    </span>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {s.count} {t(lang, "programsAt")}
                  </span>
                  {active === i && <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" />}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
