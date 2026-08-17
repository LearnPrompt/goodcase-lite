"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getReactorId } from "@/lib/anonymous-session";
import {
  MAX_BATCH_SLUGS,
  emptyReactionCounts,
  type ReactionCounts,
  type ReactionKind,
} from "@/lib/reactions-payload";

export type ReactionCountsState = {
  /** 还没拿到服务端答复。此时组件应该只显示本地状态，不显示计数。 */
  loading: boolean;
  /** false = 后端还没准备好（表未建 / 未配 key / 网络失败），前端隐藏计数只保留本地行为。 */
  available: boolean;
  counts: ReactionCounts;
};

const LOADING_STATE: ReactionCountsState = Object.freeze({
  loading: true,
  available: false,
  counts: Object.freeze(emptyReactionCounts()),
});

const UNAVAILABLE_STATE: ReactionCountsState = Object.freeze({
  loading: false,
  available: false,
  counts: Object.freeze(emptyReactionCounts()),
});

type Registry = {
  store: Map<string, ReactionCountsState>;
  listeners: Set<() => void>;
  requested: Set<string>;
  pending: string[];
  flushHandle: ReturnType<typeof setTimeout> | null;
};

// 状态必须挂在 globalThis 上，不能用模块作用域变量。
//
// 实测：LikeButton 和 RetestVoteButton 是两个独立的 client 边界，打包时
// reaction-counts 这个模块会被复制进多个 chunk（.next/static/chunks 里
// "api/reactions" 出现在 4 个文件中）。模块级的 Map/Set 因此有多份，
// 结果是同一个 slug 被各自请求一次——详情页发了两个 GET，正是要避免的事。
// 换成全局单例后无论模块被复制几份，去重表和缓存都只有一份。
const REGISTRY_KEY = "__goodcaseReactionCountsRegistry";

function getRegistry(): Registry {
  const holder = globalThis as typeof globalThis & {
    [REGISTRY_KEY]?: Registry;
  };

  if (!holder[REGISTRY_KEY]) {
    holder[REGISTRY_KEY] = {
      store: new Map(),
      listeners: new Set(),
      requested: new Set(),
      pending: [],
      flushHandle: null,
    };
  }

  return holder[REGISTRY_KEY];
}

function emit() {
  for (const listener of getRegistry().listeners) {
    listener();
  }
}

function subscribe(onStoreChange: () => void) {
  const registry = getRegistry();
  registry.listeners.add(onStoreChange);
  return () => {
    registry.listeners.delete(onStoreChange);
  };
}

function readState(slug: string): ReactionCountsState {
  return getRegistry().store.get(slug) ?? LOADING_STATE;
}

function markUnavailable(slugs: readonly string[]) {
  const { store } = getRegistry();
  for (const slug of slugs) {
    store.set(slug, UNAVAILABLE_STATE);
  }
}

function applyCounts(slug: string, counts: ReactionCounts) {
  getRegistry().store.set(slug, {
    loading: false,
    available: true,
    counts: { like: counts.like, retestVote: counts.retestVote },
  });
}

async function fetchBatch(slugs: string[]) {
  // 单个 slug 走 ?slug=，URL 稳定、边缘缓存命中率最高（详情页就是这条路径）。
  // 多个 slug 才合并成 ?slugs=，避免列表页一屏发二十个请求。
  const query =
    slugs.length === 1
      ? `slug=${encodeURIComponent(slugs[0])}`
      : `slugs=${slugs.map(encodeURIComponent).join(",")}`;

  try {
    const response = await fetch(`/api/reactions?${query}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      markUnavailable(slugs);
      return;
    }

    const payload = (await response.json()) as {
      available?: boolean;
      like?: number;
      retestVote?: number;
      items?: Record<string, { like?: number; retestVote?: number }>;
    };

    if (payload.available !== true) {
      markUnavailable(slugs);
      return;
    }

    if (slugs.length === 1) {
      applyCounts(slugs[0], {
        like: Number(payload.like) || 0,
        retestVote: Number(payload.retestVote) || 0,
      });
      return;
    }

    for (const slug of slugs) {
      const item = payload.items?.[slug];
      applyCounts(slug, {
        like: Number(item?.like) || 0,
        retestVote: Number(item?.retestVote) || 0,
      });
    }
  } catch {
    // 网络失败按"后端不可用"处理：隐藏计数，本地交互照常。
    markUnavailable(slugs);
  }
}

function flush() {
  const registry = getRegistry();
  registry.flushHandle = null;
  const slugs = registry.pending;
  registry.pending = [];
  if (slugs.length === 0) {
    return;
  }

  const batches: string[][] = [];
  for (let index = 0; index < slugs.length; index += MAX_BATCH_SLUGS) {
    batches.push(slugs.slice(index, index + MAX_BATCH_SLUGS));
  }

  void Promise.all(batches.map(fetchBatch)).then(emit);
}

function requestCounts(slug: string) {
  const registry = getRegistry();
  if (registry.requested.has(slug)) {
    return;
  }
  registry.requested.add(slug);
  registry.pending.push(slug);

  if (registry.flushHandle === null) {
    // 同一帧里挂载的所有按钮合并成一次请求。详情页的点赞和催复测按钮
    // 共用同一个 slug，合并后只发一次 GET，一次拿回两种计数。
    registry.flushHandle = setTimeout(flush, 0);
  }
}

/**
 * 乐观更新：立刻改本地快照，服务端失败时由调用方回滚。
 * 后端不可用时不动（计数本来就藏着）。
 */
function applyDelta(slug: string, kind: ReactionKind, delta: number) {
  const current = readState(slug);
  if (!current.available) {
    return;
  }

  const key = kind === "like" ? "like" : "retestVote";
  const next = { ...current.counts };
  next[key] = Math.max(0, next[key] + delta);
  getRegistry().store.set(slug, {
    loading: false,
    available: true,
    counts: next,
  });
  emit();
}

async function writeReaction(
  slug: string,
  kind: ReactionKind,
  method: "POST" | "DELETE"
) {
  // 防重身份用跨会话持久的 reactor id，不用标签页级的埋点会话 ID——
  // 否则关一次浏览器就换身份，同一个人能反复+1。
  const sessionId = getReactorId();
  const response = await fetch("/api/reactions", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, kind, sessionId }),
  });

  if (!response.ok) {
    throw new Error(`reaction ${method} failed: ${response.status}`);
  }
}

/**
 * 提交一次反应，带乐观更新和失败回滚。
 * 失败不抛给组件——反应失败不该打断浏览，本地状态已经生效。
 */
export function submitReaction(
  slug: string,
  kind: ReactionKind,
  active: boolean
) {
  const delta = active ? 1 : -1;
  applyDelta(slug, kind, delta);

  void writeReaction(slug, kind, active ? "POST" : "DELETE").catch(() => {
    applyDelta(slug, kind, -delta);
  });
}

export function useReactionCounts(slug: string): ReactionCountsState {
  useEffect(() => {
    requestCounts(slug);
  }, [slug]);

  return useSyncExternalStore(
    subscribe,
    () => readState(slug),
    () => LOADING_STATE
  );
}
