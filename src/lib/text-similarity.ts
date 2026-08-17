/**
 * 字符 bigram 的 Dice 系数，用来判断一段「译文」是否和原文几乎一样。
 *
 * 背景：大量 Case 的原文本来就是英文，机器又生成了一份英文译文，
 * 两份内容高度重合，Prompt 面板的语言切换按钮点下去等于空操作。
 * 这里在服务端把这种冗余译文判出来直接丢弃，按钮自然不再渲染。
 *
 * 判定前先小写化并去掉全部空白，这样换行、缩进和大小写差异不影响结论。
 *
 * 边界行为：
 * - 任一侧归一化后是空串 → 返回 0，按不相似处理，保留原有译文。
 * - 两侧归一化后完全相同 → 返回 1，包括长度不足 2、拿不出 bigram 的短串。
 * - 长度不足 2 且不相同的短串（"a" vs "b"）→ 返回 0。
 */
export function normalizeForSimilarity(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function countBigrams(value: string) {
  const counts = new Map<string, number>();
  for (let index = 0; index < value.length - 1; index += 1) {
    const gram = value.slice(index, index + 2);
    counts.set(gram, (counts.get(gram) ?? 0) + 1);
  }
  return counts;
}

export function bigramDiceCoefficient(left: string, right: string) {
  const a = normalizeForSimilarity(left);
  const b = normalizeForSimilarity(right);

  if (!a || !b) {
    return 0;
  }

  if (a === b) {
    return 1;
  }

  if (a.length < 2 || b.length < 2) {
    return 0;
  }

  const aCounts = countBigrams(a);
  const bCounts = countBigrams(b);
  let shared = 0;
  let aTotal = 0;
  let bTotal = 0;

  for (const count of aCounts.values()) {
    aTotal += count;
  }
  for (const [gram, count] of bCounts) {
    bTotal += count;
    shared += Math.min(count, aCounts.get(gram) ?? 0);
  }

  return (2 * shared) / (aTotal + bTotal);
}

export const NEAR_DUPLICATE_THRESHOLD = 0.9;

export function isNearDuplicateText(
  left: string,
  right: string,
  threshold: number = NEAR_DUPLICATE_THRESHOLD
) {
  return bigramDiceCoefficient(left, right) > threshold;
}
