/**
 * 搜索命中字段在卡片上显示成什么标签。
 *
 * 拆成独立的纯模块，是因为 case-card.tsx 是 "use client" 组件，node 里没法直接渲染，
 * 这段映射只能靠读源码正则去断言——那不是行为测试，改个换行就红。
 * 这里不引入任何运行时依赖，scripts/review/lib/case-card-search-field.test.mjs
 * 用纯 node 直接加载，同 src/lib/stability.ts 的约束。
 */
export type CaseCardSearchFieldLocale = "zh-CN" | "en";

/**
 * 返回 null 表示没有命中字段，整块标签不渲染；返回空字符串表示「有命中但不显示标签」。
 *
 * 空字符串这一档是 title 在默认卡上的正常形态：默认卡的标题本来就在卡片正上方，
 * 再打一行「标题」的标签是废话；gallery 卡的标题被裁掉了才需要点名。
 * 所以这里必须用 `??` 而不是 `||`——用 `||` 的话这个刻意的空字符串会被当成「没映射」，
 * 回退成原始字段名，默认卡上会直接渲染出一个字面量 "title"。
 */
export function caseCardSearchFieldLabel(
  field: string | null | undefined,
  locale: CaseCardSearchFieldLocale,
  isGallery: boolean
): string | null {
  if (!field) {
    return null;
  }

  // 用 Map 而不是对象字面量查表：searchField 是字符串，对象查表会连原型链一起命中，
  // field="constructor" 会返回 Object 函数本身，塞进 JSX 就是一个渲染期报错。
  const labels = new Map<string, string>([
    ["title", isGallery ? (locale === "en" ? "Title" : "标题") : ""],
    ["creator", locale === "en" ? "Creator" : "作者"],
    ["summary", locale === "en" ? "Summary" : "摘要"],
    ["model", locale === "en" ? "Model" : "模型"],
    ["source", locale === "en" ? "Source" : "来源"],
    ["tag", locale === "en" ? "Tag" : "标签"],
    ["prompt", locale === "en" ? "Prompt" : "Prompt"],
  ]);

  return labels.get(field) ?? field;
}
