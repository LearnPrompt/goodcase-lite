/**
 * 卡片媒体框的 cover / contain 判定。
 *
 * 背景：public/media/thumbs 里 302 张缩略图的宽高比是双峰分布——
 * p10 0.56（9:16 竖版视频封面）、p25 0.75、中位 1.50、p75 1.77、p90 1.79（16:9）。
 * 固定框 + object-cover 平均要裁掉 28.8%（16:9 框）到 32.3%（4:3 框）的画面，
 * 而且丢失集中在两个极端：竖版封面在 4:3 框里只剩 42% 高度，宽幅分镜只剩 40% 宽度，
 * 恰好是信息密度最高的两类。换任何单一固定比例都救不了双峰分布，
 * 所以框固定成 16:9，填充方式按每张图的实际比例自适应。
 */

/** 卡片媒体框的目标比例，和 aspect-[16/9] 必须保持一致。 */
export const CARD_MEDIA_ASPECT_RATIO = 16 / 9;

/**
 * 允许 cover 裁切的最大比例偏离度（相对目标比例的倍率偏差），默认档。
 *
 * 取 0.25 的依据有两条：
 * 1. 上界可算：偏离 25% 意味着图片与框的比例相差最多 1.25 倍，
 *    cover 在被裁的那一维至少保留 1/1.25 = 80% —— 即最多裁掉 20% 画面，
 *    这个量级不会吃掉主体，超过就开始切主体了。
 * 2. 对阈值不敏感：实测 302 张的偏离度直方图里，
 *    ≤0.20 有 144 张、≤0.25 有 160 张、≤0.30 有 169 张，
 *    阈值正好落在双峰之间的稀疏带，前后浮动 5 个点只影响个位数张数。
 */
export const CARD_MEDIA_COVER_TOLERANCE = 0.25;

/**
 * 分类专属容差表：只有 web 分类单独收紧，其余分类沿用上面的默认档。
 *
 * 依据是 2026-08 对全库 315 张缩略图按分类实测的偏离度分布：
 *
 * | 分类  | 数量 | 中位偏离 | 0.25 下 cover | 0.10 下 cover |
 * |-------|------|----------|----------------|----------------|
 * | video | 131  | 0%       | 87             | 84             |
 * | image | 106  | 58%      | 21             | 17             |
 * | web   | 78   | 13%      | 62             | 31             |
 *
 * video 几乎全是标准 16:9、image 大多是竖版海报早就走 contain——这两类
 * 在 0.10~0.25 之间怎么调阈值都基本不动，差异全部集中在 web：它的中位
 * 偏离 13% 正好卡在阈值中间，而 web 类是 UI 截图/落地页/代码产出，标题、
 * 导航、标签全贴在画面边缘，是最不该裁的一类。线上已经出现真实案例：
 * 一张落地页截图偏离 11%、在 0.25 容差下走 cover，标题被啃掉一行。
 *
 * 所以 web 单独收紧到 0.10——这类最多只容忍裁掉 9% 画面（1 - 1/1.10），
 * 且 0.10 能把 web 类中位偏离 13% 的大多数缩略图推去 contain。
 */
const CARD_MEDIA_COVER_TOLERANCE_BY_CATEGORY: Partial<Record<string, number>> = {
  web: 0.1,
};

export type CardMediaFit = "cover" | "contain";

function isPositiveFinite(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/**
 * 宽高未知时一律返回 cover：老 manifest 条目没有宽高字段、
 * 或者卡片用的是拿不到尺寸的外链原图，都退化成改动前的固定裁切行为。
 *
 * category 拿不到（undefined/null）或不在分类专属表里时，一律走默认容差，
 * 不抛错——这个函数不负责校验分类合法性，未知分类按“没传”处理。
 */
export function resolveCardMediaFit(
  width?: number | null,
  height?: number | null,
  category?: string | null
): CardMediaFit {
  if (!isPositiveFinite(width) || !isPositiveFinite(height)) {
    return "cover";
  }

  const tolerance =
    (category ? CARD_MEDIA_COVER_TOLERANCE_BY_CATEGORY[category] : undefined) ??
    CARD_MEDIA_COVER_TOLERANCE;

  const ratio = width / height;
  const deviation = Math.abs(ratio / CARD_MEDIA_ASPECT_RATIO - 1);
  return deviation <= tolerance ? "cover" : "contain";
}
