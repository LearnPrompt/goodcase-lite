import type { Metadata } from "next";
import { socialMetadata } from "@/lib/social-metadata";
import { LocalizedLink as Link } from "@/components/localized-link";
import { PageHero } from "@/components/page-hero";
import { FeedbackForm } from "@/components/feedback-form";
import { SiteShell } from "@/components/site-shell";
import { TrackedExternalLink } from "@/components/tracked-external-link";
import { SITE_ORIGIN } from "@/lib/site";
import { localizeHref, SUPPORTED_LOCALES } from "@/i18n/config";
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
  const title = isEnglish ? "Connect" : "接入";
  const description = isEnglish
    ? "Connect GoodCase.ai to your workflow with an Agent Skill, RSS, or an open REST API—no API key required."
    : "把 GoodCase.ai 接进你的工作流：Agent Skill 一行安装、RSS 订阅与公开 REST API，匿名免 Key。";

  return {
    title,
    description,
    ...socialMetadata({ locale, title, description, path: "/connect" }),
    alternates: localeAlternates(locale, "/connect"),
  };
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="w-full min-w-0 max-w-full overflow-x-auto border border-[var(--hair)] bg-[var(--ink)] p-4 text-xs leading-6 text-[var(--paper)] sm:text-sm">
      <code>{children}</code>
    </pre>
  );
}

export default async function ConnectPage({
  params,
}: {
  params: PageParams;
}) {
  const locale = await getLocaleFromParams(params);
  const isEnglish = locale === "en";
  const apiParams = [
    {
      name: "category",
      desc: isEnglish
        ? "Filter by image / video / web / copy / hardware. Other values return 400."
        : "分类过滤：image / video / web / copy / hardware，传其他值返回 400",
    },
    {
      name: "q",
      desc: isEnglish
        ? "Case-insensitive keyword match across title, summary, and creator."
        : "关键词，匹配标题 / 摘要 / 创作者，大小写不敏感，中英文都行",
    },
    {
      name: "take",
      desc: isEnglish
        ? "Return 1–50 items; defaults to 20 and clamps out-of-range values."
        : "返回条数 1-50，默认 20，越界自动钳制",
    },
    {
      name: "locale",
      desc: isEnglish
        ? "Content language: zh-CN or en. Defaults to zh-CN."
        : "内容语言：zh-CN 或 en，默认 zh-CN。",
    },
  ];
  const listFields = [
    ["slug", isEnglish ? "Unique case identifier used in detail URLs." : "案例唯一标识，用于拼详情 URL"],
    ["title / summary", isEnglish ? "Localized title and summary." : "当前语言的标题与摘要"],
    ["category", "image / video / web / copy / hardware"],
    ["creator / source / sourceUrl", isEnglish ? "Creator name, source platform, and original URL." : "创作者署名、来源平台与原始链接"],
    ["sourceLikeCount / sourceCommentCount / sourceShareCount / sourceSaveCount", isEnglish ? "Public interaction snapshot; unavailable platform fields are null." : "来源帖公开互动快照；平台不提供的字段为 null"],
    ["sourcePublishedAt / sourceMetricsCapturedAt", isEnglish ? "Source publish time and metrics capture time." : "来源发布时间与互动快照采集时间"],
    ["sourceHeatScore / sourceInteractionCount", isEnglish ? "Cross-platform normalized heat and raw interaction count; null without a snapshot." : "跨平台归一后的来源热度与原始互动总数；无快照时为 null"],
    ["promptPreview", isEnglish ? "Prompt preview; the full prompt is in the detail endpoint." : "Prompt 预览（完整 Prompt 在详情接口）"],
    ["mediaUrl / posterUrl", isEnglish ? "Absolute media and poster URLs." : "媒体与封面的绝对 URL"],
    ["stabilityScore", isEnglish ? "Current stability reference." : "当前稳定性参考分"],
    ["favoriteScore", isEnglish ? "Legacy compatibility field; not used by Source Heat Ranking." : "旧版兼容字段，不用于来源互动榜"],
    ["recommendedModels / costBand", isEnglish ? "Recommended models and low / medium / high cost band." : "推荐模型与成本档（low / medium / high）"],
    ["evidenceLevel / tags", isEnglish ? "L0 / L1 / L2 evidence level and tags." : "L0 / L1 / L2 证据等级与标签"],
    ["url", isEnglish ? "Localized case detail URL." : "当前语言的案例详情页地址"],
  ];
  const feedPath = localizeHref(locale, "/feed.xml");

  return (
    <SiteShell>
      <PageHero
        eyebrow={isEnglish ? "Connect · Open interfaces" : "接入 · 开放接口"}
        title={isEnglish ? "Bring cases into your workflow." : "让 Case 进入你的工作流。"}
        description={
          isEnglish
            ? "Agent Skill, RSS, and REST API are different ways to read GoodCase. They share one source of cases, creators, and evidence."
            : "Agent Skill、RSS 和 REST API 都只是 GoodCase 的读取方式。它们共享同一份 Case、作者和证据数据，不复制内容、不制造新库。"
        }
      >
        <div>
          <div className="gc-stat-label">
            {isEnglish ? "Access" : "访问方式"}
          </div>
          <div className="gc-stat-value">
            {isEnglish ? "Open" : "开放"}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            {isEnglish ? "No API key" : "无需 API 密钥"}
          </div>
        </div>
        <div>
          <div className="gc-stat-label">
            {isEnglish ? "Cache" : "缓存"}
          </div>
          <div className="gc-stat-value">
            {isEnglish ? "5 min" : "5 分钟"}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            {isEnglish ? "Public" : "公开"}
          </div>
        </div>
      </PageHero>

      <Link
        href="/llms.txt"
        className="mt-7 flex min-h-24 items-center justify-between gap-5 border border-[var(--orange)] bg-[var(--orange)] px-5 py-4 text-white transition hover:border-[var(--ink)] hover:bg-[var(--ink)] sm:px-7"
      >
        <span>
          <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-white/75">
            Agent discovery
          </span>
          <span className="mt-1 block text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
            {isEnglish ? "One entry point for agents: llms.txt" : "给 Agent 一个入口：llms.txt"}
          </span>
        </span>
        <span className="shrink-0 text-xl">{isEnglish ? "Open" : "打开"} →</span>
      </Link>

      <div className="grid min-w-0 gap-0 border-l border-t border-[var(--hair)] py-8 lg:grid-cols-2">
        <section className="gc-panel min-w-0 border-l-0 border-t-0 p-5 sm:p-8">
          <p className="gc-eyebrow">
            01 · Agent Skill
          </p>
          <h2 className="mt-3 text-3xl font-medium leading-[0.96] tracking-[-0.04em] sm:text-4xl">
            {isEnglish ? "Install the GoodCase Skill in your AI" : "给你的 AI 装上 goodcase Skill"}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            {isEnglish
              ? "The Skill reads the same public API as the site. Install it through the same cross-agent installer used by the LearnPrompt Skill Workshop:"
              : "Skill 与站点共用公开 API，并使用 LearnPrompt Skill 工坊同款跨 Agent 安装器："}
          </p>
          <div className="mt-4">
            <CodeBlock>{`npx skills add LearnPrompt/goodcaseai --skill goodcase --global --copy --yes --full-depth`}</CodeBlock>
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            {isEnglish
              ? "Once installed, ask your AI “What good cases are new?” and it can query GoodCase directly."
              : "装好之后，直接问你的 AI：「最近有什么好案例」，它就会自己来查。"}
          </p>
        </section>

        <section className="gc-panel min-w-0 border-l-0 border-t-0 p-5 sm:p-8">
          <p className="gc-eyebrow">
            02 · RSS
          </p>
          <h2 className="mt-3 text-3xl font-medium leading-[0.96] tracking-[-0.04em] sm:text-4xl">
            {isEnglish ? "Subscribe to new cases with RSS" : "用 RSS 订阅最新案例"}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            {isEnglish
              ? "Add this URL to any RSS reader. Each item includes a localized summary and prompt preview, newest first, up to 50 items."
              : "把下面的地址加进任何 RSS 阅读器。每条包含案例摘要与 Prompt 预览，按发布时间倒序，最多 50 条。"}
          </p>
          <div className="mt-4">
            <CodeBlock>{`${SITE_ORIGIN}${feedPath}`}</CodeBlock>
          </div>
        </section>

        <section className="gc-panel min-w-0 border-l-0 border-t-0 p-5 sm:p-8 lg:col-span-2">
          <p className="gc-eyebrow">
            03 · REST API
          </p>
          <h2 className="mt-3 text-3xl font-medium leading-[0.96] tracking-[-0.04em] sm:text-4xl">
            {isEnglish ? "Call the open REST API" : "直接调公开 REST API"}
          </h2>

          <div className="mt-6 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8">
            <div className="min-w-0">
              <h3 className="break-words text-lg font-semibold text-[var(--ink)]">
                GET /api/public/cases · {isEnglish ? "Case list" : "案例列表"}
              </h3>
              <div className="mt-3">
                <CodeBlock>{`curl -s "${SITE_ORIGIN}/api/public/cases?category=video&q=umesh&take=5&locale=${locale}"`}</CodeBlock>
              </div>
              <dl className="mt-4 grid gap-2 text-sm leading-7">
                {apiParams.map((param) => (
                  <div key={param.name} className="grid min-w-0 gap-1 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-3">
                    <dt className="font-mono font-semibold text-[var(--ink)]">{param.name}</dt>
                    <dd className="min-w-0 text-[var(--muted)]">{param.desc}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-sm font-semibold text-[var(--ink)]">
                {isEnglish ? "Response fields (per item):" : "响应字段（items 内每条）："}
              </p>
              <dl className="mt-2 grid gap-2 text-sm leading-7">
                {listFields.map(([name, description]) => (
                  <div key={name} className="grid min-w-0 gap-1 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-3">
                    <dt className="break-all font-mono font-semibold text-[var(--ink)]">{name}</dt>
                    <dd className="min-w-0 text-[var(--muted)]">{description}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="min-w-0">
              <h3 className="break-words text-lg font-semibold text-[var(--ink)]">
                GET /api/public/cases/{"{slug}"} · {isEnglish ? "Full case" : "单条全量"}
              </h3>
              <div className="mt-3">
                <CodeBlock>{`curl -s "${SITE_ORIGIN}/api/public/cases/real-case-01-umesh-ai?locale=${locale}"`}</CodeBlock>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                {isEnglish
                  ? "Adds promptFull, editorNote, labNote, spreadScore, sourceHeatNote, and other deep-reading fields to the list response."
                  : "在列表字段之外额外返回 promptFull（完整 Prompt）、editorNote（编辑点评）、labNote（实验笔记）、spreadScore（传播势能分）、sourceHeatNote（来源热度计算说明）等深度拆解字段。"}
              </p>
            </div>
          </div>
        </section>
      </div>

      <p className="mt-8 text-sm leading-7 text-[var(--muted)]">
        {isEnglish
          ? "All interfaces are anonymous and require no API key. Server responses cache for five minutes and allow direct browser fetches through CORS."
          : "以上全部接口匿名可用、不需要 API Key；服务端缓存 5 分钟；CORS 全开，浏览器里可以直接 fetch。"}
      </p>

      <section id="about" className="gc-section">
        <div className="gc-section-head">
          <div className="gc-section-id">§ About · {isEnglish ? "Product boundary" : "产品边界"}</div>
          <div>
            <h2 className="gc-section-title">
              {isEnglish ? "One product. One case source of truth." : "一个产品，一份 Case 真相源。"}
            </h2>
            <p className="gc-section-sub">
              {isEnglish
                ? "GoodCase is the public AI prompt case collection. Creator, Lab, and Skill are reading layers derived from cases. LearnPrompt remains an external link for fundamentals rather than a duplicated tutorial library."
                : "GoodCase 是公开的 AI 提示语案例合集；Creator、Lab 和 Skill 都是 Case 的派生阅读层。LearnPrompt 保留为继续学习基础方法的外部链接，不复制教程，也不另建站内内容库。"}
            </p>
          </div>
        </div>
        <div className="grid border-l border-t border-[var(--hair)] md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Case", isEnglish ? "The public unit: work, creator, method, and original source." : "公开主体：作品、作者、方法与原始来源。"],
            ["Creator", isEnglish ? "A creator view aggregated from accepted cases." : "由已收录 Case 聚合出来的作者视图。"],
            ["Lab", isEnglish ? "Retest records and stability evidence around a case." : "围绕 Case 的复测记录与稳定性证据。"],
            ["Skill", isEnglish ? "A method package distilled after repeated success across cases." : "多个 Case 反复成立后沉淀的方法包。"],
          ].map(([title, description]) => (
            <article key={title} className="border-b border-r border-[var(--hair)] bg-white p-5">
              <p className="gc-eyebrow">{title}</p>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{description}</p>
            </article>
          ))}
        </div>
        <TrackedExternalLink
          href="https://www.learnprompt.pro"
          eventName="outbound_learnprompt"
          className="mt-6 flex min-h-24 items-center justify-between gap-5 border border-[var(--orange)] bg-[var(--orange)] px-5 py-4 text-white transition hover:border-[var(--ink)] hover:bg-[var(--ink)] sm:px-7"
        >
          <span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-white/75">
              LearnPrompt
            </span>
            <span className="mt-1 block text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
              {isEnglish ? "Learn prompt fundamentals systematically" : "系统学习 Prompt 基础方法"}
            </span>
          </span>
          <span className="shrink-0 text-xl">{isEnglish ? "Open" : "打开"} ↗</span>
        </TrackedExternalLink>
      </section>

      <section id="feedback" className="gc-section">
        <div className="gc-section-head">
          <div className="gc-section-id">§ Feedback · {isEnglish ? "Feedback" : "反馈"}</div>
          <div>
            <h2 className="gc-section-title">
              {isEnglish ? "Found a mistake? Leave it here." : "发现错漏，就直接留在这里。"}
            </h2>
            <p className="gc-section-sub">
              {isEnglish
                ? "Content corrections, page issues, and product suggestions enter a separate human queue and never masquerade as case submissions."
                : "内容纠错、页面问题和产品建议进入独立人工队列，不会冒充 Case 投稿。"}
            </p>
          </div>
        </div>
        <div className="gc-panel max-w-3xl p-5 sm:p-7">
          <FeedbackForm />
        </div>
      </section>
    </SiteShell>
  );
}
