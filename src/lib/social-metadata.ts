import type { Metadata } from "next";
import { localizeHref, type Locale } from "@/i18n/config";

/**
 * 社交分享元数据（Open Graph + Twitter Card）的统一出口。
 *
 * 为什么需要它：Next 的 metadata 继承是「按字段整块覆盖」，不是深合并。
 * 子页面只写 title / description，父级 layout 里那份 openGraph 会原样继承下来，
 * 结果是案例库、创作者列表、Skills 列表分享出去全都显示站点默认标题
 * 「GoodCase.ai」+ 站点描述，页面自己的标题一个字都没进卡片。
 * 所以每个需要被分享的页面都必须显式给出自己的 openGraph / twitter。
 *
 * 同一条规则也吃掉 og:image：文件式约定 src/app/[lang]/opengraph-image.tsx
 * 是把图填进 **[lang] 这一段** 的 openGraph.images 的，子页面一旦自己声明
 * openGraph，那份 images 会跟着整块被替换掉，分享卡就没有图了。
 * 所以凡是走本函数的页面都必须显式指回站点默认卡的路由地址。
 *
 * 例外是 /cases/[slug]：它自己那一段里有 opengraph-image.tsx，Next 会填上
 * 案例专属卡，因此详情页不走本函数、也不要在那里手写 images。
 */

const SITE_NAME = "GoodCase.ai";

/**
 * 站点默认分享卡的路由地址。用不带语种前缀的形式（zh 是 /opengraph-image，
 * en 是 /en/opengraph-image）：写成 /zh-CN/opengraph-image 会先吃一次 308
 * 跳到 /opengraph-image，有些抓取器不跟跳转。
 */
function defaultOgImage(locale: Locale) {
  return {
    url: localizeHref(locale, "/opengraph-image"),
    width: 1200,
    height: 630,
    type: "image/png",
    alt: "GoodCase.ai AI prompt case collection",
  };
}

/** og:description / meta description 的安全长度：中文按字数算，160 字符是各家抓取器的公约数。 */
export function truncateDescription(text: string, maxLength = 160) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1)}…`;
}

export function ogLocale(locale: Locale) {
  return locale === "en" ? "en_US" : "zh_CN";
}

type SocialMetadataInput = {
  locale: Locale;
  title: string;
  description: string;
  /** 不带语种前缀的站内路径，如 "/cases"；本函数负责本地化。 */
  path: string;
  type?: "website" | "article" | "profile";
};

export function socialMetadata({
  locale,
  title,
  description,
  path,
  type = "website",
}: SocialMetadataInput): Pick<Metadata, "openGraph" | "twitter"> {
  const shortDescription = truncateDescription(description);
  const image = defaultOgImage(locale);

  return {
    openGraph: {
      type,
      locale: ogLocale(locale),
      siteName: SITE_NAME,
      url: localizeHref(locale, path),
      title,
      description: shortDescription,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: shortDescription,
      images: [image],
    },
  };
}
