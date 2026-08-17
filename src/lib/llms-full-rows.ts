import "server-only";

import { buildFulltextSelect, type CaseRow } from "@/lib/case-columns";
import type { Locale } from "@/i18n/config";

/**
 * llms-full.txt 的原始行取数：一次分页批量拉全表，不再逐条取详情。
 *
 * ── 这个文件为什么存在（别把它改回去）──────────────────────────────
 * 原来的写法是：
 *
 *     const slugs = await getCaseSlugs();                       // 555 条
 *     const items = await Promise.all(slugs.map(getCaseDetailData));
 *     return items.filter(Boolean);                             // 静默丢弃
 *
 * 两个错叠在一起，效果是线上 https://goodcase.ai/llms-full.txt 头部写着
 * 「案例总数：19」，而同一时刻 sitemap.xml 里有 555 条案例 URL；再早几个小时
 * 同一地址返回的是 257。结果不确定、随负载变化：
 *
 * 1. N+1 且无并发上限。555 条 slug 逐条发单行详情查询，`Promise.all` 把它们
 *    一次性全部发出去，直接打爆 Supabase 的并发/限流。
 * 2. 失败被静默吞掉。`getCaseDetailData` 底下的 `loadRowsOrNull` 把任何查询
 *    失败都接成 null，再被 `.filter(Boolean)` 过滤掉——部分结果和完整结果长得
 *    一模一样，没有任何报错、没有任何日志。
 *
 * 危害不在于「少了几条」，而在于这份文件是专门喂 AI 爬虫的全量语料：给爬虫
 * 一份 3.4% 的语料却在头部声称是全量快照，比直接 500 有害得多——500 它会重试，
 * 残缺快照它会当真。
 *
 * ── 为什么走裸 REST 而不是 supabase-js ──────────────────────────────
 * 照抄 src/lib/sitemap-data.ts 的写法，那是这个仓库里唯一在 555 行这个量级上
 * 被生产验证过的批量取数路径（sitemap.xml 正常输出 555 条就是它跑出来的）：
 *
 * - service role key 直连 PostgREST，绕开 anon 路径上那套 RLS 求值——同一张表
 *   anon 路径的延迟抖动过很大，而这里要一次拉全表，抖不起。
 * - 显式 limit/offset 分页（PAGE_SIZE = 1000）而不是裸查全表：PostgREST 侧
 *   可能配了 db-max-rows，静默截断比报错更难发现，显式分页把这件事变成可控的。
 * - `next: { revalidate }` 而不是 no-store，路由才可能被判为可缓存路由。
 *
 * 唯一比 sitemap-data.ts 多的一件事：带 `Prefer: count=exact`，让 PostgREST
 * 在 Content-Range 里回一个「库里到底有多少行」的权威数字。调用方拿它和最终
 * 真正拼进正文的条目数做对比——这就是任务 2 里那个「期望条数」的来源，也是
 * 唯一能同时兜住「分页提前结束」和「某几行映射失败」两种情况的口径。
 */

const PAGE_SIZE = 1_000;

/**
 * 单页超时。sitemap-data.ts 用的也是 30s：这张表上实测同一分钟内延迟能从
 * 0.25s 抖到 14.7s（见 getCaseSlugs 里的注释），默认 12s 挡不住这种抖动。
 */
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * 分页循环的硬上限，纯粹是防死循环（比如某天 PostgREST 忽略 offset 一直回
 * 满页）。50 页 = 5 万行，远高于 sitemap 自己那道 45000 条的告警阈值，正常
 * 情况下永远碰不到。
 */
const MAX_PAGES = 50;

export type PublishedCaseRowsResult = {
  rows: CaseRow[];
  /**
   * 库里 is_published = true 的真实行数（PostgREST count=exact）。
   * 拿不到 Content-Range 时是 null，调用方此时退而用 rows.length 当期望值。
   */
  totalFromDatabase: number | null;
};

/** Content-Range 形如 `0-554/555`；总数未知时 PostgREST 会回 `*`。 */
function parseContentRangeTotal(header: string | null): number | null {
  const total = header?.split("/")[1]?.trim();
  if (!total || total === "*") {
    return null;
  }
  const parsed = Number.parseInt(total, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

/**
 * 全量已发布案例的原始行。
 *
 * @returns 没配 service role 环境变量时返回 null（本地开发场景，调用方退回
 *   本地样例数据）；查询本身失败时**抛出**，绝不返回部分结果——静默降级正是
 *   这次故障的根因，不能在修复里重演一遍。
 */
export async function fetchAllPublishedCaseRows(
  locale: Locale
): Promise<PublishedCaseRowsResult | null> {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!envUrl || !envServiceRoleKey) {
    return null;
  }
  // 和 sitemap-data.ts 同样的处理：闭包里 TypeScript 不带上面这层 truthy
  // 收窄的结果，用带显式标注的具名常量一次性把类型钉成 string。
  const baseUrl: string = envUrl;
  const serviceRoleKey: string = envServiceRoleKey;
  const selectColumns = buildFulltextSelect(locale);

  function fetchPage(offset: number): Promise<Response> {
    const query = new URL("/rest/v1/cases", baseUrl);
    query.searchParams.set("select", selectColumns);
    query.searchParams.set("is_published", "eq.true");
    // 按 slug 排序而不是 created_at：created_at 可能为空，空值排序在分页里
    // 不稳定，同一行可能跨页重复出现或整行漏掉。slug 非空且唯一。
    query.searchParams.set("order", "slug.asc");
    query.searchParams.set("limit", String(PAGE_SIZE));
    query.searchParams.set("offset", String(offset));

    return fetch(query, {
      // 和 sitemap-data.ts 取值保持一致。这里是兜底：案例发布/下架都会走
      // Deploy Hook 触发整站重新构建。
      //
      // 注意这一层的缓存是「尽力而为」，而且实测就是命不中的：Next Data Cache
      // 单条上限 2MB（见 src/lib/case-cache.ts 顶部的实测数据），而 555 行带
      // prompt_full 的响应实测 4.8MB（zh）/ 4.5MB（en），必然超限。每次回源
      // 都会在服务端日志里留下这么一行：
      //
      //   Error: Failed to set Next.js data cache for <supabase rest url>,
      //   items over 2MB can not be cached (4816469 bytes)
      //
      // **这行是预期内的，不是故障**：它只说明这次 fetch 没被写进 Data Cache，
      // 请求本身照常 200 返回。真正在挡流量的是路由自己的 ISR 产物和响应头上
      // 的 s-maxage=300，不是这一行。
      //
      // 那为什么还留着 revalidate？因为把它换成 no-store 会让整个路由被判成
      // 按请求动态渲染，顶上的 `export const revalidate` 和 generateStaticParams
      // 全部失效，每个爬虫请求都要现打一次 Supabase 拉 3MB——比现在这行日志
      // 噪音糟得多。想消掉这行日志，正确做法是把响应拆小（例如分片输出），
      // 不是删掉这个选项。
      next: { revalidate: 3_600 },
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Accept-Profile": "public",
        // 让 PostgREST 在 Content-Range 里回权威总数，供调用方做完整性校验。
        Prefer: "count=exact",
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  }

  const rows: CaseRow[] = [];
  let totalFromDatabase: number | null = null;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const response = await fetchPage(page * PAGE_SIZE);

    if (!response.ok) {
      throw new Error(
        `Failed to load llms-full case rows (offset ${page * PAGE_SIZE}): ` +
          `${response.status} ${await response.text()}`
      );
    }

    if (totalFromDatabase === null) {
      totalFromDatabase = parseContentRangeTotal(
        response.headers.get("content-range")
      );
    }

    const pageRows = (await response.json()) as CaseRow[];
    rows.push(...pageRows);
    if (pageRows.length < PAGE_SIZE) {
      return { rows, totalFromDatabase };
    }
  }

  throw new Error(
    `Failed to load llms-full case rows: 分页超过 ${MAX_PAGES} 页仍未取完` +
      `（已取 ${rows.length} 行），疑似 offset 未生效导致死循环。`
  );
}
