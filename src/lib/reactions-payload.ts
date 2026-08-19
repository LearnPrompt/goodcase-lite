// 反应（点赞 / 催复测投票）的纯逻辑层：输入校验、计数聚合、Supabase 错误分类。
//
// 这个模块被 内部测试脚本 用纯 node 直接加载，
// 不能引入任何带 "@/" 别名的运行时依赖，也不能 import server-only 的东西。
// API route 和客户端都从这里取校验规则，避免两边规则漂移。

export const REACTION_KINDS = ["like", "retest_vote"] as const;

export type ReactionKind = (typeof REACTION_KINDS)[number];

export type ReactionCounts = {
  like: number;
  retestVote: number;
};

/** Supabase 分页读取 case_reactions 时使用的请求页大小。 */
export const REACTION_PAGE_SIZE = 500;

export type ReactionPage<T> = {
  data: T[] | null;
  error: { message?: string } | null;
  count?: number | null;
};

/**
 * 读取完整的 case_reactions 结果集。
 *
 * PostgREST 的默认 max-rows 会静默截断结果，所以不能用一个很大的
 * limit 假设「全量都回来了」。调用方必须在查询上加稳定 order，并用
 * count=exact + range 分页；offset 按实际返回行数前进，兼容服务端
 * max-rows 小于请求页大小的情况。
 */
export async function fetchAllReactionRows<T>(
  buildQuery: (from: number, to: number) => PromiseLike<ReactionPage<T>>,
  pageSize = REACTION_PAGE_SIZE
): Promise<T[]> {
  if (!Number.isInteger(pageSize) || pageSize <= 0) {
    throw new Error("reaction page size must be a positive integer");
  }

  const rows: T[] = [];
  for (let from = 0; ; ) {
    const { data, error, count } = await buildQuery(
      from,
      from + pageSize - 1
    );
    if (error) {
      throw new Error(error.message || "case_reactions query failed");
    }

    const page = data ?? [];
    rows.push(...page);

    if (typeof count === "number") {
      if (rows.length >= count) {
        return rows;
      }
      if (page.length === 0) {
        throw new Error(
          "case_reactions pagination ended before the exact row count"
        );
      }
    } else if (page.length < pageSize) {
      return rows;
    }

    from += page.length;
  }
}

const REACTION_KIND_SET = new Set<string>(REACTION_KINDS);

// slug 的形状：若干「字母或数字」段，用单个连字符连接。
//
// 不能只允许 ASCII：线上 395 条 cases 里有一条是 sensenova-u1-pro-功能页面。
// 它不是 src/lib/candidate-dedupe.ts 的 slugify 产出的（那个函数遇到非 ASCII 会补哈希后缀），
// 应该是人工录入的，但它已经是线上可访问的详情页 URL，校验规则必须认它。
// 用 \p{L}\p{N} 覆盖 CJK，同时仍然挡掉 PostgREST 过滤器里有特殊含义的字符
// （逗号、括号、单双引号、点、星号、百分号）和空白。
// 当前最长 slug 53 字符，上限留到 120。
const SLUG_PATTERN = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;
const MAX_SLUG_LENGTH = 120;

// sessionId 复用埋点那套匿名会话 ID（crypto.randomUUID 或 时间戳-随机串），
// 值域和 analytics-payload.ts 的 cleanSessionId 保持一致：字母数字加连字符，8~100 位。
const SESSION_ID_PATTERN = /^[a-zA-Z0-9-]{8,100}$/;

// 埋点在拿不到存储（无痕、禁用 storage）时回退成固定串 "ephemeral"。
// 埋点可以接受这个共享桶，反应不行：所有这类浏览器会挤在同一个防重键上，
// 第一个人点完后面所有人都被唯一约束挡掉，更糟的是其中任何一个人取消点赞
// 会把这行共享记录删掉。所以写库路径直接拒掉它，退化成"只有本地状态"。
const EPHEMERAL_SESSION_ID = "ephemeral";

// 批量查询一次最多问多少个 slug。列表页一屏 20 条，留一倍余量。
export const MAX_BATCH_SLUGS = 40;

export function isReactionKind(value: unknown): value is ReactionKind {
  return typeof value === "string" && REACTION_KIND_SET.has(value);
}

/** 合法返回原 slug，不合法返回空串。不做大小写纠正——slug 是主键的一部分，只认原样。 */
export function cleanCaseSlug(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  const slug = value.trim();
  if (slug.length === 0 || slug.length > MAX_SLUG_LENGTH) {
    return "";
  }
  return SLUG_PATTERN.test(slug) ? slug : "";
}

/** 合法返回原 sessionId，不合法返回空串。写库路径上不接受 "ephemeral" 兜底——防重要靠它。 */
export function cleanSessionId(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  const sessionId = value.trim();
  if (sessionId === EPHEMERAL_SESSION_ID) {
    return "";
  }
  return SESSION_ID_PATTERN.test(sessionId) ? sessionId : "";
}

/** 解析 ?slug= / ?slugs= 的批量查询参数，去重并保序；任何一个非法就整体拒掉。 */
export function parseSlugQuery(
  rawSlug: string | null,
  rawSlugs: string | null
): { ok: true; slugs: string[] } | { ok: false; error: string } {
  const raw = (rawSlugs ?? rawSlug ?? "").trim();
  if (!raw) {
    return { ok: false, error: "slug is required" };
  }

  const parts = raw.split(",");
  if (parts.length > MAX_BATCH_SLUGS) {
    return { ok: false, error: "too many slugs" };
  }

  const slugs: string[] = [];
  for (const part of parts) {
    const slug = cleanCaseSlug(part);
    if (!slug) {
      return { ok: false, error: "invalid slug" };
    }
    if (!slugs.includes(slug)) {
      slugs.push(slug);
    }
  }

  return { ok: true, slugs };
}

export type ReactionWriteRequest = {
  caseSlug: string;
  kind: ReactionKind;
  sessionId: string;
};

/** POST / DELETE 的 body 校验。错误信息只回固定字符串，不回显用户输入。 */
export function parseReactionWriteBody(
  raw: unknown
): { ok: true; value: ReactionWriteRequest } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "invalid body" };
  }

  const body = raw as Record<string, unknown>;

  const caseSlug = cleanCaseSlug(body.slug);
  if (!caseSlug) {
    return { ok: false, error: "invalid slug" };
  }

  if (!isReactionKind(body.kind)) {
    return { ok: false, error: "invalid kind" };
  }

  const sessionId = cleanSessionId(body.sessionId);
  if (!sessionId) {
    return { ok: false, error: "invalid sessionId" };
  }

  return { ok: true, value: { caseSlug, kind: body.kind, sessionId } };
}

export function emptyReactionCounts(): ReactionCounts {
  return { like: 0, retestVote: 0 };
}

/**
 * 把 (case_slug, kind) 行聚合成每个 slug 的计数。
 * PostgREST 没有 group by，所以取回明细在这里数；调用方用
 * fetchAllReactionRows 分页，避免服务端 max-rows 静默截断。
 * 未知 kind（迁移里加了新值但前端还没跟上）直接忽略，不炸。
 */
export function countReactionRows(
  rows: ReadonlyArray<{ case_slug?: unknown; kind?: unknown }>,
  slugs: readonly string[]
): Record<string, ReactionCounts> {
  const counts: Record<string, ReactionCounts> = {};
  for (const slug of slugs) {
    counts[slug] = emptyReactionCounts();
  }

  for (const row of rows) {
    const slug = typeof row.case_slug === "string" ? row.case_slug : "";
    const bucket = counts[slug];
    if (!bucket) {
      continue;
    }
    if (row.kind === "like") {
      bucket.like += 1;
    } else if (row.kind === "retest_vote") {
      bucket.retestVote += 1;
    }
  }

  return counts;
}

/**
 * 表还没建时的降级判定。
 *
 * 两个码都要认：Postgres 原生的 42P01（undefined_table），以及 PostgREST 在
 * schema cache 里找不到表时回的 PGRST205（"Could not find the table ... in the schema cache"）。
 * 走 supabase-js 时实际拿到的通常是后者，只判 42P01 会漏。
 */
export function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = (error as { code?: unknown }).code;
  if (code === "42P01" || code === "PGRST205" || code === "PGRST202") {
    return true;
  }

  const message = (error as { message?: unknown }).message;
  if (typeof message !== "string") {
    return false;
  }
  const lower = message.toLowerCase();
  return (
    lower.includes("case_reactions") &&
    (lower.includes("does not exist") || lower.includes("schema cache"))
  );
}

/** 唯一约束冲突 = 这个会话已经反应过，按幂等成功处理。 */
export function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  return (error as { code?: unknown }).code === "23505";
}
