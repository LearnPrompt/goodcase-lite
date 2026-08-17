"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { CaseCardPrompt } from "@/components/case-card-prompt";
import { CaseCardStabilityVote } from "@/components/case-card-stability";
import { LocalizedLink as Link } from "@/components/localized-link";
import { useLocale, useMessages } from "@/i18n/client";
import type { CardMediaFit } from "@/lib/card-media-fit";
import { caseCardSearchFieldLabel } from "@/lib/case-card-search-field";
import {
  formatCardPublishedDate,
  getPresentableCaseSummary,
} from "@/lib/case-presentation";
import { slugifyCreatorName } from "@/lib/creator-slug";
import { splitHighlightedText } from "@/lib/search";
import type { SkillLink } from "@/lib/skills";
import { formatStabilityScore, resolveStabilityState } from "@/lib/stability";
import { optimizedPosterUrl } from "@/lib/optimized-poster";

export type CaseCardItem = {
  slug: string;
  title: string;
  category: string;
  source: string;
  creator?: string;
  summary: string;
  promptPreview?: string | null;
  contentLocale?: "zh-CN" | "en";
  promptTranslationZh?: string | null;
  promptTranslationEn?: string | null;
  mediaType: string;
  mediaUrl: string | null;
  posterUrl?: string | null;
  /** 三段式复用方法，第一段是关键决定；摘要是自动生成的套话时拿它兜底。 */
  promptContributionNotes?: string[];
  /** 本地 400px 缩略图；列表用它省流量与图片转换额度，详情页仍用原图。 */
  thumbnailUrl?: string;
  /** 缩略图在 16:9 框里的填充方式，由缩略图宽高算出；缺省按 cover。 */
  thumbnailFit?: CardMediaFit;
  stabilityScore: number;
  /**
   * 稳定度那一格要区分「没测过」和「测过没通过」，光看分数区分不出来
   * （库里 stability_score not null default 0），判别位是证据等级，
   * 见 src/lib/stability.ts。两个字符，卡片 payload 可以忽略不计。
   */
  evidenceLevel?: string | null;
  sourceHeatScore: number | null;
  sourcePublishedAt?: string | null;
  skills?: SkillLink[];
  searchQuery?: string;
  searchSnippet?: string | null;
  searchField?: string | null;
};

export function CaseCard({
  item,
  actions,
  variant = "default",
}: {
  item: CaseCardItem;
  actions?: ReactNode;
  variant?: "default" | "gallery";
}) {
  const messages = useMessages();
  const locale = useLocale();
  const isGallery = variant === "gallery";
  const stabilityState = resolveStabilityState(
    item.stabilityScore,
    item.evidenceLevel
  );
  const label =
    messages.category[item.category as keyof typeof messages.category] ||
    item.category;
  // 自动生成的通用摘要（来自 X 的真实 XX 案例…）已被 getPresentableCaseSummary 判为无效，
  // 于是同一排卡片有的有推荐理由有的没有。这里用复用方法的第一句兜底，
  // 让每张卡都有一句能读的推荐理由，排版也不再忽长忽短。
  const summary = getPresentableCaseSummary(
    item.summary,
    item.promptContributionNotes
  );
  const searchSummary = item.searchSnippet || summary;
  const searchFieldLabel = caseCardSearchFieldLabel(
    item.searchField,
    locale,
    isGallery
  );
  const creatorSlug = item.creator ? slugifyCreatorName(item.creator) : "";
  const publishedDate = formatCardPublishedDate(item.sourcePublishedAt, locale);
  // 列表卡片一律优先本地缩略图：外链原图动辄几 MB，一页 24 张会拖垮首屏。
  const cardMediaUrl = item.thumbnailUrl || item.mediaUrl || "";
  // 只有本地缩略图才量得到宽高；回退到外链原图时前端拿不到尺寸，按 cover 处理。
  const mediaFit: CardMediaFit = item.thumbnailUrl
    ? item.thumbnailFit ?? "cover"
    : "cover";

  return (
    <article className="gc-card group flex h-full flex-col overflow-hidden">
      <Link
        href={`/cases/${item.slug}`}
        className="relative block aspect-[16/9] overflow-hidden border-b border-[var(--hair)] bg-[var(--paper-2)]"
      >
        {item.mediaUrl ? (
          item.mediaType === "image" || item.thumbnailUrl ? (
            <Image
              src={cardMediaUrl}
              alt={item.title}
              fill
              sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
              className={`${
                mediaFit === "contain" ? "object-contain" : "object-cover"
              } transition duration-300 group-hover:scale-[1.015]`}
            />
          ) : (
            <video
              muted
              playsInline
              preload="none"
              poster={optimizedPosterUrl(item.posterUrl || undefined)}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.015]"
            >
              <source src={item.mediaUrl} type="video/mp4" />
            </video>
          )
        ) : null}
      </Link>

      {/*
        三段式骨架：头部（分类/标题/推荐理由）+ 中段（Skill 标签/提示语）+ 尾部（统计/底栏）。
        中段拿 flex-1 吃掉所有高度差异——Skill 标签行可有可无、提示语块有「提示语」和
        「方法/代码」两种高度——尾部再用 mt-auto 贴底。同一行卡片由 grid 拉成等高，
        于是统计行和底栏都落在同一个 y 上，不会再被中段那些可选行整体顶偏。
      */}
      <div
        className={`flex flex-1 flex-col ${isGallery ? "p-4 sm:p-5" : "p-5"}`}
      >
        <div>
          {/*
            顶部 chips 行：锁单行高度（跟 gc-chip 的 min-height:1.75rem 对齐），
            flex-nowrap + overflow-hidden 不让 chip 数量不一致时换到第二行——
            换行正是卡片高度失控的一个来源。溢出的 chip 直接被裁掉，
            这一行卡片一般只有 2-4 个 chip，实测不会裁到关键信息。
          */}
          <div className="flex h-7 flex-nowrap items-center gap-2 overflow-hidden">
            <span className="gc-chip gc-chip-accent">{label}</span>
            <span className="gc-chip">{item.source}</span>
            {publishedDate ? (
              <span className="gc-chip font-mono">{publishedDate}</span>
            ) : null}
            {!isGallery && item.creator && creatorSlug ? (
              <Link
                href={`/creators/${creatorSlug}`}
                className="gc-chip transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
              >
                {item.creator} →
              </Link>
            ) : !isGallery && item.creator ? (
              <span className="gc-chip">{item.creator}</span>
            ) : null}
          </div>

          <Link
            href={`/cases/${item.slug}`}
            className={isGallery ? "mt-4 block" : "mt-5 block"}
          >
            {/*
              标题锁两行高度：一行的标题也占两行位，同一排卡片的标题块底边
              才能对齐。min-height 按当前字号 × leading 算的两行高度：
              gallery 移动端 20px×1.16×2≈46.4px、sm+ 24px×1.16×2≈55.7px；
              默认变体移动端 24px×1.02×2≈48.96px、sm+ 30px×1.02×2≈61.2px。
            */}
            <h2
              className={`line-clamp-2 font-semibold tracking-[-0.035em] text-[var(--ink)] ${
                isGallery
                  ? "min-h-[47px] text-xl leading-[1.16] sm:min-h-[56px] sm:text-2xl"
                  : "min-h-[49px] text-2xl leading-[1.02] sm:min-h-[62px] sm:text-3xl"
              }`}
            >
              {item.searchQuery
                ? splitHighlightedText(item.title, item.searchQuery).map((part, index) =>
                    part.matched ? (
                      <mark key={index} className="gc-search-hit">
                        {part.text}
                      </mark>
                    ) : (
                      <span key={index}>{part.text}</span>
                    )
                  )
                : item.title}
            </h2>
          </Link>

          {/*
            创作者行只在 gallery 变体单独成行（默认变体的创作者在上面 chips 行里）。
            之前没有创作者时整行不渲染，导致有/无创作者的卡片高度差一行；
            现在永远占位，min-h 按 10px 字号 × 默认行高 1.5 算（15px），
            没有创作者时塞一个不换行空格保证盒子不塌陷。
          */}
          {isGallery ? (
            <p className="mt-3 min-h-[15px] truncate font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]">
              {item.creator ? (
                <>
                  {messages.common.creator}{" "}
                  {creatorSlug ? (
                    <Link
                      href={`/creators/${creatorSlug}`}
                      className="font-semibold text-[var(--ink)] hover:text-[var(--orange)]"
                    >
                      {item.creator} →
                    </Link>
                  ) : (
                    <span className="font-semibold text-[var(--ink)]">
                      {item.creator}
                    </span>
                  )}
                </>
              ) : (
                " "
              )}
            </p>
          ) : null}

          {/*
            摘要块永远渲染并锁高度（按 clamp 行数 × leading 算）：
            gallery 2 行 × 14px×1.5=24px → 48px；默认 3 行 × 14px×1.75=28px → 84px。
            summary 为空时塞空格占位，不再让整块高度塌到 0。
          */}
          {item.searchQuery && item.searchSnippet ? (
            <div className="mt-3 min-h-[48px] text-sm leading-6 text-[var(--muted)]">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--orange)]">
                {searchFieldLabel}
              </div>
              <p className="line-clamp-2">
                {splitHighlightedText(searchSummary || "", item.searchQuery).map((part, index) =>
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
          <p
            className={`mt-3 text-sm text-[var(--muted)] ${
              isGallery
                ? "line-clamp-2 min-h-[48px] leading-6"
                : "line-clamp-3 min-h-[84px] leading-7"
            }`}
          >
            {summary || " "}
          </p>
          )}
        </div>

        <div className="flex-1">
          {/*
            SKILL 标签行永远占位（min-h 对齐 gc-chip 的 1.75rem），
            没有 SKILL 的卡片渲染同高度的空行，不再让提示语块因为这行
            有没有渲染而落在不同 y 上。这行本身允许换行/长高——不clamp，
            多 SKILL 的卡片可以比空卡高，只保证「至少一行」这条下限。
          */}
          <div className="mt-4 flex min-h-7 flex-wrap gap-2">
            {item.skills?.length ? (
              <>
                {item.skills
                  .slice(0, isGallery ? 1 : item.skills.length)
                  .map((skill) => (
                    <Link
                      key={skill.slug}
                      href={`/skills/${skill.slug}`}
                      className="gc-chip transition hover:border-[var(--orange)] hover:text-[var(--orange)]"
                    >
                      Skill · {skill.title}
                    </Link>
                  ))}
                {isGallery && item.skills.length > 1 ? (
                  <span className="gc-chip">+{item.skills.length - 1}</span>
                ) : null}
              </>
            ) : null}
          </div>

          <CaseCardPrompt
            promptPreview={item.promptPreview}
            contentLocale={item.contentLocale}
            promptTranslationZh={item.promptTranslationZh}
            promptTranslationEn={item.promptTranslationEn}
            compact={isGallery}
          />
        </div>

        <div className="mt-auto">
          <div
            className={`grid grid-cols-2 ${
              isGallery
                ? "mt-5 gap-px border border-[var(--concrete)] bg-[var(--concrete)]"
                : "mt-5 gap-2"
            }`}
          >
            <div
              className={
                isGallery ? "bg-white px-3 py-2" : "gc-stat"
              }
            >
              <div className="gc-stat-label">{messages.card.sourceHeat}</div>
              <div
                className={
                  isGallery ? "mt-1 text-sm font-semibold" : "gc-stat-value"
                }
              >
                {item.sourceHeatScore ?? "—"}
              </div>
            </div>
            <div
              className={
                isGallery ? "bg-white px-3 py-2" : "gc-stat"
              }
            >
              <div className="gc-stat-label">{messages.card.stability}</div>
              <div
                className={
                  isGallery ? "mt-1 text-sm font-semibold" : "gc-stat-value"
                }
              >
                {stabilityState === "measured" ? (
                  formatStabilityScore(item.stabilityScore)
                ) : stabilityState === "failed" ? (
                  // 复测跑过没通过：不再假装「还没测」去催投票。
                  // 只用单强调色标出来，不加边框/圆角/徽章，
                  // 免得撑破统计格刚锁定的高度对齐（同 case-card-stability.tsx 的理由）。
                  <span className="text-[var(--orange)]">
                    {messages.stability.failed}
                  </span>
                ) : (
                  <CaseCardStabilityVote caseSlug={item.slug} />
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hair)] pt-4">
            {actions}
            <Link href={`/cases/${item.slug}`} className="gc-action ml-auto">
              {messages.common.viewCase} →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
