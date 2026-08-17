"use client";

import { usePathname } from "next/navigation";
import { useLocale, useMessages } from "@/i18n/client";
import { persistLocale } from "@/i18n/browser";
import {
  localizeHref,
  type Locale,
} from "@/i18n/config";

export function LanguageSwitcher() {
  const locale = useLocale();
  const messages = useMessages();
  const pathname = usePathname();

  const prepareLanguageSwitch = (
    event: React.MouseEvent<HTMLAnchorElement>,
    nextLocale: Locale
  ) => {
    persistLocale(nextLocale);
    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    event.currentTarget.href = localizeHref(nextLocale, currentHref);
  };

  return (
    <div
      aria-label={messages.language.label}
      className="flex min-h-11 shrink-0 border border-[var(--hair)] bg-white font-mono text-[10px] uppercase tracking-[0.08em]"
    >
      {[
        ["zh-CN", messages.language.chinese, messages.language.switchToChinese],
        ["en", messages.language.english, messages.language.switchToEnglish],
      ].map(([value, label, ariaLabel]) => {
        const targetLocale = value as Locale;
        const className = `inline-flex items-center border-r border-[var(--hair)] px-3 last:border-r-0 ${
          locale === targetLocale
            ? "bg-[var(--ink)] text-[var(--paper)]"
            : "text-[var(--muted)] transition hover:bg-[var(--paper-2)]"
        }`;

        return locale === targetLocale ? (
          <span
            key={value}
            aria-current="page"
            className={className}
          >
            {label}
          </span>
        ) : (
          <a
            key={value}
            href={localizeHref(targetLocale, pathname)}
            aria-label={ariaLabel}
            onClick={(event) => prepareLanguageSwitch(event, targetLocale)}
            className={className}
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}
