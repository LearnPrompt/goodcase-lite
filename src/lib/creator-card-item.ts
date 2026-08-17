import type { CreatorCardItem } from "@/components/creator-card";
import type { CreatorItem } from "@/lib/creators";
// 相对路径 + 显式 .ts 后缀：这个文件会被 scripts/review/lib/*.test.mjs 用相对路径
// 直接 import（node --test 原生跑 TS，不认 tsconfig 的 "@/*" 路径别名），
// 之前这里全是 import type（编译期整句被抹掉，不受影响），这是第一个值导入，
// 用 "@/lib/case-presentation" 会在测试里报 ERR_MODULE_NOT_FOUND。
import { getPresentableCaseSummary } from "./case-presentation.ts";
import { getSearchSnippet, type SearchMatch } from "./search.ts";

/**
 * 从完整 CreatorItem 里挑出卡片真正要渲染的字段。
 *
 * 必须放在这个普通模块里，不能挂在 creator-card.tsx 上：那个文件是 "use client"，
 * 从服务端组件调用它导出的普通函数会在运行期报
 * 「Attempted to call toCreatorCardItem() from the server」——
 * tsc / eslint / next build 都不会报这个错，只有真跑起来才炸。
 *
 * 为什么要挑而不是直接 {...creator}：CreatorItem 上挂着 heroCase（完整 CaseItem，
 * 含 promptFull / resultBreakdown）和 representativeCases（一整数组完整 CaseItem）。
 * 客户端组件的 props 会被原样序列化进 RSC payload，整个传进去等于把几十 KB
 * 卡片根本不渲染的 Prompt 正文塞进 HTML。
 */
export function toCreatorCardItem(
  creator: CreatorItem,
  search?: { query: string; match: SearchMatch | null }
): CreatorCardItem {
  return {
    slug: creator.slug,
    name: creator.name,
    avatarUrl: creator.avatarUrl,
    bio: creator.bio,
    // 卡片只显示前两个标签，多余的没必要序列化。
    tags: creator.tags.slice(0, 2),
    highlightedLabel: creator.highlightedLabel,
    caseCount: creator.caseCount,
    averageSourceHeatScore: creator.averageSourceHeatScore,
    averageStabilityScore: creator.averageStabilityScore,
    heroCaseSlug: creator.heroCase.slug,
    heroCaseTitle: creator.heroCase.title,
    // 裸取 summary 会把「来自 X 的真实…」这类自动生成套话原样传出去；
    // 这里在服务端就把摘要过滤 + 兜底解析成最终字符串，只往下传一个 string | null，
    // 不把 promptContributionNotes 整个数组带进 CreatorCardItem，payload 不会因此变大。
    heroCaseSummary: getPresentableCaseSummary(
      creator.heroCase.summary,
      creator.heroCase.promptContributionNotes
    ),
    // 已经是服务端算好、按 locale 格式化的 YYYY/MM/DD 字符串（或 null），
    // 不是对象，符合「只传一个格式化好的日期字符串」的 payload 纪律。
    latestWorkDate: creator.latestWorkDate,
    ...(search
      ? {
          searchQuery: search.query,
          searchSnippet: search.match
            ? getSearchSnippet(search.match, search.query)
            : null,
          searchField: search.match?.field ?? null,
        }
      : {}),
  };
}
