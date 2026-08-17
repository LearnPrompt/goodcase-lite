// 这个模块被 scripts/review/lib/stability.test.mjs 用纯 node 直接加载，
// 不能引入任何带 "@/" 别名的运行时依赖，所以 locale 类型和文案都在本地定义。
// 同一份文案在 src/i18n/messages.ts 的 stability 组里有一份供组件使用，改动请同步。
type StabilityLocale = "zh-CN" | "en";

export const STABILITY_PENDING_LABEL: Record<StabilityLocale, string> = {
  "zh-CN": "投票催复测",
  en: "Vote to retest",
};

export const STABILITY_FAILED_LABEL: Record<StabilityLocale, string> = {
  "zh-CN": "复测未通过",
  en: "Failed retest",
};

/**
 * 稳定度三态。
 *
 * - measured：1–100 的实测分。
 * - failed：复测跑过而且没通过，按 0 分计入排序和作者均分。
 * - pending：从来没测过，展示成「投票催复测」。
 *
 * 为什么不能直接用「score === 0 就是复测未通过」
 * ----------------------------------------------
 * cases.stability_score 在库里是 `int not null default 0`
 * （supabase/schema.sql），没测过的案例落库就是 0，站上现有几百条都是这个状态。
 * 光看分数区分不出「没测过」和「测了没通过」，把 0 一律当成失败，等于把全站
 * 未复测的案例改判成「复测未通过」——比它要修的 bug 更糟。
 *
 * 判别位用 evidence_level：站上对外口径（src/app/[lang]/llms.txt/route.ts）写的是
 * 「L2 才代表已有独立复测记录」。所以 L2 + 0 分 = 测过且没通过，
 * 非 L2 + 0 分 = 还没测过。这条判别不需要迁移，evidence_level 在 index 档就有。
 */
export type StabilityState = "measured" | "failed" | "pending";

/** 只认「跑过独立复测」的那一档；和 llms.txt 对外承诺的 evidenceLevel 语义一致。 */
const RETESTED_EVIDENCE_LEVEL = "L2";

export function hasMeasuredStability(
  score: number | null | undefined
): score is number {
  return (
    typeof score === "number" &&
    Number.isFinite(score) &&
    score > 0 &&
    score <= 100
  );
}

export function isFailedRetest(
  score: number | null | undefined,
  evidenceLevel?: string | null
) {
  return evidenceLevel === RETESTED_EVIDENCE_LEVEL && score === 0;
}

export function resolveStabilityState(
  score: number | null | undefined,
  evidenceLevel?: string | null
): StabilityState {
  if (hasMeasuredStability(score)) return "measured";
  if (isFailedRetest(score, evidenceLevel)) return "failed";
  return "pending";
}

/**
 * 排序 / 聚合用的分值：复测未通过按 0 计入（该受的惩罚要真受），
 * 没测过返回 null，由调用方决定丢进「无实测分」那一桶。
 */
export function measuredStabilityValue(
  score: number | null | undefined,
  evidenceLevel?: string | null
): number | null {
  const state = resolveStabilityState(score, evidenceLevel);
  if (state === "measured") return score as number;
  if (state === "failed") return 0;
  return null;
}

export function formatStabilityScore(
  score: number | null | undefined,
  locale: StabilityLocale = "zh-CN",
  evidenceLevel?: string | null
) {
  const state = resolveStabilityState(score, evidenceLevel);
  if (state === "measured") return String(Math.round(score as number));
  if (state === "failed") return STABILITY_FAILED_LABEL[locale];
  return STABILITY_PENDING_LABEL[locale];
}

/**
 * 已经过 measuredStabilityValue 解析的分值求均分。
 *
 * 传进来的 0 是「复测未通过」这个真实结论，要计入；null / undefined 是「没测过」，
 * 跳过。所以这里不能再用 hasMeasuredStability 过滤——它按展示口径把 0 判成未测。
 */
export function averageMeasuredStability(
  values: Array<number | null | undefined>
) {
  const measured = values.filter(
    (value): value is number =>
      typeof value === "number" &&
      Number.isFinite(value) &&
      value >= 0 &&
      value <= 100
  );
  if (!measured.length) {
    return null;
  }

  return Math.round(
    measured.reduce((sum, score) => sum + score, 0) / measured.length
  );
}

/**
 * 作者均分等聚合值的展示：这里的 0 是「所有实测都没通过」这个真实结果，
 * 不是占位分，所以直接显示数字；null 才是「没有任何实测分」。
 */
export function formatAggregateStability(
  average: number | null | undefined,
  locale: StabilityLocale = "zh-CN"
) {
  return typeof average === "number" && Number.isFinite(average)
    ? String(Math.round(average))
    : STABILITY_PENDING_LABEL[locale];
}
