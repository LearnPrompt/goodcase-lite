import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 请求超时（毫秒）。
 * 本机访问 supabase.co 可能被墙（TLS 重置），@supabase/postgrest-js 自带重试，
 * 导致单次查询需 8 秒才返回 error。用 Promise.race 在应用层兜底：
 * 超时即视为 Supabase 不可用，快速 fallback 到 mock-data，
 * 保证 SSR 流式渲染不被阻塞、动态页面不卡在 loading 骨架屏、hydration 正常完成。
 */
export const SUPABASE_TIMEOUT_MS = 3_000;

const TRANSIENT_SUPABASE_ERROR_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ENETUNREACH",
  "UND_ERR_CONNECT_TIMEOUT",
]);

type RetryableErrorLike = {
  cause?: unknown;
  code?: unknown;
  name?: unknown;
  message?: unknown;
  status?: unknown;
};

function asRetryableErrorLike(error: unknown): RetryableErrorLike | null {
  return error && typeof error === "object"
    ? (error as RetryableErrorLike)
    : null;
}

/**
 * 只认网络层失败和应用层超时为瞬态错误。
 *
 * Supabase 的 HTTP 4xx/5xx 会作为 resolved response 的 `error` 返回，
 * 详情查询会把它们包装成 CaseRowsUnavailableError；它们不会经过这个
 * 判定，因此不会被重试。这里也显式看 status，避免未来某个调用方把
 * HTTP 错误直接 throw 后误判为网络抖动。
 */
export function isTransientSupabaseError(error: unknown): boolean {
  const seen = new Set<unknown>();
  let current: unknown = error;

  while (current && !seen.has(current)) {
    seen.add(current);
    const candidate = asRetryableErrorLike(current);
    if (!candidate) {
      break;
    }

    if (candidate.name === "CaseRowsUnavailableError") {
      return false;
    }

    const status =
      typeof candidate.status === "number" ? candidate.status : null;
    if (status !== null && status >= 400 && status < 500) {
      return false;
    }

    if (
      typeof candidate.code === "string" &&
      TRANSIENT_SUPABASE_ERROR_CODES.has(candidate.code)
    ) {
      return true;
    }

    if (
      candidate.name === "TimeoutError" ||
      candidate.name === "AbortError" ||
      candidate.code === "ABORT_ERR"
    ) {
      return true;
    }

    if (typeof candidate.message === "string") {
      const message = candidate.message.toLowerCase();
      if (
        message.includes("supabase query timed out") ||
        message.includes("fetch failed") ||
        message.includes("network") ||
        message.includes("timed out") ||
        message.includes("abort") ||
        message.includes("socket hang up")
      ) {
        return true;
      }
    }

    current = candidate.cause;
  }

  return false;
}

export type TransientRetryOptions = {
  /** 总尝试次数；默认 2，即失败后只补一次。 */
  maxAttempts?: number;
  /** 重试前等待毫秒数。 */
  delayMs?: number;
  shouldRetry?: (error: unknown) => boolean;
  sleep?: (ms: number) => Promise<void>;
};

/**
 * 应用层的瞬态 Supabase 请求重试。
 *
 * 这是 build-time detail read 的稳定性兜底，不是通用的无限重试器：
 * 默认最多两次，且只接受 isTransientSupabaseError 判定为网络/超时的错误。
 */
export async function retryTransient<T>(
  load: () => Promise<T>,
  {
    maxAttempts = 2,
    delayMs = 250,
    shouldRetry = isTransientSupabaseError,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  }: TransientRetryOptions = {},
): Promise<T> {
  const attempts = Math.max(1, Math.floor(maxAttempts));
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await load();
    } catch (error) {
      lastError = error;
      if (attempt >= attempts || !shouldRetry(error)) {
        throw error;
      }
      if (delayMs > 0) {
        await sleep(delayMs);
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError));
}

let cachedClient: SupabaseClient | null | undefined;

export function getServerSupabaseClient(): SupabaseClient | null {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

/**
 * 带超时的 Promise wrapper：在 SUPABASE_TIMEOUT_MS 内没完成就 reject，
 * 让调用方的 fallback 逻辑快速生效。
 * 接受 PromiseLike 以兼容 Supabase query builder（thenable 但非 Promise）。
 */
export async function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number = SUPABASE_TIMEOUT_MS,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Supabase query timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([Promise.resolve(promise), timeout]);
  } finally {
    clearTimeout(timer!);
  }
}
