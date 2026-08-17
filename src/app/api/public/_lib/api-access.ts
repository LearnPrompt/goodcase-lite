import "server-only";

import { getAdminSupabaseClient } from "@/lib/supabase/admin-client";
import {
  ANONYMOUS_HOURLY_LIMIT,
  ANONYMOUS_WINDOW_MS,
  clientIpFromHeaders,
  evaluateQuota,
  extractApiKeyAttempt,
  hashApiKey,
  isMissingApiKeyRelationError,
  nextUsageResetAt,
  rateLimitHeaders,
  retryAfterSeconds,
  usageDayKey,
  verifyStoredApiKey,
  type StoredApiKey,
} from "@/lib/api-keys";
import { createSlidingWindowLimiter } from "@/lib/rate-limit";

/**
 * 免 key 的进程内滑动窗口。模块级单例 —— 同一个函数实例上的请求共用一份。
 * 它的不精确性和取舍写在 src/lib/rate-limit.ts 的文件头注释里，那是这个设计
 * 最需要被理解的部分，不在这里重复。
 */
const anonymousLimiter = createSlidingWindowLimiter({
  limit: ANONYMOUS_HOURLY_LIMIT,
  windowMs: ANONYMOUS_WINDOW_MS,
});

/**
 * 带 key 的响应绝不能进 CDN 缓存：
 *  1) X-RateLimit-Remaining 是逐请求变化的，缓存下来就是错的；
 *  2) 一把 key 的响应被缓存后可能命中给另一把 key 的请求，配额就串了。
 * 免 key 的响应继续沿用原有的 s-maxage=300 公共缓存，一个字不改。
 */
const KEYED_CACHE_CONTROL = "private, no-store";

export type ApiAccessGranted = {
  ok: true;
  /** 合并进响应头的限额信息。 */
  headers: Record<string, string>;
  /** 是否走了带 key 的路径。免 key（含降级）为 false。 */
  authenticated: boolean;
  /** 带 key 时覆盖 Cache-Control；免 key 时为 null，保留原有公共缓存。 */
  cacheControl: string | null;
};

export type ApiAccessDenied = {
  ok: false;
  status: 401 | 429;
  /** 错误码，机器可判；文案由调用方按 locale 出。 */
  code: "invalid_api_key" | "rate_limited" | "quota_exceeded";
  headers: Record<string, string>;
};

export type ApiAccess = ApiAccessGranted | ApiAccessDenied;

/**
 * 判定一次公开 API 调用的准入。
 *
 * 三条路径：
 *   A. 没带 gc_ 凭据      → 按 IP 走每小时软限，超了 429。
 *   B. 带了 gc_ 凭据      → 验哈希 → 原子扣配额 → 放行并回 X-RateLimit-Remaining。
 *   C. 表 / 函数还没建     → 整体退回 A，等同免 key 模式。
 *
 * 路径 C 是这次改动能先上线、迁移后跑的原因，也是它必须存在的原因：
 * 代码部署和迁移执行永远不是同一时刻，中间那段窗口里 API 必须照常工作。
 * 注意 C 会让一把**错的** key 也被当成匿名请求放行（表都没有，无从验起），
 * 这是刻意的 —— 在"迁移前误把合法调用挡在门外"和"迁移前少挡几个伪造 key"
 * 之间，向后兼容优先。
 */
export async function resolveApiAccess(request: Request): Promise<ApiAccess> {
  const now = Date.now();
  const attempt = extractApiKeyAttempt(request.headers);

  if (attempt.present) {
    if (!attempt.shaped) {
      // 形状都不对，不用查库。注意这里必须已经确认过 gc_ 前缀，
      // 否则会把带无关 Authorization 头的匿名请求打成 401。
      return {
        ok: false,
        status: 401,
        code: "invalid_api_key",
        headers: { "Cache-Control": KEYED_CACHE_CONTROL },
      };
    }

    const keyed = await resolveKeyedAccess(attempt.plaintext, now);
    if (keyed) {
      return keyed;
    }
    // keyed 为 null = 降级（没配 service role key，或迁移还没跑），落到匿名路径。
  }

  return resolveAnonymousAccess(request, now);
}

function resolveAnonymousAccess(request: Request, now: number): ApiAccess {
  const ip = clientIpFromHeaders(request.headers);
  const decision = anonymousLimiter.hit(`ip:${ip}`, now);
  const headers = rateLimitHeaders({
    limit: decision.limit,
    remaining: decision.remaining,
    resetAt: decision.resetAt,
    scope: "anonymous",
  });

  if (!decision.allowed) {
    return {
      ok: false,
      status: 429,
      code: "rate_limited",
      headers: {
        ...headers,
        "Retry-After": String(retryAfterSeconds(decision.resetAt, now)),
        "Cache-Control": "no-store",
      },
    };
  }

  return { ok: true, headers, authenticated: false, cacheControl: null };
}

/**
 * 带 key 的路径。返回 null 表示"这套机制当前不可用，请降级到免 key"。
 * 任何真错误（网络、权限）也返回 null —— 计费机制自己挂了不该连累读接口。
 */
async function resolveKeyedAccess(
  plaintext: string,
  now: number
): Promise<ApiAccess | null> {
  const supabase = getAdminSupabaseClient();
  if (!supabase) {
    return null;
  }

  const keyHash = hashApiKey(plaintext);

  let row: StoredApiKey | null;
  try {
    // 按 hash 精确查，明文从不落库也从不进日志。
    const { data, error } = await supabase
      .from("api_keys")
      .select("id, key_hash, daily_limit, status")
      .eq("key_hash", keyHash)
      .maybeSingle();

    if (error) {
      if (isMissingApiKeyRelationError(error)) {
        return null;
      }
      throw error;
    }
    row = (data as StoredApiKey | null) ?? null;
  } catch {
    return null;
  }

  // 查不到、已吊销、哈希对不上 —— 三种情况回同一个 401，
  // 判定逻辑在 verifyStoredApiKey 里，单测覆盖每条分支。
  const verdict = verifyStoredApiKey(plaintext, row);
  if (!verdict.ok) {
    return {
      ok: false,
      status: 401,
      code: "invalid_api_key",
      headers: { "Cache-Control": KEYED_CACHE_CONTROL },
    };
  }

  const resetAt = nextUsageResetAt(new Date(now));

  let consumed: { allowed: boolean; used: number } | null;
  try {
    consumed = await consumeQuota(supabase, verdict.key, now);
  } catch {
    return null;
  }
  if (!consumed) {
    return null;
  }

  const quota = evaluateQuota(
    consumed.used,
    verdict.key.daily_limit,
    consumed.allowed
  );
  const headers = rateLimitHeaders({
    limit: quota.limit,
    remaining: quota.remaining,
    resetAt,
    scope: "key",
  });

  if (!quota.allowed) {
    return {
      ok: false,
      status: 429,
      code: "quota_exceeded",
      headers: {
        ...headers,
        "Retry-After": String(retryAfterSeconds(resetAt, now)),
        "Cache-Control": KEYED_CACHE_CONTROL,
      },
    };
  }

  return {
    ok: true,
    headers,
    authenticated: true,
    cacheControl: KEYED_CACHE_CONTROL,
  };
}

/**
 * 「查用量 → 判限额 → 计数 +1」合成一次 RPC。
 *
 * 为什么不是先 select 再 update：那是读改写竞态，同一把 key 的并发请求会互相
 * 覆盖计数，超额也放得过去。付费配额允许不精确的话就没有付费配额可言了。
 * consume_api_quota 在库里用行级锁把这三步做成一个原子操作，
 * 定义见 supabase/migrations/20260807000000_agent_api_keys.sql。
 *
 * 返回 null = 函数不存在（迁移没跑），调用方据此降级。
 */
async function consumeQuota(
  supabase: NonNullable<ReturnType<typeof getAdminSupabaseClient>>,
  row: StoredApiKey,
  now: number
): Promise<{ allowed: boolean; used: number } | null> {
  const { data, error } = await supabase.rpc("consume_api_quota", {
    p_key_id: row.id,
    p_day: usageDayKey(new Date(now)),
    p_limit: row.daily_limit,
  });

  if (error) {
    if (isMissingApiKeyRelationError(error)) {
      return null;
    }
    throw error;
  }

  // returns table(...) 在 PostgREST 上回的是数组。
  const record = Array.isArray(data) ? data[0] : data;
  if (!record || typeof record !== "object") {
    return null;
  }

  const allowed = (record as { allowed?: unknown }).allowed === true;
  const rawUsed = (record as { used?: unknown }).used;
  const used = typeof rawUsed === "number" ? rawUsed : Number(rawUsed);

  return { allowed, used: Number.isFinite(used) ? used : row.daily_limit };
}

/** 401 / 429 的双语文案，和现有 route 的错误风格保持一致（一个 error 字段）。 */
export function apiAccessErrorMessage(
  code: ApiAccessDenied["code"],
  locale: "zh-CN" | "en"
): string {
  const isEnglish = locale === "en";
  switch (code) {
    case "invalid_api_key":
      return isEnglish
        ? "Invalid or revoked API key. Remove the header to fall back to the anonymous tier."
        : "API key 无效或已吊销。去掉认证头即可退回匿名档使用。";
    case "quota_exceeded":
      return isEnglish
        ? "Daily quota exhausted for this API key. It resets at 00:00 UTC."
        : "这把 API key 的当日配额已用完，UTC 零点重置。";
    case "rate_limited":
    default:
      return isEnglish
        ? "Too many anonymous requests from this IP. Slow down, or use an API key for a higher quota."
        : "该 IP 的匿名请求过于频繁。请降低频率，或申请 API key 换更高配额。";
  }
}
