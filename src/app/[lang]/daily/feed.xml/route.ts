import {
  localizeHref,
  normalizeLocale,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getPresentableCaseSummary } from "@/lib/case-presentation";
import { getCaseListData, type DisplayCaseItem } from "@/lib/cases";
import {
  DAILY_DIGEST_FEED_ISSUES,
  DAILY_DIGEST_OFFSET_MINUTES,
  getDigestDateKey,
  listRecentIssueDates,
  selectDailyDigest,
  type DailyDigestPick,
} from "@/lib/daily-digest";
import { getRetestRecords } from "@/lib/retest-source";
import { SITE_ORIGIN } from "@/lib/site";

// 和 /daily 页面同一套理由：内容是天级的，但回源节流按小时给，
// 免得北京时间跨日之后 feed 里最新一期还停在昨天。
export const revalidate = 3_600;

// 和页面一样，[lang] 是动态段，不枚举的话上面的 revalidate 不生效，
// 每次订阅器拉取都会打一次 Supabase。
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** 某一期的发布时刻取当天北京时间 08:00，读者按天订阅时序不会乱。 */
function issuePubDate(dateKey: string) {
  const midnightUtc = Date.parse(`${dateKey}T00:00:00.000Z`);
  if (!Number.isFinite(midnightUtc)) {
    return null;
  }

  return new Date(
    midnightUtc - DAILY_DIGEST_OFFSET_MINUTES * 60_000 + 8 * 3_600_000
  ).toUTCString();
}

function describePick(
  pick: DailyDigestPick<DisplayCaseItem>,
  label: string,
  locale: Locale
) {
  const item = pick.item;
  const summary = getPresentableCaseSummary(
    item.summary,
    item.promptContributionNotes
  );
  const link = `${SITE_ORIGIN}${localizeHref(locale, `/cases/${item.slug}`)}`;
  const promptLine = `${locale === "en" ? "Prompt preview" : "Prompt 预览"}：${
    item.promptPreview
  }`;

  // 只放摘要与 Prompt 预览，绝不输出 promptFull，和 /feed.xml 保持同一个暴露面。
  return [
    `【${label}】${item.title}`,
    `${locale === "en" ? "Creator" : "创作者"}：${item.creator} · ${item.source}`,
    summary,
    promptLine,
    `${locale === "en" ? "Read it" : "站内链接"}：${link}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const locale = normalizeLocale((await params).lang);
  const messages = getMessages(locale);
  const cases = await getCaseListData("all", locale);
  const retestRecords = await getRetestRecords();

  const today = getDigestDateKey(new Date()) ?? "";
  // 选择完全由日期决定，所以历史期数可以直接重算出来，不需要另存一张期刊表。
  //
  // 复测数据没有历史快照——manifest / case_retests 只留着「现在」这一份复测证据，
  // 拿它去回放两周前那期，等于假装那条案例在两周前就测过，是编的。所以只有
  // 今天这一期传 retestRecords，历史期一律不传，自动落回旧的「今日复习」逻辑。
  const issues = listRecentIssueDates(today, DAILY_DIGEST_FEED_ISSUES).map(
    (dateKey) =>
      selectDailyDigest(
        cases,
        dateKey,
        dateKey === today ? { retestRecords } : undefined
      )
  );

  const itemsXml = issues
    .map((digest) => {
      const issueLabel = messages.daily.issue.replace(
        "{issue}",
        String(digest.issueNumber)
      );
      const issueTitle =
        locale === "en"
          ? `${messages.daily.eyebrow} · ${issueLabel} (${digest.dateKey})`
          : `${messages.daily.eyebrow} · ${issueLabel}（${digest.dateKey}）`;
      const link = `${SITE_ORIGIN}${localizeHref(locale, "/daily")}`;
      // 每期一个稳定的 guid：同一期重算多少次都是这一条，不会在阅读器里重复冒泡。
      const guid = `${SITE_ORIGIN}${localizeHref(
        locale,
        "/daily"
      )}#${digest.dateKey}`;
      const reviewLabel =
        digest.review?.slot === "retest"
          ? messages.daily.retestLabel
          : messages.daily.reviewLabel;
      const blocks = [
        digest.fresh
          ? describePick(digest.fresh, messages.daily.freshLabel, locale)
          : null,
        digest.review ? describePick(digest.review, reviewLabel, locale) : null,
      ].filter((block): block is string => Boolean(block));

      if (blocks.length === 0) {
        return null;
      }

      const pubDate = issuePubDate(digest.dateKey);

      return [
        "    <item>",
        `      <title>${escapeXml(issueTitle)}</title>`,
        `      <description>${escapeXml(blocks.join("\n\n"))}</description>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="false">${escapeXml(guid)}</guid>`,
        pubDate ? `      <pubDate>${escapeXml(pubDate)}</pubDate>` : null,
        "    </item>",
      ]
        .filter((line): line is string => line !== null)
        .join("\n");
    })
    .filter((entry): entry is string => entry !== null)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(messages.daily.feedTitle)}</title>
    <link>${SITE_ORIGIN}${localizeHref(locale, "/daily")}</link>
    <description>${escapeXml(messages.daily.feedDescription)}</description>
    <language>${locale === "en" ? "en" : "zh-cn"}</language>
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
