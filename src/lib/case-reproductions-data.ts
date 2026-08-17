// 同提示语多复现（方案 B）的纯数据层：类型 + 归一化 + 合并去重。
// 刻意不 import server-only / supabase：这一层要能被测试与构建期 manifest 复用，
// 数据获取放在 case-reproductions.ts（server-only）里，和 case-retest-evidence 同构。

export const REPRODUCTION_SCHEMA = "goodcase-reproduction-v1";

export type ReproductionMediaKind = "image" | "video" | "ui";

export type CaseReproduction = {
  id: string;
  /** 挂靠的原 Case slug。 */
  parentSlug: string;
  reproducer: string;
  reproducerAvatarUrl: string | null;
  mediaKind: ReproductionMediaKind;
  mediaUrl: string;
  /** 视频封面，缺省时前端用父 Case 的 poster 兜底。 */
  posterUrl: string | null;
  models: string[];
  referenceNote: string | null;
  sourceUrl: string | null;
  reproducedAt: string | null;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const s = stringValue(entry);
    return s ? [s] : [];
  });
}

function mediaKind(value: unknown): ReproductionMediaKind | null {
  return value === "image" || value === "video" || value === "ui"
    ? value
    : null;
}

/**
 * 一条数据库/manifest 记录归一化成展示模型。缺 id / parentSlug / reproducer /
 * mediaUrl / 合法 mediaKind 的记录直接丢弃（返回 null），不让半条记录进 UI。
 */
export function normalizeCaseReproduction(
  value: unknown
): CaseReproduction | null {
  if (!isRecord(value)) return null;

  const id = stringValue(value.id ?? value.ID);
  const parentSlug = stringValue(value.parentSlug ?? value.parent_slug);
  const reproducer = stringValue(value.reproducer);
  const mediaUrl = stringValue(value.mediaUrl ?? value.media_url);
  const kind = mediaKind(value.mediaKind ?? value.media_kind);

  if (!id || !parentSlug || !reproducer || !mediaUrl || !kind) {
    return null;
  }

  return {
    id,
    parentSlug,
    reproducer,
    reproducerAvatarUrl: stringValue(
      value.reproducerAvatarUrl ?? value.reproducer_avatar_url
    ),
    mediaKind: kind,
    mediaUrl,
    posterUrl: stringValue(value.posterUrl ?? value.poster_url),
    models: stringArray(value.models),
    referenceNote: stringValue(value.referenceNote ?? value.reference_note),
    sourceUrl: stringValue(value.sourceUrl ?? value.source_url),
    reproducedAt: stringValue(value.reproducedAt ?? value.reproduced_at),
  };
}

function reproducedAtKey(item: CaseReproduction): string {
  return item.reproducedAt ?? "";
}

/**
 * 合并多组来源（构建期 manifest + 数据库），按 id 去重，后传入的优先（数据库
 * 覆盖 manifest），再按复现时间倒序、id 兜底稳定排序。与 case-retest 同一套约定。
 */
export function mergeCaseReproductions(
  ...groups: ReadonlyArray<readonly CaseReproduction[]>
): CaseReproduction[] {
  const byId = new Map<string, CaseReproduction>();
  for (const group of groups) {
    for (const item of group) {
      byId.set(item.id, item);
    }
  }
  return [...byId.values()].sort(
    (a, b) =>
      reproducedAtKey(b).localeCompare(reproducedAtKey(a)) ||
      a.id.localeCompare(b.id)
  );
}

/** 详情页副标题用：把复现者去重后数一下有几个人复现过。 */
export function countDistinctReproducers(
  records: readonly CaseReproduction[]
): number {
  return new Set(records.map((item) => item.reproducer)).size;
}
