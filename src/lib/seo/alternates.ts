import type { Metadata } from "next";
import { localizeHref, type Locale } from "@/i18n/config";

/**
 * hreflang（alternates.canonical / alternates.languages）的统一出口。
 *
 * 为什么必须走这个出口：Next 的 metadata 继承是「按字段整块覆盖」，不是深合并。
 * `[lang]/layout.tsx` 给了一份首页专属的 `alternates`（canonical 指首页、
 * languages 指首页的 zh-CN / en 两个地址）。子页面如果只写
 * `alternates: { canonical: ... }`，Next 不会把 canonical 和 languages 分别
 * 合并——整个 `alternates.languages` 会原样继承父级那份指向首页的值。
 *
 * 线上实测过真实事故：`https://goodcase.ai/models/nano-banana` 的
 * hreflang 输出 `zh-CN → https://goodcase.ai`、`en → https://goodcase.ai/en`，
 * 全部指向首页而不是这个模型页——根因就是该页 `generateMetadata` 在模型未命中
 * 时提前 `return {}`，`alternates` 完全没声明，于是继承了 layout 那份写死的
 * 首页 languages。这等于给 Google 喂了一整簇错误的 hreflang，比完全不写
 * hreflang 更糟。
 *
 * 所以：任何子页面只要需要 canonical，就必须连 languages 一起通过本函数
 * 显式给出，不要只写裸 `alternates: { canonical }`，也不要指望父级兜底。
 */
export function localeAlternates(
  locale: Locale,
  path: string,
  /**
   * rss: true 挂站点级 `/feed.xml`（layout 用）；传字符串挂那个具体路径——
   * /daily、/daily/[date] 用的是独立的 `/daily/feed.xml`，不是站点总 feed。
   */
  opts?: { rss?: boolean | string }
): Metadata["alternates"] {
  const alternates: Metadata["alternates"] = {
    canonical: localizeHref(locale, path),
    languages: {
      "zh-CN": localizeHref("zh-CN", path),
      en: localizeHref("en", path),
      "x-default": localizeHref("zh-CN", path),
    },
  };

  if (opts?.rss) {
    const rssPath = typeof opts.rss === "string" ? opts.rss : "/feed.xml";
    alternates.types = {
      "application/rss+xml": localizeHref(locale, rssPath),
    };
  }

  return alternates;
}
