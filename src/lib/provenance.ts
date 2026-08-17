// 公开 API 的 provenance（溯源）字段。
//
// 这个模块被 scripts/review/lib/provenance.test.mjs 用纯 node 直接加载，
// 不能引入任何带 "@/" 别名的依赖。
//
// 为什么要在响应里单独开一个 provenance 对象
// ------------------------------------------
// Agent 在生成图 / 视频 / UI 之前来查 prompt，它面对的最大风险是拿到一条
// 编造的 prompt —— 看起来完整、语气专业，但从来没有人用它跑出过那张图。
// 训练数据里这种东西遍地都是，Agent 自己分辨不了。
//
// 我们的差异不在"有 prompt"，在"这条 prompt 和原帖对得上，而且是人核过的"。
// 这件事以前只存在于运营流程里（2026-08-05 的溯源审计，见
// supabase/migrations/20260805100000_candidate_provenance_anchor.sql：
// 带 #reversed 锚点的候选 = 平台拿产出图逆向重构的 prompt，一律不许进 pending，
// 库级 check 约束兜底），响应里一个字都没体现。
// 不体现就等于没有 —— 机器读不到的卖点不是卖点。

/**
 * 溯源口径生效日期（常量，不是每条案例各自的核验时间）。
 *
 * 诚实的口径是这样的：我们没有为每条案例单独记一个"人工核对完成时刻"，
 * 有的是一条自这个日期起对全部发布内容生效的准入规则。所以这里给的是
 * 规则的生效日，字段名也叫 policyEffectiveAt 而不是 verifiedAt，
 * 免得让调用方以为拿到的是逐条的核验时间戳。
 *
 * 什么时候该改这个常量：溯源准入规则本身升级时（比如以后接入逐条核验记录）。
 * 日常发案例不动它。
 */
export const PROVENANCE_POLICY_EFFECTIVE_AT = "2026-08-05";

/** 当前的核验方式标识。以后上逐条自动核验时会新增取值，调用方应按未知值降级处理。 */
export const PROVENANCE_METHOD = "human-reviewed-source-match";

export type CaseProvenance = {
  /** 原帖地址。没有原帖的案例这里是 null，此时不做任何核验声明。 */
  sourceUrl: string | null;
  /** 这条案例的 prompt 是否经人工核对与原帖一致。 */
  verifiedAgainstSource: boolean;
  /** 核验方式；verifiedAgainstSource 为 false 时是 null。 */
  method: string | null;
  /** 溯源准入规则的生效日期（YYYY-MM-DD）；未核验时是 null。 */
  policyEffectiveAt: string | null;
  /** 给人看的一句话说明，跟随请求 locale。 */
  note: string;
};

const NOTES = {
  verified: {
    "zh-CN":
      "已发布案例的 prompt 均经人工核对与原帖一致；平台逆向重构的 prompt 不予收录。",
    en: "Published prompts are human-checked against the original post; platform-reconstructed prompts are not accepted.",
  },
  unsourced: {
    "zh-CN": "这条案例没有可公开的原帖链接，因此不做溯源声明。",
    en: "This case has no public source post, so no provenance claim is made.",
  },
} as const;

/**
 * 由 sourceUrl 推出 provenance。
 *
 * 关键判断：**没有 sourceUrl 就不声称已核验**。
 * 「已发布的案例都验过」这句话的前提是"验的是它和原帖对得上"；
 * 一条没有原帖的案例根本没有可对的东西，这时候把布尔置 true 是在撒谎，
 * 而这个字段整个的价值就建立在它不撒谎上。宁可少声明，不可虚报。
 */
export function buildCaseProvenance(
  sourceUrl: string | null | undefined,
  locale: "zh-CN" | "en"
): CaseProvenance {
  const normalized =
    typeof sourceUrl === "string" && sourceUrl.trim() ? sourceUrl.trim() : null;

  if (!normalized) {
    return {
      sourceUrl: null,
      verifiedAgainstSource: false,
      method: null,
      policyEffectiveAt: null,
      note: NOTES.unsourced[locale],
    };
  }

  return {
    sourceUrl: normalized,
    verifiedAgainstSource: true,
    method: PROVENANCE_METHOD,
    policyEffectiveAt: PROVENANCE_POLICY_EFFECTIVE_AT,
    note: NOTES.verified[locale],
  };
}
