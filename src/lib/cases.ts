import { access } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import {
  deriveCreatorsFromCases,
  findCreatorByName,
  findCreatorBySlug,
  type CreatorItem,
} from "@/lib/creators";
import {
  CATEGORY_LABELS,
  MISSING_PROMPT_PREVIEW,
  getCaseCardSummary,
} from "@/lib/case-presentation";
import {
  DETAIL_SELECT,
  GENERATED_PREVIEW_COLUMNS,
  buildCardSelect,
  buildIndexSelect,
  buildResultBreakdownSelect,
  isMissingColumnError,
  truncatePromptPreview,
  type CaseCardRow,
  type CaseDetailRow,
  type CaseIndexRow,
  type CaseRow,
} from "@/lib/case-columns";
import { cacheCaseRows, CaseRowsUnavailableError } from "@/lib/case-cache";
import { fetchAllPublishedCaseRows } from "@/lib/llms-full-rows";
import { scoreSourceHeat, type SourceHeatFields } from "@/lib/source-heat";
import {
  getServerSupabaseClient,
  isTransientSupabaseError,
  retryTransient,
  withTimeout,
} from "@/lib/supabase/server-client";
import { caseItems, creatorAvatarUrls, type CaseItem } from "@/lib/mock-data";
import {
  filterCasesByModel,
  getHomeModelStripItems,
  getModelFamily,
} from "@/lib/models";
import { getRelatedCases, MISSING_MODEL } from "@/lib/related-cases";
import { getThumbnail } from "@/lib/thumbnails";
import {
  resolveCardMediaFit,
  type CardMediaFit,
} from "@/lib/card-media-fit";
import {
  formatStabilityScore,
  hasMeasuredStability,
} from "@/lib/stability";
import { isNearDuplicateText } from "@/lib/text-similarity";
import { rankSearchResults, type SearchField } from "@/lib/search";
import { selectWeeklyHot, type WeeklyHotWindow } from "@/lib/weekly-hot";
import {
  deriveSkillCatalog,
  findSkillBySlug,
  getCaseSkillLinks,
  getCreatorMethods,
  type SkillLink,
} from "@/lib/skills";
import type { Locale } from "@/i18n/config";
import { getEnglishCaseTranslation } from "@/i18n/content";

type StoredCaseTranslation = {
  title?: string;
  summary?: string;
  promptFull?: string;
  resultBreakdown?: [string, string, string];
};

/**
 * promptContributionNotes 的来源。
 *
 * - authored：这条 Case 自己写过的三段式复盘（translations[locale].resultBreakdown）。
 * - template：库里没有复盘，按 category 拼出来的通用句子。同一个 category 下
 *   所有 Case 拿到的是**同一段文字**，只能当阅读提示，不能当这条 Case 的证据。
 *
 * 打标放在生成端而不是让消费端去猜字符串：模板句会随文案调整而变，
 * 任何基于「看起来像套话」的字符串判断都会在下一次改文案时静默失效。
 * src/lib/skills.ts 只接受 authored 的句子当 Skill 证据。
 */
export type PromptContributionNotesSource = "authored" | "template";

type BaseDerivedCaseFields = {
  promptPublicNote: string;
  promptLoginNotes: string[];
  promptContributionNotes: string[];
  promptContributionNotesSource: PromptContributionNotesSource;
  editorNote: string;
  labNote: string[];
  /** 本地 400px 缩略图，只用于列表；没有时回退到原始媒体。详情页始终用原图。 */
  thumbnailUrl?: string;
  /**
   * 缩略图在 16:9 卡片框里该用 cover 还是 contain，由缩略图实际宽高算出。
   * 拿不到尺寸（老 manifest 条目、只有外链原图）时是 "cover"，即改动前的行为。
   */
  thumbnailFit: CardMediaFit;
};

type DerivedCaseFields = BaseDerivedCaseFields &
  SourceHeatFields & {
    spreadScore: number | null;
    spreadScoreNote: string;
  };

export type DisplayCaseItem = CaseItem & DerivedCaseFields;

/** 首页「本周最热」区块的数据：六条卡片 + 它们实际来自哪一级窗口。 */
export type HomeWeeklyHot = {
  items: DisplayCaseItem[];
  window: WeeklyHotWindow;
};

export type CaseSearchableItem = Pick<
  CaseItem,
  | "title"
  | "summary"
  | "creator"
  | "source"
  | "promptPreview"
  | "promptFull"
  | "recommendedModels"
  | "tags"
>;

const MEDIA_PLACEHOLDER = "/media/placeholder.png";
const MISSING_PROMPT_FULL = "该案例暂未提供完整 Prompt。";

/**
 * creator_name 为空时统一填充的占位署名。
 *
 * 它是展示用的，不是身份：库里所有没署名的案例都会拿到同一个字符串，背后却是一群
 * 互不相干的人。凡是按作者聚合或按作者限量的逻辑都必须先把它还原成「无主」，
 * 否则「同一作者最多两条」会把整批无署名案例当成一个人压下去。
 */
const ANONYMOUS_CREATOR_NAME = "匿名作者";

/**
 * 把占位署名还原成「无主」，供所有按作者聚合 / 限量的逻辑取作者用。
 *
 * 返回 null 表示这条没有可归属的作者，不该和任何其它条目算同一个人。口径同时覆盖
 * 占位署名、缺失和全空白，和 src/lib/weekly-hot.ts 的 defaultCreatorOf、
 * src/lib/creator-diversity.ts 的默认取值保持一致。
 */
export function attributedCreatorOf(item: {
  creator?: string | null;
  creatorName?: string | null;
}): string | null {
  const name = item.creator ?? item.creatorName;
  const trimmed = typeof name === "string" ? name.trim() : "";
  return !trimmed || trimmed === ANONYMOUS_CREATOR_NAME ? null : trimmed;
}

const COST_BAND_LABELS: Record<CaseItem["costBand"], string> = {
  low: "低",
  medium: "中",
  high: "高",
};

export type CaseFilter =
  | "all"
  | "video"
  | "web"
  | "image"
  | "copy"
  | "hardware";

function applyCaseFilter<T extends CaseItem>(list: T[], filter: CaseFilter): T[] {
  if (filter === "all") {
    return list;
  }

  return list.filter((item) => item.category === filter);
}

export function getCaseSearchFields(item: CaseSearchableItem): SearchField[] {
  return [
    { key: "title", value: item.title, weight: 140 },
    { key: "creator", value: item.creator, weight: 115 },
    // 裸取 item.summary 会让搜索命中/高亮片段直接展示代码原文（#78 遗留脏数据），
    // 见 src/lib/case-presentation.ts 的 getCaseCardSummary。无效摘要在这里
    // 直接从可搜索字段里剔除，命中会退到权重更低的 prompt 字段（本来就该展示
    // 代码，标签也会显示成「Prompt」而不是误标成「摘要」）。
    { key: "summary", value: getCaseCardSummary(item.summary), weight: 95 },
    { key: "model", value: item.recommendedModels.join(" "), weight: 88 },
    { key: "source", value: item.source, weight: 70 },
    { key: "tag", value: item.tags?.join(" "), weight: 68 },
    { key: "prompt", value: item.promptPreview, weight: 55 },
    { key: "prompt", value: item.promptFull, weight: 35 },
  ];
}

export function filterCasesByQuery<T extends CaseSearchableItem>(
  list: T[],
  q: string
): T[] {
  return rankSearchResults(list, q, getCaseSearchFields).map(({ item }) => item);
}

function normalizeCategory(value: string): CaseItem["category"] {
  return value === "image" ||
    value === "video" ||
    value === "web" ||
    value === "copy" ||
    value === "hardware"
    ? value
    : "image";
}

function normalizeMediaType(value: string, mediaUrl?: string): CaseItem["mediaType"] {
  if (mediaUrl && /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(mediaUrl)) {
    return "video";
  }

  return value === "video" ? "video" : "image";
}

function normalizeCostBand(value: string): CaseItem["costBand"] {
  return value === "low" || value === "medium" || value === "high" ? value : "medium";
}

function normalizeResultBreakdown(value: unknown) {
  return Array.isArray(value) &&
    value.length === 3 &&
    value.every((item) => typeof item === "string")
    ? (value as [string, string, string])
    : undefined;
}

function readStoredTranslation(
  value: unknown,
  locale: Locale
): StoredCaseTranslation | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const candidate = (value as Record<string, unknown>)[locale];
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return null;
  }

  const record = candidate as Record<string, unknown>;
  const resultBreakdown = normalizeResultBreakdown(record.resultBreakdown);

  return {
    title: typeof record.title === "string" ? record.title.trim() : undefined,
    summary:
      typeof record.summary === "string" ? record.summary.trim() : undefined,
    promptFull:
      typeof record.promptFull === "string"
        ? record.promptFull.trim()
        : undefined,
    resultBreakdown,
  };
}

/**
 * 译文和原文几乎一样时直接丢掉。
 * 大量 Case 的原文本来就是英文，机器又译了一份英文，切换按钮点下去是空操作；
 * 这里在服务端判掉，PromptViewer / CaseCardPrompt 的 availableLanguages
 * 就只剩 original，按钮组自然不渲染。
 */
function dropRedundantTranslation(
  original: string,
  translation: string | null | undefined
) {
  const value = translation?.trim();
  if (!value) {
    return undefined;
  }

  return isNearDuplicateText(original, value) ? undefined : value;
}

function toPublicAssetPath(rawPath: string | null) {
  if (!rawPath) {
    return MEDIA_PLACEHOLDER;
  }

  if (/^https?:\/\//i.test(rawPath)) {
    return rawPath;
  }

  const normalized = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  return normalized;
}

async function resolveUsableMediaPath(rawPath: string | null) {
  const publicPath = toPublicAssetPath(rawPath);
  if (/^https?:\/\//i.test(publicPath)) {
    return publicPath;
  }

  const absolute = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));

  try {
    await access(absolute);
    return publicPath;
  } catch {
    return MEDIA_PLACEHOLDER;
  }
}

function getPromptFocus(
  category: CaseItem["category"],
  locale: Locale
) {
  if (locale === "en") {
    if (category === "video") return "camera continuity, transition logic, and action resolution";
    if (category === "web") return "information hierarchy, module order, and CTA clarity";
    if (category === "copy") return "the opening hook, evidence section, and closing action";
    if (category === "hardware") return "the physical action, software response, privacy boundary, and device chain";
    return "the subject, style, and material constraints";
  }

  if (category === "video") {
    return "镜头连续性、转场逻辑和动作收束是否同时成立";
  }

  if (category === "web") {
    return "页面信息层级、模块顺序和 CTA 是否一口气讲清楚";
  }

  if (category === "copy") {
    return "前三秒钩子、证据段和结尾行动指令能不能稳定复用";
  }

  if (category === "hardware") {
    return "按下动作、软件反馈、隐私边界与真实设备链路是否同时成立";
  }

  return "主体、风格和材质约束能不能一起站住";
}

function getLabFocus(category: CaseItem["category"], locale: Locale) {
  if (locale === "en") {
    if (category === "video") return "shot length, transitions, and motion amplitude";
    if (category === "web") return "module order, value proposition, and CTA placement";
    if (category === "copy") return "opening structure, evidence count, and CTA strength";
    if (category === "hardware") return "trigger action, end-to-end latency, false triggers, and privacy fallback";
    return "subject description, style intensity, lighting, and material constraints";
  }

  if (category === "video") {
    return "镜头长度、转场方式与动作幅度";
  }

  if (category === "web") {
    return "模块顺序、价值主张写法与 CTA 位置";
  }

  if (category === "copy") {
    return "开场句式、证据数量与行动指令强度";
  }

  if (category === "hardware") {
    return "按键动作、端到端延迟、误触处理与隐私降级";
  }

  return "主体描述、风格词强度与布光/材质约束";
}

function getLearningAngle(category: CaseItem["category"], locale: Locale) {
  if (locale === "en") {
    if (category === "video") return "shot planning and pacing";
    if (category === "web") return "information architecture and conversion copy";
    if (category === "copy") return "structured storytelling and spoken rhythm";
    if (category === "hardware") return "physical interaction, software feedback, and privacy";
    return "visual structure and style control";
  }

  if (category === "video") {
    return "镜头编排与节奏控制";
  }

  if (category === "web") {
    return "信息架构与转化表达";
  }

  if (category === "copy") {
    return "结构化叙事与口播节奏";
  }

  if (category === "hardware") {
    return "实体交互、软件闭环与隐私设计";
  }

  return "视觉结构与风格控制";
}

function getEditableVariables(category: CaseItem["category"], locale: Locale) {
  if (locale === "en") {
    if (category === "video") return "the subject, scene, camera movement, and final action";
    if (category === "web") return "the product name, audience, page modules, and primary button";
    if (category === "copy") return "the audience, pain point, evidence, and call to action";
    if (category === "hardware") return "the trigger, software feedback, failure fallback, and privacy cue";
    return "the subject, scene, material, and color palette";
  }

  if (category === "video") {
    return "主体、场景、镜头运动和结尾动作";
  }

  if (category === "web") {
    return "产品名称、目标用户、页面模块和主按钮";
  }

  if (category === "copy") {
    return "受众、痛点、证据和行动指令";
  }

  if (category === "hardware") {
    return "触发动作、软件反馈、失败降级和隐私提示";
  }

  return "主体、场景、材质和配色";
}

function buildPromptPublicNote(item: CaseItem, locale: Locale) {
  if (locale === "en") {
    return `The useful part of this case is how it turns ${getPromptFocus(item.category, locale)} into constraints you can adjust and retest.`;
  }
  return `这条 ${CATEGORY_LABELS[item.category]} Case 值得学的地方，是它把 ${getPromptFocus(item.category, locale)} 写成了一组可以反复调整的约束。`;
}

function buildPromptLoginNotes(item: CaseItem, locale: Locale) {
  const models = item.recommendedModels.slice(0, 2).join(" / ");

  if (locale === "en") {
    return [
      "Keep it unchanged first: run the complete prompt once to establish a baseline.",
      `Replace only ${getEditableVariables(item.category, locale)} while keeping the rest of the structure fixed.`,
      `Compare next: start with ${models} and change only one variable per run.`,
    ];
  }

  return [
    "先不改：完整复制提示语，生成一版基线结果。",
    `只替换：先改 ${getEditableVariables(item.category, locale)}，其余结构保持不动。`,
    `再对比：优先用 ${models} 起步，每次只改一个变量。`,
  ];
}

function buildPromptContributionNotes(
  item: CaseItem,
  locale: Locale
): { notes: string[]; source: PromptContributionNotesSource } {
  if (locale === "en") {
    const translated = getEnglishCaseTranslation(item.slug);
    if (translated?.resultBreakdown) {
      return { notes: translated.resultBreakdown, source: "authored" };
    }
    return {
      notes: [
        `Check whether ${getPromptFocus(item.category, locale)} all hold in the final result.`,
        `Extract “target result → ${getEditableVariables(item.category, locale)} → constraints” as a reusable template for similar work.`,
        `Run single-variable comparisons around ${getLabFocus(item.category, locale)}. Record the model, cost, and failures; turn it into a Skill only after it repeats reliably.`,
      ],
      source: "template",
    };
  }

  if (item.resultBreakdown) {
    return { notes: item.resultBreakdown, source: "authored" };
  }

  return {
    notes: [
      `观察最终结果里，${getPromptFocus(item.category, locale)} 是否同时成立。`,
      `把“目标结果 → ${getEditableVariables(item.category, locale)} → 约束条件”抽成模板，后续可复用到同类任务。`,
      `围绕 ${getLabFocus(item.category, locale)} 做单变量对照，并记录模型、成本和失败结果；重复成立后再沉淀为 Skill。`,
    ],
    source: "template",
  };
}

function buildEditorNote(item: CaseItem, locale: Locale) {
  const leadModel = item.recommendedModels[0] || "当前推荐模型";
  const evidenceLevel = item.evidenceLevel || "L0";

  if (locale === "en") {
    return `This case is best approached through ${getLearningAngle(item.category, locale)}. Its current evidence level is ${evidenceLevel}, with a stability reference of ${formatStabilityScore(item.stabilityScore, locale)}. Source heat is calculated separately from the original-post snapshot. Read it as a structural sample: understand why it works with ${leadModel} before investing in more expensive iterations.`;
  }
  return `这是一个适合从 ${getLearningAngle(item.category, locale)} 切进去的 case。当前证据等级为 ${evidenceLevel}，稳定性参考为 ${formatStabilityScore(item.stabilityScore, locale)}；来源互动热度单独按原帖快照计算，不和编辑判断混在一起。更建议你把它当成“结构样本”来读；先理解它为什么在 ${leadModel} 上容易出结果，再决定要不要投入更高成本继续打磨。`;
}

function buildLabNote(item: CaseItem, locale: Locale) {
  const leadModel = item.recommendedModels[0] || "当前推荐模型";
  const backupModel = item.recommendedModels[1] || item.recommendedModels[0] || "备选模型";

  if (locale === "en") {
    const cost = {
      low: "low",
      medium: "medium",
      high: "high",
    }[item.costBand];
    return [
      `Build a baseline with ${leadModel}, then compare it with ${backupModel}. Do not change many parameters at once.`,
      `The stability reference is ${formatStabilityScore(item.stabilityScore, locale)}. Focus first on ${getLabFocus(item.category, locale)} and check whether the output stays in the same direction.`,
      `The current cost band is ${cost}. Start with small retests before increasing the number of generations.`,
    ];
  }

  return [
    `第一轮先用 ${leadModel} 建基准版本，再用 ${backupModel} 对照；不要一开始就同时改太多参数。`,
    `这条 case 的稳定参考是 ${formatStabilityScore(item.stabilityScore, locale)}，更建议你优先盯 ${getLabFocus(item.category, locale)} 这些变量，看输出是否还能保持同一方向。`,
    `当前成本档位是 ${COST_BAND_LABELS[item.costBand]}，适合先做小步复测，再决定要不要放大生成次数。`,
  ];
}

function enrichCaseItemBase(
  item: CaseItem,
  locale: Locale
): CaseItem & BaseDerivedCaseFields {
  const translation = getEnglishCaseTranslation(item.slug);
  // 静态兜底数据也要过同一道冗余判定，和数据库路径保持一致。
  const promptTranslationZh = dropRedundantTranslation(
    item.promptFull,
    translation?.promptTranslationZh || item.promptTranslationZh
  );
  const promptTranslationEn = dropRedundantTranslation(
    item.promptFull,
    item.promptTranslationEn
  );
  const localizedItem =
    locale === "en" && translation ? { ...item, ...translation } : { ...item };
  const thumbnail = getThumbnail(item.slug);
  const promptContribution = buildPromptContributionNotes(localizedItem, locale);

  return {
    ...localizedItem,
    contentLocale: item.contentLocale || "en",
    promptTranslationZh,
    promptTranslationEn,
    creatorAvatarUrl: item.creatorAvatarUrl || creatorAvatarUrls[item.creator],
    likedCount: 0,
    promptPublicNote: buildPromptPublicNote(localizedItem, locale),
    promptLoginNotes: buildPromptLoginNotes(localizedItem, locale),
    promptContributionNotes: promptContribution.notes,
    promptContributionNotesSource: promptContribution.source,
    editorNote: buildEditorNote(localizedItem, locale),
    labNote: buildLabNote(localizedItem, locale),
    thumbnailUrl: thumbnail?.url,
    thumbnailFit: resolveCardMediaFit(
      thumbnail?.width,
      thumbnail?.height,
      item.category
    ),
  };
}

const SOURCE_HEAT_KEYS = [
  "sourceInteractionCount",
  "sourceWeightedInteractionCount",
  "sourceInteractionVelocity",
  "sourceMetricsCompleteness",
  "sourceHeatScore",
  "sourceHeatNote",
] as const;

function pickSourceHeatFields(item: SourceHeatFields): SourceHeatFields {
  return Object.fromEntries(
    SOURCE_HEAT_KEYS.map((key) => [key, item[key]])
  ) as unknown as SourceHeatFields;
}

/** 把一份已经算好的全库热度结果转成 slug → 打分字段的索引。 */
export function buildSourceHeatIndex(list: DisplayCaseItem[]) {
  return new Map(list.map((item) => [item.slug, pickSourceHeatFields(item)]));
}

/**
 * 来源热度是「平台内百分位」，结果取决于一起参与打分的那一批数据。
 * 分档取数之后，卡片这一批只有几行，就地打分会把所有分数压成 50。
 * 所以凡是只取了部分行的场景，都要把全库 index 档算好的分数传进来。
 */
function enrichCaseItems(
  items: CaseItem[],
  locale: Locale = "zh-CN",
  heatIndex?: Map<string, SourceHeatFields>
): DisplayCaseItem[] {
  const base = items.map((item) => enrichCaseItemBase(item, locale));
  let scored: Array<CaseItem & BaseDerivedCaseFields & SourceHeatFields>;

  if (heatIndex) {
    // 索引里没有的行（理论上不该出现）就地补一次，保证字段齐全。
    const missing = base.filter((item) => !heatIndex.has(item.slug));
    const patched = new Map(
      scoreSourceHeat(missing).map((item) => [item.slug, pickSourceHeatFields(item)])
    );
    scored = base.map((item) => ({
      ...item,
      ...(heatIndex.get(item.slug) ?? patched.get(item.slug)!),
    }));
  } else {
    scored = scoreSourceHeat(base);
  }

  return scored.map((item) => ({
    ...item,
    spreadScore: item.sourceHeatScore,
    spreadScoreNote:
      item.sourceHeatScore === null
        ? locale === "en"
          ? "No verifiable source-interaction snapshot is available, so momentum is not scored."
          : "尚无可核验的来源互动快照，传播势能暂不评分。"
        : locale === "en"
          ? "Momentum currently follows source heat: interactions and velocity are normalized within each platform before cross-platform comparison."
          : "传播势能当前沿用来源热度：先按平台内互动与互动速度归一，再跨平台比较。",
  }));
}

function enrichCaseItem(
  item: CaseItem,
  locale: Locale = "zh-CN"
): DisplayCaseItem {
  return enrichCaseItems([item], locale)[0];
}

type RowTranslations = {
  localized: StoredCaseTranslation | null;
  zhPromptFull?: string;
  enPromptFull?: string;
};

/**
 * detail 档带整包 translations；index / card 档只带 PostgREST 拍平出来的别名字段。
 * 两种形态在这里统一成同一个结构，下游映射逻辑不用再分叉。
 */
function readRowTranslations(row: CaseRow, locale: Locale): RowTranslations {
  if (row.translations !== undefined) {
    return {
      localized: readStoredTranslation(row.translations, locale),
      zhPromptFull: readStoredTranslation(row.translations, "zh-CN")?.promptFull,
      enPromptFull: readStoredTranslation(row.translations, "en")?.promptFull,
    };
  }

  const title = row.tr_title?.trim() || undefined;
  const summary = row.tr_summary?.trim() || undefined;
  const resultBreakdown = normalizeResultBreakdown(row.tr_result_breakdown);

  return {
    localized:
      title || summary || resultBreakdown
        ? { title, summary, resultBreakdown }
        : null,
    zhPromptFull: truncatePromptPreview(row.prompt_preview_zh),
    enPromptFull: truncatePromptPreview(row.prompt_preview_en),
  };
}

async function mapCaseRowToCaseItem(
  row: CaseRow,
  locale: Locale
): Promise<CaseItem> {
  const fallbackEditorial = caseItems.find((item) => item.slug === row.slug);
  const contentLocale: Locale =
    row.content_locale === "en" ? "en" : "zh-CN";
  const { localized, zhPromptFull, enPromptFull } = readRowTranslations(
    row,
    locale
  );

  // index 档不取媒体列。这里不能拿 undefined 去做 fs.access，
  // 否则 314 行会白跑 628 次占位图判断。
  const hasMediaColumns = row.media_url !== undefined;
  const mediaUrl = hasMediaColumns
    ? await resolveUsableMediaPath(row.media_url ?? null)
    : MEDIA_PLACEHOLDER;
  const posterUrl = hasMediaColumns
    ? await resolveUsableMediaPath(row.poster_url ?? null)
    : MEDIA_PLACEHOLDER;
  const mediaType = normalizeMediaType(
    row.media_kind ?? "image",
    row.media_url ?? undefined
  );

  // detail 档保持原来的三级兜底；index / card 档没有 prompt_full，
  // 用 240 字的预览顶上——卡片本来就只渲染预览，不会露出「暂未提供」占位文案。
  const promptFull =
    row.prompt_full !== undefined
      ? row.prompt_full || row.prompt_preview || MISSING_PROMPT_FULL
      : row.prompt_preview?.trim() || "";

  return {
    slug: row.slug,
    title: localized?.title || row.title,
    category: normalizeCategory(row.category),
    source: row.source_platform || "未知来源",
    sourceUrl: row.source_url || undefined,
    sourceLikeCount: row.source_like_count ?? undefined,
    sourceCommentCount: row.source_comment_count ?? undefined,
    sourceShareCount: row.source_share_count ?? undefined,
    sourceSaveCount: row.source_save_count ?? undefined,
    sourcePublishedAt: row.source_published_at || undefined,
    sourceMetricsCapturedAt: row.source_metrics_captured_at || undefined,
    creator: row.creator_name || ANONYMOUS_CREATOR_NAME,
    creatorAvatarUrl:
      row.creator_avatar_url ||
      fallbackEditorial?.creatorAvatarUrl ||
      creatorAvatarUrls[row.creator_name || ""] ||
      undefined,
    summary: localized?.summary || row.summary || "",
    promptPreview: row.prompt_preview || MISSING_PROMPT_PREVIEW,
    promptFull,
    contentLocale,
    promptTranslationZh:
      contentLocale === "zh-CN"
        ? undefined
        : dropRedundantTranslation(
            promptFull,
            zhPromptFull || fallbackEditorial?.promptTranslationZh
          ),
    promptTranslationEn:
      contentLocale === "en"
        ? undefined
        : dropRedundantTranslation(promptFull, enPromptFull),
    resultBreakdown:
      localized?.resultBreakdown || fallbackEditorial?.resultBreakdown,
    mediaType,
    mediaUrl,
    posterUrl: mediaType === "video" ? posterUrl : undefined,
    likedCount: 0,
    remakeCount: row.remake_count,
    stabilityScore: row.stability_score,
    favoriteScore: row.favorite_score,
    recommendedModels:
      row.recommended_models && row.recommended_models.length > 0
        ? row.recommended_models
        : [MISSING_MODEL],
    costBand: normalizeCostBand(row.cost_band),
    evidenceLevel:
      row.evidence_level === "L1" || row.evidence_level === "L2" ? row.evidence_level : "L0",
    tags: row.tags || [],
    createdAt: row.created_at || undefined,
  };
}

/* ------------------------------------------------------------------ *
 * 取数层：index / card / detail 三档，两层缓存。
 *
 * 外层 React cache：同一次渲染里重复调用只映射 / enrich 一次。
 * 内层 cacheCaseRows：跨请求缓存 Supabase 原始行，窗口 1 小时，带 tag。
 *
 * 顺序不能反。React cache 必须在最外面，跨请求缓存包在里面——
 * 反过来的话每次请求都会跳过 React cache 那层去查 Data Cache，
 * 而且映射和 enrich 的结果在同一次渲染里也不再共享。
 * 详细取舍见 @/lib/case-cache。
 * ------------------------------------------------------------------ */

/**
 * 缓存边界之外统一接住失败：没配环境变量、Supabase 报错、超时，都退回 null，
 * 由各调用方决定是回退本地样例还是留空。
 *
 * 关键是这个 try/catch 在 cacheCaseRows 外面：抛出的那一次不会被写进缓存，
 * 所以一次抖动不会把降级结果钉住整整一个缓存窗口。
 */
async function loadRowsOrNull<R>(load: () => Promise<R>): Promise<R | null> {
  if (!getServerSupabaseClient()) {
    return null;
  }

  try {
    return await load();
  } catch {
    return null;
  }
}

/** index 档原始行。全表，只取排序 / 聚合 / 派生要用的列，实测 314 行约 240KB。 */
const loadCaseIndexRows = cacheCaseRows(
  "case-index-rows",
  async function loadCaseIndexRows(locale: Locale): Promise<CaseIndexRow[]> {
    const supabase = getServerSupabaseClient();
    if (!supabase) {
      throw new CaseRowsUnavailableError("supabase client missing");
    }

    const { data, error } = await withTimeout(
      supabase
        .from("cases")
        .select(buildIndexSelect(locale))
        .eq("is_published", true)
        .order("created_at", { ascending: false })
    );

    const rows = data as unknown as CaseIndexRow[] | null;
    if (error || !rows || rows.length === 0) {
      // 空表和报错一样按不可用处理，且必须抛出——返回 null 会被缓存一小时。
      throw new CaseRowsUnavailableError(
        error?.message || "index query returned no rows"
      );
    }

    return rows;
  }
);

/**
 * index 档：全表但只取排序、聚合、派生要用的列。
 *
 * 为什么必须全量：来源热度是「平台内百分位」，创作者聚合、Skill 目录归类、
 * 相关案例挑选也都要看全库。只取部分行会直接改掉这些数值和结果。
 * 拿到的是「轻量 DisplayCaseItem」——summary 为空、promptPreview 是占位、
 * 媒体是占位图，只能用于排序 / 聚合 / 派生，不能直接渲染成卡片。
 */
const fetchCaseIndex = cache(async function fetchCaseIndexUncached(
  locale: Locale = "zh-CN"
): Promise<DisplayCaseItem[] | null> {
  const rows = await loadRowsOrNull(() => loadCaseIndexRows(locale));
  if (!rows) {
    return null;
  }

  const items = await Promise.all(
    rows.map((row) => mapCaseRowToCaseItem(row, locale))
  );
  return enrichCaseItems(items, locale);
});

/**
 * 迁移跑没跑过只探一次。没跑过时 card 档退回整段译文 promptFull，
 * 页面依然正确，只是出网量和迁移前一样大。
 */
let generatedPreviewColumnsAvailable = true;

/**
 * 迁移没跑时 prompt_preview_zh / _en 是整段译文，进缓存前先截到和库侧生成列同样的
 * 240 字。下游 readRowTranslations 本来也只用前 240 字，语义完全一致，
 * 但缓存条目会从 0.835MB / 0.898MB 降到 0.501MB / 0.564MB（zh / en，占 2MB 上限
 * 41.7% / 44.9% → 25.0% / 28.2%）。上限是静默的，超了不报错只是不缓存，
 * 所以余量要主动留够。迁移跑过之后库侧本来就是截断列，这一步等于空转。
 */
function shrinkCardRowForCache(row: CaseCardRow): CaseCardRow {
  return {
    ...row,
    prompt_preview_zh: truncatePromptPreview(row.prompt_preview_zh) ?? null,
    prompt_preview_en: truncatePromptPreview(row.prompt_preview_en) ?? null,
  };
}

const CARD_SLUG_SEPARATOR = ",";

/**
 * card 档原始行。slugKey 为空串表示全表，否则是逗号分隔的 slug 列表；
 * 它和 locale 一起进缓存键，/en 不会吃到 /zh-CN 的结果。
 */
const loadCaseCardRows = cacheCaseRows(
  "case-card-rows",
  async function loadCaseCardRows(
    locale: Locale,
    slugKey: string
  ): Promise<CaseCardRow[]> {
    const supabase = getServerSupabaseClient();
    if (!supabase) {
      throw new CaseRowsUnavailableError("supabase client missing");
    }

    const slugs = slugKey ? slugKey.split(CARD_SLUG_SEPARATOR) : null;
    const load = (generatedPreviewColumns: boolean) => {
      const query = supabase
        .from("cases")
        .select(buildCardSelect(locale, { generatedPreviewColumns }))
        .eq("is_published", true);

      return withTimeout(
        (slugs ? query.in("slug", slugs) : query).order("created_at", {
          ascending: false,
        })
      );
    };

    let result = await load(generatedPreviewColumnsAvailable);
    if (
      generatedPreviewColumnsAvailable &&
      isMissingColumnError(result.error, GENERATED_PREVIEW_COLUMNS)
    ) {
      generatedPreviewColumnsAvailable = false;
      result = await load(false);
    }

    const rows = result.data as unknown as CaseCardRow[] | null;
    // 全表查询取回空集合和报错一样按不可用处理（原本在调用方判定，
    // 挪进来是为了让它走抛出路径，不被缓存）；按 slug 取到空集合是正常结果。
    if (result.error || !rows || (!slugs && rows.length === 0)) {
      throw new CaseRowsUnavailableError(
        result.error?.message || "card query returned no rows"
      );
    }

    return rows.map(shrinkCardRowForCache);
  }
);

/**
 * 卡片摘要是自动生成的套话时，会退回「复用方法」的第一句当推荐理由。
 * 这段文案存在 translations.resultBreakdown 里，整表拉过来 gzip 后还有 130KB，
 * 而真正用得上的只有摘要为套话的那十来条，所以按需补取。
 */
type ResultBreakdownRow = { slug: string; tr_result_breakdown: unknown };

/**
 * 单独一档缓存，不并进 card 档。
 * 合进去的话，补取失败就会让整个 card 条目都不写缓存，
 * 于是一次无关紧要的抖动把全站打回本地样例——代价远大于少一句推荐理由。
 */
const loadResultBreakdownRows = cacheCaseRows(
  "case-result-breakdown-rows",
  async function loadResultBreakdownRows(
    locale: Locale,
    slugKey: string
  ): Promise<ResultBreakdownRow[]> {
    const supabase = getServerSupabaseClient();
    if (!supabase) {
      throw new CaseRowsUnavailableError("supabase client missing");
    }

    const { data, error } = await withTimeout(
      supabase
        .from("cases")
        .select(buildResultBreakdownSelect(locale))
        .in("slug", slugKey.split(CARD_SLUG_SEPARATOR))
    );

    const extras = data as unknown as ResultBreakdownRow[] | null;
    if (error || !extras) {
      throw new CaseRowsUnavailableError(
        error?.message || "result breakdown query returned no rows"
      );
    }

    return extras;
  }
);

async function attachResultBreakdown(
  locale: Locale,
  rows: CaseCardRow[]
): Promise<CaseRow[]> {
  const needySlugs = rows
    .filter(
      (row) =>
        !getCaseCardSummary(row.tr_summary?.trim() || row.summary?.trim() || "")
    )
    .map((row) => row.slug);

  if (needySlugs.length === 0) {
    return rows;
  }

  const extras = await loadRowsOrNull(() =>
    loadResultBreakdownRows(locale, needySlugs.join(CARD_SLUG_SEPARATOR))
  );
  if (!extras) {
    return rows;
  }

  const bySlug = new Map(
    extras.map((extra) => [extra.slug, extra.tr_result_breakdown])
  );
  return rows.map((row) =>
    bySlug.has(row.slug)
      ? { ...row, tr_result_breakdown: bySlug.get(row.slug) }
      : row
  );
}

const fetchCaseCardsByKey = cache(async function fetchCaseCardsByKeyUncached(
  locale: Locale,
  slugKey: string
): Promise<DisplayCaseItem[] | null> {
  const slugs = slugKey ? slugKey.split(CARD_SLUG_SEPARATOR) : null;
  const rows = await loadRowsOrNull(() => loadCaseCardRows(locale, slugKey));
  if (!rows) {
    return null;
  }

  const enriched = await attachResultBreakdown(locale, rows);
  const items = await Promise.all(
    enriched.map((row) => mapCaseRowToCaseItem(row, locale))
  );

  // 全量 card 档自己就是完整队列，热度就地打分即可，和改造前完全一致；
  // 只取了部分行时必须借 index 档的全库分数。
  const heatIndex = slugs
    ? buildSourceHeatIndex((await fetchCaseIndex(locale)) ?? [])
    : undefined;
  return enrichCaseItems(items, locale, heatIndex);
});

/** 全表 card 档：/cases、/creators、/skills 这类天然需要多行的页面用。 */
function fetchPublishedCaseCards(locale: Locale = "zh-CN") {
  return fetchCaseCardsByKey(locale, "");
}

/** 按 slug 取 card 档，返回 slug → 完整卡片的索引。 */
async function fetchCardsBySlug(
  locale: Locale,
  slugs: string[]
): Promise<Map<string, DisplayCaseItem>> {
  const unique = [...new Set(slugs)].sort();
  if (unique.length === 0) {
    return new Map();
  }

  const cards = await fetchCaseCardsByKey(
    locale,
    unique.join(CARD_SLUG_SEPARATOR)
  );
  return new Map((cards ?? []).map((card) => [card.slug, card]));
}

/**
 * index 档的轻量行没有 summary / prompt / 媒体，直接渲染卡片会是空壳。
 * 这个替换器把它们换成 card 档取回的完整行；补不到就保留原行，不至于整块消失。
 */
function makeCardHydrator(cards: Map<string, DisplayCaseItem>) {
  return <T extends { slug: string }>(item: T): T =>
    (cards.get(item.slug) as unknown as T | undefined) ?? item;
}

/** 把 index 档的轻量行补成可渲染的完整卡片，顺序保持不变。 */
async function hydrateCards(
  locale: Locale,
  items: DisplayCaseItem[]
): Promise<DisplayCaseItem[]> {
  const cards = await fetchCardsBySlug(
    locale,
    items.map((item) => item.slug)
  );
  return items.map(makeCardHydrator(cards));
}

type DetailFetchResult =
  | { status: "ok"; row: CaseDetailRow }
  | { status: "missing" }
  | { status: "unavailable" };

/**
 * detail 档原始行。这一档不带 locale：它把 translations 整包取回来，
 * 语种是在映射层挑的，所以缓存键只有 slug。
 * 查到空行是「这条 slug 不存在」这个确定结果，可以缓存；
 * 只有查询本身失败才抛出。
 */
const loadCaseDetailRow = cacheCaseRows(
  "case-detail-row",
  async function loadCaseDetailRow(
    slug: string
  ): Promise<{ row: CaseDetailRow | null }> {
    const supabase = getServerSupabaseClient();
    if (!supabase) {
      throw new CaseRowsUnavailableError("supabase client missing");
    }

    // generateStaticParams 在 next build 期间先跑，再生成每个详情页；一次
    // 瞬时网络抖动不应该把整次构建打成 CaseDataUnavailableError。只补一次，
    // 且 retryTransient 不会重试 Supabase 返回的 4xx/5xx 业务错误。
    const { data, error } = await retryTransient(
      async () => {
        const result = await withTimeout(
          supabase
            .from("cases")
            .select(DETAIL_SELECT)
            .eq("is_published", true)
            .eq("slug", slug)
            .maybeSingle()
        );

        // postgrest-js 会把 fetch/network rejection 包成 resolved error，
        // status=0；把这种结果重新抛出，才能进入 retryTransient。HTTP
        // 4xx/5xx 保留为结果，下面统一包装成 CaseRowsUnavailableError，
        // 不会被误重试。
        if (
          result.error &&
          isTransientSupabaseError({ ...result.error, status: result.status })
        ) {
          throw Object.assign(new Error(result.error.message), {
            cause: result.error,
            status: result.status,
          });
        }

        return result;
      },
      { maxAttempts: 2 }
    );

    if (error) {
      throw new CaseRowsUnavailableError(error.message);
    }

    return { row: (data as unknown as CaseDetailRow | null) ?? null };
  }
);

/** detail 档：按 slug 单行取全列。 */
const fetchCaseDetailRow = cache(async function fetchCaseDetailRowUncached(
  slug: string
): Promise<DetailFetchResult> {
  const result = await loadRowsOrNull(() => loadCaseDetailRow(slug));
  if (!result) {
    return { status: "unavailable" };
  }

  return result.row ? { status: "ok", row: result.row } : { status: "missing" };
});

const loadPublishedCaseCount = cacheCaseRows(
  "case-published-count",
  async function loadPublishedCaseCount(): Promise<{ count: number }> {
    const supabase = getServerSupabaseClient();
    if (!supabase) {
      throw new CaseRowsUnavailableError("supabase client missing");
    }

    const { count, error } = await withTimeout(
      supabase
        .from("cases")
        .select("slug", { count: "exact", head: true })
        .eq("is_published", true)
    );

    if (error || typeof count !== "number") {
      throw new CaseRowsUnavailableError(error?.message || "count unavailable");
    }

    return { count };
  }
);

/** 总数用 count=exact + head，不拉行。 */
const fetchPublishedCaseCount = cache(
  async function fetchPublishedCaseCountUncached(): Promise<number | null> {
    const result = await loadRowsOrNull(() => loadPublishedCaseCount());
    return result ? result.count : null;
  }
);

export async function getCaseListData(
  filter: CaseFilter = "all",
  locale: Locale = "zh-CN"
) {
  const fromDb = await fetchPublishedCaseCards(locale);
  if (fromDb) {
    return applyCaseFilter(fromDb, filter);
  }

  return applyCaseFilter(enrichCaseItems(caseItems, locale), filter);
}

/**
 * 单条案例：detail 档取这一行的全列，热度仍然按全库口径给分，
 * 所以还要顺带拿一次 index 档（同一次渲染里和详情页共用同一份缓存）。
 */
export async function getCaseDetailData(
  slug: string,
  locale: Locale = "zh-CN"
) {
  const [detail, index] = await Promise.all([
    fetchCaseDetailRow(slug),
    fetchCaseIndex(locale),
  ]);

  if (detail.status === "ok") {
    const item = await mapCaseRowToCaseItem(detail.row, locale);
    return enrichCaseItems(
      [item],
      locale,
      index ? buildSourceHeatIndex(index) : undefined
    )[0];
  }

  if (detail.status === "missing") {
    return null;
  }

  return enrichCaseItems(caseItems, locale).find((item) => item.slug === slug) || null;
}

/**
 * 数据库不可用时抛出，让详情页走错误边界而不是 notFound。
 *
 * 之前的行为是 Supabase 拿不到数据就回退到本地 12 条样例，
 * 于是线上 302 条真实 Case 全部变成「页面不存在」，
 * 而且这个 404 会被 ISR 缓存下来，数据库恢复后仍然维持一段时间。
 */
/**
 * 是否配置了真实数据源。轻量版 fork 后不接 Supabase 是预期状态：内置样例
 * 就是数据源，所有「数据源不可用要抛错」的策略只在配置齐全时生效。
 */
function isDatasourceConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export class CaseDataUnavailableError extends Error {
  constructor() {
    super("Case data source unavailable");
    this.name = "CaseDataUnavailableError";
  }
}

const EMPTY_CASE_DETAIL_PAGE_DATA = {
  item: null,
  creator: null,
  relatedCases: [] as DisplayCaseItem[],
  caseSkills: [] as SkillLink[],
  relatedCaseSkills: new Map<string, SkillLink[]>(),
};

/** 主体、相关案例、作者、Skill 这四块的组装逻辑，数据库路径和本地样例路径共用。 */
function buildCaseDetailPageData(
  item: DisplayCaseItem,
  scope: DisplayCaseItem[],
  relatedCases: DisplayCaseItem[],
  locale: Locale
) {
  const creators = deriveCreatorsFromCases(scope, locale);
  const skillCatalog = deriveSkillCatalog(scope, locale);

  return {
    item,
    creator: findCreatorByName(creators, item.creator),
    relatedCases,
    caseSkills: getCaseSkillLinks(skillCatalog, item.slug, true),
    relatedCaseSkills: new Map(
      relatedCases.map((relatedCase) => [
        relatedCase.slug,
        getCaseSkillLinks(skillCatalog, relatedCase.slug),
      ])
    ),
  };
}

export async function getCaseDetailPageData(
  slug: string,
  locale: Locale = "zh-CN"
) {
  const [detail, index] = await Promise.all([
    fetchCaseDetailRow(slug),
    fetchCaseIndex(locale),
  ]);

  // 数据源故障：沿用本地样例；样例里也没有这条 slug 就抛错走错误边界，
  // 不能让临时故障被 ISR 固化成 404。
  if (detail.status === "unavailable") {
    const fallback = enrichCaseItems(caseItems, locale);
    const item = fallback.find((candidate) => candidate.slug === slug) || null;
    if (!item) {
      throw new CaseDataUnavailableError();
    }
    return buildCaseDetailPageData(
      item,
      fallback,
      getRelatedCases(item, fallback),
      locale
    );
  }

  if (detail.status === "missing") {
    return EMPTY_CASE_DETAIL_PAGE_DATA;
  }

  const item = await mapCaseRowToCaseItem(detail.row, locale);

  // index 档挂了但主体拿到了：正文照常渲染，派生区块留空，不牵连整页。
  if (!index) {
    return {
      ...EMPTY_CASE_DETAIL_PAGE_DATA,
      item: enrichCaseItems([item], locale)[0],
    };
  }

  const heatIndex = buildSourceHeatIndex(index);
  const enrichedItem = enrichCaseItems([item], locale, heatIndex)[0];
  const indexItem = index.find((candidate) => candidate.slug === slug);
  const relatedCases = await hydrateCards(
    locale,
    indexItem ? getRelatedCases(indexItem, index) : []
  );

  return buildCaseDetailPageData(enrichedItem, index, relatedCases, locale);
}

export async function getCaseSlugs(): Promise<string[]> {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return caseItems.map((item) => item.slug);
  }

  // 实测这条查询在同一分钟内会从 0.25s 抖到 10.8s、14.7s，偶尔直接超过 30s。
  // 12s 的默认超时挡不住这种抖动，Vercel 构建已经因此连续失败多次，
  // 所以这里单独放宽到 30s 并重试三次；仍然保留最终抛错，
  // 不静默退回本地样例 slug 导致预渲染出错误的页面集合。
  const SLUG_QUERY_TIMEOUT_MS = 30_000;
  const MAX_ATTEMPTS = 3;
  let lastError: string | null = null;
  let data: Array<{ slug: string | null }> | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      // withTimeout 超时走 reject，不会写进 error 字段；两条失败路径都要接住。
      const result = await withTimeout(
        supabase.from("cases").select("slug").eq("is_published", true),
        SLUG_QUERY_TIMEOUT_MS
      );
      if (!result.error) {
        data = result.data;
        lastError = null;
        break;
      }
      lastError = result.error.message;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    if (attempt < MAX_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
    }
  }

  if (lastError) {
    throw new Error(
      `Failed to load sitemap case slugs after ${MAX_ATTEMPTS} attempts: ${lastError}`
    );
  }

  return (data || [])
    .map((item) => item.slug)
    .filter((slug): slug is string => typeof slug === "string" && slug.length > 0);
}

export type PublishedCaseSnapshot = {
  items: DisplayCaseItem[];
  /**
   * 期望条目数。接真库时是 PostgREST `count=exact` 报的库内已发布行数
   * （拿不到时退 rows.length）；走本地样例时就是样例条数。
   * 调用方拿它和 items.length 比，判断这份快照完不完整。
   */
  expected: number;
  source: "supabase" | "local-sample";
};

/**
 * llms-full.txt 专用：一次性取回全部已发布案例的完整展示对象。
 *
 * 这个函数存在的唯一理由是替掉 `slugs.map(getCaseDetailData)` 那种 N+1 写法
 * （根因与取舍见 src/lib/llms-full-rows.ts 顶部的长注释）。它不适合别的调用方：
 * 一次把全表的 prompt_full 都拉进内存，只有「本来就要输出全量正文」的场景
 * 才划算。列表页、详情页请继续走 index / card / detail 三档。
 *
 * 和逐条取详情相比，输出口径故意保持一致：行照样过
 * mapCaseRowToCaseItem + enrichCaseItems，所以 summary 净化、复用方法兜底、
 * 译文合并这些逻辑一份都没重写，也就不会和详情页分叉。
 * （唯一的差别是媒体字段退成占位图——这一档不取媒体列，见 buildFulltextSelect。）
 *
 * 来源热度不用另外传 heatIndex：这一批本来就是全库，就地打分算出来的百分位
 * 和 index 档口径相同。
 *
 * 失败不降级：取数出错时 fetchAllPublishedCaseRows 直接抛，这里不接。
 */
export async function getPublishedCaseSnapshot(
  locale: Locale = "zh-CN"
): Promise<PublishedCaseSnapshot> {
  const result = await fetchAllPublishedCaseRows(locale);

  if (!result) {
    // 没配 service role 环境变量（本地开发）。和 sitemap-data.ts 一样退本地
    // 样例，此时 expected 就等于样例条数，完整性校验恒等成立，不会误报。
    const items = enrichCaseItems(caseItems, locale);
    return { items, expected: items.length, source: "local-sample" };
  }

  const mapped = await Promise.all(
    result.rows.map((row) => mapCaseRowToCaseItem(row, locale))
  );

  return {
    items: enrichCaseItems(mapped, locale),
    expected: result.totalFromDatabase ?? result.rows.length,
    source: "supabase",
  };
}

/**
 * 三个榜的排序键都不是数据库列：spread / sourceHeat 走的是全库百分位，
 * 在 JS 里算；stability 虽然是列，但要和另两个榜共用同一份数据才不多打一次库。
 * 所以这里的做法是「index 档排完序 → 只把真正渲染的那几十行补成完整卡片」。
 */
export async function getHomeData(locale: Locale = "zh-CN") {
  const [index, publishedCount] = await Promise.all([
    fetchCaseIndex(locale),
    fetchPublishedCaseCount(),
  ]);
  const list = index || enrichCaseItems(caseItems, locale);
  const creators = deriveCreatorsFromCases(list, locale);

  // 列表按发布时间倒序，list[0] 会随每条新 Case 漂移。
  // 配了 GOODCASE_FEATURED_CASE_SLUG 就钉住那一条；没配或找不到时保持原行为。
  const pinnedSlug = process.env.GOODCASE_FEATURED_CASE_SLUG?.trim();
  const pinnedCase = pinnedSlug
    ? list.find((item) => item.slug === pinnedSlug)
    : undefined;
  const featuredCase =
    pinnedCase || list[0] || enrichCaseItem(caseItems[0], locale);
  const spread = [...list]
    .filter((item) => item.spreadScore !== null)
    .sort((a, b) => (b.spreadScore ?? -1) - (a.spreadScore ?? -1))
    .slice(0, 10);
  const sourceHeat = [...list]
    .filter((item) => item.sourceHeatScore !== null)
    .sort(
      (a, b) =>
        (b.sourceHeatScore ?? -1) - (a.sourceHeatScore ?? -1) ||
        (b.sourceWeightedInteractionCount ?? -1) -
          (a.sourceWeightedInteractionCount ?? -1)
    )
    .slice(0, 10);
  const stability = [...list]
    .filter((item) => hasMeasuredStability(item.stabilityScore))
    .sort((a, b) => b.stabilityScore - a.stabilityScore)
    .slice(0, 10);
  const featuredCreators = creators.slice(0, 4);

  // 「本周最热」同样从 index 档就地派生，不新增任何查询。
  // 当前时刻取构建时刻：首页 revalidate 是 86400，模块跟着每日重建刷新，
  // 对「周热」这个语义来说这个新鲜度正好够。
  // creatorOf 必须显式传：index 档的 creator 已经被占位署名填满了，用默认取值的话
  // 「同作者最多两条」会把所有无署名案例当成同一个人，真正最热的那几条反而上不了榜。
  const weeklyHot = selectWeeklyHot(list, Date.now(), {
    creatorOf: attributedCreatorOf,
  });

  // 近 24 小时新增：从 index 档就地数 createdAt，不新增查询。口径刻意用
  // 「近 24 小时」而不是日历意义的「今天」——首页 revalidate=86400、靠发布
  // Deploy Hook 重建，跨午夜后页面不会自动重渲，「今天 +N」在凌晨会变成
  // 假话，滚动窗口怎么缓存都不会说错。走 mock 兜底（index 为 null）时给
  // null：样例数据数出来的不是真话，调用方按「没有数据」隐藏整行。
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentCaseCount24h = index
    ? list.filter(
        (item) => item.createdAt && Date.parse(item.createdAt) >= dayAgo
      ).length
    : null;

  // 首页要渲染的行 = 焦点 Case + 本周最热 + 三个榜 + 精选作者的代表作，一共几十条。
  const cards = index
    ? await fetchCardsBySlug(locale, [
        featuredCase.slug,
        ...weeklyHot.items.map((item) => item.slug),
        ...spread.map((item) => item.slug),
        ...sourceHeat.map((item) => item.slug),
        ...stability.map((item) => item.slug),
        ...featuredCreators.flatMap((creator) => [
          creator.heroCase.slug,
          ...creator.representativeCases.map((item) => item.slug),
        ]),
      ])
    : new Map<string, DisplayCaseItem>();
  const hydrate = makeCardHydrator(cards);

  return {
    featuredCase: hydrate(featuredCase),
    totalCaseCount: publishedCount ?? list.length,
    totalCreatorCount: creators.length,
    recentCaseCount24h,
    featuredCreators: featuredCreators.map((creator) => ({
      ...creator,
      heroCase: hydrate(creator.heroCase),
      representativeCases: creator.representativeCases.map(hydrate),
    })),
    spreadLeaderboard: spread.map(hydrate),
    sourceHeatLeaderboard: sourceHeat.map(hydrate),
    stabilityLeaderboard: stability.map(hydrate),
    // window 要一路传到渲染层：实际产出的是七天还是两周档，副题文案跟着它走。
    weeklyHot: {
      items: weeklyHot.items.map(hydrate),
      window: weeklyHot.window,
    },
    modelStrip: getHomeModelStripItems(list, locale),
  };
}

export async function getCreatorListData(locale: Locale = "zh-CN") {
  const list = await getCaseListData("all", locale);
  return deriveCreatorsFromCases(list, locale);
}

/**
 * 创作者是从 cases 行派生的，没有自己的表；本地样例里也没有任何真实创作者。
 * 所以这两个 creator 取数函数不能沿用「数据源故障就退回本地样例」的降级：
 * 退回样例等于把所有真实创作者判成查无此人，调用方 notFound() 之后
 * 这个软 404 会被 ISR（revalidate=86400）和 CDN 钉住最长一天。
 * 案例详情页早就为此走了 CaseDataUnavailableError 错误边界，这里跟进同一策略。
 *
 * 另一个坑是 index / card 两档缓存条目各自写入、各自过期：新发布创作者的行
 * 可能已进其中一档而另一档还是旧数据。主档查不到时先跨另一档确认一次，
 * 两档都说没有才算真的不存在。
 */
export async function getCreatorDetailData(
  slug: string,
  locale: Locale = "zh-CN"
) {
  const list = await fetchPublishedCaseCards(locale);
  const creator = list
    ? findCreatorBySlug(deriveCreatorsFromCases(list, locale), slug)
    : null;
  if (creator) {
    return creator;
  }

  const index = await fetchCaseIndex(locale);
  if (!index) {
    if (!list) {
      // 轻量版（未接 Supabase）：内置样例就是数据源，作者从样例里派生。
      // 「数据源不可用要抛错」的策略只对配置了真实数据源的部署成立。
      if (!isDatasourceConfigured()) {
        return findCreatorBySlug(
          deriveCreatorsFromCases(enrichCaseItems(caseItems, locale), locale),
          slug
        );
      }
      throw new CaseDataUnavailableError();
    }
    // card 档正常且查不到、index 档临时不可用：主档给出了确定结果，
    // 不因确认档抖动把整页打成 5xx。
    return null;
  }
  return findCreatorBySlug(deriveCreatorsFromCases(index, locale), slug);
}

/**
 * index 档查不到作者时的跨档确认路径：改用全量 card 档做同样的聚合。
 * card 档全表和 index 档一样是全库口径（热度就地打分），行本身就是完整卡片，
 * 不需要再 hydrate。
 */
async function getCreatorDetailPageDataFromCardTier(
  slug: string,
  locale: Locale,
  { indexUnavailable }: { indexUnavailable: boolean }
) {
  let list = await fetchPublishedCaseCards(locale);
  // 轻量版（未接 Supabase）：内置样例充当 card 档，后续派生/聚合照常走。
  if (!list && indexUnavailable && !isDatasourceConfigured()) {
    list = enrichCaseItems(caseItems, locale);
  }
  if (!list) {
    if (indexUnavailable) {
      // 两档都取不到行 → 数据源不可用，抛错走错误边界，绝不能算「作者不存在」。
      throw new CaseDataUnavailableError();
    }
    return {
      creator: null,
      methods: [],
      representativeCaseSkills: new Map(),
    };
  }

  const creator = findCreatorBySlug(deriveCreatorsFromCases(list, locale), slug);
  if (!creator) {
    return {
      creator: null,
      methods: [],
      representativeCaseSkills: new Map(),
    };
  }

  const skillCatalog = deriveSkillCatalog(list, locale);
  return {
    creator,
    methods: getCreatorMethods(skillCatalog, creator.name),
    representativeCaseSkills: new Map(
      creator.representativeCases.map((item) => [
        item.slug,
        getCaseSkillLinks(skillCatalog, item.slug),
      ])
    ),
  };
}

/**
 * 作者页只渲染 3 条代表作，所以走 index 档聚合（保持全库口径的平均热度、
 * 平均稳定分和作者排序），再单独把那 3 条补成完整卡片。
 * 数据源故障与跨档确认的策略见 getCreatorDetailData 的注释。
 */
export async function getCreatorDetailPageData(
  slug: string,
  locale: Locale = "zh-CN"
) {
  const index = await fetchCaseIndex(locale);
  const creator = index
    ? findCreatorBySlug(deriveCreatorsFromCases(index, locale), slug)
    : null;

  if (!index || !creator) {
    return getCreatorDetailPageDataFromCardTier(slug, locale, {
      indexUnavailable: !index,
    });
  }

  const skillCatalog = deriveSkillCatalog(index, locale);
  const cards = await fetchCardsBySlug(locale, [
    creator.heroCase.slug,
    ...creator.representativeCases.map((item) => item.slug),
  ]);
  const hydrate = makeCardHydrator(cards);

  return {
    creator: {
      ...creator,
      heroCase: hydrate(creator.heroCase),
      representativeCases: creator.representativeCases.map(hydrate),
    },
    methods: getCreatorMethods(skillCatalog, creator.name),
    representativeCaseSkills: new Map(
      creator.representativeCases.map((item) => [
        item.slug,
        getCaseSkillLinks(skillCatalog, item.slug),
      ])
    ),
  };
}

/**
 * /skills 与 /skills/[slug] 都要把归入某个 Skill 的 Case 渲染成卡片，
 * 所以这里保持全量 card 档，不做分页。
 */
export async function getSkillCatalogData(locale: Locale = "zh-CN") {
  const list =
    (await fetchPublishedCaseCards(locale)) || enrichCaseItems(caseItems, locale);
  return deriveSkillCatalog(list, locale);
}

export async function getSkillDetailData(
  slug: string,
  locale: Locale = "zh-CN"
) {
  const catalog = await getSkillCatalogData(locale);
  return findSkillBySlug(catalog, slug);
}

/**
 * 只要 slug 列表，不需要卡片内容：Skill 归类只看标题、标签、分类和作者，
 * index 档就够，走全量 card 档纯属浪费。
 */
export async function getSkillSlugs() {
  const index = await fetchCaseIndex();
  const list = index || enrichCaseItems(caseItems, "zh-CN");
  return deriveSkillCatalog(list, "zh-CN").allSkills.map((skill) => skill.slug);
}

/**
 * /models/[slug] 现在走 getCaseListData 全量再在内存里筛。
 * 模型匹配是「别名子串」语义（"nano banana" 要命中 "Nano Banana Pro"），
 * PostgREST 在数组列上表达不了，array_to_string / ::text 又不是 immutable，
 * 建不了生成列。所以退一步：用 index 档在 JS 里筛出 slug，只补这些行的卡片。
 * 页面接线由调用方决定，这里只提供函数。
 */
export async function getModelCaseListData(
  modelSlug: string,
  locale: Locale = "zh-CN"
) {
  if (!getModelFamily(modelSlug)) {
    return [];
  }

  const index = await fetchCaseIndex(locale);
  if (!index) {
    return filterCasesByModel(enrichCaseItems(caseItems, locale), modelSlug);
  }

  return hydrateCards(locale, filterCasesByModel(index, modelSlug));
}

/** 只要作者档案，不需要作者名下所有 Case 的卡片内容，所以聚合走 index 档。 */
export async function getCreatorForCase(
  slug: string,
  locale: Locale = "zh-CN"
) {
  const [item, index] = await Promise.all([
    getCaseDetailData(slug, locale),
    fetchCaseIndex(locale),
  ]);

  if (!item) {
    return null;
  }

  const creators = deriveCreatorsFromCases(
    index || enrichCaseItems(caseItems, locale),
    locale
  );
  return findCreatorByName(creators, item.creator);
}

export type { CreatorItem };
