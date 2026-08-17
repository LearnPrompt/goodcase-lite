"use client";

import { useMessages } from "@/i18n/client";
import { useRetestVote } from "@/lib/use-retest-vote";

/**
 * 稳定度格子/首页深度 Case 里「投票催复测」文案，现在可点：点击即乐观 +1、
 * POST /api/reactions、记 localStorage，跟详情页 RetestVoteButton 共用同一个
 * use-retest-vote.ts hook——同一案例在任一页面投过，两处状态立刻同步。
 *
 * 底层订阅的仍是 reaction-counts.ts 里的全局单例 store，一页只会合并成一条
 * /api/reactions 批量请求，这个组件本身不额外发请求。
 *
 * 粒度收在这一个小组件：只有它会因计数/投票状态更新而重渲染，不会带动整张卡片
 * （case-card.tsx / home-case-deck.tsx）重渲染。
 *
 * 视觉刻意不用 gc-action（那个类 min-height 2.75rem，会撑破卡片统计格/底栏
 * 刚锁定的高度对齐）。可点态只用下划线做最小暗示，字号、行高完全继承父级
 * （gc-stat-value 或 gallery 变体的 text-sm），跟"有实测分数时的纯文本"占用
 * 同一个盒子高度，同一行卡片的 y 对齐不受影响。
 */
export function CaseCardStabilityVote({ caseSlug }: { caseSlug: string }) {
  const messages = useMessages();
  const { hasVoted, reactions, voteCount, vote } = useRetestVote(caseSlug);
  // 计数不因投没投而消失，跟详情页 RetestVoteButton 的展示逻辑一致——
  // 那边票数 span 独立于 hasVoted 渲染，不是只在未投票时才露出。
  const showCount = reactions.available && voteCount > 0;

  if (hasVoted) {
    return (
      <>
        {messages.stability.voted}
        {showCount ? ` · ${voteCount}` : ""}
      </>
    );
  }

  const label = showCount
    ? `${messages.stability.pending} · ${voteCount}`
    : messages.stability.pending;

  return (
    <button
      type="button"
      onClick={(event) => {
        // 格子目前不在任何 <Link> 里，但卡片/首页 deck 周围到处是 Link——
        // 防冒泡按需求写清楚，不留"改天卡片结构一变就意外跳转"的坑。
        event.preventDefault();
        event.stopPropagation();
        vote();
      }}
      className="underline decoration-dotted underline-offset-2 transition hover:text-[var(--orange)]"
    >
      {label}
    </button>
  );
}
