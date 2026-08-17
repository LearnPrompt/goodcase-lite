import "server-only";

import {
  mergeCaseReproductions,
  normalizeCaseReproduction,
  type CaseReproduction,
} from "@/lib/case-reproductions-data";
import { getAdminSupabaseClient } from "@/lib/supabase/admin-client";

type DatabaseReproductionRow = {
  id: number | string;
  parent_slug: string | null;
  reproducer: string | null;
  reproducer_avatar_url: string | null;
  media_kind: string | null;
  media_url: string | null;
  poster_url: string | null;
  models: string[] | null;
  reference_note: string | null;
  source_url: string | null;
  reproduced_at: string | null;
};

let databasePromise: Promise<CaseReproduction[]> | null = null;

async function loadDatabaseReproductions(): Promise<CaseReproduction[]> {
  const supabase = getAdminSupabaseClient();
  if (!supabase) return [];

  // 只取人工确认过的复现（verified = true）。未确认的留库里但不出街——
  // 这是 fail-closed：默认不承认「声称的复现」，人翻牌才展示。
  const { data, error } = await supabase
    .from("case_reproductions")
    .select(
      "id, parent_slug, reproducer, reproducer_avatar_url, media_kind, media_url, poster_url, models, reference_note, source_url, reproduced_at"
    )
    .eq("verified", true)
    .order("reproduced_at", { ascending: false })
    .limit(2_000);

  if (error) {
    console.error(
      "[case-reproductions] 读取 case_reproductions 失败，复现区留空：",
      error
    );
    return [];
  }

  return ((data ?? []) as DatabaseReproductionRow[]).flatMap((row) => {
    const normalized = normalizeCaseReproduction(row);
    return normalized ? [normalized] : [];
  });
}

function getDatabaseReproductions(): Promise<CaseReproduction[]> {
  databasePromise ??= loadDatabaseReproductions();
  return databasePromise;
}

/**
 * 详情页某条原 Case 的全部已确认复现。读取故障时返回空数组，绝不拖挂 Case 主体
 * ——复现区是加分项，不是必需内容。
 */
export async function getCaseReproductions(
  slug: string
): Promise<CaseReproduction[]> {
  const database = (await getDatabaseReproductions()).filter(
    (item) => item.parentSlug === slug
  );
  return mergeCaseReproductions(database);
}
