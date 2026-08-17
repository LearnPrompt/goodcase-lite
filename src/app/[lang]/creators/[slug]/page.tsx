import type { Metadata } from "next";
import { socialMetadata } from "@/lib/social-metadata";
import { notFound } from "next/navigation";
import { CaseCard } from "@/components/case-card";
import { CreatorAvatar } from "@/components/creator-avatar";
import { PageHero } from "@/components/page-hero";
import { SiteShell } from "@/components/site-shell";
import { JsonLd } from "@/components/json-ld";
import { LocalizedLink as Link } from "@/components/localized-link";
import { SUPPORTED_LOCALES } from "@/i18n/config";
import { decodeCreatorSlugParam } from "@/lib/creator-slug";
import { getMessages } from "@/i18n/messages";
import { getLocaleFromParams } from "@/i18n/server";
import {
  getCreatorDetailData,
  getCreatorDetailPageData,
  getCreatorListData,
} from "@/lib/cases";
import { formatAggregateStability } from "@/lib/stability";
import { localeAlternates } from "@/lib/seo/alternates";
import {
  buildBreadcrumbSchema,
  buildCreatorSchema,
} from "@/lib/seo/structured-data";

// 内容只在运营发布时变，发布会触发部署，新部署自带一份空的 ISR 缓存。间隔越短，
// 边缘副本被清掉重推得越频繁，大陆用户吃冷缓存的次数就越多。和案例详情页取同一档：
// 兜底一天一次，新鲜度交给部署。详细理由见 src/app/[lang]/page.tsx。
export const revalidate = 86_400;

export async function generateStaticParams() {
  const creators = await getCreatorListData();
  return SUPPORTED_LOCALES.flatMap((lang) =>
    creators.map((creator) => ({ lang, slug: creator.slug }))
  );
}

// 关掉按需渲染，是为了让不存在的 slug 拿到真 404（和 cases/[slug] 同一个坑，
// 详见那边的注释：开着的时候 Next 会先把静态外壳按 200 发出去、再流式渲染
// 「页面不存在」，状态码已经改不回来了，这种软 404 会被搜索引擎当成薄内容页收录）。
//
// creator 的 slug 是从数据库案例派生的，新发布的作者要等下一次部署才有页面——
// 这个取舍和 cases/[slug] 已经接受的一样：发布/下架会触发 Deploy Hook 全站重建。
export const dynamicParams = false;

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
  const { slug: rawSlug } = await params;
  const slug = decodeCreatorSlugParam(rawSlug);
  const creator = await getCreatorDetailData(slug, locale);

  if (!creator) {
    // 提前触发 404，避免流式渲染下先发 200 再渲染 not-found（软 404）。
    notFound();
  }

  const description = truncateDescription(creator.bio);

  return {
    title: creator.name,
    description,
    alternates: localeAlternates(locale, `/creators/${slug}`),
    ...socialMetadata({
      locale,
      title: creator.name,
      description,
      path: `/creators/${slug}`,
      type: "profile",
    }),
  };
}

export default async function CreatorDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const locale = await getLocaleFromParams(params);
  const messages = getMessages(locale);
  const isEnglish = locale === "en";
  const { slug: rawSlug } = await params;
  const slug = decodeCreatorSlugParam(rawSlug);
  const { creator, methods, representativeCaseSkills } =
    await getCreatorDetailPageData(slug, locale);

  if (!creator) {
    notFound();
  }

  const creatorSchema = buildCreatorSchema({
    locale,
    slug: creator.slug,
    name: creator.name,
    avatarUrl: creator.avatarUrl,
    bio: creator.bio,
  });
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [
    { name: isEnglish ? "Home" : "首页", path: "/" },
    { name: isEnglish ? "Creators" : "创作者", path: "/creators" },
    { name: creator.name, path: `/creators/${creator.slug}` },
  ]);

  return (
    <SiteShell
      footerNote={
        isEnglish
          ? "Creator pages aggregate existing cases so every judgment traces back to the work."
          : "Creator 页只聚合已有 Case，所有判断都能回到作品证据。"
      }
    >
      <JsonLd data={[creatorSchema, breadcrumbSchema]} />
      <PageHero
        eyebrow={`Creator · ${creator.highlightedLabel}`}
        title={creator.name}
        description={creator.bio}
      >
        <div className="col-span-2 flex items-center gap-4">
          <CreatorAvatar
            name={creator.name}
            avatarUrl={creator.avatarUrl}
            size={72}
          />
          <div>
            <div className="gc-stat-label">
              {isEnglish ? "Creator profile" : "创作者资料"}
            </div>
            <div className="mt-1 text-lg font-semibold">{creator.name}</div>
          </div>
        </div>
        <div>
          <div className="gc-stat-label">{messages.common.cases}</div>
          <div className="gc-stat-value">{creator.caseCount}</div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            {creator.sourceFootprint.join(" / ")}
          </div>
        </div>
        <div>
          <div className="gc-stat-label">{isEnglish ? "Average" : "平均值"}</div>
          <div className="gc-stat-value">
            {formatAggregateStability(creator.averageStabilityScore, locale)}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            Stability
          </div>
        </div>
        <div>
          <div className="gc-stat-label">
            {isEnglish ? "Source interactions" : "来源互动"}
          </div>
          <div className="gc-stat-value">{creator.totalSourceInteractions || "—"}</div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            Total
          </div>
        </div>
        <div>
          <div className="gc-stat-label">{messages.common.evidence}</div>
          <div className="gc-stat-value">
            {
              creator.representativeCases.filter(
                (item) => item.evidenceLevel === "L1" || item.evidenceLevel === "L2"
              ).length
            }
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            L1 / L2 Cases
          </div>
        </div>
        {creator.latestWorkDate ? (
          <div className="col-span-2">
            <div className="gc-stat-label">{messages.common.latestWork}</div>
            <div className="gc-stat-value font-mono">{creator.latestWorkDate}</div>
            <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
              {isEnglish
                ? "Newest sourcePublishedAt across published cases"
                : "已发布 Case 里最新的来源发布时间"}
            </div>
          </div>
        ) : null}
      </PageHero>

      {methods.length > 0 ? (
        <section className="gc-section">
          <div className="gc-section-head">
            <p className="gc-section-id">
              {isEnglish ? "Creator methods" : "作者标志性方法"}
            </p>
            <div>
              <h2 className="gc-section-title">
                {isEnglish
                  ? "Repeated work becomes a method."
                  : "从重复作品里找方法。"}
              </h2>
              <p className="gc-section-sub">
                {isEnglish
                  ? "A creator method appears only when the same pattern is evidenced by at least three published cases. Popularity alone does not create one."
                  : "只有同一作者至少 3 个已发布 Case 重复出现同类做法，才会形成作者方法；作者热度本身不能生成方法。"}
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {methods.map((method) => (
              <Link
                key={method.slug}
                href={`/skills/${method.slug}`}
                className="gc-card group p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="gc-chip gc-chip-accent">
                    {isEnglish ? "Creator method" : "作者方法"}
                  </span>
                  <span className="font-mono text-[10px] uppercase text-[var(--muted)]">
                    {method.caseCount} Cases
                  </span>
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">
                  {method.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {method.description}
                </p>
                <span className="mt-5 block text-sm font-semibold transition group-hover:text-[var(--orange)]">
                  {isEnglish ? "Open method evidence" : "查看方法证据"} →
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="gc-section">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--hair)] pb-6">
          <div>
            <p className="gc-eyebrow">
              {isEnglish ? "Representative cases" : "代表案例"}
            </p>
            <h2 className="mt-3 text-4xl font-medium leading-[0.95] tracking-[-0.04em]">
              {isEnglish
                ? "Start with the representative work."
                : "从代表 Case 开始判断。"}
            </h2>
          </div>
          <Link
            href="/creators"
            className="gc-action"
          >
            {isEnglish ? "Back to creators" : "返回创作者索引"}
          </Link>
        </div>
        <div className="grid border-l border-t border-[var(--hair)] md:grid-cols-2 xl:grid-cols-3">
          {creator.representativeCases.map((item) => (
            <CaseCard
              key={item.slug}
              item={{
                ...item,
                skills: representativeCaseSkills.get(item.slug) ?? [],
              }}
            />
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
