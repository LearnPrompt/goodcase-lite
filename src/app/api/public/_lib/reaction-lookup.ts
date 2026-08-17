import "server-only";

import { getAdminSupabaseClient } from "@/lib/supabase/admin-client";
import {
  countReactionRows,
  isMissingTableError,
  type ReactionCounts,
} from "@/lib/reactions-payload";

// 公开 API 用的批量查询上限，和内部反应接口保持一致的安全阀（见 src/app/api/reactions/route.ts）。
const MAX_REACTION_ROWS = 10_000;

/**
 * 按 slug 批量查真实的点赞 / 催复测计数，供公开 API 覆盖 src/lib/cases.ts 里写死的 0。
 *
 * service role key 缺失、case_reactions 表还没建（本地开发没跑迁移）都返回 null，
 * 调用方按此降级回 0，不抛错——反应计数是公开 API 响应里的一个增强字段，
 * 它拿不到不该连累案例数据本身也拿不到。
 */
export async function lookupReactionCounts(
  slugs: readonly string[]
): Promise<Record<string, ReactionCounts> | null> {
  if (slugs.length === 0) {
    return {};
  }

  const supabase = getAdminSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("case_reactions")
    .select("case_slug, kind")
    .in("case_slug", slugs)
    .limit(MAX_REACTION_ROWS);

  if (error) {
    if (isMissingTableError(error)) {
      return null;
    }
    throw error;
  }

  return countReactionRows(data ?? [], slugs);
}
