import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { CaseCard } from "@/components/case-card";
import { CreatorAvatar } from "@/components/creator-avatar";
import { LocalizedLink as Link } from "@/components/localized-link";
import { HomeCaseDeck } from "@/components/home-case-deck";
import { ModelStrip } from "@/components/model-strip";
import { SiteShell } from "@/components/site-shell";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getLocaleFromParams } from "@/i18n/server";
import { getHomeData, type DisplayCaseItem } from "@/lib/cases";
import { toCaseCardItem } from "@/lib/case-card-item";
import { getPresentableCaseSummary } from "@/lib/case-presentation";
import { HOME_RANKINGS_ANCHOR } from "@/lib/home-anchors";
import { localeAlternates } from "@/lib/seo/alternates";
import { optimizedPosterUrl } from "@/lib/optimized-poster";
import {
  formatAggregateStability,
  formatStabilityScore,
  resolveStabilityState,
} from "@/lib/stability";

// 内容只在运营发布时变，发布会触发部署，新部署自带一份空的 ISR 缓存并立刻回填
// 最新内容——内容新鲜度由部署保证，不由这个间隔保证。
//
// 之前写 3600 的代价：每满一小时，这一页在所有边缘节点上的副本会被一起清掉重推，
// 大陆用户平均每小时就要吃一次冷缓存。实测冷 MISS 的 TTFB 大陆 1.8-2.1s、香港 1.1s，
// 焐热后约 400ms。放到 86400 之后这种回落一天一次，顺带省掉 23 次纯属多余的回源重建。
// 唯一的行为变化：绕过部署直接改 Supabase 时，页面最长要等一天才自己刷新。
export const revalidate = 86_400;

// [lang] 是动态段，不加 generateStaticParams 的话上面的 revalidate 完全不起作用——
// 每次请求都会打 Supabase。只有两种语言，直接枚举。
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

/**
 * 首页此前完全没有自己的 generateMetadata，全靠继承 [lang]/layout.tsx——
 * title / description / openGraph 继承下来恰好就是首页该有的那份，唯独
 * alternates 必须显式声明：不写的话确实也是继承同一份正确值，但这个巡检
 * 口径要求「每个页面都能在自己文件里看到走的是 localeAlternates」，不靠
 * 「恰好没被覆盖」这种隐性正确。
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = await getLocaleFromParams(params);
  return {
    alternates: localeAlternates(locale, "/", { rss: true }),
  };
}

const categoryLabels: Record<
  Locale,
  Record<DisplayCaseItem["category"], string>
> = {
  "zh-CN": {
    image: "AI 生图",
    video: "AI 视频",
    web: "AI 编程",
    copy: "AI 文案",
    hardware: "AI 硬件",
  },
  en: {
    image: "AI Image",
    video: "AI Video",
    web: "AI Coding",
    copy: "AI Copy",
    hardware: "AI Hardware",
  },
};

const costLabels: Record<DisplayCaseItem["costBand"], string> = {
  low: "LOW",
  medium: "MID",
  high: "HIGH",
};

function uniqueCases(items: DisplayCaseItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.slug)) {
      return false;
    }
    seen.add(item.slug);
    return true;
  });
}

function MediaTile({
  item,
  locale,
  rank,
  className = "",
  showCategory = true,
  vivid = false,
  useThumbnail = false,
  hoverReveal = false,
  priority = false,
}: {
  item: DisplayCaseItem;
  locale: Locale;
  rank?: string;
  className?: string;
  /** 榜单行里的缩略图只有 56px 宽，压上分类标签会把作品本身盖住，那里要关掉。 */
  showCategory?: boolean;
  /** 榜单缩略图蒙版减淡到 15%，让人先看清作品本身。 */
  vivid?: boolean;
  /** 小尺寸位置用本地 400px 缩略图；首屏大图仍走原图保清晰度。 */
  useThumbnail?: boolean;
  /**
   * 曾经是「默认灰度、指针悬停还原本色」的位置；图片改回默认彩色后
   * 这个开关不再影响灰度，只保留用于关掉蒙版——这个位置的 rank/分类
   * 标签本身自带实底背景，不靠蒙版提供对比度。
   */
  hoverReveal?: boolean;
  /**
   * 首屏可见的位置传 true：取消 lazy 并标 fetchpriority=high。全页 36 张图
   * 曾经全部 lazy，首屏图也要等布局算完才请求，LCP 白白后移。只给 hero 区
   * 那三张 Top 位，折叠线以下的榜单/卡片保持 lazy。
   */
  priority?: boolean;
}) {
  const mediaClassName = "object-cover";
  // 三个位置的文字都落在自带实底背景的 chip（rank 徽标 bg-orange、分类标签
  // bg-black/60）上，不是裸文字压图，所以 hoverReveal / 默认分支都不需要蒙版；
  // 只有 vivid 位保留一层 0.15 的淡蒙版统一质感。
  const washClassName = hoverReveal
    ? ""
    : vivid
      ? "absolute inset-0 bg-[linear-gradient(135deg,rgba(194,65,12,0.15),transparent_46%,rgba(10,10,10,0.15))]"
      : "";
  const thumbnail = useThumbnail ? item.thumbnailUrl : undefined;

  return (
    <div className={`relative overflow-hidden border border-[var(--hair)] bg-[var(--ink)] ${className}`}>
      {thumbnail ? (
        <Image src={thumbnail} alt={item.title} fill sizes="(min-width: 1024px) 20vw, 33vw" className={mediaClassName} priority={priority} />
      ) : item.mediaType === "video" && item.posterUrl ? (
        <Image src={item.posterUrl} alt={item.title} fill sizes="(min-width: 1024px) 20vw, 33vw" className={mediaClassName} priority={priority} />
      ) : item.mediaType === "video" ? (
        <video
          muted
          playsInline
          preload="none"
          poster={optimizedPosterUrl(item.posterUrl)}
          className={`h-full w-full ${mediaClassName}`}
        >
          <source src={item.mediaUrl} type="video/mp4" />
        </video>
      ) : (
        <Image src={item.mediaUrl} alt={item.title} fill sizes="(min-width: 1024px) 20vw, 33vw" className={mediaClassName} priority={priority} />
      )}
      {washClassName ? <div className={washClassName} /> : null}
      {rank ? (
        <span className="absolute left-2 top-2 bg-[var(--orange)] px-2 py-1 font-mono text-[10px] text-white">
          {rank}
        </span>
      ) : null}
      {showCategory ? (
        <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 font-mono text-[10px] text-white">
          {categoryLabels[locale][item.category]}
        </span>
      ) : null}
    </div>
  );
}

/** 稳定榜行内缩略图：同样去掉灰度、蒙版减淡，优先让人看清作品。 */
function EvidenceTile({ item }: { item: DisplayCaseItem }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden border border-[var(--hair)] bg-[var(--ink)]">
      {item.thumbnailUrl ? (
        <Image src={item.thumbnailUrl} alt={item.title} fill sizes="120px" className="object-cover" />
      ) : item.mediaType === "video" && item.posterUrl ? (
        <Image src={item.posterUrl} alt={item.title} fill sizes="120px" className="object-cover" />
      ) : item.mediaType === "video" ? (
        <video
          muted
          playsInline
          preload="none"
          poster={optimizedPosterUrl(item.posterUrl)}
          className="h-full w-full object-cover"
        >
          <source src={item.mediaUrl} type="video/mp4" />
        </video>
      ) : (
        <Image src={item.mediaUrl} alt={item.title} fill sizes="120px" className="object-cover" />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(194,65,12,0.15),transparent_54%,rgba(0,0,0,0.15))]" />
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-[var(--concrete)] bg-white p-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--mute)]">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]">{value}</div>
    </div>
  );
}

function RankingList({
  items,
  renderRow,
  scrollable = true,
  maxHeightClassName = "max-h-[560px]",
}: {
  items: DisplayCaseItem[];
  renderRow: (item: DisplayCaseItem, index: number) => ReactNode;
  scrollable?: boolean;
  maxHeightClassName?: string;
}) {
  return (
    <div className={scrollable ? `${maxHeightClassName} overflow-y-auto` : undefined}>
      {items.map((item, index) => renderRow(item, index))}
    </div>
  );
}

function formatMetricCount(value: number | null, locale: Locale) {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat(locale, {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function renderSourceHeatRow(
  item: DisplayCaseItem,
  index: number,
  locale: Locale
) {
  return (
    <div key={item.slug} className="grid grid-cols-[34px_56px_1fr_82px] items-center gap-4 border-b border-[var(--concrete)] px-5 py-3 last:border-b-0">
      <span className={`font-mono text-xs ${index < 3 ? "text-[var(--orange)]" : "text-[var(--mute)]"}`}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <Link href={`/cases/${item.slug}`}>
        <MediaTile
          item={item}
          locale={locale}
          className="aspect-square"
          showCategory={false}
          vivid
          useThumbnail
        />
      </Link>
      <div>
        <Link href={`/cases/${item.slug}`} className="font-semibold leading-tight hover:text-[var(--orange)]">
          {item.title}
        </Link>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.04em] text-[var(--mute)]">
          {categoryLabels[locale][item.category]} · {item.source} ·{" "}
          {locale === "en" ? "Interactions" : "原始互动"}{" "}
          {formatMetricCount(item.sourceInteractionCount, locale)}
        </div>
      </div>
      <div className="text-right font-mono text-xs">
        {locale === "en" ? "Heat" : "热度"}{" "}
        <b className="text-[var(--orange)]">{item.sourceHeatScore}</b>
      </div>
    </div>
  );
}

function renderStabilityRow(
  item: DisplayCaseItem,
  index: number,
  locale: Locale
) {
  return (
    <div
      key={item.slug}
      className="grid grid-cols-[30px_50px_minmax(0,1fr)_70px] items-center gap-3 border-b border-[var(--concrete)] px-5 py-4 last:border-b-0 md:grid-cols-[34px_56px_minmax(0,1fr)_112px_72px] md:gap-4"
    >
      <span className={`font-mono text-xs ${index < 2 ? "text-[var(--orange)]" : "text-[var(--mute)]"}`}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <Link href={`/cases/${item.slug}#prompt`}>
        <EvidenceTile item={item} />
      </Link>
      <div>
        <Link href={`/cases/${item.slug}#prompt`} className="font-semibold leading-tight hover:text-[var(--orange)]">
          {item.title}
        </Link>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.04em] text-[var(--mute)]">
          {locale === "en" ? "Sample=Beta" : "样本=Beta"} ·{" "}
          {item.recommendedModels.slice(0, 2).join(" / ")}
        </div>
      </div>
      <div className="hidden flex-wrap gap-1 md:flex">
        {item.recommendedModels.slice(0, 2).map((model) => (
          <span key={model} className="border border-[var(--concrete)] px-1.5 py-1 font-mono text-[9px] text-[var(--mute)]">
            {model}
          </span>
        ))}
      </div>
      <div className="text-right font-mono text-xs">
        <b className="text-[var(--orange)]">
          {formatStabilityScore(item.stabilityScore, locale, item.evidenceLevel)}
          {resolveStabilityState(item.stabilityScore, item.evidenceLevel) ===
          "measured"
            ? "%"
            : ""}
        </b>
      </div>
    </div>
  );
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = await getLocaleFromParams(params);
  const isEnglish = locale === "en";
  const messages = getMessages(locale);
  const {
    featuredCase,
    totalCaseCount,
    totalCreatorCount,
    recentCaseCount24h,
    featuredCreators,
    spreadLeaderboard,
    sourceHeatLeaderboard,
    stabilityLeaderboard,
    weeklyHot,
    modelStrip,
  } = await getHomeData(locale);

  // 副题跟着实际产出的窗口档位走，不写死「过去七天」，见 src/lib/weekly-hot.ts。
  const weeklyHotSub = {
    week: messages.weeklyHot.subWeek,
    fortnight: messages.weeklyHot.subFortnight,
    latest: messages.weeklyHot.subLatest,
  }[weeklyHot.window];

  // 「原始 / 分散」拼贴卡里的摘要片段；过滤套话 + 复用方法兜底，两者都没有
  // 时是 null，下面按 case-card.tsx 的写法不渲染这段，不留空 <p>。
  const featuredCaseSummary = getPresentableCaseSummary(
    featuredCase.summary,
    featuredCase.promptContributionNotes
  );

  const previewCases = uniqueCases([
    ...spreadLeaderboard,
    ...sourceHeatLeaderboard,
    ...stabilityLeaderboard,
  ]);
  // 首页深度 Case 区在客户端翻页，一次取好整池，翻页不再回源。
  const evidenceCases = previewCases.slice(0, 24);

  const heroTopCases = uniqueCases([
    ...sourceHeatLeaderboard,
    ...stabilityLeaderboard,
  ]).slice(0, 3);
  const heroTopLabel =
    sourceHeatLeaderboard.length > 0
      ? isEnglish
        ? "Top source-interaction cases · Top 3"
        : "来源互动领先 Case · Top3"
      : isEnglish
        ? "Top stability cases · Top 3"
        : "稳定分领先 Case · Top3";
  const heroTopCreator = featuredCreators[0];

  return (
    <SiteShell
      footerNote={
        isEnglish
          ? "GoodCase.ai · Real cases, creators, and retest evidence, continuously updated."
          : "GoodCase.ai · 真实 Case、作者与复测证据持续更新。"
      }
    >
      <section className="grid min-w-0 gap-10 py-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(560px,1fr)] lg:items-end lg:py-8">
        <article className="min-w-0">
          <h1 className="mt-4 max-w-full text-5xl font-medium leading-[0.94] tracking-[-0.04em] text-[var(--ink)] sm:text-[3.5rem] lg:text-[3.75rem] xl:text-[4.25rem]">
            <span className="block">
              {isEnglish ? "See what " : "看清什么"}
              <span className="text-[var(--orange)]">
                {isEnglish ? "actually works" : "真有效"}
              </span>
            </span>
            <span className="mt-2 block">
              {isEnglish
                ? "Follow the people who ship."
                : "关注直接输出的人。"}
            </span>
          </h1>
          <p className="mt-5 max-w-xl break-words text-base leading-8 text-[var(--mute)]">
            {isEnglish
              ? "GoodCase.ai tracks AI cases in circulation and brings the work, creator, method, original source, and retest evidence back onto one page."
              : "GoodCase.ai 追踪正在传播的 AI Case，把作品、作者、方法、原始来源与复测证据放回同一个页面。"}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="gc-btn gc-btn-primary" href="/cases">
              {isEnglish ? "View rankings" : "查看榜单"} <span>→</span>
            </Link>
            <Link className="gc-btn" href="/connect">
              {isEnglish ? "Agent access" : "Agent 接入"} <span>→</span>
            </Link>
            <Link className="gc-btn gc-btn-ghost" href="/submit">
              {isEnglish ? "Submit a case" : "提交案例"}
            </Link>
          </div>
          {/*
            每日早报入口。放在主 CTA 下面、统计行上面：想每天回来的人一眼看得到，
            又不跟「查看榜单」抢首屏的主动作。样式压到一行细边框，不做成第四个按钮。
          */}
          <Link
            href="/daily"
            className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-l-2 border-[var(--orange)] pl-3 transition hover:bg-[var(--paper-2)]"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--orange)]">
              {isEnglish ? "Daily digest" : "今日早报"}
            </span>
            <span className="text-sm leading-6 text-[var(--mute)]">
              {isEnglish
                ? "One new hit and one retested older hit, two cases every day."
                : "一条新爆款，一条复测过的旧爆款，每天两条。"}
            </span>
            <span className="font-mono text-xs text-[var(--orange)]">→</span>
          </Link>

          <div className="mt-6 flex flex-wrap gap-5 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--mute)]">
            {/* 近 24 小时新增：没有数据（mock 兜底）或为 0 时整个 span 不渲染。 */}
            {recentCaseCount24h ? (
              <span>
                <b className="text-[var(--orange)]">+{recentCaseCount24h}</b>{" "}
                {isEnglish ? "in 24h" : "24 小时新增"}
              </span>
            ) : null}
            <span>
              <b className="text-[var(--ink)]">{totalCaseCount}</b>{" "}
              {isEnglish ? "cases" : "个案例"}
            </span>
            <span>
              <b className="text-[var(--ink)]">{totalCreatorCount}</b>{" "}
              {isEnglish ? "creators" : "位创作者"}
            </span>
            <span>
              <b className="text-[var(--ink)]">{evidenceCases.length}</b>{" "}
              {isEnglish ? "deep cases" : "个深度案例"}
            </span>
          </div>
        </article>

        <article className="relative min-w-0 border border-[var(--hair)] bg-white shadow-[0_44px_90px_-52px_rgba(10,10,10,0.7)]">
          <div className="flex min-w-0 items-center justify-between gap-2 border-b border-[var(--hair)] bg-[var(--paper-2)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--mute)]">
            <span>{isEnglish ? "Current sample · Beta" : "当前样本 · Beta"}</span>
            <span className="text-[var(--orange)]">
              ● {isEnglish ? "Case collection" : "案例合集"}
            </span>
          </div>

          <div className="border-b border-[var(--hair)] p-4">
            <div className="mb-3 flex justify-between font-mono text-[10px] uppercase tracking-[0.09em] text-[var(--mute)]">
              <span>{heroTopLabel}</span>
              <span className="text-[var(--orange)]">
                {sourceHeatLeaderboard.length > 0
                  ? isEnglish
                    ? "● Source"
                    : "● 来源"
                  : isEnglish
                    ? "● Evidence"
                    : "● 证据"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-px border border-[var(--hair)] bg-[var(--hair)]">
              {heroTopCases.map((item, index) => (
                <Link key={item.slug} href={`/cases/${item.slug}`} className="group block bg-white">
                  <MediaTile item={item} locale={locale} rank={`#0${index + 1}`} className="aspect-[3/4] w-full" useThumbnail hoverReveal priority />
                </Link>
              ))}
            </div>
          </div>

          <div className="border-b border-[var(--hair)] p-4">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.09em] text-[var(--mute)]">
              {isEnglish ? "Featured creator" : "最厉害的人 · Creator"}
            </div>
            <Link href={`/creators/${heroTopCreator.slug}`} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-3">
                <CreatorAvatar
                  name={heroTopCreator.name}
                  avatarUrl={heroTopCreator.avatarUrl}
                  size={40}
                />
                <span>
                  <span className="block font-semibold leading-tight">{heroTopCreator.name}</span>
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.04em] text-[var(--mute)]">
                    {heroTopCreator.highlightedLabel}
                  </span>
                </span>
              </span>
              <span className="font-mono text-xs text-[var(--orange)]">→</span>
            </Link>
          </div>

        </article>
      </section>

      <ModelStrip items={modelStrip} locale={locale} />

      {/*
        本周最热放在模型条之后、榜单之前。
        首页原本从头到尾都是全库口径：Top3、模型条、两个总榜、深度 Case，没有一处
        回答「这一周发生了什么」。把时间最近的一块放在这里，整页就读成一条从此刻
        到archive 的时间线（当下在用的模型 → 本周 → 历史总榜 → 深度阅读）。
        放到榜单之后就会被两个十行滚动列表压在下面，正好丢掉「活着」这个信号。
      */}
      {weeklyHot.items.length > 0 ? (
        <section className="gc-section">
          <div className="gc-section-head">
            <div className="gc-section-id">
              § 01 · {messages.weeklyHot.sectionId}
            </div>
            <div>
              <h2 className="gc-section-title text-4xl">
                {messages.weeklyHot.title}
              </h2>
              <p className="gc-section-sub">{weeklyHotSub}</p>
            </div>
          </div>
          {/*
            复用 /cases 的紧凑卡片变体和同一套栅格：桌面两行三列，中屏两列，
            移动端单列自然折行。不给这个模块发明新的卡片形态。
          */}
          <div className="grid gap-0 border-l border-t border-[var(--hair)] md:grid-cols-2 xl:grid-cols-3">
            {weeklyHot.items.map((item) => (
              <CaseCard
                key={item.slug}
                variant="gallery"
                item={toCaseCardItem(item)}
              />
            ))}
          </div>
          <div className="flex justify-end border-b border-l border-r border-[var(--hair)] px-5 py-4">
            <Link href="/cases" className="gc-action">
              {messages.weeklyHot.viewAll} →
            </Link>
          </div>
        </section>
      ) : null}

      {/*
        顶部导航的「排行榜」跳的就是这里。scroll-mt 是给 sticky header 让位的：
        不留这段边距，锚点会把标题正好顶到吸顶条底下，看起来像是跳歪了。

        三档对应 header 实测的三种高度：窄屏 logo、语言/接入、导航各占一行
        （约 182px）；sm 起导航不再撑满宽度，收成两行（约 126px）；md 起挤回
        一行（约 71px）。宁可多留几像素，也不能让标题被吸顶条压掉。
      */}
      <section
        id={HOME_RANKINGS_ANCHOR}
        className="gc-section scroll-mt-48 sm:scroll-mt-32 md:scroll-mt-24"
      >
        <div className="gc-section-head">
          <div className="gc-section-id">
            § 02 · {isEnglish ? "Rankings" : "榜单"}
          </div>
        </div>
        <div className="grid border-t border-[var(--hair)] lg:grid-cols-2">
          <article className="border border-t-0 border-[var(--hair)] bg-white">
            <div className="border-b border-[var(--hair)] px-5 py-4">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">
                <span className="mr-2 inline-block size-2 bg-[var(--orange)]" />
                {isEnglish ? "Source Heat Ranking" : "来源互动榜"}
              </h2>
            </div>
            {sourceHeatLeaderboard.length > 0 ? (
              <RankingList
                items={sourceHeatLeaderboard}
                renderRow={(item, index) =>
                  renderSourceHeatRow(item, index, locale)
                }
              />
            ) : (
              <div className="px-5 py-10 text-sm leading-7 text-[var(--mute)]">
                {isEnglish
                  ? "No verifiable source-interaction snapshot is available yet. A case enters this ranking only after real likes, comments, reposts, saves, and capture time are connected."
                  : "尚无可核验的来源互动快照。接入真实点赞、评论、转发、收藏和采集时间后才进入榜单；旧“喜爱分”不会顶替。"}
              </div>
            )}
            {/*
              来源热度是 /cases 的默认排序，不把 sort=heat 写进 URL，
              避免同一内容出现两个 URL（见 src/app/[lang]/cases/page.tsx 的 DEFAULT_SORT 注释）。
            */}
            <div className="flex justify-end border-t border-[var(--hair)] px-5 py-4">
              <Link href="/cases" className="gc-action">
                {messages.homeRankings.viewHeat} →
              </Link>
            </div>
          </article>

          <article className="border border-t-0 border-[var(--hair)] bg-white lg:border-l-0">
            <div className="flex justify-between border-b border-[var(--hair)] px-5 py-4">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">
                <span className="mr-2 inline-block size-2 bg-[var(--orange)]" />
                {isEnglish
                  ? "Stability Ranking"
                  : "Stability Ranking · 稳定榜"}
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--mute)]">
                {isEnglish ? "Beta experiment" : "Beta 实验"}
              </span>
            </div>
            <RankingList
              items={stabilityLeaderboard}
              renderRow={(item, index) =>
                renderStabilityRow(item, index, locale)
              }
            />
            <div className="flex justify-end border-t border-[var(--hair)] px-5 py-4">
              <Link href="/cases?sort=stability" className="gc-action">
                {messages.homeRankings.viewStability} →
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="gc-section">
        <div className="gc-section-head">
          <div className="gc-section-id">
            § 03 · {isEnglish ? "Deep cases" : "深度 Case"}
          </div>
          <div>
            <h2 className="gc-section-title text-4xl">
              {isEnglish
                ? "From the finished work to the retest method."
                : "从作品结果，一直读到复测方法。"}
            </h2>
          </div>
        </div>
        <HomeCaseDeck
          locale={locale}
          labels={{
            previewTag: isEnglish ? "Preview" : "Preview",
            stability: isEnglish ? "Stability" : "稳定参考",
            viewPrompt: isEnglish ? "View prompt" : "查看提示语",
            prev: isEnglish ? "Prev" : "上一屏",
            next: isEnglish ? "Next" : "下一屏",
          }}
          items={evidenceCases.map((item) => ({
            slug: item.slug,
            title: item.title,
            summary: getPresentableCaseSummary(
              item.summary,
              item.promptContributionNotes
            ),
            creator: item.creator,
            categoryLabel: categoryLabels[locale][item.category],
            stabilityScore: item.stabilityScore,
            evidenceLevel: item.evidenceLevel,
            mediaType: item.mediaType,
            mediaUrl: item.mediaUrl,
            posterUrl: item.posterUrl,
            thumbnailUrl: item.thumbnailUrl,
            thumbnailFit: item.thumbnailFit,
          }))}
        />
      </section>

      <section className="gc-section">
        <div className="gc-section-head">
          <div className="gc-section-id">
            § 04 · {isEnglish ? "Creators" : "创作者"}
          </div>
          <div>
            <h2 className="gc-section-title">
              {isEnglish
                ? "Creators who keep shipping, aggregated from their published cases."
                : "持续出活的作者，按已发布 Case 聚合。"}
            </h2>
          </div>
        </div>
        <div className="grid border-l border-t border-[var(--hair)] md:grid-cols-2 xl:grid-cols-4">
          {featuredCreators.map((creator) => (
            <Link key={creator.slug} href={`/creators/${creator.slug}`} className="flex h-full min-h-80 flex-col border-b border-r border-[var(--hair)] bg-white p-6 transition hover:bg-[var(--paper-2)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <CreatorAvatar
                    name={creator.name}
                    avatarUrl={creator.avatarUrl}
                    size={48}
                  />
                  <span>
                    <span className="block font-semibold">{creator.name}</span>
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--mute)]">
                      {categoryLabels[locale][creator.primaryCategory]} · {creator.sourceFootprint.slice(0, 2).join(" / ")}
                    </span>
                  </span>
                </div>
                <span className="border border-[var(--orange)] px-2 py-1 font-mono text-[10px] text-[var(--orange)]">
                  🌟 {isEnglish ? "Editor’s pick" : "编辑精选"}
                </span>
              </div>
              <p className="mt-6 text-sm leading-7 text-[var(--mute)]">{creator.bio}</p>
              <div className="mt-auto grid grid-cols-3 gap-2 pt-6">
                <MiniMetric label="Cases" value={creator.caseCount} />
                <MiniMetric
                  label={isEnglish ? "Heat" : "热度"}
                  value={creator.averageSourceHeatScore ?? "—"}
                />
                <MiniMetric
                  label="Stab."
                  value={formatAggregateStability(
                    creator.averageStabilityScore,
                    locale
                  )}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="gc-section">
        <div className="gc-section-head">
          <div className="gc-section-id">
            § 05 · {isEnglish ? "Method" : "方法"}
          </div>
          <div>
            <h2 className="gc-section-title text-4xl">
              {isEnglish
                ? "From scattered hits to reusable methods."
                : "从碎片化爆款，到可复用方法。"}
            </h2>
          </div>
        </div>
        <div className="grid gap-0 border-t border-[var(--hair)] lg:grid-cols-[1fr_48px_1fr]">
          <article className="min-h-[520px] border border-[var(--hair)] bg-[var(--paper-2)] p-7">
            <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--mute)]">
              <span>A · {isEnglish ? "Original / scattered" : "原始 / 分散"}</span>
              <span>{isEnglish ? "Internet" : "互联网"}</span>
            </div>
            <div className="relative mt-8 min-h-[410px]">
              <div className="absolute left-0 top-0 w-[62%] -rotate-2 border border-[var(--hair)] bg-white p-4">
                <div className="font-mono text-[10px] text-[var(--mute)]">{featuredCase.creator} · {featuredCase.source}</div>
                {featuredCaseSummary ? (
                  <p className="mt-2 text-sm leading-6">{featuredCaseSummary}</p>
                ) : null}
              </div>
              <div className="absolute right-0 top-8 h-52 w-[34%] rotate-2">
                <MediaTile item={featuredCase} locale={locale} className="h-full" />
              </div>
              <div className="absolute left-[8%] top-[48%] w-[70%] rotate-1 border border-[var(--hair)] bg-white p-4 font-mono text-[11px] leading-6">
                <span className="text-[var(--mute)]">
                  {isEnglish ? "Prompt excerpt" : "提示词片段"}
                </span>
                <br />
                {featuredCase.promptPreview.slice(0, 120)}...
              </div>
              <div className="absolute bottom-6 right-3 w-[48%] -rotate-2 border border-[var(--hair)] bg-white p-3 font-mono text-[10px] text-[var(--mute)]">
                #AIcase #prompt #model #workflow #creator
              </div>
            </div>
          </article>
          <div className="hidden items-center justify-center lg:flex">
            <span className="font-mono text-3xl text-[var(--orange)]">→</span>
          </div>
          <article className="min-h-[520px] border border-[var(--hair)] bg-white p-7">
            <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--mute)]">
              <span>
                B · {isEnglish ? "Structured case page" : "结构化案例页"}
              </span>
              <span className="text-[var(--orange)]">GoodCase.ai</span>
            </div>
            <div className="mt-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold tracking-[-0.03em]">{featuredCase.title}</h3>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--mute)]">
                    {categoryLabels[locale][featuredCase.category]} · {featuredCase.source}
                  </p>
                </div>
                <span className="bg-[var(--orange)] px-2 py-1 font-mono text-[10px] text-white">
                  #{spreadLeaderboard.findIndex((item) => item.slug === featuredCase.slug) + 1 || 1} Signal
                </span>
              </div>
              {[
                [
                  isEnglish ? "Source" : "来源",
                  `${featuredCase.source} · ${featuredCase.creator}`,
                ],
                [
                  isEnglish ? "Prompt" : "提示词",
                  `${featuredCase.promptPreview.length} ${
                    isEnglish ? "chars · standardized preview" : "字 · 标准化预览"
                  }`,
                ],
                [
                  isEnglish ? "Models tested" : "运行过的模型",
                  featuredCase.recommendedModels.join(" · "),
                ],
                [
                  isEnglish ? "Creator" : "创作者",
                  `${featuredCase.creator} · ${
                    isEnglish ? "pattern owner" : "模式持有者"
                  }`,
                ],
              ].map(([key, value]) => (
                <div key={key} className="grid grid-cols-[116px_1fr] gap-4 border-b border-dashed border-[var(--concrete)] py-4 font-mono text-[11px]">
                  <span className="text-[var(--mute)]">{key}</span>
                  <span>{value}</span>
                </div>
              ))}
              <div className="mt-5 grid grid-cols-3 gap-3">
                <MiniMetric label={isEnglish ? "Signal" : "传播"} value={featuredCase.spreadScore ?? "—"} />
                <MiniMetric
                  label={isEnglish ? "Stable" : "稳定"}
                  value={formatStabilityScore(
                    featuredCase.stabilityScore,
                    locale,
                    featuredCase.evidenceLevel
                  )}
                />
                <MiniMetric label={isEnglish ? "Cost" : "成本"} value={costLabels[featuredCase.costBand]} />
              </div>
              <div className="mt-6 border border-[var(--hair)] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--mute)]">
                  {isEnglish ? "Retest record" : "复测记录"}
                </div>
                <div className="mt-2 text-base font-semibold">
                  {featuredCase.title} · Beta{" "}
                  {isEnglish ? "evidence" : "证据"}
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="gc-section pb-6">
        <div className="grid gap-6 border border-[var(--hair)] bg-[var(--ink)] p-8 text-[var(--paper)] md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--orange-on-dark)]">GoodCase.ai Beta</p>
            <h2 className="mt-5 max-w-3xl text-5xl font-medium leading-[0.98] tracking-[-0.045em] md:text-7xl">
              {isEnglish
                ? "Do more than save cases. Follow the creator to the method."
                : "不只收藏案例，顺着创作者找到方法。"}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/cases" className="gc-btn border-white text-white hover:bg-white hover:text-[var(--ink)]">
              {isEnglish ? "Enter case library" : "进入案例库"}
            </Link>
            <Link href="/creators" className="gc-btn bg-[var(--orange)] text-white hover:bg-white hover:text-[var(--ink)]">
              {isEnglish ? "Browse creators" : "浏览创作者"}
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
