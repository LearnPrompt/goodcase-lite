// Agent API 的 key 纯逻辑层：明文格式、哈希、请求头提取、日限额判定。
//
// 这个模块被 scripts/review/lib/api-keys.test.mjs 用纯 node 直接加载，
// 所以只允许 import node: 内置模块，不能引入任何带 "@/" 别名的依赖，
// 也不能 import server-only。API route 和签发脚本共用这里的规则，避免两边漂移。

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * 明文 key 的命名空间前缀。
 *
 * 选一个我们独占的前缀不是为了好看，是为了让"这是不是一次带 key 的调用"
 * 这个判断毫无歧义：只有以 gc_ 开头的凭据才被当作 Agent API key，
 * 其它任何 Authorization 值（Basic、别家网关插进来的 Bearer JWT）一律视为没带 key，
 * 走匿名路径。免 key 向后兼容是硬约束，不能因为请求里碰巧有个 Authorization 头就 401。
 */
export const API_KEY_PREFIX = "gc_";

/** 明文随机部分的字节数。24 字节 = 192 bit 熵，hex 化后 48 字符。 */
const SECRET_BYTES = 24;

/**
 * 明文形状：gc_ + 32~96 位小写 hex。
 * 上下界留宽是为了以后能换更长的随机串而不用改校验；下界 32 位（128 bit）是安全底线。
 */
const API_KEY_PATTERN = /^gc_[0-9a-f]{32,96}$/;

/** 存库的哈希形状：sha-256 的 64 位小写 hex。签发脚本和验证路径共用。 */
const KEY_HASH_PATTERN = /^[0-9a-f]{64}$/;

/**
 * 免 key 的软限额：每个 IP 每小时 60 次。
 *
 * 这是"软限"，不是配额保证：Serverless 每个实例各有一份内存窗口，
 * 请求被路由到哪个实例不受我们控制，所以实际放行量是 60 × 活跃实例数。
 * 它拦的是单机脚本 while true 循环这种误用，不是有组织的滥用。
 * 真要精确限流得上共享存储（Redis / Supabase 计数行），那是有付费用户之后的事。
 */
export const ANONYMOUS_HOURLY_LIMIT = 60;

/** 免 key 窗口长度：1 小时。 */
export const ANONYMOUS_WINDOW_MS = 60 * 60 * 1000;

/** 新 key 的默认日限额。签发脚本可以按客户单独调高。 */
export const DEFAULT_DAILY_LIMIT = 2_000;

/** 日限额允许的取值范围，签发脚本用它挡住手滑输入。 */
export const MIN_DAILY_LIMIT = 1;
export const MAX_DAILY_LIMIT = 1_000_000;

/** key 名称长度上限，纯粹是运营备注，不参与任何逻辑。 */
export const MAX_KEY_NAME_LENGTH = 80;

export type ApiKeyStatus = "active" | "revoked";

/** 只需要 get(name) 的读头接口：Headers 和测试里的普通对象都能喂进来。 */
export type HeaderReader = {
  get(name: string): string | null | undefined;
};

/** sha-256 hex。库里只存这个，明文只在签发那一刻出现在终端里。 */
export function hashApiKey(plaintext: string): string {
  return createHash("sha256").update(plaintext, "utf8").digest("hex");
}

export function isApiKeyShaped(value: unknown): value is string {
  return typeof value === "string" && API_KEY_PATTERN.test(value);
}

export function isKeyHashShaped(value: unknown): value is string {
  return typeof value === "string" && KEY_HASH_PATTERN.test(value);
}

/** 生成一把新 key。明文只返回一次，调用方负责打印后丢掉，别落盘。 */
export function generateApiKey(): { plaintext: string; hash: string } {
  const plaintext = `${API_KEY_PREFIX}${randomBytes(SECRET_BYTES).toString("hex")}`;
  return { plaintext, hash: hashApiKey(plaintext) };
}

/**
 * 明文与库里哈希的比对。
 *
 * 用 timingSafeEqual 而不是 ===：两个哈希长度固定 64，长度不等直接判否不泄露信息，
 * 长度相等时逐字节等时比较。实话说这里的时序侧信道价值很低（攻击者猜的是 sha-256 输出，
 * 而查库本身已经是按 hash 精确匹配了），但等时比较的成本是零，没理由不用。
 */
export function verifyApiKeyHash(plaintext: string, storedHash: unknown): boolean {
  if (!isApiKeyShaped(plaintext) || !isKeyHashShaped(storedHash)) {
    return false;
  }

  const computed = Buffer.from(hashApiKey(plaintext), "utf8");
  const stored = Buffer.from(storedHash, "utf8");
  if (computed.length !== stored.length) {
    return false;
  }
  return timingSafeEqual(computed, stored);
}

/** api_keys 表里我们真正用到的那几列。 */
export type StoredApiKey = {
  id: number;
  key_hash: string;
  daily_limit: number;
  status: string;
};

export type KeyVerdict =
  | { ok: true; key: StoredApiKey }
  | { ok: false; reason: "not_found" | "revoked" | "hash_mismatch" };

/**
 * 「查回来的这一行到底认不认」的判定，从 Supabase 查询里剥出来的纯函数。
 *
 * 剥出来是为了能不连库就把 401 的每条路径测到：查无此 key、已吊销、
 * 以及库里 hash 和明文对不上（理论上不可能，因为查询本身就是按 hash 走的，
 * 但多一道比对不花钱，能挡住"查询条件被改坏了"这类回归）。
 *
 * 三种拒绝在 API 层回同一个 401，不对外区分 —— reason 只进日志和测试，
 * 免得给探测者"这个 key 存在但被吊销了"这种额外信息。
 */
export function verifyStoredApiKey(
  plaintext: string,
  row: StoredApiKey | null | undefined
): KeyVerdict {
  if (!row) {
    return { ok: false, reason: "not_found" };
  }
  if (row.status !== "active") {
    return { ok: false, reason: "revoked" };
  }
  if (!verifyApiKeyHash(plaintext, row.key_hash)) {
    return { ok: false, reason: "hash_mismatch" };
  }
  return { ok: true, key: row };
}

export type ApiKeyAttempt =
  /** 请求里根本没有我们命名空间下的凭据 —— 走免 key 路径。 */
  | { present: false }
  /** 带了 gc_ 开头的凭据。shaped 为 false 说明形状不对，应该 401 而不是静默降级。 */
  | { present: true; shaped: boolean; plaintext: string };

/**
 * 从请求头里取 API key，支持两种写法：
 *   Authorization: Bearer gc_xxx
 *   X-API-Key: gc_xxx
 *
 * 判定规则：**只有以 gc_ 开头的值才算一次带 key 的调用**。
 * 这条规则是向后兼容的关键 —— 现网已发布的 goodcase skill 用裸 curl 调用，
 * 不带任何认证头；而经过公司代理的请求可能被塞进无关的 Authorization 头，
 * 那些请求必须继续按匿名放行，不能因为"有 Authorization 头"就当成认证失败。
 */
export function extractApiKeyAttempt(headers: HeaderReader): ApiKeyAttempt {
  const candidates = [
    stripBearer(headers.get("authorization")),
    normalizeHeaderValue(headers.get("x-api-key")),
  ];

  for (const candidate of candidates) {
    if (!candidate || !candidate.startsWith(API_KEY_PREFIX)) {
      continue;
    }
    return {
      present: true,
      shaped: isApiKeyShaped(candidate),
      plaintext: candidate,
    };
  }

  return { present: false };
}

function normalizeHeaderValue(raw: string | null | undefined): string {
  return typeof raw === "string" ? raw.trim() : "";
}

function stripBearer(raw: string | null | undefined): string {
  const value = normalizeHeaderValue(raw);
  if (!value) {
    return "";
  }
  // 大小写不敏感：Bearer / bearer / BEARER 都有人写。
  const match = /^bearer\s+(.+)$/i.exec(value);
  return match ? match[1].trim() : value;
}

/**
 * 免 key 限流的身份键：客户端 IP。
 *
 * x-forwarded-for 是逗号分隔的链路，最左边是原始客户端。这个头是可以伪造的，
 * 所以免 key 限流本质上拦不住存心绕过的人 —— 这也是它只配当"软限"、
 * 而真正的配额要挂在 key 上的原因。取不到 IP 时回退到一个共享桶 "unknown"，
 * 让这类请求彼此挤在同一个窗口里，而不是每条都获得一份独立配额。
 */
export function clientIpFromHeaders(headers: HeaderReader): string {
  const forwarded = normalizeHeaderValue(headers.get("x-forwarded-for"));
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = normalizeHeaderValue(headers.get("x-real-ip"));
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

/**
 * 用量归档的日期键：UTC 的 YYYY-MM-DD。
 *
 * 刻意用 UTC 而不是北京时间：函数跑在哪个区域不确定，UTC 是唯一在所有实例上
 * 一致的切分。文档页会写清楚"配额按 UTC 自然日重置"，别让用户自己猜。
 */
export function usageDayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/** 下一个 UTC 零点的 epoch 毫秒，用于 X-RateLimit-Reset。 */
export function nextUsageResetAt(now: Date): number {
  const next = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  );
  return next;
}

export type QuotaDecision = {
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
};

/**
 * 日限额边界判定。used 是"这次请求计数之后"的值。
 *
 * 边界口径：limit = 100 时，第 100 次请求应该成功且 remaining 归 0，
 * 第 101 次被拒。remaining 永远不为负 —— 限额被人工调低时库里的 used
 * 可能已经超过新 limit，那种情况下 remaining 报 0 而不是负数。
 */
export function evaluateQuota(
  used: number,
  limit: number,
  allowed: boolean
): QuotaDecision {
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.trunc(limit)) : 0;
  const safeUsed = Number.isFinite(used) ? Math.max(0, Math.trunc(used)) : 0;
  return {
    allowed,
    limit: safeLimit,
    used: safeUsed,
    remaining: Math.max(0, safeLimit - safeUsed),
  };
}

/**
 * 表 / 函数还没建时的降级判定，思路照抄 src/lib/reactions-payload.ts 的
 * isMissingTableError，但把关系名做成参数，因为这里要同时认三个对象
 * （api_keys、api_usage、consume_api_quota 函数）。
 *
 * 三个码都要认：Postgres 原生 42P01（undefined_table）/ 42883（undefined_function），
 * 以及 PostgREST 在 schema cache 里找不到表 / 函数时回的 PGRST205 / PGRST202。
 * 走 supabase-js 时实际拿到的通常是后两者。
 */
export function isMissingApiKeyRelationError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = (error as { code?: unknown }).code;
  if (
    code === "42P01" ||
    code === "42883" ||
    code === "PGRST205" ||
    code === "PGRST202"
  ) {
    return true;
  }

  const message = (error as { message?: unknown }).message;
  if (typeof message !== "string") {
    return false;
  }
  const lower = message.toLowerCase();
  const mentionsRelation =
    lower.includes("api_keys") ||
    lower.includes("api_usage") ||
    lower.includes("consume_api_quota");
  return (
    mentionsRelation &&
    (lower.includes("does not exist") || lower.includes("schema cache"))
  );
}

/** 签发脚本用的名称清洗。空名字不给过 —— 没有名字的 key 事后没法认领和吊销。 */
export function cleanKeyName(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length === 0 || name.length > MAX_KEY_NAME_LENGTH) {
    return "";
  }
  return name;
}

/** 签发脚本用的日限额清洗。非整数、越界一律返回 null，由调用方报错退出。 */
export function cleanDailyLimit(value: unknown): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value.trim())
        : Number.NaN;

  if (!Number.isInteger(parsed)) {
    return null;
  }
  if (parsed < MIN_DAILY_LIMIT || parsed > MAX_DAILY_LIMIT) {
    return null;
  }
  return parsed;
}

/**
 * 统一的限额响应头。三个头都用业界通行的 X-RateLimit-* 命名，
 * Reset 用 epoch 秒（不是剩余秒数），和 GitHub / Stripe 一致，Agent 侧好解析。
 */
export function rateLimitHeaders(input: {
  limit: number;
  remaining: number;
  resetAt: number;
  scope: "anonymous" | "key";
}): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(input.limit),
    "X-RateLimit-Remaining": String(Math.max(0, input.remaining)),
    "X-RateLimit-Reset": String(Math.ceil(input.resetAt / 1000)),
    "X-RateLimit-Scope": input.scope,
  };
}

/** 429 时额外给一个 Retry-After（秒），照 HTTP 语义补齐，别让调用方自己算。 */
export function retryAfterSeconds(resetAt: number, now: number): number {
  return Math.max(1, Math.ceil((resetAt - now) / 1000));
}
