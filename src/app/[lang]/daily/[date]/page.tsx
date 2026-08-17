import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DailyDigestView } from "@/components/daily-digest-view";
import { JsonLd } from "@/components/json-ld";
import { localizeHref, SUPPORTED_LOCALES } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getLocaleFromParams } from "@/i18n/server";
import {
  getDailyDigestPageData,
  listArchiveDateKeys,
} from "@/lib/daily-digest-page";
import { socialMetadata } from "@/lib/social-metadata";
import { localeAlternates } from "@/lib/seo/alternates";
import { buildCollectionListSchema } from "@/lib/seo/structured-data";
import { absoluteUrl } from "@/lib/site";

// 和 /daily 同一个理由：内容是天级的，回源节流按小时给。旧期数的两条案例
// 其实不会再变，但热度和稳定分会，所以不单独放宽这个间隔。
export const revalidate = 3_600;

/*
  dynamicParams 保持默认（开）。

  同级的 cases/[slug] 特意关掉了它，为的是让不存在的 slug 拿到硬 404；这里
  不能照抄：预渲染只覆盖构建时刻的归档窗口，而窗口每天往前挪一天。关掉之后
  只要两天没部署，/daily 上「前一天」指过去的那一期就会 404——一个每天都要
  自己走一格的路由，天然不适合把可达集合钉死在构建时刻。

  代价是窗口外的日期会先进渲染再 notFound()，拿到的是软 404。这些 URL 站内
  没有任何入口，只有手敲才会遇到，用一个每天都可能断的翻页去换它不值。
*/

export async function generateStaticParams() {
  const dates = await listArchiveDateKeys();
  return SUPPORTED_LOCALES.flatMap((lang) =>
    dates.map((date) => ({ lang, date }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  const locale = await getLocaleFromParams(params);
  const messages = getMessages(locale);
  const data = await getDailyDigestPageData(locale, date);

  if (!data) {
    // 这一路走下去是 notFound()，但状态码已经按 200 发出去了（见文件顶部
    // 那段注释）。状态码救不回来，至少挂一条 noindex，别让一个空壳日期页
    // 被当成薄内容收录。
    return {
      title: messages.daily.eyebrow,
      robots: { index: false, follow: false },
    };
  }

  const issueLabel = messages.daily.issue.replace(
    "{issue}",
    String(data.digest.issueNumber)
  );
  const title =
    locale === "en"
      ? `${messages.daily.eyebrow} · ${issueLabel} (${data.digest.dateKey})`
      : `${messages.daily.eyebrow} · ${issueLabel}（${data.digest.dateKey}）`;
  const description = messages.daily.description;
  // 最新一期在 /daily 和 /daily/{今天} 两个地址都能打开，canonical 统一指
  // /daily，免得同一份内容自己和自己抢收录。
  const path = data.isLatest ? "/daily" : `/daily/${data.digest.dateKey}`;

  return {
    title,
    description,
    ...socialMetadata({ locale, title, description, path }),
    alternates: localeAlternates(locale, path, { rss: "/daily/feed.xml" }),
  };
}

export default async function DailyDigestArchivePage({
  params,
}: {
  params: Promise<{ lang: string; date: string }>;
}) {
  const { date } = await params;
  const locale = await getLocaleFromParams(params);
  const messages = getMessages(locale);
  // 日期不合法、早于归档窗口、或者干脆是未来某天，一律 404。
  // 早报可以按日期重算，但不能凭空多出一期。
  const data = await getDailyDigestPageData(locale, date);
  if (!data) {
    notFound();
  }

  // 与 generateMetadata 同一条语义：最新一期在 /daily 和 /daily/{今天} 两个
  // 地址都能打开，collection schema 的 url 统一指 /daily，不给同一份内容
  // 生成两份互相矛盾的结构化数据。
  const path = data.isLatest ? "/daily" : `/daily/${data.digest.dateKey}`;
  const collectionSchema = buildCollectionListSchema({
    locale,
    path,
    name: `${messages.daily.eyebrow} · ${messages.daily.issue.replace("{issue}", String(data.digest.issueNumber))}`,
    items: data.cases.map((item) => ({
      name: item.title,
      url: absoluteUrl(localizeHref(locale, `/cases/${item.slug}`)),
    })),
  });

  return (
    <>
      <JsonLd data={collectionSchema} />
      <DailyDigestView locale={locale} messages={messages} data={data} />
    </>
  );
}
