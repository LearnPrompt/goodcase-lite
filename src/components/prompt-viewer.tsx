"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useMessages } from "@/i18n/client";
import {
  type PromptLanguage,
  usePromptLanguage,
} from "@/lib/prompt-language";

export function PromptViewer({
  original,
  originalLocale = "en",
  translationZh,
  translationEn,
}: {
  original: string;
  originalLocale?: "zh-CN" | "en";
  translationZh?: string;
  translationEn?: string;
}) {
  const locale = useLocale();
  const messages = useMessages();
  const hasTranslationZh = Boolean(
    translationZh?.trim() && originalLocale !== "zh-CN"
  );
  const hasTranslationEn = Boolean(
    translationEn?.trim() && originalLocale !== "en"
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
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prompt =
    language === "zh" && translationZh
      ? translationZh
      : language === "en" && translationEn
        ? translationEn
        : original;

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, []);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
      resetTimer.current = setTimeout(() => setCopied(false), 2_000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="gc-eyebrow">{messages.prompt.bilingual}</p>
        <div className="flex items-center">
          {availableLanguages.length > 1 ? (
            <div className="flex border border-r-0 border-[var(--hair)] bg-white">
              {availableLanguages.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={language === value}
                  onClick={() => setLanguage(value as PromptLanguage)}
                  className={`min-h-10 border-r border-[var(--hair)] px-3 font-mono text-[10px] uppercase tracking-[0.08em] transition ${
                    language === value
                      ? "bg-[var(--ink)] text-[var(--paper)]"
                      : "bg-white text-[var(--muted)] hover:bg-[var(--paper-2)]"
                  }`}
                >
                  {value === "original"
                    ? messages.prompt.original
                    : value === "zh"
                      ? messages.prompt.chineseTranslation
                      : messages.prompt.englishTranslation}
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={copyPrompt}
            className="min-h-10 border border-[var(--hair)] bg-[var(--orange)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--ink)]"
          >
            <span aria-live="polite">
              {copied ? messages.common.copied : messages.common.copy}
            </span>
          </button>
        </div>
      </div>
      <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap border border-[var(--hair)] bg-[var(--paper-2)] p-4 font-sans text-sm leading-8 text-[var(--ink)] sm:p-6">
        {prompt}
      </pre>
    </>
  );
}
