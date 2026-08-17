"use client";

import {
  toggleLocalLike,
  useHasLikedCase,
} from "@/lib/local-likes";
import { submitReaction, useReactionCounts } from "@/lib/reaction-counts";
import { useMessages } from "@/i18n/client";

export function LikeButton({
  caseSlug,
  initialCount,
}: {
  caseSlug: string;
  initialCount: number;
}) {
  const messages = useMessages();
  // SSR 与首次 hydration 一律按未点赞渲染，挂载后读本机状态，避免 hydration mismatch。
  const hasLiked = useHasLikedCase(caseSlug);
  // localStorage 继续管"我点过没"这个即时状态，总数改从后端拉。
  const reactions = useReactionCounts(caseSlug);

  // 三态：拉取中沿用服务端渲染的 initialCount（保持 hydration 一致）；
  // 拿到真数就显示真数；后端不可用（迁移没跑、没配 key、网络失败）就整个藏掉计数，
  // 只留一个纯点赞按钮，本地状态照常工作。
  const showCount = reactions.loading || reactions.available;
  const likedCount = reactions.available ? reactions.counts.like : initialCount;

  return (
    <div className="grid gap-2">
      <button
        type="button"
        aria-pressed={hasLiked}
        onClick={() => {
          const nextLiked = toggleLocalLike(caseSlug);
          submitReaction(caseSlug, "like", nextLiked);
        }}
        className={`gc-action whitespace-nowrap ${
          hasLiked
            ? "border-[var(--orange)] bg-[var(--orange)] text-white"
            : ""
        }`}
      >
        <span aria-hidden="true">{hasLiked ? "♥" : "♡"}</span>
        {showCount ? <span>{likedCount}</span> : null}
        <span>
          {hasLiked ? messages.interaction.liked : messages.interaction.like}
        </span>
      </button>
    </div>
  );
}
