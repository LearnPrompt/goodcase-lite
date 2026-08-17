/**
 * JSON-LD 结构化数据的统一输出组件。Server component，不带任何交互。
 *
 * 传单个 schema 对象时，自动补一层 `@context`；传数组时输出 `@graph`
 * （数组内每个对象只需要 `@type`，不用各自重复 `@context`）。
 *
 * 序列化结果里的 `<` 必须转义成 `<`：`dangerouslySetInnerHTML` 不会对
 * `<script>` 内容做转义，Prompt 全文、案例标题这些字段一旦含有 `</script>`
 * 之类的子串，会提前把 script 标签闭合、后面的内容被当成 HTML 解析，属于
 * 经典的存储型 XSS 入口。JSON 语法本身允许 `<` 代替字面 `<`，转义后
 * 不影响 JSON.parse 的结果。
 */

type JsonLdData = Record<string, unknown>;

export function JsonLd({ data }: { data: JsonLdData | JsonLdData[] }) {
  const payload = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : { "@context": "https://schema.org", ...data };

  const json = JSON.stringify(payload).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
