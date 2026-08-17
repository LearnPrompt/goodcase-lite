"use client";

import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/i18n/client";

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6"];

export default function CasesLoading() {
  const locale = useLocale();
  return (
    <SiteShell
      footerNote={
        locale === "en" ? "Loading the case library." : "案例库加载中。"
      }
    >
      <section className="gc-page-hero">
        <div className="grid gap-4">
          <div className="h-3 w-24 animate-pulse bg-[var(--orange)]/30" />
          <div className="h-16 w-full max-w-xl animate-pulse bg-black/10 sm:h-24" />
          <div className="h-5 w-full max-w-3xl animate-pulse bg-black/5" />
        </div>
      </section>

      <section className="flex flex-wrap gap-2 border-b border-[var(--hair)] py-6">
        {["f1", "f2", "f3", "f4"].map((key) => (
          <div key={key} className="h-11 w-24 animate-pulse border border-[var(--hair)] bg-white" />
        ))}
      </section>

      <section className="grid border-l border-t border-[var(--hair)] md:grid-cols-2 xl:grid-cols-3">
        {SKELETON_KEYS.map((key) => (
          <article
            key={key}
            className="flex h-full flex-col overflow-hidden border border-[var(--hair)] bg-white"
          >
            <div className="aspect-[16/10] animate-pulse border-b border-[var(--hair)] bg-[var(--concrete)]" />
            <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-16 animate-pulse bg-black/10" />
                <div className="h-6 w-14 animate-pulse bg-black/5" />
                <div className="h-6 w-16 animate-pulse bg-black/5" />
              </div>
              <div className="space-y-3">
                <div className="h-9 w-4/5 animate-pulse bg-black/10" />
                <div className="h-4 w-full animate-pulse bg-black/5" />
                <div className="h-4 w-2/3 animate-pulse bg-black/5" />
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hair)] pt-4">
                <div className="h-11 w-32 animate-pulse border border-[var(--hair)] bg-white" />
                <div className="h-11 w-24 animate-pulse border border-[var(--hair)] bg-white" />
              </div>
            </div>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
