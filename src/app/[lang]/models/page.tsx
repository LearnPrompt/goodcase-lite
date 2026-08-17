import type { Metadata } from "next";
import { socialMetadata } from "@/lib/social-metadata";
import { PageHero } from "@/components/page-hero";
import { SiteShell } from "@/components/site-shell";
import { JsonLd } from "@/components/json-ld";
import { LocalizedLink as Link } from "@/components/localized-link";
import { localizeHref, SUPPORTED_LOCALES } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getLocaleFromParams } from "@/i18n/server";
import { getCaseListData } from "@/lib/cases";
import { getModelBrowseItems } from "@/lib/models";
import { localeAlternates } from "@/lib/seo/alternates";
import { buildCollectionListSchema } from "@/lib/seo/structured-data";
import { absoluteUrl } from "@/lib/site";

// 内容只在运营发布时变，发布会触发部署，新部署自带一份空的 ISR 缓存。间隔越短，
// 边缘副本被清掉重推得越频繁，大陆用户吃冷缓存的次数就越多。和首页取同一档：
// 兜底一天一次，新鲜度交给部署。详细理由见 src/app/[lang]/page.tsx。
export const revalidate = 86_400;

// [lang] 是动态段，不加 generateStaticParams 的话上面的 revalidate 完全不起作用——
// 每次请求都会打 Supabase。只有两种语言，直接枚举。
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = await getLocaleFromParams(params);
  const isEnglish = locale === "en";
  const title = isEnglish ? "Browse cases by model" : "按模型浏览案例";
  const description = isEnglish
    ? "Every AI model covered by GoodCase, with the number of published cases and full prompts behind each one."
    : "GoodCase 已覆盖的 AI 模型，每个模型下都有已发布 Case 与完整 Prompt。";

  return {
    title,
    description,
    ...socialMetadata({ locale, title, description, path: "/models" }),
    alternates: localeAlternates(locale, "/models"),
  };
}

export default async function ModelsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = await getLocaleFromParams(params);
  const isEnglish = locale === "en";
  const messages = getMessages(locale);
  const cases = await getCaseListData("all", locale);
  const items = getModelBrowseItems(cases, locale);
  const collectionSchema = buildCollectionListSchema({
    locale,
    path: "/models",
    name: isEnglish ? "Browse cases by model" : "按模型浏览案例",
    items: items.map(({ family, label }) => ({
      name: label,
      url: absoluteUrl(localizeHref(locale, `/models/${family.slug}`)),
    })),
  });

  return (
    <SiteShell
      footerNote={
        isEnglish
          ? "Model coverage follows published cases; it is not a vendor list."
          : "模型覆盖来自已发布 Case，不是厂商清单。"
      }
    >
      <JsonLd data={collectionSchema} />
      <PageHero
        eyebrow={
          isEnglish ? "Models · Case coverage" : "模型 · 案例覆盖"
        }
        title={
          isEnglish
            ? "Browse by the model that made it."
            : "按做出结果的那个模型浏览。"
        }
        description={
          isEnglish
            ? "Each entry counts only published cases whose recommended models match. New models appear here as soon as their first case is published."
            : "这里只统计已发布、且建议模型能对上的 Case。新模型只要有第一条 Case 发布，就会出现在这里。"
        }
      >
        <div>
          <div className="gc-stat-label">
            {isEnglish ? "Models" : "模型"}
          </div>
          <div className="gc-stat-value">{items.length}</div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            {isEnglish ? "Covered" : "已覆盖"}
          </div>
        </div>
        <div>
          <div className="gc-stat-label">
            {isEnglish ? "Cases" : "案例"}
          </div>
          <div className="gc-stat-value">{cases.length}</div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            {isEnglish ? "Published" : "已发布"}
          </div>
        </div>
      </PageHero>

      <section className="grid gap-0 border-l border-t border-[var(--hair)] md:grid-cols-2 xl:grid-cols-3">
        {items.map(({ family, label, count }) => (
          <Link
            key={family.slug}
            href={`/models/${family.slug}`}
            className="group flex flex-col gap-4 border-b border-r border-[var(--hair)] bg-white p-5 transition hover:bg-[var(--paper-2)]"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]">
                {messages.model.media[family.media]}
              </span>
              {family.badge ? (
                <span className="border border-[var(--orange)] px-1 font-mono text-[9px] uppercase leading-4 tracking-[0.08em] text-[var(--orange)]">
                  {family.badge === "new"
                    ? messages.model.badgeNew
                    : messages.model.badgeHot}
                </span>
              ) : null}
            </div>
            <h2 className="text-2xl font-medium tracking-[-0.02em] text-[var(--ink)]">
              {label}
            </h2>
            <p className="mt-auto font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
              <b className="text-[var(--ink)]">{count}</b>{" "}
              {messages.model.caseCount}
              <span className="ml-3 text-[var(--orange)]">→</span>
            </p>
          </Link>
        ))}
      </section>
    </SiteShell>
  );
}
