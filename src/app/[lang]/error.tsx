"use client";

import { useEffect } from "react";
import { LocalizedLink as Link } from "@/components/localized-link";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/i18n/client";
import { trackEvent } from "@/lib/analytics";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const isEnglish = locale === "en";
  useEffect(() => {
    console.error(error);
    trackEvent("app_error", { digest: error.digest || "unknown" });
  }, [error]);

  return (
    <SiteShell
      footerNote={
        isEnglish
          ? "Retry the request or return home."
          : "页面出错时可以重试，或返回首页继续。"
      }
    >
      <section className="gc-empty-state my-8">
        <p className="gc-eyebrow">
          Something went wrong
        </p>
        <h1 className="text-5xl font-medium leading-[0.95] tracking-[-0.04em] md:text-7xl">
          {isEnglish
            ? "Something went wrong. Try once more."
            : "页面出了点问题，先重试一次。"}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
          {isEnglish
            ? "The last request did not complete. Retry below; if it keeps failing, return later."
            : "刚才的请求没有成功。你可以点击下方按钮重试，如果反复失败，请稍后再回来。"}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="gc-action gc-action-primary"
          >
            {isEnglish ? "Try again" : "重试"}
          </button>
          <Link
            href="/"
            className="gc-action"
          >
            {isEnglish ? "Back to home" : "返回首页"}
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
