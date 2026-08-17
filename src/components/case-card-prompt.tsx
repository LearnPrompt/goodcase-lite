"use client";

import { getCaseCardPrompt } from "@/lib/case-presentation";
import { useLocale, useMessages } from "@/i18n/client";
import {
  type PromptLanguage,
  usePromptLanguage,
} from "@/lib/prompt-language";

export function CaseCardPrompt({
  promptPreview,
  contentLocale = "en",
  promptTranslationZh,
  promptTranslationEn,
  compact = false,
}: {
  promptPreview?: string | null;
  contentLocale?: "zh-CN" | "en";
  promptTranslationZh?: string | null;
  promptTranslationEn?: string | null;
  compact?: boolean;
}) {
  const locale = useLocale();
  const messages = useMessages();
  const hasTranslationZh = Boolean(
    promptTranslationZh?.trim() && contentLocale !== "zh-CN"
  );
  const hasTranslationEn = Boolean(
    promptTranslationEn?.trim() && contentLocale !== "en"
  );
  const availableLanguages: PromptLanguage[] = ["original"];
  if (hasTranslationZh) {
    availableLanguages.push("zh");
  }
  if (hasTranslationEn) {
    availableLanguages.push("en");
  }
  const preferredLanguage: PromptLanguage =
    locale === "zh-CN" && availableLanguages.includes("zh")
      ? "zh"
      : locale === "en" && availableLanguages.includes("en")
        ? "en"
        : "original";
  const [language, setLanguage] = usePromptLanguage(
    hasTranslationZh,
    hasTranslationEn,
    preferredLanguage
  );
  const prompt = getCaseCardPrompt(
    language === "zh"
      ? promptTranslationZh
      : language === "en"
        ? promptTranslationEn
        : promptPreview,
    compact
  );

  if (!prompt.text && !prompt.resourceUrl) {
    return null;
  }

  if (prompt.resourceUrl) {
    return (
      <div
        className={`border-y border-[var(--hair)] bg-[var(--paper-2)] px-4 py-3 ${
          compact ? "mt-4 min-h-[104px]" : "mt-5"
        }`}
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--orange)]">
          {messages.card.method} / {messages.card.code}
        </p>
        <a
          href={prompt.resourceUrl}
          target="_blank"
          rel="noreferrer"
          className="gc-action mt-3 inline-flex"
        >
          {messages.card.viewMethod} ↗
        </a>
      </div>
    );
  }

  return (
    <div
      className={`border-y border-[var(--hair)] bg-[var(--paper-2)] px-4 py-3 ${
        compact ? "mt-4 min-h-[104px]" : "mt-5"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--orange)]">
          {messages.card.prompt}
        </p>
        {!compact && availableLanguages.length > 1 ? (
          <div className="flex border border-[var(--hair)] bg-white">
            {availableLanguages.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={language === value}
                onClick={() => setLanguage(value as PromptLanguage)}
                className={`min-h-7 border-r border-[var(--hair)] px-2 font-mono text-[9px] last:border-r-0 ${
                  language === value
                    ? "bg-[var(--ink)] text-[var(--paper)]"
                    : "text-[var(--muted)] hover:bg-[var(--paper)]"
                }`}
              >
                {value === "original"
                  ? messages.prompt.original
                  : value === "zh"
                    ? messages.language.chinese
                    : messages.language.english}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <p
        className={`mt-2 font-mono text-[11px] leading-5 text-[var(--ink)] ${
          compact ? "line-clamp-2" : "line-clamp-3"
        }`}
      >
        {prompt.text}
      </p>
    </div>
  );
}
