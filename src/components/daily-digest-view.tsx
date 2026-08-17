import { CaseCard } from "@/components/case-card";
import { FavoriteButton } from "@/components/favorite-button";
import { LikeButton } from "@/components/like-button";
import { LocalizedLink as Link } from "@/components/localized-link";
import { PageHero } from "@/components/page-hero";
import { SiteShell } from "@/components/site-shell";
import { localizeHref, type Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { toCaseCardItem } from "@/lib/case-card-item";
import type { DisplayCaseItem } from "@/lib/cases";
import {
  DAILY_DIGEST_EPOCH,
  groupIssueDatesByMonth,
  type DailyDigestPick,
} from "@/lib/daily-digest";
import type {
  DailyDigestArchiveEntry,
  DailyDigestPageData,
} from "@/lib/daily-digest-page";
import { deriveSkillCatalog, getCaseSkillLinks } from "@/lib/skills";
import { formatStabilityScore, resolveStabilityState } from "@/lib/stability";

function formatIssue(messages: Messages, issueNumber: number) {
  return messages.daily.issue.replace("{issue}", String(issueNumber));
}

const EN_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * 月份标题。dateKey 已经是早报时区下的日期字符串，这里只切片不构造 Date——
 * 过一遍 Date 再交给 Intl，反而要担心时区把 8 月 1 日推回 7 月 31 日。
 */
function formatArchiveMonth(month: string, locale: Locale) {
  const [year, monthPart] = month.split("-");
  const index = Number(monthPart);
  if (!year || !Number.isInteger(index) || index < 1 || index > 12) {
    return month;
  }

  return locale === "en"
    ? `${EN_MONTH_NAMES[index - 1]} ${year}`
    : `${year} 年 ${index} 月`;
}

function SlotHeader({
  index,
  label,
  note,
}: {
  index: string;
  label: string;
  note: string;
}) {
  return (
    <div className="border-b border-[var(--hair)] px-5 py-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.09em] text-[var(--mute)]">
        § {index}
      </div>
      <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[var(--ink)]">
        <span className="mr-2 inline-block size-2 bg-[var(--orange)]" />
        {label}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--mute)]">{note}</p>
    </div>
  );
}

function DigestSlot({
  index,
  label,
  note,
  pick,
  locale,
  messages,
  skillCatalog,
}: {
  index: string;
  label: string;
  note: string;
  pick: DailyDigestPick<DisplayCaseItem> | null;
  locale: Locale;
  messages: Messages;
  skillCatalog: ReturnType<typeof deriveSkillCatalog>;
}) {
  return (
    <article className="border border-[var(--hair)] bg-white">
      <SlotHeader index={index} label={label} note={note} />
      <div className="p-5">
        {pick ? (
          <CaseCard
            item={toCaseCardItem(
              pick.item,
              getCaseSkillLinks(skillCatalog, pick.item.slug)
            )}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <LikeButton
                  caseSlug={pick.item.slug}
                  initialCount={pick.item.likedCount}
                />
                <FavoriteButton caseSlug={pick.item.slug} />
              </div>
            }
          />
        ) : (
          <div className="gc-empty-state">
            <p>{messages.daily.empty}</p>
            <Link className="gc-action mt-4 inline-flex" href="/cases">
              {messages.daily.browseAll} →
            </Link>
          </div>
        )}
      </div>
      {pick ? (
        <div className="grid grid-cols-3 gap-px border-t border-[var(--hair)] bg-[var(--hair)]">
          <div className="bg-white px-5 py-3">
            <div className="gc-stat-label">{messages.common.sourceHeat}</div>
            <div className="mt-1 font-mono text-sm text-[var(--ink)]">
              {pick.item.sourceHeatScore ?? messages.common.notAvailable}
            </div>
          </div>
          <div className="bg-white px-5 py-3">
            <div className="gc-stat-label">{messages.common.stability}</div>
            <div className="mt-1 font-mono text-sm text-[var(--ink)]">
              {/* 0 分要分两种：evidence_level 已经是 L2 的是「复测未通过」，
                  其余才是「还没测过」，见 src/lib/stability.ts。 */}
              {resolveStabilityState(
                pick.item.stabilityScore,
                pick.item.evidenceLevel
              ) === "pending"
                ? messages.common.notAvailable
                : formatStabilityScore(
                    pick.item.stabilityScore,
                    locale,
                    pick.item.evidenceLevel
                  )}
            </div>
          </div>
          <div className="bg-white px-5 py-3">
            <div className="gc-stat-label">
              {locale === "en" ? "Shortlist" : "候选名次"}
            </div>
            <div className="mt-1 font-mono text-sm text-[var(--ink)]">
              {pick.rank} / {pick.poolSize}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

const PAGER_CELL =
  "inline-flex min-h-11 shrink-0 items-center px-4 transition";

/** 「← 前一天 | 日期 | 后一天 →」。到头的那一侧不渲染链接，只留灰掉的文字。 */
function IssuePager({
  dateKey,
  isLatest,
  neighbors,
  messages,
}: {
  dateKey: string;
  isLatest: boolean;
  neighbors: { prev: string | null; next: string | null };
  messages: Messages;
}) {
  return (
    <nav
      aria-label={messages.daily.issueNavLabel}
      className="mb-6 flex items-stretch border border-[var(--hair)] bg-white font-mono text-[10px] uppercase tracking-[0.08em]"
    >
      {neighbors.prev ? (
        <Link
          href={`/daily/${neighbors.prev}`}
          rel="prev"
          className={`${PAGER_CELL} text-[var(--muted)] hover:bg-[var(--ink)] hover:text-[var(--paper)]`}
        >
          <span aria-hidden className="mr-2">
            ←
          </span>
          {messages.daily.prevIssue}
        </Link>
      ) : (
        <span className={`${PAGER_CELL} text-[var(--hair)]`}>
          <span aria-hidden className="mr-2">
            ←
          </span>
          {messages.daily.prevIssue}
        </span>
      )}

      <span className="flex min-h-11 flex-1 items-center justify-center gap-2 border-x border-[var(--hair)] px-3 text-center text-[var(--ink)]">
        <span className="font-mono">{dateKey}</span>
        {isLatest ? (
          <span className="bg-[var(--orange)] px-1.5 py-0.5 text-[9px] text-white">
            {messages.daily.latestTag}
          </span>
        ) : null}
      </span>

      {neighbors.next ? (
        <Link
          href={`/daily/${neighbors.next}`}
          rel="next"
          className={`${PAGER_CELL} text-[var(--muted)] hover:bg-[var(--ink)] hover:text-[var(--paper)]`}
        >
          {messages.daily.nextIssue}
          <span aria-hidden className="ml-2">
            →
          </span>
        </Link>
      ) : (
        <span className={`${PAGER_CELL} text-[var(--hair)]`}>
          {messages.daily.nextIssue}
          <span aria-hidden className="ml-2">
            →
          </span>
        </span>
      )}
    </nav>
  );
}

/**
 * 往期归档：按自然月分组，每天一行（日期 + 当期头条）。
 *
 * 月分组用原生 <details>，默认全部展开：站点开张才几个月，一上来就折起来
 * 等于把仅有的几行藏掉；结构先立在这里，期数堆多了自然读得出层级。
 */
function IssueArchive({
  entries,
  currentDateKey,
  locale,
  messages,
}: {
  entries: DailyDigestArchiveEntry[];
  currentDateKey: string;
  locale: Locale;
  messages: Messages;
}) {
  const groups = groupIssueDatesByMonth(entries.map((entry) => entry.dateKey));
  const byDate = new Map(entries.map((entry) => [entry.dateKey, entry]));

  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-[var(--ink)]">
          <span className="mr-2 inline-block size-2 bg-[var(--orange)]" />
          {messages.daily.archiveTitle}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]">
          {locale === "en" ? "since" : "自"} {DAILY_DIGEST_EPOCH}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="border border-[var(--hair)] bg-white px-5 py-10 text-sm leading-7 text-[var(--mute)]">
          {messages.daily.archiveEmpty}
        </div>
      ) : (
        <nav
          aria-label={messages.daily.archiveNavLabel}
          className="border border-[var(--hair)] bg-white"
        >
          {groups.map((group) => (
            <details key={group.month} open className="border-b border-[var(--hair)] last:border-b-0">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]">
                <span>{formatArchiveMonth(group.month, locale)}</span>
                <span>({group.dates.length})</span>
              </summary>
              <ul className="border-t border-[var(--hair)]">
                {group.dates.map((date) => {
                  const entry = byDate.get(date);
                  if (!entry) {
                    return null;
                  }
                  const isCurrent = date === currentDateKey;

                  return (
                    <li key={date}>
                      <Link
                        href={`/daily/${date}`}
                        aria-current={isCurrent ? "page" : undefined}
                        className={`flex min-h-11 items-center gap-4 border-b border-[var(--hair)] px-5 py-3 transition last:border-b-0 ${
                          isCurrent
                            ? "bg-[var(--ink)] text-[var(--paper)]"
                            : "text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]"
                        }`}
                      >
                        <span className="shrink-0 font-mono text-[11px] tracking-[0.04em]">
                          {date}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {entry.headline ?? formatIssue(messages, entry.issueNumber)}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] opacity-70">
                          {messages.daily.archiveStories.replace(
                            "{count}",
                            String(entry.storyCount)
                          )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}
        </nav>
      )}

      <p className="mt-3 text-xs leading-6 text-[var(--mute)]">
        {messages.daily.archiveNote}
      </p>
    </section>
  );
}

/** /daily 和 /daily/[date] 共用的整页渲染。两条路由只负责取数和 404 判定。 */
export function DailyDigestView({
  locale,
  messages,
  data,
}: {
  locale: Locale;
  messages: Messages;
  data: DailyDigestPageData;
}) {
  const { digest, cases, neighbors, archive, isLatest } = data;
  const skillCatalog = deriveSkillCatalog(cases, locale);
  const issueLabel = formatIssue(messages, digest.issueNumber);
  const isRetestPick = digest.review?.slot === "retest";

  return (
    <SiteShell footerNote={messages.daily.footerNote}>
      <PageHero
        eyebrow={`${messages.daily.eyebrow} · ${issueLabel}`}
        title={messages.daily.title}
        description={messages.daily.description}
      >
        <div>
          <div className="gc-stat-label">
            {locale === "en" ? "Issue" : "期数"}
          </div>
          <div className="gc-stat-value">{digest.issueNumber}</div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            {locale === "en" ? "since" : "自"} {DAILY_DIGEST_EPOCH}
          </div>
        </div>
        <div>
          <div className="gc-stat-label">{locale === "en" ? "Date" : "日期"}</div>
          <div className="gc-stat-value font-mono text-2xl">
            {digest.dateKey}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--muted)]">
            UTC+8
          </div>
        </div>
      </PageHero>

      <IssuePager
        dateKey={digest.dateKey}
        isLatest={isLatest}
        neighbors={neighbors}
        messages={messages}
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <a className="gc-btn" href={localizeHref(locale, "/daily/feed.xml")}>
          {messages.daily.subscribe} <span>→</span>
        </a>
        {isLatest ? null : (
          <Link className="gc-btn gc-btn-ghost" href="/daily">
            {messages.daily.latestIssue}
          </Link>
        )}
        <Link className="gc-btn gc-btn-ghost" href="/cases">
          {messages.daily.browseAll}
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <DigestSlot
          index="01"
          label={messages.daily.freshLabel}
          note={
            digest.fresh?.fallback
              ? messages.daily.freshFallbackNote
              : messages.daily.freshNote
          }
          pick={digest.fresh}
          locale={locale}
          messages={messages}
          skillCatalog={skillCatalog}
        />
        <DigestSlot
          index="02"
          label={isRetestPick ? messages.daily.retestLabel : messages.daily.reviewLabel}
          note={isRetestPick ? messages.daily.retestNote : messages.daily.reviewNote}
          pick={digest.review}
          locale={locale}
          messages={messages}
          skillCatalog={skillCatalog}
        />
      </section>

      <IssueArchive
        entries={archive}
        currentDateKey={digest.dateKey}
        locale={locale}
        messages={messages}
      />
    </SiteShell>
  );
}
