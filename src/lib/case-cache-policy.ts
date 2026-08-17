/**
 * Case 跨请求缓存的策略层：常量、构建期 memo、失败信号。
 *
 * 单独一个文件、且不依赖任何东西，是为了能被 node:test 直接跑——
 * 真正绑定 Next Data Cache 的 unstable_cache 在 @/lib/case-cache 里，
 * 那个模块 node 解析不了 `next/cache`（next 没有 exports map，
 * 无扩展名的 `next/cache` 在 ESM 下解析失败）。
 */

/** 发布链路用它主动失效全部 Case 取数缓存：revalidateTag(CASES_CACHE_TAG)。 */
export const CASES_CACHE_TAG = "goodcase:cases";

/** 缓存窗口，和三个列表页 export const revalidate 对齐。 */
export const CASES_CACHE_TTL_SECONDS = 3_600;

/**
 * 缓存回调里用来标记「这次取数失败了，别写缓存」。
 *
 * unstable_cache 只在回调 resolve 之后写缓存，reject 直接透传、什么都不写；
 * 条目已过期而回调又失败时，它会继续返回上一份好数据。
 * 所以「Supabase 抖动 → 回退本地样例」那条路不可能被钉进缓存窗口。
 */
export class CaseRowsUnavailableError extends Error {
  constructor(reason: string) {
    super(`Case rows unavailable: ${reason}`);
    this.name = "CaseRowsUnavailableError";
  }
}

export type Loader<A extends unknown[], R> = (...args: A) => Promise<R>;

/**
 * 构建期用的进程内 memo：不落盘、不跨构建、失败不留痕。
 *
 * 为什么构建期不能用 Data Cache：它是落盘的（.next/cache，Vercel 还会跨构建恢复），
 * 构建期去读就可能把上一次部署留下的旧行烤进新的静态页，
 * 运营发布后触发的那次部署等于白跑。memo 只活在构建进程里，
 * 既拿到「整个构建只回源一次」的收益，又保证每次构建都是新数据。
 *
 * 键就是参数本身，所以 locale / slug 天然分开。
 */
export function memoizeInProcess<A extends unknown[], R>(
  loader: Loader<A, R>
): Loader<A, R> {
  const inflight = new Map<string, Promise<R>>();

  return (...args: A) => {
    const key = JSON.stringify(args);
    const hit = inflight.get(key);
    if (hit) {
      return hit;
    }

    const pending = loader(...args);
    inflight.set(key, pending);
    // 失败的结果不留在 memo 里，下一个页面重新取。
    pending.catch(() => inflight.delete(key));
    return pending;
  };
}
