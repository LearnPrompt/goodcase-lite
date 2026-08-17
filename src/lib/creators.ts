import type { CaseItem } from "@/lib/mock-data";
import {
  averageMeasuredStability,
  measuredStabilityValue,
} from "@/lib/stability";
import {
  getCaseCardSummary,
  pickLatestAuthorDate,
} from "@/lib/case-presentation";
import type { Locale } from "@/i18n/config";
import {
  normalizeCreatorIdentity,
  slugifyCreatorName,
} from "@/lib/creator-slug";
import { rankSearchResults, type SearchField } from "./search.ts";

export type CreatorCaseItem = CaseItem & {
  sourceHeatScore: number | null;
  sourceInteractionCount: number | null;
  /**
   * 摘要是自动生成的套话时用来兜底的三段式复用方法（只取第一句）。
   * 实际调用方传进来的都是 DisplayCaseItem（结构上是 CaseItem 的超集，
   * 恒有这个字段），这里补进类型只是让 TS 认得它，不代表要多取数据。
   */
  promptContributionNotes: string[];
};

export type CreatorItem = {
  slug: string;
  name: string;
  avatarUrl?: string;
  bio: string;
  caseCount: number;
  primaryCategory: CaseItem["category"];
  sourceFootprint: string[];
  totalSourceInteractions: number;
  averageStabilityScore: number | null;
  averageSourceHeatScore: number | null;
  tags: string[];
  highlightedLabel: string;
  heroCase: CreatorCaseItem;
  representativeCases: CreatorCaseItem[];
  /**
   * 「最近作品」——该创作者名下已发布案例里最新的 sourcePublishedAt（缺失时退
   * createdAt），格式化成 YYYY/MM/DD。只展示作者侧时间，不展示编辑/收录时间。
   * 一条可用日期都没有时是 null，调用方不渲染这一行。
   */
  latestWorkDate: string | null;
};

const CATEGORY_LABELS: Record<CaseItem["category"], string> = {
  image: "AI 图像",
  video: "AI 视频",
  web: "AI 编程(UI)",
  copy: "AI 文案",
  hardware: "AI 硬件",
};

function pickVariant(seed: string, count: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  }
  return hash % count;
}

function buildCreatorBio(
  name: string,
  category: CaseItem["category"],
  sources: string[],
  heroCase: CaseItem,
  stabilityScore: number | null,
  sourceHeatScore: number | null,
  locale: Locale
) {
  const primarySource = sources[0] || "多个平台";
  const secondSource = sources[1];
  const leadModel = heroCase.recommendedModels[0] || "主力模型";
  const heroTitle = heroCase.title.replace(/[（(].*?[）)]\s*$/, "").trim();
  const footprint = secondSource ? `${primarySource}和${secondSource}两头都在更新` : `长期扎根${primarySource}`;
  const costPhrase =
    heroCase.costBand === "low" ? "成本压得低" : heroCase.costBand === "high" ? "愿意为质感砸成本" : "成本控制在中等区间";
  const stabilityPhrase =
    stabilityScore === null
      ? locale === "en"
        ? "stability retest open to votes"
        : "稳定度投票催复测"
      : locale === "en"
        ? `${stabilityScore}% stability`
        : `复现稳定分 ${stabilityScore}%`;
  const signalPhrase =
    sourceHeatScore === null ? stabilityPhrase : `来源热度 ${sourceHeatScore}`;

  if (locale === "en") {
    const sourceLabel = secondSource
      ? `publishes across ${primarySource} and ${secondSource}`
      : `is active on ${primarySource}`;
    const stabilityLabel =
      stabilityScore === null
        ? "with its stability retest open to votes"
        : `with a ${stabilityScore}% stability reference`;
    const categoryFocus = {
      image: "AI image making",
      video: "AI video production",
      web: "production-ready AI interfaces",
      copy: "structured AI copywriting",
      hardware: "AI hardware and software loops",
    }[category];
    return `${name} focuses on ${categoryFocus} and ${sourceLabel}. “${heroTitle}” is the current representative case, built with ${leadModel} ${stabilityLabel}.`;
  }

  const templatesByCategory: Record<CaseItem["category"], Array<(n: string) => string>> = {
    image: [
      (n) => `${n} 主攻 AI 生图，${footprint}，代表作《${heroTitle}》当前${signalPhrase}，惯用 ${leadModel}。`,
      (n) => `${n} 的布光和质感靠 ${leadModel} 打底，代表作《${heroTitle}》${stabilityPhrase}。`,
      (n) => `${n} ${footprint}，代表作《${heroTitle}》，${costPhrase}。`,
    ],
    video: [
      (n) => `${n} ${footprint}，《${heroTitle}》用 ${leadModel} 做转场，当前${signalPhrase}。`,
      (n) => `${n} ${footprint}，代表作《${heroTitle}》${stabilityPhrase}，惯用 ${leadModel}。`,
      (n) => `${n} 的代表作《${heroTitle}》用 ${leadModel} 跑出，${costPhrase}。`,
    ],
    web: [
      (n) => `${n} 在${primarySource}输出 UI 工程化实践，《${heroTitle}》搭 ${leadModel} 出方案，带可复现代码。`,
      (n) => `${n} ${footprint}，交付可运行的界面，《${heroTitle}》配了完整实现思路。`,
    ],
    copy: [
      (n) => `${n} ${footprint}，《${heroTitle}》的开场钩子和结尾行动指令都能直接复用。`,
      (n) => `${n} 用 ${leadModel} 打底稿再手调语感，代表作是《${heroTitle}》。`,
    ],
    hardware: [
      (n) => `${n} 在${primarySource}记录 AI 硬件与软件闭环，《${heroTitle}》公开了交互、隐私边界和验证状态。`,
      (n) => `${n} 把实体动作、macOS 反馈和 AI 处理串成可复测链路，代表作是《${heroTitle}》。`,
    ],
  };

  const templates = templatesByCategory[category];
  return templates[pickVariant(name, templates.length)](name);
}

function buildCreatorTags(
  cases: CreatorCaseItem[],
  category: CaseItem["category"],
  locale: Locale
) {
  const categoryLabel =
    locale === "en"
      ? {
          image: "AI Image",
          video: "AI Video",
          web: "AI Coding (UI)",
          copy: "AI Copy",
          hardware: "AI Hardware",
        }[category]
      : CATEGORY_LABELS[category];
  const tags = new Set<string>([categoryLabel]);

  if (cases.some((item) => item.stabilityScore >= 90)) {
    tags.add(locale === "en" ? "Stable output" : "稳定输出");
  }

  if (cases.some((item) => (item.sourceHeatScore ?? -1) >= 80)) {
    tags.add(locale === "en" ? "High source heat" : "来源互动高");
  }

  if (cases.some((item) => item.costBand === "low")) {
    tags.add(locale === "en" ? "Low-cost method" : "低成本可学");
  }

  if (cases.some((item) => item.costBand === "high")) {
    tags.add(locale === "en" ? "High finish" : "高完成度");
  }

  return Array.from(tags).slice(0, 4);
}

export function deriveCreatorsFromCases(
  caseList: CreatorCaseItem[],
  locale: Locale = "zh-CN"
): CreatorItem[] {
  const grouped = new Map<
    string,
    { name: string; items: CreatorCaseItem[] }
  >();

  for (const item of caseList) {
    const rawName = item.creator.normalize("NFKC").trim();
    const key = normalizeCreatorIdentity(rawName);
    const existing = grouped.get(key);
    if (existing) {
      existing.items.push(item);
    } else {
      grouped.set(key, {
        name: rawName.replace(/^@(?=[a-z0-9_])/i, ""),
        items: [item],
      });
    }
  }

  return Array.from(grouped.values())
    .map(({ name, items }) => {
      const representativeCases = [...items]
        .sort(
          (a, b) =>
            (b.sourceHeatScore ?? 0) +
            b.stabilityScore -
            ((a.sourceHeatScore ?? 0) + a.stabilityScore)
        )
        .slice(0, 3);
      const heroCase = representativeCases[0] || items[0];
      const sourceFootprint = Array.from(new Set(items.map((item) => item.source)));
      const primaryCategory = heroCase.category;
      const sourceHeatScores = items
        .map((item) => item.sourceHeatScore)
        .filter((score): score is number => typeof score === "number");
      const totalSourceInteractions = items.reduce(
        (sum, item) => sum + (item.sourceInteractionCount ?? 0),
        0
      );
      // 复测未通过的案例按 0 分计入均分：作者页的稳定分要吃到真实惩罚，
      // 而不是把失败的复测和「还没测过」一起排除掉。
      const averageStabilityScore = averageMeasuredStability(
        items.map((item) =>
          measuredStabilityValue(item.stabilityScore, item.evidenceLevel)
        )
      );
      const averageSourceHeatScore =
        sourceHeatScores.length > 0
          ? Math.round(
              sourceHeatScores.reduce((sum, score) => sum + score, 0) /
                sourceHeatScores.length
            )
          : null;
      const highlightedLabel =
        averageSourceHeatScore !== null &&
        (averageStabilityScore === null ||
          averageSourceHeatScore >= averageStabilityScore)
          ? locale === "en"
            ? "Editor’s pick"
            : "编辑精选"
          : locale === "en"
            ? "Worth learning"
            : "值得学习";
      const avatarUrl = heroCase.creatorAvatarUrl || items.find((item) => item.creatorAvatarUrl)?.creatorAvatarUrl;
      const latestWorkDate = pickLatestAuthorDate(items, locale);

      return {
        slug: slugifyCreatorName(name),
        name,
        avatarUrl,
        bio: buildCreatorBio(
          name,
          primaryCategory,
          sourceFootprint,
          heroCase,
          averageStabilityScore,
          averageSourceHeatScore,
          locale
        ),
        caseCount: items.length,
        primaryCategory,
        sourceFootprint,
        totalSourceInteractions,
        averageStabilityScore,
        averageSourceHeatScore,
        tags: buildCreatorTags(items, primaryCategory, locale),
        highlightedLabel,
        heroCase,
        representativeCases,
        latestWorkDate,
      } satisfies CreatorItem;
    })
    .sort((a, b) => {
      const scoreA =
        (a.averageSourceHeatScore ?? 0) +
        (a.averageStabilityScore ?? 0) +
        a.totalSourceInteractions / 100;
      const scoreB =
        (b.averageSourceHeatScore ?? 0) +
        (b.averageStabilityScore ?? 0) +
        b.totalSourceInteractions / 100;
      return scoreB - scoreA;
    });
}

export function findCreatorBySlug(creators: CreatorItem[], slug: string) {
  return creators.find((item) => item.slug === slug) || null;
}

export function findCreatorByName(creators: CreatorItem[], name: string) {
  const identity = normalizeCreatorIdentity(name);
  return (
    creators.find(
      (item) => normalizeCreatorIdentity(item.name) === identity
    ) || null
  );
}

export function getCreatorSearchFields(creator: CreatorItem): SearchField[] {
  return [
    { key: "name", value: creator.name, weight: 145 },
    { key: "bio", value: creator.bio, weight: 105 },
    { key: "category", value: creator.tags.join(" "), weight: 85 },
    { key: "source", value: creator.sourceFootprint.join(" "), weight: 70 },
    { key: "case", value: creator.heroCase.title, weight: 100 },
    // 裸取 summary 会让 /creators 搜索的命中片段直接展示代码原文，同一条
    // 净化规则见 src/lib/cases.ts 的 getCaseSearchFields 和
    // src/lib/case-presentation.ts 的 getCaseCardSummary。
    {
      key: "summary",
      value: getCaseCardSummary(creator.heroCase.summary),
      weight: 70,
    },
  ];
}

/**
 * /creators 页面搜索：覆盖作者名、领域/来源、标签和代表案例。
 * 创作者页是 Case 的派生视图，用户可能记住的是作品名或「AI 视频」而不是作者名。
 */
export function filterCreatorsByQuery(
  creators: CreatorItem[],
  q: string
): CreatorItem[] {
  return rankSearchResults(creators, q, getCreatorSearchFields).map(
    ({ item }) => item
  );
}
