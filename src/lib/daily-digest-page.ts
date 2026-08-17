import "server-only";

import { cache } from "react";
import type { Locale } from "@/i18n/config";
import { getCaseListData, type DisplayCaseItem } from "@/lib/cases";
import {
  clampIssueRange,
  getDigestDateKey,
  getIssueDateRange,
  getIssueNeighbors,
  isIssueDateInRange,
  isIssueDateKey,
  listIssueDatesInRange,
  selectDailyDigest,
  type DailyDigest,
  type DailyDigestIssueRange,
} from "@/lib/daily-digest";
import { getRetestRecords } from "@/lib/retest-source";

/** 归档列表里的一行：日期 + 那一期头条的标题，够读者判断要不要点进去。 */
export type DailyDigestArchiveEntry = {
  dateKey: string;
  issueNumber: number;
  /** 那一期「今日新案例」的标题；那一档为空时退到复习那条，都没有则 null。 */
  headline: string | null;
  /** 那一期一共排出几条（0 / 1 / 2）。 */
  storyCount: number;
};

export type DailyDigestPageData = {
  digest: DailyDigest<DisplayCaseItem>;
  cases: DisplayCaseItem[];
  /** 收窄到归档窗口之后的可看区间。列表、翻页、404 判定共用这一个。 */
  range: DailyDigestIssueRange | null;
  neighbors: { prev: string | null; next: string | null };
  archive: DailyDigestArchiveEntry[];
  todayDateKey: string;
  /** 请求的是不是最新一期。/daily 永远是 true。 */
  isLatest: boolean;
};

function headlineOf(digest: DailyDigest<DisplayCaseItem>) {
  // 一期两条（新爆款 + 复习），归档行把两个标题都带上：
  // 单标题时相邻日期常常撞头条（选池小），读者没法区分两期。
  const titles = [digest.fresh?.item.title, digest.review?.item.title].filter(
    (title): title is string => Boolean(title)
  );
  return titles.length > 0 ? titles.join(" & ") : null;
}

function storyCountOf(digest: DailyDigest<DisplayCaseItem>) {
  return (digest.fresh ? 1 : 0) + (digest.review ? 1 : 0);
}

/**
 * /daily 与 /daily/[date] 共用的取数入口。
 *
 * requestedDateKey 省略即「最新一期」。给了但不合法、或落在归档窗口之外，
 * 一律返回 null，由路由 notFound()——宁可 404 也不顺手渲染一期不存在的早报。
 *
 * 外面裹一层 React cache：generateMetadata 和页面本体各调一次，同一次渲染里
 * 只查一次 Supabase、只算一遍归档列表。
 */
export const getDailyDigestPageData = cache(async function getDailyDigestPageDataUncached(
  locale: Locale,
  requestedDateKey?: string
): Promise<DailyDigestPageData | null> {
  const cases = await getCaseListData("all", locale);
  const todayDateKey = getDigestDateKey(new Date()) ?? "";
  const range = clampIssueRange(getIssueDateRange(cases, todayDateKey));

  if (requestedDateKey !== undefined) {
    if (!isIssueDateKey(requestedDateKey) || !isIssueDateInRange(requestedDateKey, range)) {
      return null;
    }
  }

  const dateKey = requestedDateKey ?? todayDateKey;
  const isLatest = dateKey === todayDateKey;

  /*
    复测证据只有「现在」这一份快照：case_retests 和 retest-manifest.json 都不留
    历史版本。拿今天的复测记录去回放上周那一期，等于假装那条案例上周就测过，
    是编的。所以只有最新一期传 retestRecords，历史期一律不传，自动落回
    「今日复习」逻辑。这条规则和 /daily/feed.xml 里的完全一致，别只改一边。
  */
  const retestRecords = isLatest ? await getRetestRecords() : [];
  const digest = selectDailyDigest(cases, dateKey, { retestRecords });

  /*
    归档列表要显示每一期的头条，所以窗口内每一天都得真算一遍 digest。
    窗口有上限（DAILY_DIGEST_ARCHIVE_ISSUES），这里的成本才是有界的；
    列表里也只放确实排出了内容的那些天，空期不生成行、也就点不进去。
  */
  const archive: DailyDigestArchiveEntry[] = [];
  for (const entryDate of listIssueDatesInRange(range)) {
    const entryDigest =
      entryDate === dateKey
        ? digest
        : selectDailyDigest(
            cases,
            entryDate,
            entryDate === todayDateKey ? { retestRecords } : undefined
          );
    const storyCount = storyCountOf(entryDigest);
    if (storyCount === 0) {
      continue;
    }
    archive.push({
      dateKey: entryDate,
      issueNumber: entryDigest.issueNumber,
      headline: headlineOf(entryDigest),
      storyCount,
    });
  }

  return {
    digest,
    cases,
    range,
    neighbors: getIssueNeighbors(dateKey, range),
    archive,
    todayDateKey,
    isLatest,
  };
});

/** 预渲染用的日期列表；和归档列表同一个窗口，不会铺出点不进去的页面。 */
export async function listArchiveDateKeys(locale: Locale = "zh-CN") {
  const cases = await getCaseListData("all", locale);
  const range = clampIssueRange(
    getIssueDateRange(cases, getDigestDateKey(new Date()) ?? "")
  );
  return listIssueDatesInRange(range);
}
