"use client";

import { gsap } from "gsap";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CaseCardStabilityVote } from "@/components/case-card-stability";
import { LocalizedLink as Link } from "@/components/localized-link";
import type { CardMediaFit } from "@/lib/card-media-fit";
import { resolveStabilityState, formatStabilityScore } from "@/lib/stability";
import { useMessages } from "@/i18n/client";

export type HomeDeckItem = {
  slug: string;
  title: string;
  /** 过滤套话 + 复用方法兜底之后的结果；两者都没有时是 null，不渲染摘要段。 */
  summary: string | null;
  creator: string;
  categoryLabel: string;
  /** 原始分数，不是格式化好的文案——未实测时要在这里订阅票数徽标，需要拿到原始值判断。 */
  stabilityScore: number | null;
  /** 区分「没测过」和「复测未通过」的判别位，见 src/lib/stability.ts。 */
  evidenceLevel?: string | null;
  mediaType: "image" | "video";
  mediaUrl: string;
  posterUrl?: string;
  thumbnailUrl?: string;
  /** 缩略图在 16:9 框里的填充方式；只有本地缩略图量得到宽高，其余按 cover。 */
  thumbnailFit?: CardMediaFit;
};

const PER_PAGE = 6;

/**
 * 首页深度 Case 区的翻页。
 *
 * 数据在服务端一次取好整池传进来，翻页纯客户端切片：
 * 不再发请求，既不增加 Supabase 出网流量，也没有翻页等待，
 * 目的是让人愿意在首页多翻几屏而不是看完六条就走。
 */
export function HomeCaseDeck({
  items,
  locale,
  labels,
}: {
  items: HomeDeckItem[];
  locale: "zh-CN" | "en";
  labels: {
    previewTag: string;
    stability: string;
    viewPrompt: string;
    prev: string;
    next: string;
  };
}) {
  const messages = useMessages();
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const visible = items.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const isEnglish = locale === "en";
  const gridRef = useRef<HTMLDivElement>(null);
  // 首屏（page === 0 的初次挂载）交给全局 case-reveal 的 ScrollTrigger 处理；
  // 这里只在翻页（page 变化且不是初次渲染）时对新一批卡片做进场动效，
  // 用 isFirstRender 而不是 page !== 0 来判断，避免深链/恢复状态时首帧误触发。
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = gridRef.current?.querySelectorAll("[data-reveal]");
    if (!cards || cards.length === 0) return;
    gsap.fromTo(
      cards,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
        ease: "power2.out",
        stagger: 0.07,
      }
    );
  }, [page]);

  return (
    <>
      <div
        ref={gridRef}
        className="grid border-l border-t border-[var(--hair)] md:grid-cols-2 xl:grid-cols-3"
      >
        {visible.map((item, index) => {
          const media = item.thumbnailUrl || item.posterUrl || item.mediaUrl;
          // 只有本地缩略图量得到宽高；回退到 poster / 原图时按 cover。
          const mediaFit: CardMediaFit = item.thumbnailUrl
            ? item.thumbnailFit ?? "cover"
            : "cover";
          return (
            <article
              key={item.slug}
              data-reveal
              className="group flex min-h-[440px] flex-col border-b border-r border-[var(--hair)] bg-white"
            >
              <Link
                href={`/cases/${item.slug}`}
                className="block overflow-hidden border-b border-[var(--hair)]"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--paper-2)] transition duration-300 group-hover:scale-[1.015]">
                  <Image
                    src={media}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
                    className={
                      mediaFit === "contain" ? "object-contain" : "object-cover"
                    }
                  />
                  <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 font-mono text-[10px] text-white">
                    {item.categoryLabel}
                  </span>
                </div>
              </Link>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--mute)]">
                  <span>
                    Case ·{" "}
                    {String(page * PER_PAGE + index + 1).padStart(4, "0")}
                  </span>
                  <span className="text-[var(--orange)]">
                    {labels.previewTag}
                  </span>
                </div>
                {/*
                  标题锁两行高度：text-2xl 默认行高 2rem(32px)，line-clamp-2
                  两行即 4rem(64px)，一行的标题也占两行位，同排卡片才能对齐。
                */}
                <h3 className="mt-5 line-clamp-2 min-h-16 text-2xl font-semibold tracking-[-0.03em]">
                  {item.title}
                </h3>
                <p className="mt-2 truncate font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--mute)]">
                  {item.categoryLabel} · {item.creator}
                </p>
                {/*
                  摘要块永远渲染并锁高度：3 行 × leading-7(28px) = 84px，
                  跟 case-card.tsx 默认变体的摘要高度对齐；没有摘要时占位不塌陷。
                */}
                <p className="mt-4 line-clamp-3 min-h-[84px] text-sm leading-7 text-[var(--muted)]">
                  {item.summary || " "}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-[var(--hair)] pt-4 font-mono text-[10px] uppercase tracking-[0.08em]">
                  <span>
                    {labels.stability}{" "}
                    {(() => {
                      const state = resolveStabilityState(
                        item.stabilityScore,
                        item.evidenceLevel
                      );
                      if (state === "measured") {
                        return formatStabilityScore(item.stabilityScore, locale);
                      }
                      if (state === "failed") {
                        return (
                          <span className="text-[var(--orange)]">
                            {messages.stability.failed}
                          </span>
                        );
                      }
                      return <CaseCardStabilityVote caseSlug={item.slug} />;
                    })()}
                  </span>
                  <Link
                    href={`/cases/${item.slug}`}
                    className="text-[var(--orange)]"
                  >
                    {labels.viewPrompt} ↗
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-l border-r border-[var(--hair)] px-5 py-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
            {isEnglish
              ? `${page + 1} / ${totalPages}`
              : `第 ${page + 1} / ${totalPages} 屏`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="gc-action disabled:pointer-events-none disabled:opacity-40"
            >
              ← {labels.prev}
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="gc-action disabled:pointer-events-none disabled:opacity-40"
            >
              {labels.next} →
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
