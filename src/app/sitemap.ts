import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { MODEL_FAMILIES } from "@/lib/models";
import {
  getSitemapData,
  SITEMAP_URL_WARN_THRESHOLD,
  type SitemapEntry,
} from "@/lib/sitemap-data";
import { SITE_ORIGIN } from "@/lib/site";

// sitemap.js 默认按路由整体走 Next 的路由缓存，除非用到 request-time API 或显式
// dynamic 配置（node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions
// /01-metadata/sitemap.md）。这里不再用 force-dynamic（每次爬虫请求都直接拉一次
// Supabase 全表），改成时间性 revalidate：案例发布/下架都会走 Deploy Hook 触发整站
// 重新构建，构建产物本身就是最新的；下面这个 3600s 只是兜底安全网，防止 Hook 偶发
// 失败时 sitemap 长期钉死在上一次构建快照上。取值与同目录 llms.txt 路由保持一致。
export const revalidate = 3_600;

function toLastModified(value: string | null): Date | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const {
    caseEntries,
    creatorEntries,
    skillEntries,
    modelEntries,
    siteLatest,
  } = await getSitemapData();

  const siteLastModified = toLastModified(siteLatest);

  function localizedEntries(
    path: string,
    changeFrequency: NonNullable<
      MetadataRoute.Sitemap[number]["changeFrequency"]
    >,
    priority: number,
    lastModified?: Date
  ): MetadataRoute.Sitemap {
    const zhUrl = `${SITE_ORIGIN}${path}`;
    const enUrl = `${SITE_ORIGIN}/en${path === "/" ? "" : path}`;
    const alternates = {
      languages: {
        "zh-CN": zhUrl,
        en: enUrl,
        // x-default 指向不区分语种的默认版本，供搜索引擎/客户端在猜不出用户
        // 语言时兜底；站内默认语种固定是 zh-CN（见 i18n/config.ts DEFAULT_LOCALE）。
        "x-default": DEFAULT_LOCALE === "zh-CN" ? zhUrl : enUrl,
      },
    };
    return [
      { url: zhUrl, changeFrequency, priority, alternates, lastModified },
      { url: enUrl, changeFrequency, priority, alternates, lastModified },
    ];
  }

  function entryRoutes(
    entries: SitemapEntry[],
    pathPrefix: string,
    changeFrequency: NonNullable<
      MetadataRoute.Sitemap[number]["changeFrequency"]
    >,
    priority: number
  ): MetadataRoute.Sitemap {
    return entries.flatMap((entry) =>
      localizedEntries(
        `${pathPrefix}/${encodeURIComponent(entry.slug)}`,
        changeFrequency,
        priority,
        toLastModified(entry.lastmod)
      )
    );
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    ...localizedEntries("/", "daily", 1, siteLastModified),
    ...localizedEntries("/cases", "daily", 0.9, siteLastModified),
    // /daily 早报同样跟着全站最新案例的收录节奏走。
    ...localizedEntries("/daily", "daily", 0.7, siteLastModified),
    // 其余静态页没有能代表真实更新时间的字段，宁可不输出 lastmod 也不编一个——
    // 假的 lastmod 会让 Google 降低对这个信号的信任度。
    ...localizedEntries("/skills", "daily", 0.85),
    ...localizedEntries("/models", "daily", 0.85),
    ...localizedEntries("/creators", "daily", 0.8),
    ...localizedEntries("/changelog", "weekly", 0.5),
    ...localizedEntries("/connect", "monthly", 0.5),
    ...localizedEntries("/agent-api", "monthly", 0.6),
    ...localizedEntries("/submit", "monthly", 0.4),
    // /favorites 内容全部来自 localStorage，爬虫看到的是空壳——薄内容，故意
    // 不进 sitemap（原来的条目已删除）。
  ];

  const caseRoutes = entryRoutes(caseEntries, "/cases", "weekly", 0.7);
  const creatorRoutes = entryRoutes(creatorEntries, "/creators", "weekly", 0.6);
  const skillRoutes = entryRoutes(skillEntries, "/skills", "weekly", 0.55);

  // 模型页走注册表顺序（和 /models 页面一致），lastmod 用 sitemap-data 里
  // 按 caseMatchesModel 算好的每个模型家族的最新案例时间。
  const modelLastmodBySlug = new Map(
    modelEntries.map((entry) => [entry.slug, entry.lastmod])
  );
  const modelRoutes: MetadataRoute.Sitemap = MODEL_FAMILIES.flatMap((family) =>
    localizedEntries(
      `/models/${family.slug}`,
      "daily",
      0.75,
      toLastModified(modelLastmodBySlug.get(family.slug) ?? null)
    )
  );

  const allRoutes: MetadataRoute.Sitemap = [
    ...staticRoutes,
    ...caseRoutes,
    ...creatorRoutes,
    ...skillRoutes,
    ...modelRoutes,
  ];

  if (allRoutes.length > SITEMAP_URL_WARN_THRESHOLD) {
    // sitemaps.org 协议单文件硬上限是 50000 条 URL / 50MB。到这个量级要拆成
    // sitemap index：用 `generateSitemaps` 按 id 分片输出多个 `/sitemap/[id].xml`，
    // 而不是继续往这一个文件里塞。现在（1662 条量级）还早，这里只负责喊一声。
    console.warn(
      `[sitemap] URL 数量 ${allRoutes.length} 已超过预警阈值 ${SITEMAP_URL_WARN_THRESHOLD}，` +
        "接近 sitemaps.org 单文件 50000 条上限，该规划拆分 sitemap index 了。"
    );
  }

  return allRoutes;
}
