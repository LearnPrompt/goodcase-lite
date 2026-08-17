"use client";

import { useEffect, useState } from "react";
import { CaseCard } from "@/components/case-card";
import { FavoriteButton } from "@/components/favorite-button";
import { LikeButton } from "@/components/like-button";
import { LocalizedLink as Link } from "@/components/localized-link";
import { useLocale, useMessages } from "@/i18n/client";
import { useFavoritedSlugs } from "@/lib/local-favorites";

type PublicCaseItem = {
  slug: string;
  title: string;
  category: string;
  source: string;
  summary: string;
  promptPreview: string | null;
  contentLocale: "zh-CN" | "en";
  promptTranslationZh: string | null;
  promptTranslationEn: string | null;
  mediaType: string;
  mediaUrl: string | null;
  posterUrl: string | null;
  likedCount: number;
  stabilityScore: number;
  sourceHeatScore: number | null;
};

/** 公开 API 返回站点绝对 URL，本地环境下转回相对路径以便直接命中本站静态资源。 */
function toLocalMediaUrl(rawUrl: string | null): string | null {
  if (!rawUrl) {
    return null;
  }
  return rawUrl.replace(/^https:\/\/goodcase\.ai(?=\/)/, "");
}

export function FavoritesList() {
  const locale = useLocale();
  const messages = useMessages();
  const favoritedSlugs = useFavoritedSlugs();
  const [cases, setCases] = useState<PublicCaseItem[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/public/cases?take=50&locale=${locale}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`unexpected status ${response.status}`);
        }
        return response.json();
      })
      .then((data: { items?: PublicCaseItem[] }) => {
        if (!cancelled) {
          setCases(Array.isArray(data.items) ? data.items : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const favoritedCases = (cases ?? []).filter((item) => favoritedSlugs.includes(item.slug));

  return (
    <>
      <p className="mb-6 border border-[var(--hair)] bg-[var(--paper-2)] px-4 py-3 font-mono text-[11px] leading-6 text-[var(--muted)]">
        {messages.favorites.localNotice}
      </p>

      {favoritedSlugs.length === 0 ? (
        <section className="gc-empty-state">
          <p className="text-lg font-semibold text-[var(--ink)]">
            {messages.favorites.emptyTitle}
          </p>
          <p className="text-sm leading-7 text-[var(--muted)]">
            {messages.favorites.emptyDescription}
          </p>
          <div>
            <Link
              href="/cases"
              className="gc-action gc-action-primary"
            >
              {messages.favorites.browse}
            </Link>
          </div>
        </section>
      ) : loadFailed ? (
        <section className="gc-empty-state text-sm leading-7 text-[var(--muted)]">
          {messages.favorites.loadFailed}
        </section>
      ) : cases === null ? (
        <section className="gc-empty-state text-sm leading-7 text-[var(--muted)]">
          {messages.favorites.loading}
        </section>
      ) : favoritedCases.length === 0 ? (
        <section className="gc-empty-state text-sm leading-7 text-[var(--muted)]">
          {messages.favorites.missing}
        </section>
      ) : (
        <section className="grid border-l border-t border-[var(--hair)] md:grid-cols-2 2xl:grid-cols-3">
          {favoritedCases.map((item) => {
            const mediaUrl = toLocalMediaUrl(item.mediaUrl);
            const posterUrl = toLocalMediaUrl(item.posterUrl) ?? undefined;

            return (
              <CaseCard
                key={item.slug}
                item={{ ...item, mediaUrl, posterUrl }}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                      <LikeButton caseSlug={item.slug} initialCount={item.likedCount} />
                      <FavoriteButton caseSlug={item.slug} />
                    </div>
                }
              />
            );
          })}
        </section>
      )}
    </>
  );
}
