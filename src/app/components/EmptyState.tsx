import { SearchX, Search } from "lucide-react";
import { Lang, t } from "../lib/i18n";

interface Props {
  lang: Lang;
  mode: "none" | "start";
  suggestion?: string;
  onSuggestion?: (s: string) => void;
}

export function EmptyState({ lang, mode, suggestion, onSuggestion }: Props) {
  const start = mode === "start";
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-20 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {start ? <Search className="h-7 w-7" /> : <SearchX className="h-7 w-7" />}
      </span>
      <h3 className="text-foreground">
        {t(lang, start ? "startTitle" : "noResultsTitle")}
      </h3>
      <p className="mt-2 max-w-sm text-muted-foreground">
        {t(lang, start ? "startBody" : "noResultsBody")}
      </p>
      {suggestion && (
        <p className="mt-4 text-sm text-muted-foreground">
          {t(lang, "didYouMean")}{" "}
          <button
            onClick={() => onSuggestion?.(suggestion)}
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            {suggestion}
          </button>
        </p>
      )}
    </div>
  );
}
