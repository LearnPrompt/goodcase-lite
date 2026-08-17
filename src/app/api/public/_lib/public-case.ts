import type { DisplayCaseItem } from "@/lib/cases";
import type { Locale } from "@/i18n/config";
import { localizeHref } from "@/i18n/config";
import { getEnglishCaseTranslation } from "@/i18n/content";
import { buildCaseProvenance } from "@/lib/provenance";
import { SITE_ORIGIN } from "@/lib/site";

/**
 * CORS 允许的请求头。
 *
 * 浏览器里带 Authorization / X-API-Key 调用会先发 preflight OPTIONS，
 * 没有这两个头的许可，带 key 的前端调用会在 preflight 阶段就被拦掉。
 * X-RateLimit-* 必须显式 expose，否则 JS 读不到（简单响应头之外的一律不可见）。
 */
const ALLOWED_REQUEST_HEADERS = "Authorization, X-API-Key, Content-Type";
const EXPOSED_RESPONSE_HEADERS =
  "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-RateLimit-Scope, Retry-After";

export function getPublicApiHeaders(
  locale: Locale,
  extra?: Record<string, string>
): Record<string, string> {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Language": locale,
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": ALLOWED_REQUEST_HEADERS,
    "Access-Control-Expose-Headers": EXPOSED_RESPONSE_HEADERS,
    // Authorization 进 Vary：带 key 的响应和匿名响应内容一样但限额头不同，
    // 不区分的话共享缓存可能把某把 key 的 Remaining 喂给别人。
    // 带 key 的响应本身是 no-store，这条主要是给中间代理一个正确的信号。
    Vary: "Accept-Language, Authorization",
    ...extra,
  };
}

/** preflight 响应。GET 之外不开放任何方法 —— 公开 API 是只读的。 */
export function publicApiPreflightResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": ALLOWED_REQUEST_HEADERS,
      "Access-Control-Expose-Headers": EXPOSED_RESPONSE_HEADERS,
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    },
  });
}

export function toAbsoluteUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  const normalized = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  return `${SITE_ORIGIN}${normalized}`;
}

export function toPublicListItem(item: DisplayCaseItem, locale: Locale) {
  const hasEnglishTranslation = Boolean(getEnglishCaseTranslation(item.slug));
  return {
    slug: item.slug,
    title: item.title,
    category: item.category,
    source: item.source,
    sourceUrl: item.sourceUrl || null,
    sourceLikeCount: item.sourceLikeCount ?? null,
    sourceCommentCount: item.sourceCommentCount ?? null,
    sourceShareCount: item.sourceShareCount ?? null,
    sourceSaveCount: item.sourceSaveCount ?? null,
    sourcePublishedAt: item.sourcePublishedAt || null,
    sourceMetricsCapturedAt: item.sourceMetricsCapturedAt || null,
    sourceInteractionCount: item.sourceInteractionCount,
    sourceWeightedInteractionCount: item.sourceWeightedInteractionCount,
    sourceInteractionVelocity: item.sourceInteractionVelocity,
    sourceMetricsCompleteness: item.sourceMetricsCompleteness,
    sourceHeatScore: item.sourceHeatScore,
    creator: item.creator,
    summary: item.summary,
    promptPreview: item.promptPreview,
    promptTranslationZh: item.promptTranslationZh?.slice(0, 240) || null,
    promptTranslationEn: item.promptTranslationEn?.slice(0, 240) || null,
    mediaType: item.mediaType,
    mediaUrl: toAbsoluteUrl(item.mediaUrl),
    posterUrl: toAbsoluteUrl(item.posterUrl),
    likedCount: item.likedCount,
    remakeCount: item.remakeCount,
    stabilityScore: item.stabilityScore,
    favoriteScore: item.favoriteScore,
    recommendedModels: item.recommendedModels,
    costBand: item.costBand,
    evidenceLevel: item.evidenceLevel || null,
    tags: item.tags || [],
    url: `${SITE_ORIGIN}${localizeHref(locale, `/cases/${item.slug}`)}`,
    contentLocale: item.contentLocale || "en",
    availableLocales: hasEnglishTranslation ? ["zh-CN", "en"] : ["zh-CN"],
    isFallback: locale === "en" && !hasEnglishTranslation,
    // 溯源声明。sourceUrl 上面已经有一份了，这里重复一次是刻意的：
    // provenance 是一个自足的对象，Agent 拿走它就能独立判断这条 prompt 可不可信，
    // 不用再回头拼别的字段。理由见 src/lib/provenance.ts 的文件头。
    provenance: buildCaseProvenance(item.sourceUrl, locale),
  };
}

export function toPublicDetailItem(item: DisplayCaseItem, locale: Locale) {
  return {
    ...toPublicListItem(item, locale),
    promptFull: item.promptFull,
    promptTranslationZh: item.promptTranslationZh || null,
    promptTranslationEn: item.promptTranslationEn || null,
    spreadScore: item.spreadScore,
    spreadScoreNote: item.spreadScoreNote,
    sourceHeatNote: item.sourceHeatNote,
    promptPublicNote: item.promptPublicNote,
    promptLoginNotes: item.promptLoginNotes,
    promptContributionNotes: item.promptContributionNotes,
    editorNote: item.editorNote,
    labNote: item.labNote,
  };
}
