import type { Metadata } from "next";
import { socialMetadata } from "@/lib/social-metadata";
import { notFound } from "next/navigation";
import { CaseCard } from "@/components/case-card";
import { PageHero } from "@/components/page-hero";
import { SiteShell } from "@/components/site-shell";
import { JsonLd } from "@/components/json-ld";
import { LocalizedLink as Link } from "@/components/localized-link";
import { SUPPORTED_LOCALES } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getLocaleFromParams } from "@/i18n/server";
import {
  getSkillDetailData,
  getSkillSlugs,
} from "@/lib/cases";
import { slugifyCreatorName } from "@/lib/creator-slug";
import {
  getInstallableSkillPackage,
  getSkillDownloadPath,
  getSkillInstallCommand,
  getSkillSourceUrl,
} from "@/lib/installable-skills";
import { localeAlternates } from "@/lib/seo/alternates";
import {
  buildBreadcrumbSchema,
  buildSkillSchema,
} from "@/lib/seo/structured-data";

// 内容只在运营发布时变，发布会触发部署，新部署自带一份空的 ISR 缓存。间隔越短，
// 边缘副本被清掉重推得越频繁，大陆用户吃冷缓存的次数就越多。和案例详情页取同一档：
// 兜底一天一次，新鲜度交给部署。详细理由见 src/app/[lang]/page.tsx。
export const revalidate = 86_400;

export async function generateStaticParams() {
  const slugs = await getSkillSlugs();

  // 构建期守卫：下面的 dynamicParams = false 意味着这里返回的 slug 列表就是
  // 全部会有详情页的 skill，漏掉一个就等于让那个 skill 详情页 404。
  // deriveSkillCatalog 有最小案例数/作者数门槛（SHARED_MIN_CASES /
  // SHARED_MIN_CREATORS），本地没接 Supabase 时走 caseItems mock 兜底，
  // mock 案例本来就凑不够门槛，slugs 为空是预期状态，不能报错——否则本地
  // 开发和 CI 每次构建都会炸。但如果已经接了真实 Supabase 库、slugs 却还是
  // 空的，说明 deriveSkillCatalog 的门槛或者数据本身出了问题：构建仍会
  // 成功（generateStaticParams 返回空数组不算错误），但上线后 /skills/*
  // 全部变成 404，且构建日志完全不会提示，几乎没人会发现。所以这里必须
  // 在构建期就把这种情况炸出来，而不是留到线上才被用户或搜索引擎撞见。
  //
  // 判据照抄 src/lib/sitemap-data.ts 的做法：NEXT_PUBLIC_SUPABASE_URL 与
  // SUPABASE_SERVICE_ROLE_KEY 同时齐全才算「接了真库」。sitemap 那边对同一
  // 情况只 warn 不 throw（少几条 URL 不影响已有页面能否访问），这里是唯一
  // 会真正导致 404 的入口，一处炸够了。
  const hasSupabaseCredentials = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (slugs.length === 0) {
    if (hasSupabaseCredentials) {
      throw new Error(
        "[skills/[slug]] generateStaticParams 接了真库却派生出 0 条 skill，" +
          "dynamicParams=false 会让所有 skill 详情页 404。先查 deriveSkillCatalog " +
          "的门槛（SHARED_MIN_CASES / SHARED_MIN_CREATORS，见 src/lib/skills.ts）" +
          "和当前已发布案例数据，再决定是数据问题还是门槛该调。"
      );
    }
    console.warn(
      "[skills/[slug]] 未检测到 Supabase 凭据，本次走本地 mock 数据构建；" +
        "mock 案例数量不够 deriveSkillCatalog 的门槛，skill 目录为空是预期状态，" +
        "不阻断构建。"
    );
  }

  return SUPPORTED_LOCALES.flatMap((lang) =>
    slugs.map((slug) => ({ lang, slug }))
  );
}

// 关掉按需渲染，是为了让不存在的 slug 拿到真 404（和 cases/[slug] 同一个坑，
// 详见那边的注释：开着的时候 Next 会先把静态外壳按 200 发出去、再流式渲染
// 「页面不存在」，状态码已经改不回来了，这种软 404 会被搜索引擎当成薄内容页收录）。
//
// skill 的 slug 是从数据库案例派生的，新发布的 skill 要等下一次部署才有页面——
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
  const { slug } = await params;
  const skill = await getSkillDetailData(slug, locale);

  if (!skill) {
    notFound();
  }

  const description = truncateDescription(skill.description);
  return {
    title: `${skill.title} · Skill`,
    description,
    alternates: localeAlternates(locale, `/skills/${slug}`),
    ...socialMetadata({
      locale,
      title: `${skill.title} · Skill`,
      description,
      path: `/skills/${slug}`,
      type: "article",
    }),
  };
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const locale = await getLocaleFromParams(params);
  const messages = getMessages(locale);
  const isEnglish = locale === "en";
  const { slug } = await params;
  const skill = await getSkillDetailData(slug, locale);

  if (!skill) {
    notFound();
  }

  const visibleCases = skill.cases.slice(0, 12);
  const visibleCreators = skill.creators.slice(0, 12);
  const installablePackage = getInstallableSkillPackage(skill.slug);
  const skillSchema = buildSkillSchema({
    locale,
    slug: skill.slug,
    title: skill.title,
    description: skill.description,
    cases: skill.cases.slice(0, 20).map((item) => ({
      title: item.title,
      slug: item.slug,
    })),
  });
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [
    { name: isEnglish ? "Home" : "首页", path: "/" },
    { name: isEnglish ? "Skills" : "Skills", path: "/skills" },
    { name: skill.title, path: `/skills/${skill.slug}` },
  ]);

  return (
    <SiteShell
      footerNote={
        isEnglish
          ? "A Skill is a derived reading layer. Every claim must trace back to published Cases."
          : "Skill 是派生阅读层，所有判断都必须能回到已发布 Case。"
      }
    >
      <JsonLd data={[skillSchema, breadcrumbSchema]} />
      <PageHero
        eyebrow={
          skill.kind === "creator_method"
            ? isEnglish
              ? "Skill · Creator method"
              : "Skill · 作者方法"
            : isEnglish
              ? "Skill · Shared method"
              : "Skill · 跨作者通用方法"
        }
        title={skill.title}
        description={skill.description}
      >
        <div>
          <div className="gc-stat-label">{messages.common.cases}</div>
          <div className="gc-stat-value">{skill.caseCount}</div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            {isEnglish ? "Published evidence" : "已发布证据"}
          </div>
        </div>
        <div>
          <div className="gc-stat-label">{messages.common.creator}</div>
          <div className="gc-stat-value">{skill.creatorCount}</div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            {isEnglish ? "Creator evidence" : "作者证据"}
          </div>
        </div>
        <div>
          <div className="gc-stat-label">{isEnglish ? "Category" : "分类"}</div>
          <div className="gc-stat-value">{messages.category[skill.category]}</div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            Case first
          </div>
        </div>
        <div>
          <div className="gc-stat-label">{isEnglish ? "Status" : "生成方式"}</div>
          <div className="gc-stat-value">{isEnglish ? "Derived" : "纯派生"}</div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            {isEnglish ? "No separate submissions" : "无独立投稿"}
          </div>
        </div>
        {skill.latestExampleDate ? (
          <div className="col-span-2">
            <div className="gc-stat-label">{messages.common.latestExample}</div>
            <div className="gc-stat-value font-mono">{skill.latestExampleDate}</div>
            <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
              {isEnglish
                ? "Newest sourcePublishedAt across supporting cases"
                : "支撑证据里最新的来源发布时间"}
            </div>
          </div>
        ) : null}
      </PageHero>

      {installablePackage ? (
        <section className="grid min-w-0 gap-5 border-b border-[var(--hair)] py-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)]">
          <article className="min-w-0 border border-[var(--orange)] bg-[var(--orange)] p-5 text-white sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/75">
                {isEnglish ? "Verified installable Agent Skill" : "已验证 · 可安装 Agent Skill"}
              </p>
              <span className="border border-white/50 px-2 py-1 font-mono text-[10px] uppercase">
                SKILL.md + .skill
              </span>
            </div>
            <h2 className="mt-5 text-3xl font-medium leading-none tracking-[-0.04em]">
              {isEnglish ? "Install into your agent." : "把这套方法装进你的 Agent。"}
            </h2>
            <pre className="mt-5 w-full min-w-0 max-w-full overflow-x-auto border border-white/30 bg-black/20 p-4 font-mono text-xs leading-6 text-white">
              <code>{getSkillInstallCommand(skill.slug)}</code>
            </pre>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                className="gc-action border-white bg-white text-[var(--ink)] hover:bg-[var(--ink)] hover:text-white"
                href={getSkillDownloadPath(skill.slug)}
                download
              >
                {isEnglish ? "Download .skill" : "下载 .skill"} ↓
              </a>
              <a
                className="inline-flex min-h-11 items-center justify-center border border-white bg-transparent px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-[var(--ink)]"
                href={getSkillSourceUrl(skill.slug)}
                target="_blank"
                rel="noreferrer"
              >
                {isEnglish ? "Inspect source" : "查看源码"} ↗
              </a>
            </div>
          </article>

          <aside className="min-w-0 gc-panel-muted p-5 sm:p-6">
            <p className="gc-eyebrow">
              {isEnglish ? "Installation contract" : "安装合约"}
            </p>
            <ul className="mt-4 grid gap-3 text-sm leading-7 text-[var(--muted)]">
              <li>✓ {isEnglish ? "Standard SKILL.md frontmatter" : "标准 SKILL.md frontmatter"}</li>
              <li>✓ {isEnglish ? "Inputs, workflow, output, verification, safety" : "输入、流程、输出、验收、安全边界"}</li>
              <li>✓ {isEnglish ? "Bundled Case evidence and attribution" : "内置 Case 证据与作者署名"}</li>
              <li>✓ {isEnglish ? "Validated and packaged by skill-creator" : "已通过 skill-creator 校验与打包"}</li>
            </ul>
            {skill.kind === "creator_method" ? (
              <p className="mt-5 border-t border-[var(--hair)] pt-4 text-xs leading-6 text-[var(--muted)]">
                {isEnglish
                  ? "This is an unofficial evidence-derived synthesis, not an official Skill published or endorsed by the creator."
                  : "这是基于公开证据的非官方归纳，不代表作者本人发布或背书。"}
              </p>
            ) : null}
          </aside>
        </section>
      ) : null}

      <section className="grid min-w-0 gap-5 border-b border-[var(--hair)] py-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)]">
        <article className="min-w-0 gc-panel p-5 sm:p-6">
          <p className="gc-eyebrow">
            {isEnglish ? "Method skeleton" : "方法骨架"}
          </p>
          <ol className="mt-5 grid gap-3">
            {skill.methodSteps.map((step, index) => (
              <li
                key={step}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-3 border-t border-[var(--hair)] pt-3"
              >
                <span className="font-mono text-sm text-[var(--orange)]">
                  0{index + 1}
                </span>
                <span className="text-base font-semibold leading-7">{step}</span>
              </li>
            ))}
          </ol>
        </article>

        <aside className="min-w-0 gc-panel-muted p-5 sm:p-6">
          <p className="gc-eyebrow">
            {isEnglish ? "Why it exists" : "为什么形成 Skill"}
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            {skill.kind === "creator_method"
              ? isEnglish
                ? `The same method appears in ${skill.caseCount} published cases by one creator. Popularity is not part of the threshold.`
                : `同一作者有 ${skill.caseCount} 个已发布 Case 重复出现这套方法；热度不参与成 Skill 的门槛。`
              : isEnglish
                ? `${skill.caseCount} published cases from ${skill.creatorCount} creators share the same explicit result pattern.`
                : `${skill.creatorCount} 位作者的 ${skill.caseCount} 个已发布 Case 出现同一类明确结果，达到跨作者复用门槛。`}
          </p>
          {skill.generalSkillSlug ? (
            <Link
              href={`/skills/${skill.generalSkillSlug}`}
              className="gc-action mt-5"
            >
              {isEnglish ? "View shared Skill" : "查看跨作者通用 Skill"} →
            </Link>
          ) : null}
        </aside>
      </section>

      <section className="gc-section">
        <div className="gc-section-head">
          <p className="gc-section-id">
            {isEnglish ? "Creator evidence" : "作者证据"}
          </p>
          <div>
            <h2 className="gc-section-title">
              {isEnglish
                ? "Methods stay attached to their makers."
                : "方法归纳出来，作者署名仍然留在证据上。"}
            </h2>
          </div>
        </div>
        <div className="grid border-l border-t border-[var(--hair)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleCreators.map((creator) => {
            const creatorSlug = slugifyCreatorName(creator.name);
            return (
              <Link
                key={creator.name}
                href={`/creators/${creatorSlug}`}
                className="min-h-36 border-b border-r border-[var(--hair)] bg-white p-5 transition hover:bg-[var(--paper-2)]"
              >
                <span className="font-mono text-[10px] uppercase text-[var(--muted)]">
                  {creator.caseCount} Cases
                </span>
                <span className="mt-3 block text-lg font-semibold">
                  {creator.name}
                </span>
                <span className="mt-5 block text-sm font-semibold text-[var(--orange)]">
                  {isEnglish ? "View creator" : "查看作者"} →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="gc-section">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--hair)] pb-6">
          <div>
            <p className="gc-eyebrow">
              {isEnglish ? "Case evidence" : "Case 证据"}
            </p>
            <h2 className="mt-3 text-4xl font-medium leading-[0.95] tracking-[-0.04em]">
              {isEnglish
                ? "Judge the Skill through finished work."
                : "先看作品，再判断这套方法值不值得学。"}
            </h2>
          </div>
          <span className="font-mono text-[10px] uppercase text-[var(--muted)]">
            {visibleCases.length < skill.caseCount
              ? isEnglish
                ? `Showing ${visibleCases.length} of ${skill.caseCount}`
                : `展示 ${visibleCases.length} / ${skill.caseCount}`
              : `${skill.caseCount} Cases`}
          </span>
        </div>
        <div className="grid border-l border-t border-[var(--hair)] md:grid-cols-2 2xl:grid-cols-3">
          {visibleCases.map((item) => (
            <CaseCard
              key={item.slug}
              item={{
                ...item,
                skills: [
                  {
                    slug: skill.slug,
                    title: skill.title,
                    kind: skill.kind,
                  },
                ],
              }}
            />
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
