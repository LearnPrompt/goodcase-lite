import { unstable_cache } from "next/cache";
import {
  CASES_CACHE_TAG,
  CASES_CACHE_TTL_SECONDS,
  memoizeInProcess,
  type Loader,
} from "@/lib/case-cache-policy";

/**
 * Case 取数的跨请求缓存。
 *
 * 背景：/cases、/creators、/skills 要读 searchParams（分页 / 关键词 / 分类），
 * Next 16 因此把它们强制成按请求动态渲染，页面上的 revalidate 和
 * generateStaticParams 都不再生效，构建路由表里是 ƒ，响应也没有 x-nextjs-cache。
 * 但真正贵的不是渲染，是每次渲染都要把 cases 表整张拉一遍
 * （实测每个请求 513KB 出网，Supabase 免费额度 Egress 只有 5GB/月）。
 *
 * 所以缓存不放在页面层，放在取数层：页面照旧每请求渲染，
 * 底下的行在缓存窗口内只回源一次。搜索和筛选逻辑一行都不用改。
 *
 * 为什么用 unstable_cache：
 *   - `use cache` / cacheLife / cacheTag 属于 cacheComponents 那一套，
 *     要在 next.config 里开开关，会连带改变整站的渲染语义，代价远大于这次的目标。
 *   - 自己写一个模块级 Map + TTL 也能跨请求，但它只活在单个实例里：
 *     Serverless 冷启动就没了，多实例各缓存一份，也没法被发布链路主动失效。
 *     unstable_cache 背后是 Data Cache，跨实例共享，还能 revalidateTag。
 *
 * 缓存的是 Supabase 原始行，不是 enrich 之后的 DisplayCaseItem。
 * Data Cache 单条上限 2MB（见 next/dist/server/lib/incremental-cache：
 * 超限只打一行 warn 然后静默不写）。314 行 card 档实测：
 *   原始行           zh 0.501MB / en 0.564MB（占上限 25.0% / 28.2%）
 *   enrich 之后      zh 0.892MB / en 1.236MB（占上限 44.6% / 61.8%）
 * enrich 会给每条 Case 多出编辑按语、实验建议、复用方法这些长文案，
 * en 档已经吃掉六成上限，Case 数再涨六成就会静默不缓存——而且是静默的。
 * 所以映射和 enrich 留给外面那层 React cache，同一次渲染里照样只算一次。
 */

export {
  CASES_CACHE_TAG,
  CASES_CACHE_TTL_SECONDS,
  CaseRowsUnavailableError,
} from "@/lib/case-cache-policy";

const IS_PRODUCTION_BUILD =
  process.env.NEXT_PHASE === "phase-production-build";

/**
 * 把一个「取原始行」的函数包成跨请求缓存。
 *
 * name 只用来把不同档次的缓存键分开（index / card / detail / count 各一份）；
 * locale、slug 这类维度靠函数参数进键，调用方不用自己拼 key。
 * 回调抛异常时什么都不写，所以降级结果不会被缓存。
 */
export function cacheCaseRows<A extends unknown[], R>(
  name: string,
  loader: Loader<A, R>
): Loader<A, R> {
  if (IS_PRODUCTION_BUILD) {
    return memoizeInProcess(loader);
  }

  return unstable_cache(loader, [name], {
    revalidate: CASES_CACHE_TTL_SECONDS,
    tags: [CASES_CACHE_TAG],
  });
}
