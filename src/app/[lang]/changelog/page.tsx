import type { Metadata } from "next";
import { socialMetadata } from "@/lib/social-metadata";
import { LocalizedLink as Link } from "@/components/localized-link";
import { SiteShell } from "@/components/site-shell";
import { SUPPORTED_LOCALES } from "@/i18n/config";
import { getLocaleFromParams } from "@/i18n/server";
import { CHANGELOG, CHANGELOG_EN } from "@/lib/changelog";
import { localeAlternates } from "@/lib/seo/alternates";

// 页面内容全部来自仓库内常量，请求期不取任何数。不枚举 [lang] 的话 Next 只能
// 在请求时渲染，Vercel 对这类响应下发 private/no-store，边缘永远 MISS——实测
// /changelog 每次访问都是 x-vercel-cache: MISS。枚举之后它变成构建期静态页，
// 边缘直接命中，内容随部署更新。
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
  const title = isEnglish ? "Changelog" : "更新日志 · 好案例";
  const description = isEnglish
    ? "GoodCase.ai product updates across search, favorites, RSS, open API, Skill access, and more."
    : "GoodCase.ai 的产品更新日志：搜索、收藏、RSS、公开 API、Skill 接入等功能的上线记录，用人话说清楚每次变化。";

  return {
    title,
    description,
    ...socialMetadata({ locale, title, description, path: "/changelog" }),
    alternates: localeAlternates(locale, "/changelog"),
  };
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${year}.${month}.${day}`;
}

export default async function ChangelogPage({
  params,
}: {
  params: PageParams;
}) {
  const locale = await getLocaleFromParams(params);
  const isEnglish = locale === "en";
  const changelog = isEnglish ? CHANGELOG_EN : CHANGELOG;

  return (
    <SiteShell
      footerNote={
        isEnglish
          ? "Entries run newest first and cover only changes readers can experience."
          : "更新日志按时间倒序排列，只记录你能感知到的变化。"
      }
    >
      <div className="mx-auto max-w-[860px]">
        <header className="border-b border-[var(--hair)] pb-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
            {isEnglish ? "Changelog" : "更新日志"}
          </p>
          <h1 className="mt-3 text-4xl font-medium leading-[0.98] tracking-[-0.045em] text-[var(--ink)] sm:text-5xl">
            {isEnglish ? "Changelog" : "更新日志"}
          </h1>
          <p className="mt-4 max-w-[36rem] text-sm leading-7 text-[var(--muted)]">
            {isEnglish
              ? "A plain-language record of visible GoodCase.ai changes: new features, experience updates, and open interfaces."
              : "这里记录 GoodCase.ai 每一次你能感知到的变化。新功能、体验调整、开放能力，都在这一页说清楚。"}
          </p>
        </header>

        <ol className="mt-2">
          {changelog.map((entry, index) => {
            const isPlan =
              entry.tags?.some((tag) => tag === "规划" || tag === "Roadmap") ??
              false;
            return (
              <li
                key={`${entry.date}-${entry.title}`}
                className={`grid gap-3 border-b border-[var(--concrete)] py-8 sm:grid-cols-[160px_1fr] sm:gap-6 ${
                  index === changelog.length - 1 ? "border-b-0" : ""
                }`}
              >
                <div className="flex items-start gap-3 sm:flex-col sm:gap-2">
                  <time
                    dateTime={entry.date}
                    className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]"
                  >
                    {isPlan ? "ROADMAP" : formatDate(entry.date)}
                  </time>
                  {entry.tags?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`inline-flex items-center border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] ${
                            tag === "规划" || tag === "Roadmap"
                              ? "border-[var(--orange)] text-[var(--orange)]"
                              : "border-[var(--concrete-2)] text-[var(--muted)]"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <article>
                  <h2 className="text-xl font-semibold tracking-[-0.02em] text-[var(--ink)] sm:text-2xl">
                    {entry.title}
                  </h2>
                  <ul className="mt-4 grid gap-2.5">
                    {entry.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 text-sm leading-7 text-[var(--muted)]"
                      >
                        <span
                          aria-hidden
                          className="mt-[13px] h-px w-4 shrink-0 bg-[var(--orange)]"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            );
          })}
        </ol>

        <div className="mt-4 flex flex-wrap gap-3 border-t border-[var(--hair)] pt-8">
          <Link href="/cases" className="gc-btn gc-btn-primary">
            {isEnglish ? "Browse cases" : "去看案例库"}
          </Link>
          <Link href="/connect" className="gc-btn gc-btn-ghost">
            {isEnglish
              ? "Connect GoodCase to your AI assistant"
              : "把好案例接进你的 AI 助手"}
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
