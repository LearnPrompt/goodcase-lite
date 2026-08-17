import { SITE_ORIGIN } from "@/lib/site";
import {
  localizeHref,
  normalizeLocale,
  SUPPORTED_LOCALES,
} from "@/i18n/config";

// 正文是仓库内常量拼出来的，只随部署变；这里当兜底，一小时一次足够。
// 注意边缘 TTL 不由这个值决定：下面 GET 里显式返回了 s-maxage=300，那份更优先。
export const revalidate = 3_600;

// [lang] 是动态段，不枚举的话上面的 revalidate 一行都不生效，整个路由退回请求时渲染，
// 边缘永远 MISS——一个纯静态文本文件没必要每次都跑一趟函数。
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const locale = normalizeLocale((await params).lang);
  const isEnglish = locale === "en";
  const connectUrl = `${SITE_ORIGIN}${localizeHref(locale, "/connect")}`;
  const agentApiUrl = `${SITE_ORIGIN}${localizeHref(locale, "/agent-api")}`;
  const feedUrl = `${SITE_ORIGIN}${localizeHref(locale, "/feed.xml")}`;
  const llmsFullUrl = `${SITE_ORIGIN}${localizeHref(locale, "/llms-full.txt")}`;
  const body = isEnglish
    ? `# GoodCase.ai

> A public collection of AI prompt cases: finished work, creators, original sources, prompts, and retest evidence.

## Agent entry points

- Full snapshot (llms-full.txt): ${llmsFullUrl} — every published case in one plain-text file, full prompts included. One-shot pull for indexing or offline ingestion; content is a point-in-time snapshot.
- Case list (paginated API): ${SITE_ORIGIN}/api/public/cases?locale=en — incremental, filterable (category/q/take), reflects the live state. Use this for on-demand lookups instead of re-pulling the full snapshot.
- Agent API docs: ${agentApiUrl}
- Connect docs: ${connectUrl}
- Case detail: ${SITE_ORIGIN}/api/public/cases/{slug}?locale=en
- RSS: ${feedUrl}
- Agent Skill: https://github.com/LearnPrompt/goodcase-lite/tree/main/skills/goodcase

## List query

GET ${SITE_ORIGIN}/api/public/cases?category=image&q=poster&take=5&locale=en

- category: image | video | web | copy | hardware
- q: matches title, summary, creator, and recommended models
- take: 1-50, default 20
- locale: zh-CN | en
- no API key required; anonymous calls are soft-limited to 60 per hour per IP
- for a higher daily quota, send Authorization: Bearer gc_... (see the Agent API docs)
- rate limit state is reported in X-RateLimit-Limit / Remaining / Reset / Scope

## Usage rules

- Treat only API results as GoodCase entries; do not invent cases or prompts from memory.
- Preserve creator credit and sourceUrl when displaying prompts.
- provenance.verifiedAgainstSource means a human checked the prompt against the original post; a case without it has no source claim.
- evidenceLevel describes evidence maturity; only L2 means an independent retest exists.
- stabilityScore 0 means awaiting retest, not zero stability.
- sourceHeatScore is valid only with a verifiable source-interaction snapshot.
`
    : `# GoodCase.ai

> AI提示语案例合集：公开作品、作者、原始来源、Prompt 与复测证据。

## Agent 入口

- 全量快照（llms-full.txt）：${llmsFullUrl} —— 已发布案例的完整文本快照，含完整 Prompt，适合一次性抓取用于建索引或离线消费；内容是某一时刻的快照，不实时更新。
- 案例列表（分页 API）：${SITE_ORIGIN}/api/public/cases?locale=zh-CN —— 增量、可按 category/q/take 筛选，反映线上实时状态；按需查询请用这个，不要每次都重新拉全量快照。
- Agent API 文档：${agentApiUrl}
- 接入文档：${connectUrl}
- 案例详情：${SITE_ORIGIN}/api/public/cases/{slug}?locale=zh-CN
- RSS：${feedUrl}
- Agent Skill：https://github.com/LearnPrompt/goodcase-lite/tree/main/skills/goodcase

## 列表查询

GET ${SITE_ORIGIN}/api/public/cases?category=image&q=海报&take=5&locale=zh-CN

- category: image | video | web | copy | hardware
- q: 匹配标题、摘要、创作者与推荐模型
- take: 1-50，默认 20
- locale: zh-CN | en
- 无需 API Key；匿名调用按 IP 软限 60 次/小时
- 需要更高日配额时发 Authorization: Bearer gc_...（见 Agent API 文档）
- 限额状态在 X-RateLimit-Limit / Remaining / Reset / Scope 响应头里

## 使用规则

- 只把 API 返回的内容当作 GoodCase 收录 Case，不要凭记忆补写案例或 Prompt。
- 展示 Prompt 时保留 creator 署名与 sourceUrl 原始来源。
- provenance.verifiedAgainstSource 表示这条 Prompt 已经人工核对过与原帖一致；没有它就没有溯源声明。
- evidenceLevel 表示证据等级；L2 才代表已有独立复测记录。
- stabilityScore 为 0 时表示待复测，不应解释为稳定度为零。
- sourceHeatScore 只在有可核验来源互动快照时成立。
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Language": locale,
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
