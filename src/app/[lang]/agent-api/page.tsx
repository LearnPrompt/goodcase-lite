import type { Metadata } from "next";
import { socialMetadata } from "@/lib/social-metadata";
import { JsonLd } from "@/components/json-ld";
import { LocalizedLink as Link } from "@/components/localized-link";
import { PageHero } from "@/components/page-hero";
import { SiteShell } from "@/components/site-shell";
import { SUPPORTED_LOCALES } from "@/i18n/config";
import { getLocaleFromParams } from "@/i18n/server";
import { getSkillInstallCommand } from "@/lib/installable-skills";
import { localeAlternates } from "@/lib/seo/alternates";
import {
  buildCaseDatasetSchema,
  buildWebApiSchema,
} from "@/lib/seo/structured-data";
import { SITE_ORIGIN } from "@/lib/site";
import { AGENT_API_CONTACT_PATH, getAgentApiCopy } from "./copy";

/**
 * Dataset schema 的 name/description 单独维护在这里而不是 copy.ts：
 * 这两个字段是给结构化数据消费方看的事实描述，不是页面文案，措辞对齐
 * llms.txt / llms-full.txt 的开场白，不跟着这页的 UI 文案改版联动。
 */
const DATASET_COPY: Record<
  "zh-CN" | "en",
  { name: string; description: string }
> = {
  "zh-CN": {
    name: "GoodCase.ai 案例数据集",
    description:
      "GoodCase.ai 公开发布的 AI 提示语案例数据集：作品、作者、原始来源、完整 Prompt 与复测证据，提供实时可筛选的列表 API 与全量文本快照两种获取方式。",
  },
  en: {
    name: "GoodCase.ai Case Dataset",
    description:
      "Public dataset of AI prompt cases published on GoodCase.ai: finished work, creators, original sources, full prompts, and retest evidence — available as a live, filterable list API and as a full-text snapshot.",
  },
};

// 页面内容全部来自仓库内常量（copy.ts / installable-skills），请求期不取任何数。
// 不枚举 [lang] 的话 Next 只能在请求时渲染，Vercel 对这类响应下发 private/no-store，
// 边缘永远 MISS。枚举之后它变成构建期静态页，边缘直接命中，内容随部署更新。
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
  const copy = getAgentApiCopy(locale);
  const title = copy.metaTitle;
  const description = copy.metaDescription;

  return {
    title,
    description,
    ...socialMetadata({ locale, title, description, path: "/agent-api" }),
    alternates: localeAlternates(locale, "/agent-api"),
  };
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="w-full min-w-0 max-w-full overflow-x-auto border border-[var(--hair)] bg-[var(--ink)] p-4 text-xs leading-6 text-[var(--paper)] sm:text-sm">
      <code>{children}</code>
    </pre>
  );
}

function DefinitionList({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="mt-4 grid gap-2 text-sm leading-7">
      {rows.map(([term, description]) => (
        <div
          key={term}
          className="grid min-w-0 gap-1 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-3"
        >
          <dt className="break-all font-mono font-semibold text-[var(--ink)]">
            {term}
          </dt>
          <dd className="min-w-0 text-[var(--muted)]">{description}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * 响应示例。
 *
 * 这是 GET /api/public/cases?category=video&take=1 的真实一次输出，只做了两件事：
 * 长字符串截到 48 字符后加省略号、tags 只留前三个。字段名、字段数量、取值类型
 * 全部原样 —— 文档给出一个形状不对的响应，比不给文档更糟，
 * 调用方会照着它写解析代码。改公开响应结构时，重跑那条 curl 再把这里换掉。
 */
const LIST_RESPONSE_SAMPLE = `{
  "count": 1,
  "locale": "zh-CN",
  "items": [
    {
      "slug": "tattoo-generator",
      "title": "Tattoo Generator",
      "category": "video",
      "source": "Comfy Workflows",
      "sourceUrl": "https://comfy.org/workflows/90d086fef9e3-90d086f…",
      "creator": "Rob",
      "summary": "这条工作流没有花哨的效果，胜在把纹身设计的沟通痛点解决得很实际…",
      "promptPreview": "Turn your tattoo design ideas into reality with …",
      "mediaType": "video",
      "mediaUrl": "https://…public.blob.vercel-storage.com/…",
      "posterUrl": "https://…public.blob.vercel-storage.com/…",
      "stabilityScore": 0,
      "recommendedModels": ["ComfyUI"],
      "costBand": "medium",
      "evidenceLevel": "L1",
      "tags": ["source-comfy", "workflow-method", "not-rerun"],
      "url": "https://goodcase.ai/cases/tattoo-generator",
      "contentLocale": "en",
      "availableLocales": ["zh-CN"],
      "isFallback": false,
      "provenance": {
        "sourceUrl": "https://comfy.org/workflows/90d086fef9e3-90d086fef9e3/",
        "verifiedAgainstSource": true,
        "method": "human-reviewed-source-match",
        "policyEffectiveAt": "2026-08-05",
        "note": "已发布案例的 prompt 均经人工核对与原帖一致…"
      },
      "likedCount": 0,
      "retestVoteCount": 0
    }
  ]
}`;

export default async function AgentApiPage({ params }: { params: PageParams }) {
  const locale = await getLocaleFromParams(params);
  const copy = getAgentApiCopy(locale);
  const isEnglish = locale === "en";
  const datasetCopy = DATASET_COPY[locale];
  const webApiSchema = buildWebApiSchema({
    locale,
    name: copy.metaTitle,
    description: copy.metaDescription,
  });
  const datasetSchema = buildCaseDatasetSchema({
    locale,
    name: datasetCopy.name,
    description: datasetCopy.description,
  });

  return (
    <SiteShell>
      <JsonLd data={[webApiSchema, datasetSchema]} />
      <PageHero
        eyebrow={copy.heroEyebrow}
        title={copy.heroTitle}
        description={copy.heroDescription}
      >
        <div>
          <div className="gc-stat-label">{copy.statAnonymousLabel}</div>
          <div className="gc-stat-value">{copy.statAnonymousValue}</div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            {copy.statAnonymousHint}
          </div>
        </div>
        <div>
          <div className="gc-stat-label">{copy.statKeyedLabel}</div>
          <div className="gc-stat-value">{copy.statKeyedValue}</div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            {copy.statKeyedHint}
          </div>
        </div>
      </PageHero>

      <section className="gc-panel mt-7 min-w-0 p-5 sm:p-7">
        <p className="gc-eyebrow">
          {isEnglish ? "Backward compatible" : "向后兼容"}
        </p>
        <h2 className="mt-3 text-2xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-3xl">
          {copy.compatTitle}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
          {copy.compatBody}
        </p>
      </section>

      <section className="gc-section">
        <div className="gc-section-head">
          <div className="gc-section-id">§ {copy.endpointsEyebrow}</div>
          <div>
            <h2 className="gc-section-title">{copy.endpointsTitle}</h2>
            <p className="gc-section-sub">{copy.metaDescription}</p>
          </div>
        </div>

        <div className="grid min-w-0 gap-0 border-l border-t border-[var(--hair)] lg:grid-cols-2">
          <div className="gc-panel min-w-0 border-l-0 border-t-0 p-5 sm:p-7">
            <h3 className="break-words text-lg font-semibold text-[var(--ink)]">
              GET /api/public/cases · {copy.listHeading}
            </h3>
            <div className="mt-3">
              <CodeBlock>{`curl -s "${SITE_ORIGIN}/api/public/cases?category=video&take=3&locale=${locale}"`}</CodeBlock>
            </div>
            <p className="mt-4 text-sm font-semibold text-[var(--ink)]">
              {copy.paramsHeading}
            </p>
            <DefinitionList rows={copy.params} />
          </div>

          <div className="gc-panel min-w-0 border-l-0 border-t-0 p-5 sm:p-7">
            <h3 className="break-words text-lg font-semibold text-[var(--ink)]">
              GET /api/public/cases/{"{slug}"} · {copy.detailHeading}
            </h3>
            <div className="mt-3">
              <CodeBlock>{`curl -s "${SITE_ORIGIN}/api/public/cases/real-case-01-umesh-ai?locale=${locale}"`}</CodeBlock>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              {copy.detailBody}
            </p>
            <p className="mt-6 text-sm font-semibold text-[var(--ink)]">
              {isEnglish ? "With an API key" : "带 API key 调用"}
            </p>
            <div className="mt-3">
              <CodeBlock>{`curl -s -D - \\
  -H "Authorization: Bearer gc_xxxxxxxxxxxx" \\
  "${SITE_ORIGIN}/api/public/cases?take=3"`}</CodeBlock>
            </div>
          </div>

          <div className="gc-panel min-w-0 border-l-0 border-t-0 p-5 sm:p-7 lg:col-span-2">
            <p className="text-sm font-semibold text-[var(--ink)]">
              {copy.responseHeading}
            </p>
            <div className="mt-3">
              <CodeBlock>{LIST_RESPONSE_SAMPLE}</CodeBlock>
            </div>
          </div>
        </div>
      </section>

      <section className="gc-section">
        <div className="gc-section-head">
          <div className="gc-section-id">§ {copy.provenanceEyebrow}</div>
          <div>
            <h2 className="gc-section-title">{copy.provenanceTitle}</h2>
            <p className="gc-section-sub">{copy.provenanceBody}</p>
          </div>
        </div>
        <div className="gc-panel min-w-0 p-5 sm:p-7">
          <p className="gc-eyebrow">provenance</p>
          <DefinitionList rows={copy.provenanceFields} />
        </div>
      </section>

      <section className="gc-section">
        <div className="gc-section-head">
          <div className="gc-section-id">§ {copy.limitsEyebrow}</div>
          <div>
            <h2 className="gc-section-title">{copy.limitsTitle}</h2>
            <p className="gc-section-sub">{copy.limitsBody}</p>
          </div>
        </div>

        <div className="min-w-0 overflow-x-auto border border-[var(--hair)] bg-white">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--hair)] text-left">
                {copy.tierHeaders.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {copy.tiers.map((row) => (
                <tr
                  key={row[0]}
                  className="border-b border-[var(--line)] last:border-b-0"
                >
                  <td className="px-4 py-3 font-semibold text-[var(--ink)]">
                    {row[0]}
                  </td>
                  <td className="px-4 py-3 text-[var(--ink)]">{row[1]}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-0 grid min-w-0 gap-0 border-l border-t border-[var(--hair)] lg:grid-cols-2">
          <div className="gc-panel min-w-0 border-l-0 border-t-0 p-5 sm:p-7">
            <p className="gc-eyebrow">{copy.headersHeading}</p>
            <DefinitionList rows={copy.headerRows} />
          </div>
          <div className="gc-panel min-w-0 border-l-0 border-t-0 p-5 sm:p-7">
            <p className="gc-eyebrow">{copy.errorsHeading}</p>
            <DefinitionList rows={copy.errorRows} />
          </div>
        </div>
      </section>

      <section className="gc-section">
        <div className="gc-section-head">
          <div className="gc-section-id">§ {copy.keysEyebrow}</div>
          <div>
            <h2 className="gc-section-title">{copy.keysTitle}</h2>
            <p className="gc-section-sub">{copy.keysBody}</p>
          </div>
        </div>
        <div className="gc-panel min-w-0 p-5 sm:p-7">
          <ol className="grid gap-3 text-sm leading-7 text-[var(--muted)]">
            {copy.keysSteps.map((step, index) => (
              <li key={step} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--orange)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <Link
          href={AGENT_API_CONTACT_PATH}
          className="mt-6 flex min-h-24 items-center justify-between gap-5 border border-[var(--orange)] bg-[var(--orange)] px-5 py-4 text-white transition hover:border-[var(--ink)] hover:bg-[var(--ink)] sm:px-7"
        >
          <span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-white/75">
              API key
            </span>
            <span className="mt-1 block text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
              {copy.keysCta}
            </span>
          </span>
          <span className="shrink-0 text-xl">→</span>
        </Link>
      </section>

      <section className="gc-section">
        <div className="gc-section-head">
          <div className="gc-section-id">§ {copy.skillEyebrow}</div>
          <div>
            <h2 className="gc-section-title">{copy.skillTitle}</h2>
            <p className="gc-section-sub">{copy.skillBody}</p>
          </div>
        </div>
        <div className="gc-panel min-w-0 p-5 sm:p-7">
          <CodeBlock>{getSkillInstallCommand("goodcase")}</CodeBlock>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            {copy.skillAfter}
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
