import type { Metadata } from "next";
import { socialMetadata } from "@/lib/social-metadata";
import { notFound } from "next/navigation";
import { CaseCard } from "@/components/case-card";
import { FavoriteButton } from "@/components/favorite-button";
import { LikeButton } from "@/components/like-button";
import { PageHero } from "@/components/page-hero";
import { SiteShell } from "@/components/site-shell";
import { CASES_PAGE_SIZE } from "@/components/pagination";
import { JsonLd } from "@/components/json-ld";
import { LocalizedLink as Link } from "@/components/localized-link";
import { localizeHref, SUPPORTED_LOCALES } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getLocaleFromParams } from "@/i18n/server";
import { getCaseListData } from "@/lib/cases";
import { toCaseCardItem } from "@/lib/case-card-item";
import {
  filterCasesByModel,
  getModelFamily,
  getModelLabel,
  MODEL_FAMILIES,
} from "@/lib/models";
import { deriveSkillCatalog, getCaseSkillLinks } from "@/lib/skills";
import { localeAlternates } from "@/lib/seo/alternates";
import {
  buildBreadcrumbSchema,
  buildModelCollectionSchema,
} from "@/lib/seo/structured-data";
import { absoluteUrl } from "@/lib/site";

// 模型页内容只在发布新 case 时才变，而发布会触发一次全站部署，
// 这里的 revalidate 纯粹当兜底，一天一次足够。
export const revalidate = 86_400;

/**
 * 模型页只渲染前这么多条 Case，剩下的交给 /cases?model=<slug>。
 *
 * 为什么不在这里做 URL 分页：这个页面靠 generateStaticParams 在构建期预渲染（路由表里的
 * ●），运行期零 Supabase 查询，还能吃到 ISR 和边缘缓存。一旦读 searchParams，Next 会把它
 * 判定成每请求渲染（ƒ），上面那些全部作废。/cases?model=<slug> 本来就支持按模型筛选 +
 * 分页，长列表交给它更划算。
 *
 * 上限取 CASES_PAGE_SIZE（24）而不是另拍一个数：
 * 1. 24 同时是 2 和 3 的倍数，md 两列 / xl 三列都刚好填满整行，不会留半行空格；
 * 2. 跟「查看全部」跳过去的 /cases?model= 每页条数一致，用户前后看到的节奏对得上；
 * 3. gpt-image-2 这种 78 条的大模型页，78 → 24 能砍掉约三分之二的传输体积。
 */
const MODEL_PAGE_CASE_LIMIT = CASES_PAGE_SIZE;

type PageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

/**
 * 之前这里刻意不做 generateStaticParams：预渲染每个模型页会在构建期额外触发
 * 注册表条数 × 语言数 次全表查询，曾把 Vercel 构建拖到 Supabase 12s 超时。
 *
 * 现在数据层已经改成瘦列取数（getCaseListData 不再拉全表），代价降下来了，
 * 重新加回来是安全的。
 */
export function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((lang) =>
    MODEL_FAMILIES.map((family) => ({ lang, slug: family.slug }))
  );
}

// 关掉按需渲染，是为了让不存在的 slug 拿到真 404（和 cases/[slug] 同一个坑，
// 详见那边的注释：开着的时候 Next 会先把静态外壳按 200 发出去、再流式渲染
// 「页面不存在」，状态码已经改不回来了，这种软 404 会被搜索引擎当成薄内容页收录）。
//
// MODEL_FAMILIES 是编译期常量（src/lib/models.ts），不是从数据库派生的——
// 新增模型本来就要改代码 + 重新部署，构建期枚举已经覆盖全部合法 slug，关掉
// 按需渲染不会漏掉任何真实模型。
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocaleFromParams(params);
  const family = getModelFamily(slug);
  if (!family) {
    // 之前这里直接 return {}，metadata 完全没声明就会原样继承
    // [lang]/layout.tsx 那份写死的首页 alternates.languages——这正是
    // 线上 /models/nano-banana 的 hreflang 全部指向首页的根因（见
    // src/lib/seo/alternates.ts 顶部注释）。挂一条 noindex，别让继承下来的
    // 错误 hreflang 跟着这个本该 404 的页面一起被抓取。
    return { robots: { index: false, follow: false } };
  }

  const isEnglish = locale === "en";
  const label = getModelLabel(family, locale);
  const title = isEnglish
    ? `${label} cases and prompts`
    : `${label} 案例与 Prompt`;
  const description = isEnglish
    ? `Published GoodCase examples made with ${label}, each with the full prompt, creator, and original source.`
    : `GoodCase 已收录的 ${label} 案例，每条都带完整 Prompt、作者与原始来源。`;

  return {
    title,
    description,
    ...socialMetadata({
      locale,
      title,
      description,
      path: `/models/${family.slug}`,
    }),
    alternates: localeAlternates(locale, `/models/${family.slug}`),
  };
}

export default async function ModelDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getLocaleFromParams(params);
  const family = getModelFamily(slug);
  if (!family) {
    notFound();
  }

  const isEnglish = locale === "en";
  const messages = getMessages(locale);
  const label = getModelLabel(family, locale);
  const allCases = await getCaseListData("all", locale);
  const caseItems = filterCasesByModel(allCases, family.slug);
  const skillCatalog = deriveSkillCatalog(caseItems, locale);
  // 排序沿用 filterCasesByModel 给出的既有顺序，这里只截断，不重排。
  const visibleCaseItems = caseItems.slice(0, MODEL_PAGE_CASE_LIMIT);
  const hasMoreCases = caseItems.length > visibleCaseItems.length;
  const modelSchema = buildModelCollectionSchema({
    locale,
    slug: family.slug,
    label,
    totalCount: caseItems.length,
    itemUrls: visibleCaseItems.map((item) =>
      absoluteUrl(localizeHref(locale, `/cases/${item.slug}`))
    ),
  });
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [
    { name: isEnglish ? "Home" : "首页", path: "/" },
    { name: isEnglish ? "Models" : "模型", path: "/models" },
    { name: label, path: `/models/${family.slug}` },
  ]);

  return (
    <SiteShell
      footerNote={
        isEnglish
          ? "Model pages are derived from published cases, not from vendor announcements."
          : "模型页由已发布 Case 派生，不来自厂商通稿。"
      }
    >
      <JsonLd data={[modelSchema, breadcrumbSchema]} />
      <PageHero
        eyebrow={`${messages.model.media[family.media]} · ${label}`}
        title={
          isEnglish
            ? `${label} ${messages.model.pageTitle}`
            : `${label} ${messages.model.pageTitle}`
        }
        description={messages.model.pageDescription}
      >
        <div>
          <div className="gc-stat-label">
            {isEnglish ? "Cases" : "案例"}
          </div>
          <div className="gc-stat-value">{caseItems.length}</div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            {isEnglish ? "Published" : "已发布"}
          </div>
        </div>
        <div>
          <div className="gc-stat-label">
            {isEnglish ? "Medium" : "媒介"}
          </div>
          <div className="gc-stat-value">
            {messages.model.media[family.media]}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            {isEnglish ? "Primary" : "主要"}
          </div>
        </div>
      </PageHero>

      <section className="flex flex-wrap items-center gap-3 border-b border-[var(--hair)] py-4">
        <Link href="/models" className="gc-action">
          ← {messages.model.backToAll}
        </Link>
        <Link href="/cases" className="gc-action">
          {isEnglish ? "All cases" : "全部案例"} →
        </Link>
      </section>

      {caseItems.length === 0 ? (
        <section className="gc-empty-state mt-7">
          <p className="text-lg font-semibold text-[var(--ink)]">
            {messages.model.empty}
          </p>
          <div>
            <Link href="/submit" className="gc-action gc-action-primary">
              {isEnglish ? "Submit a case" : "提交好案例"}
            </Link>
          </div>
        </section>
      ) : (
        <>
        <section className="grid gap-0 border-l border-t border-[var(--hair)] md:grid-cols-2 xl:grid-cols-3">
          {visibleCaseItems.map((item) => (
            <CaseCard
              key={item.slug}
              variant="gallery"
              item={toCaseCardItem(item, getCaseSkillLinks(skillCatalog, item.slug))}
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  <LikeButton
                    caseSlug={item.slug}
                    initialCount={item.likedCount}
                  />
                  <FavoriteButton caseSlug={item.slug} />
                </div>
              }
            />
          ))}
        </section>

        {hasMoreCases ? (
          // 版式对齐 Pagination 组件，让「还有更多」在模型页和列表页看起来是同一个东西。
          <nav className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--hair)] py-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
              {isEnglish
                ? `1–${visibleCaseItems.length} of ${caseItems.length}`
                : `第 1–${visibleCaseItems.length} 条，共 ${caseItems.length} 条`}
            </p>
            <Link
              href={`/cases?model=${family.slug}`}
              className="gc-action gc-action-primary"
            >
              {isEnglish
                ? `View all ${caseItems.length} cases`
                : `查看全部 ${caseItems.length} 条案例`}{" "}
              →
            </Link>
          </nav>
        ) : null}
        </>
      )}
    </SiteShell>
  );
}
