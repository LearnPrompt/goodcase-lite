"use client";

import { useEffect, useState } from "react";

export const FAVORITES_UPDATED_EVENT = "goodcaseai:favorites-updated";

const STORAGE_KEY = "goodcase:favorited-cases";

function readFavoritedSlugs(): string[] {
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

function writeFavoritedSlugs(slugs: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // localStorage 不可用（隐私模式等）时静默降级，收藏状态仅存在于当前内存。
  }
}

export function isFavorited(caseSlug: string): boolean {
  return readFavoritedSlugs().includes(caseSlug);
}

export function toggleFavorite(caseSlug: string): boolean {
  const slugs = readFavoritedSlugs();
  const hasFavorited = slugs.includes(caseSlug);
  const next = hasFavorited ? slugs.filter((slug) => slug !== caseSlug) : [...slugs, caseSlug];

  writeFavoritedSlugs(next);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT, { detail: { caseSlug } }));
  }

  return !hasFavorited;
}

/**
 * SSR 安全的收藏列表 hook：初始 state 为空数组（服务端与首次 hydration 一律按未收藏渲染），
 * 客户端挂载后在 useEffect 里读 localStorage，并订阅 FAVORITES_UPDATED_EVENT 与跨标签页 storage 事件。
 */
export function useFavoritedSlugs(): string[] {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setSlugs(readFavoritedSlugs());

    sync();
    window.addEventListener(FAVORITES_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return slugs;
}
