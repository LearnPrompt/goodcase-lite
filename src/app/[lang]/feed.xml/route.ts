import { getCaseListData } from "@/lib/cases";
import { getPresentableCaseSummary } from "@/lib/case-presentation";
import {
  localizeHref,
  normalizeLocale,
  SUPPORTED_LOCALES,
} from "@/i18n/config";
import { SITE_ORIGIN } from "@/lib/site";

// 内容只在运营发布时变，发布会触发部署重新生成；这里当兜底，一小时一次足够。
// 注意边缘 TTL 不由这个值决定：下面 GET 里显式返回了 s-maxage=300，那份更优先。
// 这个值管的是 ISR 侧多久重跑一次取数。
export const revalidate = 3_600;

// 和 /daily/feed.xml 一样：[lang] 是动态段，不枚举的话上面的 revalidate 一行都不生效，
// 整个路由退回请求时渲染，每次订阅器拉取都要打一次 Supabase，边缘也永远 MISS。
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

const MAX_ITEMS = 50;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toPubDate(createdAt?: string): string | null {
  if (!createdAt) {
    return null;
  }

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toUTCString();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const locale = normalizeLocale((await params).lang);
  const isEnglish = locale === "en";
  const list = await getCaseListData("all", locale);

  const items = [...list]
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, MAX_ITEMS);

  const itemsXml = items
    .map((item) => {
      const link = `${SITE_ORIGIN}${localizeHref(
        locale,
        `/cases/${item.slug}`
      )}`;
      // 只放摘要与 Prompt 预览，绝不输出 promptFull，保持与公开列表 API 一致的暴露面。
      // 摘要过滤套话 + 复用方法兜底；两者都没有（如 real-case-11-servasyy-ai）
      // 时不留一段空行，description 直接从 Prompt 预览开始。
      const summary = getPresentableCaseSummary(
        item.summary,
        item.promptContributionNotes
      );
      const promptPreviewLine = `${
        isEnglish ? "Prompt preview" : "Prompt 预览"
      }：${item.promptPreview}`;
      const description = summary
        ? `${summary}\n\n${promptPreviewLine}`
        : promptPreviewLine;
      const pubDate = toPubDate(item.createdAt);
      const enclosureUrl = `${SITE_ORIGIN}${localizeHref(
        locale,
        `/cases/${item.slug}/opengraph-image`
      )}`;

      return [
        "    <item>",
        `      <title>${escapeXml(item.title)}</title>`,
        `      <description>${escapeXml(description)}</description>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        pubDate ? `      <pubDate>${escapeXml(pubDate)}</pubDate>` : null,
        `      <enclosure url="${escapeXml(enclosureUrl)}" type="image/png" length="0" />`,
        "    </item>",
      ]
        .filter((line): line is string => line !== null)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>GoodCase.ai</title>
    <link>${SITE_ORIGIN}${localizeHref(locale, "/")}</link>
    <description>${escapeXml(
      isEnglish
        ? "A public collection of AI prompt cases with original sources, credited creators, methods, and retest evidence."
        : "AI提示语案例合集：真实出处、创作者署名、方法与复测证据。"
    )}</description>
    <language>${isEnglish ? "en" : "zh-cn"}</language>
${itemsXml}
  </channel>
</rss>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Content-Language": locale,
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
