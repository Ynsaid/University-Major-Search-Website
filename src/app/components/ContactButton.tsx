import { Send } from "lucide-react";
import { Lang } from "../lib/i18n";

const CONTACT_URL = "https://t.me/univdz24";

export function ContactButton({ lang }: { lang: Lang }) {
  const label = lang === "ar" ? "تواصل معنا" : "Contactez-nous";

  return (
    <a
      href={CONTACT_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="fixed bottom-5 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg shadow-primary/30 transition-transform duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 motion-safe:animate-pulse ltr:right-5 rtl:left-5"
    >
      <Send className="h-5 w-5 rtl:-scale-x-100" />
      <span className="whitespace-nowrap">
        {label}
      </span>
    </a>
  );
}