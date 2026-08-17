/**
 * 内容语言判定的唯一实现来源。
 *
 * 背景：供给管线长期把「案例来自中文创作者」当成「Prompt 是中文」，
 * 于是所有候选都落成 zh-CN。实际 X 上的中文创作者绝大多数直接写英文 Prompt，
 * 314 条已发布 Case 里 275 条的 prompt_full 是英文。标错的后果是前端认为需要英译，
 * 对一段本来就是英文的 Prompt 再机器翻译一遍，译文和原文几乎一样，
 * 语言切换按钮点了没反应。
 *
 * 判定口径已在这 314 条真实数据上验证过，与人工抽样一致，不要随意调阈值。
 */

const CJK = /[一-鿿぀-ヿ]/;

/** 数据库 content_locale 上有 check 约束，只认这两个值。 */
export const SUPPORTED_LOCALES = ["zh-CN", "en"];

/** 中日文字符占比。标点和空白不计入分母，避免长 Prompt 里的英文标点稀释比例。 */
export function cjkRatio(text) {
  const meaningful = (text || "").replace(/[\s\p{P}\p{S}]/gu, "");
  if (!meaningful.length) return 0;
  let hits = 0;
  for (const ch of meaningful) {
    if (CJK.test(ch)) hits += 1;
  }
  return hits / meaningful.length;
}

/** 超过 15% 的中日文字符就认定为中文原文；纯英文 Prompt 里偶尔夹一两个中文注释不会误判。 */
export function detectLocale(text) {
  return cjkRatio(text) > 0.15 ? "zh-CN" : "en";
}

/** 粗粒度相似度：按空白切词后算 Jaccard，足以识别“翻译等于原文”这种情况。 */
export function similarity(a, b) {
  const tokenize = (t) =>
    new Set(
      (t || "")
        .toLowerCase()
        .split(/\s+/)
        .filter((x) => x.length > 1)
    );
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (!setA.size || !setB.size) return 0;
  let shared = 0;
  for (const token of setA) {
    if (setB.has(token)) shared += 1;
  }
  return shared / new Set([...setA, ...setB]).size;
}

/**
 * 候选入库和发布共用的取值规则：上游显式给了合法值就尊重它，
 * 否则按 Prompt 正文判定，而不是无条件默认 zh-CN。
 * 不合法的值（拼写错误、其他语言代码）当作没给，避免写进去违反 check 约束。
 */
export function resolveContentLocale(candidate) {
  const explicit = candidate?.content_locale;
  if (typeof explicit === "string" && SUPPORTED_LOCALES.includes(explicit.trim())) {
    return explicit.trim();
  }
  return detectLocale(candidate?.prompt_full || candidate?.prompt_preview || "");
}

/**
 * 声明的语言和正文对不上时返回详情，否则返回 null。
 * 存量候选的 content_locale 是数据库默认值填的，看起来像显式声明，
 * resolveContentLocale 会照单全收；这个函数是发布前的哨兵，用来把这类行喊出来。
 */
export function describeLocaleMismatch(candidate) {
  const declared = candidate?.content_locale;
  if (typeof declared !== "string" || !SUPPORTED_LOCALES.includes(declared.trim())) {
    return null;
  }
  const text = candidate?.prompt_full || candidate?.prompt_preview || "";
  if (!text.trim()) return null;
  const detected = detectLocale(text);
  if (detected === declared.trim()) return null;
  return { declared: declared.trim(), detected, cjkRatio: cjkRatio(text) };
}
