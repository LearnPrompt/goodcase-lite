import "server-only";

// 相对路径 + 显式 .ts 后缀：见 src/lib/creator-card-item.ts 的同款注释。
// admin-client.ts 自己也挂 "server-only"，这条链路只给 Next 页面 / route 用；
// 内部管线脚本 走的是自己内联的一份 DB 查询（见该文件注释），
// 不 import 这个模块，就是为了不把 "server-only" 带进纯 node 脚本的解析路径。
import { getAdminSupabaseClient } from "./supabase/admin-client.ts";
import {
  countReactionRows,
  fetchAllReactionRows,
  isMissingTableError,
} from "./reactions-payload.ts";
import { loadRetestRecordsFromManifest } from "./retest-manifest.ts";
import type { DailyDigestRetestRecord } from "@/lib/daily-digest";

/**
 * 早报「今日新复测」栏位的复测证据源。
 *
 * 优先级：case_retests 表 → 复测清单文件(内部管线产物)（repo 内文件，
 * 读取逻辑见 src/lib/retest-manifest.ts）。
 * 表已经建了（迁移见 supabase/migrations/20260807010000_case_retests.sql），
 * 但截至这次改动，v1 那批复测记录还没回填进去——查表会成功但返回空集，
 * 这和「表不存在」是两种不同的降级触发条件，都要落到 manifest，
 * 少一个分支这个栏位会长期空着。manifest 是 内部测试脚本
 * 落盘的产物，这个模块只读它，不碰那边的执行逻辑。
 *
 * case_retests 表本身不存投票数（迁移里的字段注释说得很清楚：这张表存的是
 * 「证据」不是「结论」）。投票数另外从 case_reactions 按 kind = retest_vote
 * 聚合，复用 src/lib/reactions-payload.ts 的 countReactionRows，和公开 API、
 * /daily 复习榜的旧口径共用同一份计数逻辑，不会各算各的。
 */

// 只取最近这些行就够找出「测试时刻最新的一天」；表会一直增长，不能不设上限。
const CASE_RETESTS_QUERY_LIMIT = 50;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * 查 case_retests 表。
 *
 * 返回 null：查不了，调用方应该落到 manifest（缺 service role key、表还不存在、
 * 查询本身出错）。
 * 返回空数组：表在，能查，但目前一行都没有——同样交给调用方落到 manifest，
 * 空表不代表没有复测证据，只代表这张表还没回填。
 */
async function loadRetestRecordsFromDatabase(): Promise<
  DailyDigestRetestRecord[] | null
> {
  const supabase = getAdminSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("case_retests")
    .select("case_slug, tested_at, model, verdict")
    .order("tested_at", { ascending: false })
    .limit(CASE_RETESTS_QUERY_LIMIT);

  if (error) {
    if (isMissingTableError(error)) {
      return null;
    }
    // 非「表不存在」的查询错误：早报这个栏位不值得为此把整页拖挂，降级到 manifest。
    console.error("[daily-digest] 查 case_retests 失败，降级到 manifest：", error);
    return null;
  }

  const rows = (data ?? []).filter(
    (
      row
    ): row is {
      case_slug: string;
      tested_at: string;
      model: string | null;
      verdict: string | null;
    } => isNonEmptyString(row.case_slug) && isNonEmptyString(row.tested_at)
  );

  if (rows.length === 0) {
    return [];
  }

  const slugs = Array.from(new Set(rows.map((row) => row.case_slug)));
  let reactionRows: Array<{ case_slug: string; kind: string }> | null = null;
  try {
    reactionRows = await fetchAllReactionRows(
      (from, to) =>
        supabase
          .from("case_reactions")
          .select("case_slug, kind", { count: "exact" })
          .in("case_slug", slugs)
          .order("case_slug", { ascending: true })
          .order("kind", { ascending: true })
          .order("created_at", { ascending: true })
          .order("id", { ascending: true })
          .range(from, to)
    );
  } catch (error) {
    // 投票拿不到时仍保留复测证据；榜单只退化成没有投票加成。
    console.error("[daily-digest] 查 case_reactions 失败，投票数按 0 处理：", error);
  }

  // 投票数拿不到时全按 0 处理——复测证据本身还在，只是这一期排不出票数优先级，
  // 和 daily-digest.ts 里「取不到票数就退化成纯稳定分排序」是同一个降级哲学。
  const counts =
    reactionRows
      ? countReactionRows(reactionRows, slugs)
      : null;

  return rows.map((row) => ({
    slug: row.case_slug,
    testedAt: row.tested_at,
    retestVotes: counts?.[row.case_slug]?.retestVote ?? 0,
    model: row.model,
    verdict: row.verdict,
  }));
}

/**
 * 早报页面、/daily/feed.xml 统一走这一个入口：case_retests 表能查到非空数据
 * 就用表里的，查不到（缺表 / 缺凭证 / 查询出错）或者查到了但是空的，都回落到
 * manifest。build-digest.mjs 脚本不走这里，见文件顶部注释。
 */
export async function getRetestRecords(): Promise<DailyDigestRetestRecord[]> {
  const fromDatabase = await loadRetestRecordsFromDatabase();
  if (fromDatabase && fromDatabase.length > 0) {
    return fromDatabase;
  }

  return loadRetestRecordsFromManifest();
}
