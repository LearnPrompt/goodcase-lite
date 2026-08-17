import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseCard } from "@/components/case-card";
import { CreatorAvatar } from "@/components/creator-avatar";
import { SiteShell } from "@/components/site-shell";
import { LikeButton } from "@/components/like-button";
import { FavoriteButton } from "@/components/favorite-button";
import { ShareButton } from "@/components/share-button";
import { PromptPanel } from "@/components/prompt-panel";
import { CaseMedia } from "@/components/case-media";
import { CaseRetestEvidence } from "@/components/case-retest-evidence";
import { CaseReproductions } from "@/components/case-reproductions";
import { TrackEvent } from "@/components/track-event";
import { JsonLd } from "@/components/json-ld";
import { LocalizedLink as Link } from "@/components/localized-link";
import { SUPPORTED_LOCALES, localizeHref } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getLocaleFromParams } from "@/i18n/server";
import {
  getCaseDetailData,
  getCaseDetailPageData,
  getCaseSlugs,
} from "@/lib/cases";
import {
  formatPublishedDate,
  getCaseSeoDescription,
  getPresentableCaseSummary,
} from "@/lib/case-presentation";
import { formatCompactCount } from "@/lib/format-compact-count";
import { MISSING_MODEL } from "@/lib/related-cases";
import { getCaseRetestEvidence } from "@/lib/case-retest-evidence";
import { getCaseReproductions } from "@/lib/case-reproductions";
import { localeAlternates } from "@/lib/seo/alternates";
import {
  buildBreadcrumbSchema,
  buildCaseSchema,
} from "@/lib/seo/structured-data";

function costBandLabel(
  costBand: "low" | "medium" | "high",
  locale: "zh-CN" | "en"
) {
  if (locale === "en") {
    if (costBand === "low") return "Low";
    if (costBand === "medium") return "Medium";
    return "High";
  }
  if (costBand === "low") return "低";
  if (costBand === "medium") return "中";
  return "高";
}

// 详情页内容只在运营点发布时才变，发布会触发一次部署重新生成全站，
// 所以这里放到一天一次，纯粹当兜底，不指望它承担内容更新。
export const revalidate = 86_400;

// 关掉按需渲染，是为了让不存在的 slug 拿到真 404。
//
// 开着的时候 Next 会先把静态外壳按 200 发出去、再流式渲染「页面不存在」，
// 状态码已经改不回来了（实测：补上 slug 列表也一样是 200）。软 404 会被搜索
// 引擎当成薄内容页收进去。关掉之后未列出的 slug 在路由层就被拒，不进渲染、
// 也不打数据库。
//
// 代价是新发布的 Case 要等一次部署才可访问，由发布动作触发 Deploy Hook 补上。
export const dynamicParams = false;

export async function generateStaticParams() {
  // 全量预渲染，让详情页在运行期完全不打 Supabase——它们是站内流量的大头。
  //
  // 之前这里返回空数组，是因为当时每个详情页都要拉全表（gzip 后 783KB），
  // 628 次并发能把构建打挂。现在详情页改成单行取数（约 38KB），代价已经降下来了。
  const slugs = await getCaseSlugs();
  return SUPPORTED_LOCALES.flatMap((lang) =>
    slugs.map((slug) => ({ lang, slug }))
  );
}

function truncateDescription(text: string, maxLength = 160) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1)}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const locale = await getLocaleFromParams(params);
  const { slug } = await params;
  const item = await getCaseDetailData(slug, locale);

  if (!item) {
    // 提前触发 404，避免流式渲染下先发 200 再渲染 not-found（软 404）。
    notFound();
  }

  // 净化器过滤套话/代码原文 + 兜底组装，保证 description 既非空也不会把
  // 组件源代码原样吐进 Google 搜索结果、分享卡或 JSON-LD——见
  // src/lib/case-presentation.ts 的 getCaseSeoDescription 注释。
  const description = truncateDescription(getCaseSeoDescription(item, locale));

  return {
    title: item.title,
    description,
    alternates: localeAlternates(locale, `/cases/${slug}`),
    openGraph: {
      type: "article",
      locale: locale === "en" ? "en_US" : "zh_CN",
      siteName: "GoodCase.ai",
      url: localizeHref(locale, `/cases/${slug}`),
      title: item.title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description,
    },
  };
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const locale = await getLocaleFromParams(params);
  const messages = getMessages(locale);
  const isEnglish = locale === "en";
  const { slug } = await params;
  const [detail, retestEvidence, reproductions] = await Promise.all([
    getCaseDetailPageData(slug, locale),
    getCaseRetestEvidence(slug),
    getCaseReproductions(slug),
  ]);
  const { item, creator, relatedCases, caseSkills, relatedCaseSkills } = detail;

  if (!item) {
    notFound();
  }

  const publishedDate = formatPublishedDate(item.sourcePublishedAt);
  const searchableModels = item.recommendedModels.filter(
    (model) => model !== MISSING_MODEL
  );
  // 原帖真实点赞数是录入时抓取的快照，详情页又是构建期预渲染的静态 HTML，
  // 这个数字不会跟着原帖实时变化——预期行为，不接实时轮询。
  // 为空或 0 时不展示，不留一个只有标签没有数字的空壳。
  const formattedSourceLikeCount = item.sourceLikeCount
    ? formatCompactCount(item.sourceLikeCount)
    : null;
  // 正文摘要过滤套话 + 复用方法兜底；两者都没有（如 real-case-11-servasyy-ai）
  // 时是 null，下面按 case-card.tsx 的写法不渲染这段，不留空 <p>。
  const presentableSummary = getPresentableCaseSummary(
    item.summary,
    item.promptContributionNotes
  );
  // 同一条净化 + 兜底规则也覆盖 JSON-LD——那是 AI 引擎读的那段，绝不能是代码原文。
  const seoDescription = getCaseSeoDescription(item, locale);
  const caseSchema = buildCaseSchema({
    locale,
    slug: item.slug,
    title: item.title,
    description: seoDescription,
    category: item.category,
    mediaUrl: item.mediaUrl,
    posterUrl: item.posterUrl,
    sourcePublishedAt: item.sourcePublishedAt,
    tags: item.tags,
    creatorName: item.creator,
    creatorSlug: creator?.slug,
    sourceUrl: item.sourceUrl,
    recommendedModels: item.recommendedModels,
    promptFull: item.promptFull,
  });
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [
    { name: isEnglish ? "Home" : "首页", path: "/" },
    { name: isEnglish ? "Case Library" : "案例库", path: "/cases" },
    { name: item.title, path: `/cases/${item.slug}` },
  ]);

  return (
    <SiteShell
      footerNote={
        isEnglish
          ? "Each detail page keeps the work, method, creator, and retest evidence in one reading path."
          : "Case 详情页把作品、方法、作者与复测证据放在同一条阅读路径里。"
      }
    >
      <TrackEvent name="case_open" properties={{ caseSlug: item.slug }} />
      <JsonLd data={[caseSchema, breadcrumbSchema]} />
      <section className="grid gap-0 border-b border-[var(--hair)] pb-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:items-start">
        <article className="flex min-w-0 flex-col gap-5 self-start py-8 xl:pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/cases?filter=${item.category}`}
              className="gc-chip gc-chip-accent"
            >
              {messages.category[item.category]}
            </Link>
            <span className="gc-chip">{item.source}</span>
            {publishedDate ? (
              <span className="gc-chip font-mono">{publishedDate}</span>
            ) : null}
            {item.evidenceLevel ? (
              <span className="gc-chip">
                {messages.common.evidence} {item.evidenceLevel}
              </span>
            ) : null}
            {(item.tags ?? []).map((tag) => (
              <Link
                key={tag}
                href={`/cases?q=${encodeURIComponent(tag)}`}
                className="gc-chip"
              >
                #{tag}
              </Link>
            ))}
            {searchableModels.map((model) => (
              <Link
                key={model}
                href={`/cases?q=${encodeURIComponent(model)}`}
                className="gc-chip"
              >
                {model}
              </Link>
            ))}
          </div>
          <h1 className="max-w-[12ch] text-5xl font-medium leading-[0.92] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            {item.title}
          </h1>
          {creator ? (
            <Link
              href={`/creators/${creator.slug}`}
              className="group flex w-fit items-center gap-3"
            >
              <CreatorAvatar
                name={creator.name}
                avatarUrl={creator.avatarUrl}
                size={44}
              />
              <span>
                <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]">
                  {messages.common.creator}
                </span>
                <span className="mt-1 block text-sm font-semibold transition group-hover:text-[var(--orange)]">
                  {creator.name} →
                </span>
              </span>
            </Link>
          ) : (
            <p className="font-mono text-xs text-[var(--muted)]">
              {messages.common.creator} · {item.creator}
            </p>
          )}
          {presentableSummary ? (
            <p className="max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">
              {presentableSummary}
            </p>
          ) : null}
          {item.sourceUrl ? (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="gc-action w-fit"
            >
              {messages.common.originalSource} ↗
            </a>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <LikeButton
              caseSlug={item.slug}
              initialCount={item.likedCount}
            />
            {formattedSourceLikeCount ? (
              // 样式对齐旁边的点赞/收藏按钮（gc-action 的盒子规格），但它是数据
              // 展示不是操作，所以不用 gc-action 类本身——那会带上悬停反色和上浮，
              // 误导用户以为可点。
              <span
                className="inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--hair)] bg-white px-4 text-[0.8125rem] font-semibold text-[var(--muted)]"
                title={messages.interaction.sourceLikeHint}
              >
                {messages.interaction.sourceLikeLabel}{" "}
                <span aria-hidden="true" className="text-[var(--orange)]">♥</span>{" "}
                {formattedSourceLikeCount}
              </span>
            ) : null}
            <FavoriteButton caseSlug={item.slug} />
            <ShareButton caseSlug={item.slug} title={item.title} />
          </div>
        </article>

        <CaseMedia
          mediaType={item.mediaType}
          mediaUrl={item.mediaUrl}
          posterUrl={item.posterUrl}
          thumbnailUrl={item.thumbnailUrl}
          title={item.title}
          sourceUrl={item.sourceUrl}
        />
      </section>

      <section className="grid gap-5 border-b border-[var(--hair)] py-8">
        <PromptPanel
          caseSlug={item.slug}
          promptPreview={item.promptPreview}
          promptFull={item.promptFull}
          contentLocale={item.contentLocale}
          promptTranslationZh={item.promptTranslationZh}
          promptTranslationEn={item.promptTranslationEn}
          promptContributionNotes={item.promptContributionNotes}
          recommendedModels={item.recommendedModels}
          stabilityScore={item.stabilityScore}
          evidenceLevel={item.evidenceLevel}
          costBand={costBandLabel(item.costBand, locale)}
        />

        <CaseRetestEvidence records={retestEvidence} locale={locale} />

        <CaseReproductions
          records={reproductions}
          fallbackPosterUrl={item.posterUrl ?? null}
          locale={locale}
        />

        {caseSkills.length > 0 ? (
          <div className="gc-panel-muted p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="gc-eyebrow">Derived Skill</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                  {isEnglish
                    ? "Reusable methods evidenced by this Case."
                    : "这个 Case 可以学走的方法。"}
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-[var(--muted)]">
                {isEnglish
                  ? "Skills are derived from repeated patterns in published cases. They are not a separate submission type."
                  : "Skill 只从多个已发布 Case 的重复模式中派生，不是另一套投稿内容。"}
              </p>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {caseSkills.map((skill) => (
                <Link
                  key={skill.slug}
                  href={`/skills/${skill.slug}`}
                  className="group border border-[var(--hair)] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[var(--ink)]"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--orange)]">
                    {skill.kind === "creator_method"
                      ? isEnglish
                        ? "Creator method"
                        : "作者方法"
                      : isEnglish
                        ? "Shared skill"
                        : "通用 Skill"}
                  </span>
                  <span className="mt-2 block text-lg font-semibold">
                    {skill.title}
                  </span>
                  <span className="mt-3 block text-sm font-semibold text-[var(--muted)] transition group-hover:text-[var(--ink)]">
                    {isEnglish ? "View evidence" : "查看证据"} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--hair)] bg-[var(--paper-2)] px-4 py-3 text-sm">
            <span className="text-[var(--muted)]">
              {messages.prompt.noSkill}
            </span>
            <Link href="/connect#feedback" className="gc-action">
              {messages.prompt.requestSkill} →
            </Link>
          </div>
        )}

        {creator ? (
          <article className="gc-panel grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="flex items-start gap-4">
              <CreatorAvatar
                name={creator.name}
                avatarUrl={creator.avatarUrl}
                size={64}
              />
              <div>
                <p className="gc-eyebrow">{messages.common.creator}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                  {creator.name}
                </h2>
                <p className="mt-2 max-w-4xl text-sm leading-7 text-[var(--muted)]">{creator.bio}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="gc-chip gc-chip-accent">{creator.highlightedLabel}</span>
                  {creator.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="gc-chip">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <Link href={`/creators/${creator.slug}`} className="gc-action gc-action-primary">
              {messages.common.viewCreator} →
            </Link>
          </article>
        ) : null}
      </section>

      <section className="gc-section">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--hair)] pb-6">
          <div>
            <p className="gc-eyebrow">
              {isEnglish ? "Keep exploring" : "继续探索"}
            </p>
            <h2 className="mt-3 text-4xl font-medium leading-[0.95] tracking-[-0.04em]">
              {isEnglish ? "Explore related cases." : "继续看相关 Case。"}
            </h2>
          </div>
          <Link
            href={`/cases?filter=${item.category}`}
            className="gc-action"
          >
            {isEnglish ? "View all" : "查看全部"}{" "}
            {messages.category[item.category]} Case →
          </Link>
        </div>

        {relatedCases.length > 0 ? (
          <div className="grid border-l border-t border-[var(--hair)] md:grid-cols-2 2xl:grid-cols-3">
            {relatedCases.map((relatedCase) => (
              <CaseCard
                key={relatedCase.slug}
                item={{
                  ...relatedCase,
                  skills: relatedCaseSkills.get(relatedCase.slug) ?? [],
                }}
              />
            ))}
          </div>
        ) : null}
      </section>
    </SiteShell>
  );
}
