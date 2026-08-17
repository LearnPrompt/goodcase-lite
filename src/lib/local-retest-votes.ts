"use client";

import { useSyncExternalStore } from "react";

// 催复测投票的本机状态。结构和 src/lib/local-likes.ts 一致（同一套 localStorage +
// useSyncExternalStore 模式），只是换了 key 和事件名；两者语义不同所以没有合并：
// 点赞可以取消，催复测投票一旦投出不提供撤销（催过就是催过）。

export const RETEST_VOTES_UPDATED_EVENT = "goodcaseai:retest-votes-updated";

const STORAGE_KEY = "goodcase:retest-voted-cases";

function readVotedSlugs(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is string => typeof item === "string" && item.length > 0
    );
  } catch {
    return [];
  }
}

/** 已经投过返回 false（不重复记一次），第一次投返回 true。 */
export function recordLocalRetestVote(caseSlug: string): boolean {
  const slugs = readVotedSlugs();
  if (slugs.includes(caseSlug)) {
    return false;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...slugs, caseSlug])
    );
  } catch {
    // localStorage 不可用（隐私模式等）时静默降级：这次点击照常上报，
    // 但下次刷新按钮会回到未投状态，由服务端唯一约束兜住重复。
  }

  window.dispatchEvent(
    new CustomEvent(RETEST_VOTES_UPDATED_EVENT, { detail: { caseSlug } })
  );

  return true;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(RETEST_VOTES_UPDATED_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(RETEST_VOTES_UPDATED_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

/** SSR 与首次 hydration 一律返回 false（未投票），挂载后才读 localStorage。 */
export function useHasVotedRetest(caseSlug: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => readVotedSlugs().includes(caseSlug),
    () => false
  );
}
