"use client";

import {
  recordLocalRetestVote,
  useHasVotedRetest,
} from "@/lib/local-retest-votes";
import {
  submitReaction,
  useReactionCounts,
  type ReactionCountsState,
} from "@/lib/reaction-counts";

export type RetestVoteState = {
  /** 本机是否已经投过这个案例的催复测票（localStorage）。 */
  hasVoted: boolean;
  /** reaction-counts.ts 全局单例 store 里的原始计数状态，取 available/loading 用。 */
  reactions: ReactionCountsState;
  voteCount: number;
  /** 投票：乐观 +1 → POST /api/reactions → 记 localStorage。已投过是空操作。 */
  vote: () => void;
};

/**
 * 「投票催复测」共用状态，被详情页按钮（retest-vote-button.tsx）和
 * 卡片格子/首页深度 Case（case-card-stability.tsx）同时使用。
 *
 * 底层就是已有的两个全局单例：reaction-counts.ts（计数 + 批量请求去重）和
 * local-retest-votes.ts（已投状态，localStorage + useSyncExternalStore）。
 * 两个组件调用同一个 hook 等于订阅同一份 store，所以同一案例在任一页面投过，
 * 其它页面立刻显示已投，且不会因为多一处调用方就多发一条 /api/reactions 请求
 * ——reaction-counts.ts 内部按 slug 去重（requested Set），批量 GET 仍然只有一条。
 */
export function useRetestVote(caseSlug: string): RetestVoteState {
  const hasVoted = useHasVotedRetest(caseSlug);
  const reactions = useReactionCounts(caseSlug);

  return {
    hasVoted,
    reactions,
    voteCount: reactions.counts.retestVote,
    vote: () => {
      // 投过就不再重复上报。服务端还有唯一约束兜底，这里只是省一次请求。
      if (!recordLocalRetestVote(caseSlug)) {
        return;
      }
      submitReaction(caseSlug, "retest_vote", true);
    },
  };
}
