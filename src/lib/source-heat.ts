export type SourceMetricCount = number | null | undefined;

export type SourceHeatInput = {
  source: string;
  sourceUrl?: string;
  sourceLikeCount?: SourceMetricCount;
  sourceCommentCount?: SourceMetricCount;
  sourceShareCount?: SourceMetricCount;
  sourceSaveCount?: SourceMetricCount;
  sourcePublishedAt?: string;
  sourceMetricsCapturedAt?: string;
};

export type SourceHeatFields = {
  sourceInteractionCount: number | null;
  sourceWeightedInteractionCount: number | null;
  sourceInteractionVelocity: number | null;
  sourceMetricsCompleteness: number;
  sourceHeatScore: number | null;
  sourceHeatNote: string;
};

type WorkingSourceHeat<T> = T &
  Omit<SourceHeatFields, "sourceHeatScore" | "sourceHeatNote"> & {
    platformKey: string;
  };

const METRIC_WEIGHTS = {
  sourceLikeCount: 1,
  sourceCommentCount: 2,
  sourceShareCount: 3,
  sourceSaveCount: 4,
} as const;

type MetricWeight = (typeof METRIC_WEIGHTS)[keyof typeof METRIC_WEIGHTS];

function normalizeMetricCount(value: SourceMetricCount): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }

  return Math.round(value);
}

function normalizePlatform(source: string) {
  const normalized = source.trim().toLowerCase();

  if (/(^|[^a-z])(x|twitter)([^a-z]|$)|x\.com/.test(normalized)) return "x";
  if (/微信公众号|wechat|weixin/.test(normalized)) return "wechat";
  if (/小红书|xiaohongshu|rednote/.test(normalized)) return "xiaohongshu";
  if (/抖音|douyin|tiktok/.test(normalized)) return "douyin";
  if (/github/.test(normalized)) return "github";
  if (/youtube/.test(normalized)) return "youtube";

  return normalized || "unknown";
}

function parseTimestamp(value?: string): number | null {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function calculateCompleteness(item: SourceHeatInput, reportedMetricCount: number) {
  const sourceUrlPoints = item.sourceUrl ? 30 : 0;
  const publishedAtPoints = parseTimestamp(item.sourcePublishedAt) !== null ? 20 : 0;
  const capturedAtPoints = parseTimestamp(item.sourceMetricsCapturedAt) !== null ? 20 : 0;
  const metricPoints = (reportedMetricCount / Object.keys(METRIC_WEIGHTS).length) * 30;

  return Math.round((sourceUrlPoints + publishedAtPoints + capturedAtPoints + metricPoints) * 10) / 10;
}

function percentileRank(value: number, values: number[]) {
  if (values.length <= 1) {
    return 50;
  }

  const lowerCount = values.filter((candidate) => candidate < value).length;
  const equalCount = values.filter((candidate) => candidate === value).length;
  const midpointIndex = lowerCount + (equalCount - 1) / 2;

  return (midpointIndex / (values.length - 1)) * 100;
}

function formatScorePart(value: number) {
  return Math.round(value * 10) / 10;
}

function buildWorkingItem<T extends SourceHeatInput>(item: T): WorkingSourceHeat<T> {
  const metrics = Object.entries(METRIC_WEIGHTS).map(([key, weight]) => {
    const value = normalizeMetricCount(item[key as keyof typeof METRIC_WEIGHTS]);
    return { value, weight };
  });
  const reportedMetrics = metrics.filter(
    (metric): metric is { value: number; weight: MetricWeight } =>
      metric.value !== null
  );
  const interactionCount =
    reportedMetrics.length > 0
      ? reportedMetrics.reduce((sum, metric) => sum + metric.value, 0)
      : null;
  const weightedInteractionCount =
    reportedMetrics.length > 0
      ? reportedMetrics.reduce((sum, metric) => sum + metric.value * metric.weight, 0)
      : null;

  const publishedAt = parseTimestamp(item.sourcePublishedAt);
  const capturedAt = parseTimestamp(item.sourceMetricsCapturedAt);
  const ageHours =
    publishedAt !== null && capturedAt !== null && capturedAt > publishedAt
      ? Math.max((capturedAt - publishedAt) / 3_600_000, 1)
      : null;

  return {
    ...item,
    platformKey: normalizePlatform(item.source),
    sourceInteractionCount: interactionCount,
    sourceWeightedInteractionCount: weightedInteractionCount,
    sourceInteractionVelocity:
      weightedInteractionCount !== null && ageHours !== null
        ? weightedInteractionCount / ageHours
        : null,
    sourceMetricsCompleteness: calculateCompleteness(item, reportedMetrics.length),
  };
}

export function scoreSourceHeat<T extends SourceHeatInput>(
  items: T[]
): Array<T & SourceHeatFields> {
  const workingItems = items.map(buildWorkingItem);

  return workingItems.map((item) => {
    if (item.sourceWeightedInteractionCount === null) {
      return {
        ...item,
        sourceHeatScore: null,
        sourceHeatNote: "尚无可核验的来源互动快照，不参与来源互动榜。",
      };
    }

    const platformCohort = workingItems.filter(
      (candidate) =>
        candidate.platformKey === item.platformKey &&
        candidate.sourceWeightedInteractionCount !== null
    );
    const interactionPercentile = percentileRank(
      item.sourceWeightedInteractionCount,
      platformCohort.map((candidate) => candidate.sourceWeightedInteractionCount as number)
    );
    const velocityCohort = platformCohort
      .map((candidate) => candidate.sourceInteractionVelocity)
      .filter((value): value is number => value !== null);
    const velocityPercentile =
      item.sourceInteractionVelocity === null
        ? 50
        : percentileRank(item.sourceInteractionVelocity, velocityCohort);
    const sourceHeatScore = Math.round(
      interactionPercentile * 0.6 +
        velocityPercentile * 0.3 +
        item.sourceMetricsCompleteness * 0.1
    );

    return {
      ...item,
      sourceHeatScore,
      sourceHeatNote:
        `平台内互动百分位 ${formatScorePart(interactionPercentile)} × 60% + ` +
        `互动速度百分位 ${formatScorePart(velocityPercentile)} × 30% + ` +
        `数据完整度 ${item.sourceMetricsCompleteness} × 10%。` +
        "加权互动按赞 + 2×评论 + 3×转发 + 4×收藏计算；未提供的互动字段不按 0 计。",
    };
  });
}
