import type { CaseCardItem } from "@/components/case-card";
import type { DisplayCaseItem } from "@/lib/cases";
import type { SkillLink } from "@/lib/skills";

/**
 * 从 DisplayCaseItem 里挑出 CaseCard 真正会渲染的字段。
 *
 * 背景：CaseCard 已经是 "use client"，客户端组件的 props 会被原样序列化进 RSC payload。
 * 调用方以前写的是 item={{ ...item, skills }}，等于把整个 DisplayCaseItem 灌进 HTML——
 * 其中 promptFull、resultBreakdown、sourceUrl、source*Count、costBand、evidenceLevel、
 * recommendedModels、tags、favoriteScore、remakeCount、labNote 这些卡片一个都不渲染。
 * 实测 /cases 一页 24 张卡，光 promptFull + resultBreakdown 就占了 12KB payload。
 *
 * 这个文件必须是普通模块，不能挂在 case-card.tsx 上：从服务端组件调用 "use client"
 * 模块导出的普通函数，运行期会报 “Attempted to call ... from the server”，
 * 而 tsc / eslint / next build 都查不出来。
 */
export function toCaseCardItem(
  item: DisplayCaseItem,
  skills?: SkillLink[]
): CaseCardItem {
  return {
    slug: item.slug,
    title: item.title,
    category: item.category,
    source: item.source,
    creator: item.creator,
    summary: item.summary,
    promptPreview: item.promptPreview,
    contentLocale: item.contentLocale,
    promptTranslationZh: item.promptTranslationZh,
    promptTranslationEn: item.promptTranslationEn,
    mediaType: item.mediaType,
    mediaUrl: item.mediaUrl,
    posterUrl: item.posterUrl,
    // 卡片只读 [0]，而且只取它的第一句；整段三条方法没必要全部序列化。
    promptContributionNotes: item.promptContributionNotes?.slice(0, 1),
    thumbnailUrl: item.thumbnailUrl,
    thumbnailFit: item.thumbnailFit,
    stabilityScore: item.stabilityScore,
    // 稳定度格子要靠它区分「没测过」和「复测未通过」，见 src/lib/stability.ts。
    evidenceLevel: item.evidenceLevel,
    sourceHeatScore: item.sourceHeatScore,
    sourcePublishedAt: item.sourcePublishedAt,
    skills,
  };
}
