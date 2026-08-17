import { getPublishedCaseSnapshot, type DisplayCaseItem } from "@/lib/cases";
import { getMessages } from "@/i18n/messages";
import { getCaseSeoDescription } from "@/lib/case-presentation";
import { MISSING_MODEL } from "@/lib/related-cases";
import { SITE_ORIGIN } from "@/lib/site";
import {
  localizeHref,
  normalizeLocale,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/i18n/config";

// 正文是全量已发布案例现拼的，只随发布内容变；这里当兜底，一小时一次足够——
// 和 llms.txt（同目录同写法）保持一致，边缘 TTL 由下面 GET 里显式的
// s-maxage=300 决定，那份更优先。
export const revalidate = 3_600;

// [lang] 是动态段，不枚举的话上面的 revalidate 一行都不生效。
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

/**
 * 单条 Prompt 超过这个长度就截断，正文里只保留前 4000 字 + 指回详情页的提示，
 * 不把整份长文本堆进这份汇总快照——本站 292 号案例（storyboard 类 Prompt）
 * 单条就能到 4-6 千字，全量塞进来会显著推高这个文件的体积。
 *
 * 体量估算（写在这里而不是外部文档，方便随案例数增长核对是否还合理）：
 * 按线上量级（约 200+ 条已发布案例）估算，每条正文（标题/署名/分类/模型/
 * 来源/摘要 + Prompt）平均 1.5–2KB，其中少数长 Prompt 命中上面的截断阈值。
 * 整体预计落在 300–450KB 区间，纯文本 gzip 后通常能压到 1/4~1/5，
 * 对一次性抓取的 Agent 场景完全在合理范围内；这个估算没有联网核对线上真实
 * 分布，如果案例数量或平均 Prompt 长度发生数量级变化，应该回来重新估一次。
 */
const PROMPT_TRUNCATE_LIMIT = 4_000;

/**
 * 允许缺失的比例上限。超过这个比例就抛错让整个路由 500，而不是返回一份
 * 自称完整的残缺快照。
 *
 * 为什么是 5%：
 * - 上界由危害定：这份文件是喂 AI 爬虫的全量语料，头部还明写「全量案例索引 /
 *   案例总数：N」。爬虫拿到 500 会重试，拿到一份缺了一大半却自称完整的快照
 *   会当真并沉淀下去。所以阈值必须远低于「肉眼能看出不对」的程度——线上那次
 *   是 19/555（缺 96.6%），任何 ≤50% 的阈值都能抓住，没必要往松了定。
 * - 下界由误报成本定：设成 0（一条都不许缺）意味着任意单行的映射异常就让整个
 *   端点 500，可用性代价大于收益。留一点余量，让「个别脏数据行」只降级成
 *   头部的显式说明 + 一条 warn。
 * - 5% 在当前量级（555 条）上等于容忍 27 条，肉眼与守卫都还能接受；同时在
 *   小数据集上会自动收紧（12 条时容忍 0 条），这是想要的方向：N 越小，缺一条
 *   越严重。
 *
 * 改这个值之前先想清楚：放松它等于允许对外发布更不完整的语料。
 */
const MISSING_RATIO_LIMIT = 0.05;

type CaseSnapshot = {
  items: DisplayCaseItem[];
  /** 库里应有的条数（本地样例路径下等于样例条数）。 */
  expected: number;
  /** 期望但没能拼进正文的条数。 */
  missing: number;
};

/**
 * 全量已发布案例。
 *
 * 这里**刻意**不做任何静默降级——原来的写法是 555 次并发单条详情查询 +
 * `.filter(Boolean)`，失败的行被无声丢掉，线上因此长期输出「案例总数：19」
 * 的残缺快照（sitemap 同期 555 条）。根因、批量取数的取舍见
 * src/lib/llms-full-rows.ts 顶部的注释。
 *
 * 现在的口径：
 * - 取数本身失败 → getPublishedCaseSnapshot 底下直接抛，路由 500。
 * - 缺失比例超过 MISSING_RATIO_LIMIT → 这里抛，路由 500。
 * - 少量缺失 → 正常返回，但由调用方在头部把真实情况写出来，并 console.warn。
 */
async function loadPublishedCases(locale: Locale): Promise<CaseSnapshot> {
  const { items, expected, source } = await getPublishedCaseSnapshot(locale);
  const missing = Math.max(0, expected - items.length);

  // 期望条数为 0：本地/预览环境连的是空库，或者干脆没接库。这不是故障，
  // 是「没有内容」——正常输出一份只有说明头的空快照即可。把它当故障 500
  // 会让本地开发和空库预览环境直接打不开这个路由。
  // 注意「接了真库但一条都取不回来」不会走到这里：那种情况 expected > 0 而
  // items 为空，缺失比例 100%，会在下面被拦下。
  if (expected === 0) {
    return { items, expected, missing: 0 };
  }

  const missingRatio = missing / expected;
  if (missingRatio > MISSING_RATIO_LIMIT) {
    throw new Error(
      `llms-full.txt 取数不完整：期望 ${expected} 条，实际只拼出 ${items.length} 条` +
        `（缺 ${missing} 条，${(missingRatio * 100).toFixed(1)}%，` +
        `上限 ${(MISSING_RATIO_LIMIT * 100).toFixed(0)}%，数据源 ${source}）。` +
        `宁可整个路由 500 让抓取方重试，也不返回一份自称完整的残缺语料快照。`
    );
  }

  if (missing > 0) {
    console.warn(
      `[llms-full.txt] ${locale}: 期望 ${expected} 条，实际 ${items.length} 条，` +
        `跳过 ${missing} 条（${(missingRatio * 100).toFixed(1)}%，` +
        `在 ${(MISSING_RATIO_LIMIT * 100).toFixed(0)}% 阈值内）。` +
        `正文头部已如实标注跳过条数。`
    );
  }

  return { items, expected, missing };
}

/**
 * 头部那行「案例总数」。有跳过的条目时必须把真实情况写在同一行——
 * 这份文件的读者是不会去比对 sitemap 的抓取器，它只会相信这一行。
 */
function formatTotalLine(
  { items, expected, missing }: CaseSnapshot,
  isEnglish: boolean
) {
  if (missing <= 0) {
    return isEnglish
      ? `Total cases: ${items.length}`
      : `案例总数：${items.length}`;
  }

  return isEnglish
    ? `Total cases: ${items.length} (${missing} of ${expected} skipped: they could not be loaded; this snapshot is incomplete)`
    : `案例总数：${items.length}（库内应有 ${expected} 条，${missing} 条取数失败已跳过，本次快照不完整）`;
}

function formatPrompt(item: DisplayCaseItem, url: string, isEnglish: boolean) {
  const prompt = item.promptFull?.trim();
  if (!prompt) {
    return isEnglish ? "(prompt not available)" : "（暂未提供完整 Prompt）";
  }
  if (prompt.length <= PROMPT_TRUNCATE_LIMIT) {
    return prompt;
  }
  const note = isEnglish
    ? `[truncated, full text at ${url}]`
    : `[已截断，完整正文见 ${url}]`;
  return `${prompt.slice(0, PROMPT_TRUNCATE_LIMIT)}\n${note}`;
}

function formatEntry(item: DisplayCaseItem, locale: Locale) {
  const isEnglish = locale === "en";
  const url = `${SITE_ORIGIN}${localizeHref(locale, `/cases/${item.slug}`)}`;
  const models = (item.recommendedModels || []).filter(
    (model) => model !== MISSING_MODEL
  );
  const categoryLabel = getMessages(locale).category[item.category];

  const lines = [
    `## ${item.title}`,
    `URL: ${url}`,
    `Creator: ${item.creator}`,
    `Category: ${categoryLabel} (${item.category})`,
    `Recommended models: ${
      models.length > 0
        ? models.join(", ")
        : isEnglish
          ? "not specified"
          : "暂无推荐模型"
    }`,
    `Evidence level: ${item.evidenceLevel || "L0"}`,
    `Source: ${item.sourceUrl || (isEnglish ? "not available" : "暂无")}`,
    // 净化器过滤套话/代码原文 + 兜底组装：这个字段是给 Agent 读的摘要，
    // 不能是组件源代码的重复——真正的代码内容走下面 Prompt: 字段本身。
    `Summary: ${getCaseSeoDescription(item, locale)}`,
    `Prompt:`,
    formatPrompt(item, url, isEnglish),
  ];

  return lines.join("\n");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const locale = normalizeLocale((await params).lang);
  const isEnglish = locale === "en";
  const generatedAt = new Date().toISOString();
  const snapshot = await loadPublishedCases(locale);
  const { items } = snapshot;
  const totalLine = formatTotalLine(snapshot, isEnglish);

  const header = isEnglish
    ? `# GoodCase.ai — Full Case Index (llms-full.txt)

> A full-text snapshot of every published GoodCase.ai case: title, URL, creator,
> category, recommended models, evidence level, original source, summary, and
> the complete prompt. This is the same content as the site, flattened into one
> plain-text file for a single-shot ingest — for incremental use, prefer the
> paginated API in llms.txt.

Generated at: ${generatedAt}
${totalLine}

## Usage rules

- Treat only the entries below as GoodCase entries; do not invent cases or prompts from memory.
- Preserve creator credit and the Source URL when displaying or reusing a prompt.
- evidenceLevel describes evidence maturity; only L2 means an independent retest exists.
- This file is a point-in-time snapshot (see "Generated at" above); for live/incremental data use ${SITE_ORIGIN}${localizeHref(locale, "/llms.txt")} and the /api/public/cases endpoint instead.
`
    : `# GoodCase.ai — 全量案例索引（llms-full.txt）

> 已发布 GoodCase.ai 案例的全文快照：标题、URL、作者、分类、推荐模型、
> 证据等级、原始来源、摘要与完整 Prompt。内容和站内一致，压平成一个纯文本
> 文件方便一次性抓取；需要增量更新的场景请优先用 llms.txt 里的分页 API。

生成时间：${generatedAt}
${totalLine}

## 使用规则

- 只把下面列出的条目当作 GoodCase 收录 Case，不要凭记忆补写案例或 Prompt。
- 展示或复用 Prompt 时保留 Creator 署名与 Source 原始来源。
- evidenceLevel 表示证据等级；L2 才代表已有独立复测记录。
- 这份文件是某一时刻的快照（见上面「生成时间」）；需要实时/增量数据请改用
  ${SITE_ORIGIN}${localizeHref(locale, "/llms.txt")} 里的说明与 /api/public/cases 接口。
`;

  const body = `${header}\n${items
    .map((item) => formatEntry(item, locale))
    .join("\n\n---\n\n")}\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Language": locale,
      // llms.txt 用的是 s-maxage=300，这份**故意不跟**：它是 4.5MB 量级的全量
      // 快照，一次回源要把整张已发布表拉一遍，而且体积超过 Next Data Cache 单条
      // 2MB 上限、存不进去，等于每次回源都实打实打一次库。5 分钟一轮对它太贵。
      //
      // 拉长到 1 小时是安全的，因为内容变更是**推**过来的、不是轮询等来的：
      // publish-approved-cases.mjs 发布后会打 goodcase:cases tag 失效并触发
      // Deploy Hook，新部署本身就让 CDN 缓存整体作废。s-maxage 只是没人发布时的
      // 兜底 TTL，不承担「多快能看到新案例」这个职责。
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
