import "server-only";

import { slugifyCreatorName } from "@/lib/creator-slug";
import { caseItems, type CaseCategory } from "@/lib/mock-data";
import { caseMatchesModel, MODEL_FAMILIES } from "@/lib/models";
import { deriveSkillCatalog, type SkillCaseInput } from "@/lib/skills";

type SitemapCaseRow = {
  slug: string;
  title: string;
  category: string;
  creator_name: string | null;
  tags: string[] | null;
  created_at: string | null;
  // updated_at 是 20260814100000_cases_updated_at 迁移新加的列，代码部署和
  // 迁移执行不是同一时刻。降级路径（不带该列的查询）不会返回这个字段，
  // 所以这里标成可选而不是 `string | null`。
  updated_at?: string | null;
  source_published_at: string | null;
  recommended_models: string[] | null;
};

const PAGE_SIZE = 1_000;

const SELECT_COLUMNS_WITH_UPDATED_AT =
  "slug,title,category,creator_name,tags,created_at,updated_at,source_published_at,recommended_models";
const SELECT_COLUMNS_WITHOUT_UPDATED_AT =
  "slug,title,category,creator_name,tags,created_at,source_published_at,recommended_models";

/**
 * sitemaps.org 协议对单个 sitemap 文件的硬上限：50000 条 URL / 50MB。
 * 当前线上 1662 条，离上限还远。这里立一道显式告警阈值（留出安全边际），
 * 真到了这个量级要做的是拆成 sitemap index（`generateSitemaps` 按 id 分片
 * 输出多个 `/sitemap/[id].xml`），不是本次改动的范围——现在只负责喊一声。
 */
export const SITEMAP_URL_WARN_THRESHOLD = 45_000;

async function fetchPublishedSitemapRows(): Promise<SitemapCaseRow[] | null> {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!envUrl || !envServiceRoleKey) {
    return null;
  }
  // 显式重新声明成非 undefined 的具名常量：下面两个函数是嵌套的闭包，
  // TypeScript 不会把上面这层 truthy 判断的收窄结果带进闭包内部（闭包可能
  // 在原则上被延后调用），直接引用 envUrl / envServiceRoleKey 会在
  // fetch() 的 headers 里报「Record 的值可能是 undefined」。这里用带
  // 显式类型标注的赋值一次性把类型钉死成 string，而不是在使用处逐个
  // `as string` 断言。
  const baseUrl: string = envUrl;
  const serviceRoleKey: string = envServiceRoleKey;

  function buildQuery(offset: number, selectColumns: string): URL {
    const query = new URL("/rest/v1/cases", baseUrl);
    query.searchParams.set("select", selectColumns);
    query.searchParams.set("is_published", "eq.true");
    query.searchParams.set("order", "slug.asc");
    query.searchParams.set("limit", String(PAGE_SIZE));
    query.searchParams.set("offset", String(offset));
    return query;
  }

  function fetchPage(offset: number, selectColumns: string): Promise<Response> {
    return fetch(buildQuery(offset, selectColumns), {
      // 这条 fetch 决定了 sitemap 路由能不能被 Next 判为可缓存路由：用
      // next.revalidate 而不是把 cache 选项设成「不缓存」，路由才会走
      // 「构建期渲染 + 定期 revalidate」而不是每次请求都直接打 Supabase。
      // 3600s 只是兜底——
      // 案例发布/下架都会走 Deploy Hook 触发整站重新构建，构建产物本身就是最新的；
      // 这里防的是 Hook 偶发失败时 sitemap 长期钉死在上一次构建快照的情况。
      // 详见 src/app/sitemap.ts 顶部注释，取值与 llms.txt 路由保持一致。
      next: { revalidate: 3_600 },
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Accept-Profile": "public",
      },
      signal: AbortSignal.timeout(30_000),
    });
  }

  const rows: SitemapCaseRow[] = [];
  // 降级开关：代码部署和数据库迁移执行不是同一时刻，很可能先部署后迁移
  // （20260814100000_cases_updated_at）。生产库还没加 updated_at 列时，
  // 带这一列查询会被 PostgREST 拒绝 400（`column cases.updated_at does not
  // exist`），不降级的话整个 sitemap.xml 会直接挂掉。探测到这一种特定错误
  // 才自动降级成不带该列的查询；其它 400 原样抛出，不吞真错误。这个变量
  // 记住降级状态，分页循环里只降级一次，不会每页都重试。
  // **迁移执行完成后，这段降级逻辑可以整段删掉**，直接用
  // SELECT_COLUMNS_WITH_UPDATED_AT。
  let useUpdatedAt = true;

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const selectColumns = useUpdatedAt
      ? SELECT_COLUMNS_WITH_UPDATED_AT
      : SELECT_COLUMNS_WITHOUT_UPDATED_AT;
    let response = await fetchPage(offset, selectColumns);

    if (!response.ok) {
      const bodyText = await response.text();
      const isMissingUpdatedAtColumn =
        useUpdatedAt && response.status === 400 && bodyText.includes("updated_at");

      if (!isMissingUpdatedAtColumn) {
        throw new Error(`Failed to load sitemap data: ${response.status} ${bodyText}`);
      }

      console.warn(
        "[sitemap-data] cases.updated_at 迁移尚未执行，lastmod 暂用 created_at" +
          "（迁移 20260814100000_cases_updated_at 执行后此提示会自动消失）。"
      );
      useUpdatedAt = false;
      response = await fetchPage(offset, SELECT_COLUMNS_WITHOUT_UPDATED_AT);
      if (!response.ok) {
        throw new Error(
          `Failed to load sitemap data: ${response.status} ${await response.text()}`
        );
      }
    }

    const page = (await response.json()) as SitemapCaseRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) {
      return rows;
    }
  }
}

/**
 * 案例级 lastmod：updated_at 有值就用它（内容真正变化的时间），没有才退
 * created_at，再退 source_published_at。updated_at 可能因为两个原因缺失：
 * 迁移尚未执行（查询已降级，字段整体不存在）、或触发器还没让这一行的
 * updated_at 与 created_at 出现分歧之外的空值——理论上迁移执行后不会再有
 * 第二种情况，因为回填已保证所有行 updated_at not null。
 */
function caseLastmod(
  row: Pick<SitemapCaseRow, "created_at" | "source_published_at"> & {
    updated_at?: string | null;
  }
): string | null {
  return row.updated_at || row.created_at || row.source_published_at || null;
}

/**
 * 一组 lastmod 候选里取时间最新的一个；全空或全部无法解析时返回 null，
 * 调用方据此决定这条 URL 要不要带 lastmod——假的 lastmod 比没有更糟。
 */
function latestLastmod(values: Array<string | null | undefined>): string | null {
  let latest: string | null = null;
  let latestTime = -Infinity;

  for (const value of values) {
    if (!value) continue;
    const time = new Date(value).getTime();
    if (Number.isNaN(time) || time <= latestTime) continue;
    latest = value;
    latestTime = time;
  }

  return latest;
}

export type SitemapEntry = { slug: string; lastmod: string | null };

export async function getSitemapData() {
  // 兜底路径（Supabase 环境变量缺失时）也要能给出 lastmod：caseItems 的
  // sourcePublishedAt/createdAt 大多缺失，给不出的那些条目 lastmod 就是 null，
  // 对应 URL 在 sitemap.ts 里会整条不输出 lastModified，而不是编一个假值。
  const rows: SitemapCaseRow[] =
    (await fetchPublishedSitemapRows()) ||
    caseItems.map((item) => ({
      slug: item.slug,
      title: item.title,
      category: item.category,
      creator_name: item.creator,
      tags: item.tags ?? [],
      created_at: item.createdAt ?? null,
      source_published_at: item.sourcePublishedAt ?? null,
      recommended_models: item.recommendedModels ?? null,
    }));

  const skillCases: Array<SkillCaseInput & { lastmod: string | null }> =
    rows.flatMap((row) => {
      if (
        row.category !== "image" &&
        row.category !== "video" &&
        row.category !== "web" &&
        row.category !== "copy" &&
        row.category !== "hardware"
      ) {
        return [];
      }

      return [
        {
          slug: row.slug,
          title: row.title,
          category: row.category as CaseCategory,
          creator: row.creator_name || "匿名作者",
          tags: row.tags ?? [],
          lastmod: caseLastmod(row),
        },
      ];
    });

  const caseEntries: SitemapEntry[] = Array.from(
    rows.reduce((map, row) => {
      const slug = row.slug?.trim();
      if (!slug || map.has(slug)) {
        return map;
      }
      map.set(slug, caseLastmod(row));
      return map;
    }, new Map<string, string | null>()),
    ([slug, lastmod]) => ({ slug, lastmod })
  );

  // 创作者 lastmod = 该作者名下所有案例 created_at 的最大值。同一个 slug 可能对应
  // 多种原始署名写法（大小写/特殊字符归一化），所以按 slug 聚合而不是按原始姓名聚合，
  // 避免两个归一化后撞 slug 的作者各出一条、覆盖彼此的 lastmod。
  const creatorLastmodBySlug = new Map<string, string | null>();
  for (const row of rows) {
    const name = row.creator_name?.trim();
    if (!name) continue;
    const slug = slugifyCreatorName(name);
    if (!slug) continue;
    creatorLastmodBySlug.set(
      slug,
      latestLastmod([creatorLastmodBySlug.get(slug) ?? null, caseLastmod(row)])
    );
  }
  const creatorEntries: SitemapEntry[] = Array.from(
    creatorLastmodBySlug,
    ([slug, lastmod]) => ({ slug, lastmod })
  );

  // Skill lastmod = 该 skill 实际关联案例（deriveSkillCatalog 判定命中的那些，
  // 和 /skills/[slug] 页面渲染用的是同一份匹配逻辑）里 created_at 的最大值。
  const skillCatalog = deriveSkillCatalog(skillCases);
  const skillEntries: SitemapEntry[] = skillCatalog.allSkills.map((skill) => ({
    slug: skill.slug,
    lastmod: latestLastmod(skill.cases.map((item) => item.lastmod)),
  }));

  // 同源守卫（只 warn，不 throw）：`skills/[slug]/page.tsx` 的
  // generateStaticParams 已经对「接了真库但派生出 0 条 skill」这一情况
  // throw 到构建失败——那是唯一会真正 404 的入口，一处炸够了。sitemap 这里
  // 只是少几条 URL，不影响已存在页面能否访问，所以只提示一声方便定位，
  // 不重复中断构建。
  if (
    skillEntries.length === 0 &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.warn(
      "[sitemap-data] 接了真库但 deriveSkillCatalog 派生出 0 条 skill，sitemap 不会" +
        "包含任何 /skills/* URL。构建不会因此失败（详情页那道硬闸门在" +
        "skills/[slug]/page.tsx），但值得核实一下数据和门槛是否符合预期。"
    );
  }

  // 模型页 lastmod = 命中该模型家族（别名子串匹配，与 /models/[slug] 页面
  // 同一套 caseMatchesModel 逻辑）的案例里 created_at 的最大值。
  const modelEntries: SitemapEntry[] = MODEL_FAMILIES.map((family) => {
    const matches = rows.filter((row) =>
      caseMatchesModel({ recommendedModels: row.recommended_models }, family)
    );
    return {
      slug: family.slug,
      lastmod: latestLastmod(matches.map(caseLastmod)),
    };
  });

  return {
    caseEntries,
    creatorEntries,
    skillEntries,
    modelEntries,
    // 全站最新案例的 created_at，给 `/`、`/cases`、`/daily` 用。
    siteLatest: latestLastmod(rows.map(caseLastmod)),
  };
}
