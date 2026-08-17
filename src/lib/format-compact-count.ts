// 把计数格式化成紧凑展示文案，用于点赞数这类社交计数在有限空间里展示。
//
// 规则：>=1000 显示成一位小数 + k（2300 -> "2.3k"），整数部分不补 .0（5000 -> "5k"）；
// <1000 原样显示整数。只覆盖当前数据量级（现有 sourceLikeCount 最高 6471），
// 没有做 M/B 分级——真到那个量级再加。
export function formatCompactCount(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  const normalized = Math.max(0, Math.round(value));
  if (normalized < 1000) {
    return String(normalized);
  }

  const rounded = Math.round((normalized / 1000) * 10) / 10;
  const formatted = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${formatted}k`;
}
