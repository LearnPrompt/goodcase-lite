"use client";

import { useSyncExternalStore } from "react";

export const LIKES_UPDATED_EVENT = "goodcaseai:likes-updated";

const STORAGE_KEY = "goodcase:liked-cases";

function readLikedSlugs(): string[] {
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

    return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
  } catch {
    return [];
  }
}

function writeLikedSlugs(slugs: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // localStorage 不可用（隐私模式等）时静默降级，点赞状态仅存在于当前内存。
  }
}

export function hasLikedCase(caseSlug: string): boolean {
  return readLikedSlugs().includes(caseSlug);
}

export function toggleLocalLike(caseSlug: string): boolean {
  const slugs = readLikedSlugs();
  const hasLiked = slugs.includes(caseSlug);
  const next = hasLiked ? slugs.filter((slug) => slug !== caseSlug) : [...slugs, caseSlug];

  writeLikedSlugs(next);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(LIKES_UPDATED_EVENT, { detail: { caseSlug } }));
  }

  return !hasLiked;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(LIKES_UPDATED_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(LIKES_UPDATED_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

/**
 * SSR 安全的点赞状态 hook：服务端与首次 hydration 一律返回 false（未点赞），
 * 客户端挂载后读 localStorage，并订阅 LIKES_UPDATED_EVENT 与跨标签页 storage 事件。
 */
export function useHasLikedCase(caseSlug: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => hasLikedCase(caseSlug),
    () => false
  );
}
