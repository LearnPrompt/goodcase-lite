import type { Metadata } from "next";
import { socialMetadata } from "@/lib/social-metadata";
import { CreatorCard } from "@/components/creator-card";
import { toCreatorCardItem } from "@/lib/creator-card-item";
import { PageHero } from "@/components/page-hero";
import { SiteShell } from "@/components/site-shell";
import { SearchBox } from "@/components/search-box";
import { CASES_PAGE_SIZE, Pagination } from "@/components/pagination";
import { JsonLd } from "@/components/json-ld";
import { getCreatorListData } from "@/lib/cases";
import { filterCreatorsByQuery, getCreatorSearchFields } from "@/lib/creators";
import { getSearchMatch } from "@/lib/search";
import { localizeHref, SUPPORTED_LOCALES } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getLocaleFromParams } from "@/i18n/server";
import { localeAlternates } from "@/lib/seo/alternates";
import { buildCollectionListSchema } from "@/lib/seo/structured-data";
import { absoluteUrl } from "@/lib/site";

// 内容只在运营发布时变，发布会触发部署重新生成；这里当兜底，一小时一次足够。
export const revalidate = 3_600;

// [lang] 是动态段，不加 generateStaticParams 的话上面的 revalidate 完全不起作用——
// 每次请求都会打 Supabase。只有两种语言，直接枚举。
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

type PageParams = Promise<{ lang: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const locale = await getLocaleFromParams(params);
  const isEnglish = locale === "en";
  const title = isEnglish ? "Creators" : "创作者";
  const description = isEnglish
    ? "Evaluate AI creators through representative work, prompts, model choices, and reusable methods."
    : "先看值得长期跟的 AI 创作者，再从代表案例切进去，学习 Prompt、模型选择与可复用方法。";

  return {
    title,
    description,
    ...socialMetadata({ locale, title, description, path: "/creators" }),
    alternates: localeAlternates(locale, "/creators"),
  };
}

export default async function CreatorsPage({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const locale = await getLocaleFromParams(params);
  const messages = getMessages(locale);
  const isEnglish = locale === "en";
  const allCreators = await getCreatorListData(locale);
  const queryParams = await searchParams;
  const query = queryParams.q?.trim() || "";
  const creators = filterCreatorsByQuery(allCreators, query);

  const totalCount = creators.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / CASES_PAGE_SIZE));
  const requestedPage = Number.parseInt(queryParams.page ?? "1", 10);
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const pagedCreators = creators.slice(
    (currentPage - 1) * CASES_PAGE_SIZE,
    currentPage * CASES_PAGE_SIZE
  );
  const collectionSchema = buildCollectionListSchema({
    locale,
    path: "/creators",
    name: isEnglish ? "Creators" : "创作者",
    items: pagedCreators.map((creator) => ({
      name: creator.name,
      url: absoluteUrl(localizeHref(locale, `/creators/${creator.slug}`)),
    })),
  });

  /** 翻页时保留搜索关键词；第一页不带 page 参数，避免同一内容多个 URL。 */
  const buildPageHref = (page: number) => {
    const parts = [
      query ? `q=${encodeURIComponent(query)}` : "",
      page > 1 ? `page=${page}` : "",
    ].filter(Boolean);
    return parts.length ? `/creators?${parts.join("&")}` : "/creators";
  };

  return (
    <SiteShell
      footerNote={
        isEnglish
          ? "Creators are a view of existing cases, not a separate content library."
          : "Creator 是 Case 的作者视图，不是另一套内容库。"
      }
    >
      <JsonLd data={collectionSchema} />
      <PageHero
        eyebrow={
          isEnglish ? "Creator index · Evidence view" : "Creator index · 作者视图"
        }
        title={
          isEnglish
            ? "Verify the work before deciding whom to follow."
            : "先验证作品，再决定关注谁。"
        }
        description={
          isEnglish
            ? "Every creator in this index is aggregated from collected cases, and each entry traces back to representative work, sources, and retest signals."
            : "创作者由已收录 Case 反向聚合，每个人都能回到代表作品、来源和复测信号。"
        }
      >
        <div>
          <div className="gc-stat-label">
            {isEnglish ? "Creators" : "创作者"}
          </div>
          <div className="gc-stat-value">{totalCount}</div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            {isEnglish
              ? `From cases · page ${currentPage}/${totalPages}`
              : `来自 Case · 第 ${currentPage}/${totalPages} 页`}
          </div>
        </div>
        <div>
          <div className="gc-stat-label">{isEnglish ? "Rule" : "规则"}</div>
          <div className="gc-stat-value">
            {isEnglish ? "Case first" : "Case 优先"}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            {messages.common.evidence}
          </div>
        </div>
      </PageHero>

      <section className="border-b border-[var(--hair)] py-6">
        <SearchBox
          defaultQuery={query}
          action={localizeHref(locale, "/creators")}
          placeholder={messages.search.creatorsPlaceholder}
          ariaLabel={messages.search.creatorsAriaLabel}
          analyticsEvent="creator_search"
        />
      </section>

      {totalCount === 0 ? (
        <section className="gc-empty-state mt-7">
          <p className="text-lg font-semibold text-[var(--ink)]">
            {isEnglish
              ? `No creators found${query ? ` for “${query}”` : ""}.`
              : `没有找到${query ? `与「${query}」相关的` : ""}创作者。`}
          </p>
          <p className="text-sm leading-7 text-[var(--muted)]">
            {isEnglish ? "Try another keyword." : "换个关键词试试。"}
          </p>
        </section>
      ) : (
      <>
      <section className="grid border-l border-t border-[var(--hair)] md:grid-cols-2 xl:grid-cols-3">
        {pagedCreators.map((creator, index) => (
          <CreatorCard
            key={creator.slug}
            creator={toCreatorCardItem(
              creator,
              query
                ? {
                    query,
                    match: getSearchMatch(getCreatorSearchFields(creator), query),
                  }
                : undefined
            )}
            rank={(currentPage - 1) * CASES_PAGE_SIZE + index + 1}
          />
        ))}
      </section>

      <Pagination
        currentPage={currentPage}
        totalItems={totalCount}
        buildHref={buildPageHref}
        locale={locale}
      />
      </>
      )}
    </SiteShell>
  );
}
