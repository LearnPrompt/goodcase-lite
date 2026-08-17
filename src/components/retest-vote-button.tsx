"use client";

import { useMessages } from "@/i18n/client";
import { useRetestVote } from "@/lib/use-retest-vote";

/**
 * 「催复测」投票按钮，出现在详情页稳定度那一格（稳定度缺测时）。
 * 卡片格子/首页深度 Case 上的同一句文案现在也能点（case-card-stability.tsx），
 * 两处共用 use-retest-vote.ts 这个 hook，状态跨页面同步、不多发请求。
 */
export function RetestVoteButton({ caseSlug }: { caseSlug: string }) {
  const messages = useMessages();
  const { hasVoted, reactions, voteCount, vote } = useRetestVote(caseSlug);

  // 后端不可用时只剩本地行为：按钮能点、能变成"已投票"，但不显示票数。
  const showCount = reactions.available;

  return (
    <button
      type="button"
      aria-pressed={hasVoted}
      disabled={hasVoted}
      onClick={vote}
      className={`gc-action whitespace-nowrap ${
        hasVoted ? "border-[var(--orange)] text-[var(--orange)]" : ""
      }`}
    >
      <span aria-hidden="true">↺</span>
      <span>
        {hasVoted ? messages.stability.voted : messages.stability.pending}
      </span>
      {showCount && voteCount > 0 ? <span>{voteCount}</span> : null}
    </button>
  );
}
