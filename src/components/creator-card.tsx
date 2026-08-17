"use client";

import { CreatorAvatar } from "@/components/creator-avatar";
import { LocalizedLink as Link } from "@/components/localized-link";
import { useLocale, useMessages } from "@/i18n/client";
import { formatAggregateStability } from "@/lib/stability";
import { splitHighlightedText } from "@/lib/search";

/**
 * 创作者卡片的「窄 props」。
 *
 * 刻意不接整个 CreatorItem：CreatorItem 上挂着 heroCase（完整 CaseItem，含 promptFull /
 * resultBreakdown）和 representativeCases（一整数组完整 CaseItem）。客户端组件的 props 会被
 * 原样序列化进 RSC payload，直接把 creator 整个传进来，等于把几十 KB 卡片根本不渲染的
 * Prompt 正文塞进 HTML。所以这里只声明真正会渲染的字段，调用方负责挑。
 */
export type CreatorCardItem = {
  slug: string;
  name: string;
  avatarUrl?: string;
  bio: string;
  tags: string[];
  highlightedLabel: string;
  caseCount: number;
  averageSourceHeatScore: number | null;
  averageStabilityScore: number | null;
  heroCaseSlug: string;
  heroCaseTitle: string;
  /** 过滤套话 + 复用方法兜底之后的结果；两者都没有时是 null，不渲染摘要段。 */
  heroCaseSummary: string | null;
  /**
   * 最近作品——已经在服务端按 locale 格式化成 YYYY/MM/DD 字符串；
   * 只展示作者侧时间，不展示编辑时间。null 时不渲染这一行。
   */
  latestWorkDate: string | null;
  searchQuery?: string;
  searchSnippet?: string | null;
  searchField?: string | null;
};

export function CreatorCard({
  creator,
  rank,
}: {
  creator: CreatorCardItem;
  /** 卡片右上角的序号，已经算好全局位次（含分页偏移）。 */
  rank: number;
}) {
  const locale = useLocale();
  const messages = useMessages();
  const isEnglish = locale === "en";
  const searchFieldLabel = creator.searchField
    ? messages.searchField[creator.searchField as keyof typeof messages.searchField] ??
      messages.searchField.fallback
    : messages.searchField.fallback;

  return (
    <article className="gc-card flex h-full flex-col border-l-0 border-t-0 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="gc-chip gc-chip-accent">
          {creator.highlightedLabel}
          </span>
          {creator.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="gc-chip">
              {tag}
            </span>
          ))}
        </div>
        <span className="font-mono text-xs text-[var(--orange)]">
          #{String(rank).padStart(2, "0")}
        </span>
      </div>

      <div className="mt-7 flex items-center gap-4">
        <CreatorAvatar
          name={creator.name}
          avatarUrl={creator.avatarUrl}
          size={64}
        />
        <h2 className="text-3xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-4xl">
          {creator.searchQuery
            ? splitHighlightedText(creator.name, creator.searchQuery).map((part, index) =>
                part.matched ? (
                  <mark key={index} className="gc-search-hit">
                    {part.text}
                  </mark>
                ) : (
                  <span key={index}>{part.text}</span>
                )
              )
            : creator.name}
        </h2>
      </div>
      {creator.searchQuery && creator.searchSnippet ? (
        <div className="mt-3 min-h-[84px] text-sm leading-7 text-[var(--muted)]">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--orange)]">
            {searchFieldLabel}
          </div>
          <p className="line-clamp-3">
            {splitHighlightedText(creator.searchSnippet, creator.searchQuery).map((part, index) =>
              part.matched ? (
                <mark key={index} className="gc-search-hit">
                  {part.text}
                </mark>
              ) : (
                <span key={index}>{part.text}</span>
              )
            )}
          </p>
        </div>
      ) : (
        <p className="mt-3 min-h-[84px] text-sm leading-7 text-[var(--muted)]">{creator.bio}</p>
      )}

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="gc-stat">
          <div className="gc-stat-label">{messages.common.cases}</div>
          <div className="gc-stat-value">{creator.caseCount}</div>
        </div>
        <div className="gc-stat">
          <div className="gc-stat-label">{messages.common.sourceHeat}</div>
          <div className="gc-stat-value">{creator.averageSourceHeatScore ?? "—"}</div>
        </div>
        <div className="gc-stat">
          <div className="gc-stat-label">{messages.common.stability}</div>
          <div className="gc-stat-value">
            {formatAggregateStability(creator.averageStabilityScore, locale)}
          </div>
        </div>
      </div>

      {creator.latestWorkDate ? (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]">
          {messages.common.latestWork} {creator.latestWorkDate}
        </p>
      ) : null}

      <div className="mt-5 border border-[var(--hair)] bg-[var(--paper-2)] p-4">
        <p className="gc-eyebrow">
          {isEnglish ? "Representative case" : "代表案例"}
        </p>
        <h3 className="mt-3 text-lg font-semibold text-[var(--ink)]">{creator.heroCaseTitle}</h3>
        {creator.heroCaseSummary ? (
          <p className="mt-2 line-clamp-2 text-sm leading-7 text-[var(--muted)]">
            {creator.heroCaseSummary}
          </p>
        ) : null}
      </div>

      <div className="mt-auto flex flex-wrap gap-2 border-t border-[var(--hair)] pt-5">
        <Link
          href={`/creators/${creator.slug}`}
          className="gc-action gc-action-primary"
        >
          {messages.common.viewCreator}
        </Link>
        <Link
          href={`/cases/${creator.heroCaseSlug}`}
          className="gc-action"
        >
          {isEnglish ? "Representative case" : "代表 Case"} →
        </Link>
      </div>
    </article>
  );
}
