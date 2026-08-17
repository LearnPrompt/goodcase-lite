// 内存滑动窗口限流器：免 key 请求的软限。
//
// 这个模块被 scripts/review/lib/rate-limit.test.mjs 用纯 node 直接加载，
// 不能引入任何带 "@/" 别名的依赖，也不能 import server-only。
//
// 为什么是内存而不是共享存储
// --------------------------
// 站点跑在 Serverless 上，每个函数实例各有一份独立的进程内存，实例数量和请求
// 落在哪个实例都不由我们控制。所以这个限流器给出的**不是**配额保证：
// 真实放行量是 limit × 活跃实例数，实例回收时窗口还会整个清零。
//
// 明知不精确还这么做，是因为它要拦的东西本来就不需要精确：
// 一个写错了循环条件的脚本、一个忘了加 sleep 的爬虫，这类流量全部来自同一个
// 客户端，会被路由到少数几个实例上，撞上限的概率足够高。而真正需要精确配额的
// 场景（付费用户按量计费）走的是带 key 的路径，计数落在 Postgres 上，是准的。
//
// 换句话说：免 key 侧要的是"别让误用打爆源站"，付费侧要的才是"每一次都算对"。
// 这两件事用两套机制，比硬凑一套分布式限流简单得多，也诚实得多。

export type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  /** 本窗口内还剩多少次（已扣掉当前这次）。 */
  remaining: number;
  /** 窗口内最早那次调用的过期时刻（epoch 毫秒）。 */
  resetAt: number;
};

export type SlidingWindowLimiter = {
  /** 记一次调用并返回判定。now 由调用方传入，保证可测。 */
  hit(key: string, now: number): RateLimitDecision;
  /** 只看不记，用于诊断。 */
  peek(key: string, now: number): RateLimitDecision;
  /** 当前追踪的 key 数量，测试和排查用。 */
  size(): number;
  reset(): void;
};

export type SlidingWindowOptions = {
  limit: number;
  windowMs: number;
  /**
   * 追踪的 key 上限。超过就丢掉最久没动过的那一批。
   *
   * 没有这个上限的话，一次分布式扫描（每个请求换一个伪造的 X-Forwarded-For）
   * 就能让这张 Map 无限膨胀，把限流器本身变成内存耗尽的攻击面。
   * 被驱逐的 key 相当于窗口重置 —— 在过载时放宽限制听起来别扭，
   * 但这个取舍是对的：限流器是保护措施，它自己绝不能成为故障源。
   */
  maxKeys?: number;
};

const DEFAULT_MAX_KEYS = 10_000;

export function createSlidingWindowLimiter(
  options: SlidingWindowOptions
): SlidingWindowLimiter {
  const limit = Math.max(1, Math.trunc(options.limit));
  const windowMs = Math.max(1, Math.trunc(options.windowMs));
  const maxKeys = Math.max(1, Math.trunc(options.maxKeys ?? DEFAULT_MAX_KEYS));

  // key -> 窗口内的调用时刻，升序。
  // 用 Map 是因为它的迭代顺序 = 插入顺序，配合"命中就 delete 再 set"
  // 可以零成本地维护一个 LRU 序，驱逐时取 keys().next() 即可。
  const windows = new Map<string, number[]>();

  function prune(stamps: number[], now: number): number[] {
    const cutoff = now - windowMs;
    // 数组升序，只需要找到第一个还在窗口内的位置，一次 slice。
    let index = 0;
    while (index < stamps.length && stamps[index] <= cutoff) {
      index += 1;
    }
    return index === 0 ? stamps : stamps.slice(index);
  }

  function decide(
    stamps: number[],
    now: number,
    allowed: boolean
  ): RateLimitDecision {
    return {
      allowed,
      limit,
      remaining: Math.max(0, limit - stamps.length),
      // 窗口里最早那次调用滑出去的时刻，就是配额开始回补的时刻。
      // 窗口是空的说明当下就是满配额，reset 直接给 now + windowMs。
      resetAt: stamps.length > 0 ? stamps[0] + windowMs : now + windowMs,
    };
  }

  function evictIfNeeded() {
    while (windows.size > maxKeys) {
      const oldest = windows.keys().next();
      if (oldest.done) {
        return;
      }
      windows.delete(oldest.value);
    }
  }

  return {
    hit(key, now) {
      const pruned = prune(windows.get(key) ?? [], now);

      if (pruned.length >= limit) {
        // 拒绝的请求不记进窗口。记了的话，一个持续打满的客户端会把 resetAt
        // 一直往后推，永远等不到放行 —— 那是固定窗口惩罚，不是滑动窗口。
        windows.delete(key);
        windows.set(key, pruned);
        return decide(pruned, now, false);
      }

      pruned.push(now);
      // delete + set 把这个 key 移到 Map 末尾，维持 LRU 序。
      windows.delete(key);
      windows.set(key, pruned);
      evictIfNeeded();
      return decide(pruned, now, true);
    },

    peek(key, now) {
      const pruned = prune(windows.get(key) ?? [], now);
      return decide(pruned, now, pruned.length < limit);
    },

    size() {
      return windows.size;
    },

    reset() {
      windows.clear();
    },
  };
}
