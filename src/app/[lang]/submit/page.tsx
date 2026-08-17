import type { Metadata } from "next";
import { socialMetadata } from "@/lib/social-metadata";
import { PageHero } from "@/components/page-hero";
import { SiteShell } from "@/components/site-shell";
import { SubmitForm } from "@/components/submit-form";
import { SUPPORTED_LOCALES } from "@/i18n/config";
import { getLocaleFromParams } from "@/i18n/server";
import { localeAlternates } from "@/lib/seo/alternates";

// 页面是静态文案 + 客户端表单，请求期不取任何数。不枚举 [lang] 的话 Next 只能
// 在请求时渲染，Vercel 对这类响应下发 private/no-store，边缘永远 MISS。
// 枚举之后它变成构建期静态页，边缘直接命中，内容随部署更新。
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
  const title = isEnglish ? "Submit a Case" : "提交案例 · 好案例";
  const description = isEnglish
    ? "Submit an AI case you found or reproduced. Approved cases enter the public library."
    : "把你见过或复刻成功的 AI 好案例投稿给 GoodCase.ai，审核通过后进入案例库。";

  return {
    title,
    description,
    ...socialMetadata({ locale, title, description, path: "/submit" }),
    alternates: localeAlternates(locale, "/submit"),
  };
}

export default async function SubmitPage({
  params,
}: {
  params: PageParams;
}) {
  const locale = await getLocaleFromParams(params);
  const isEnglish = locale === "en";
  return (
    <SiteShell
      footerNote={
        isEnglish
          ? "Submissions enter a pending queue and publish only after manual review."
          : "投稿进入 pending 队列，人工审核通过后发布到案例库。"
      }
    >
      <PageHero
        eyebrow={isEnglish ? "Submit · Manual review" : "投稿 · 人工审核"}
        title={
          isEnglish
            ? "Submit a case that was actually made."
            : "提交一个真正做出来的 Case。"
        }
        description={
          isEnglish
            ? "Prioritize published work with a visible result. We need the creator, result, process or prompt, and original source. News summaries are not published as cases."
            : "优先提交公众号、小红书、抖音或 X 上已经出现结果的作品。必须能找到作者、可见结果、过程或 Prompt，以及原始来源；资讯摘要不会直接发布。"
        }
      >
        <div>
          <div className="gc-stat-label">
            {isEnglish ? "Workflow" : "处理流程"}
          </div>
          <div className="gc-stat-value">
            {isEnglish ? "Pending" : "待审核"}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            {isEnglish ? "Manual review" : "人工审核"}
          </div>
        </div>
        <div>
          <div className="gc-stat-label">{isEnglish ? "Required" : "必填"}</div>
          <div className="gc-stat-value">
            {isEnglish ? "4 fields" : "4 项"}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            {isEnglish ? "Evidence" : "证据"}
          </div>
        </div>
      </PageHero>
      <section className="mx-auto max-w-4xl py-8 md:py-12">
        <div className="gc-panel p-5 sm:p-7">
          <SubmitForm />
        </div>
      </section>
    </SiteShell>
  );
}
