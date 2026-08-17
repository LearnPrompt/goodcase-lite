import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DailyDigestView } from "@/components/daily-digest-view";
import { JsonLd } from "@/components/json-ld";
import { socialMetadata } from "@/lib/social-metadata";
import { localizeHref, SUPPORTED_LOCALES } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getLocaleFromParams } from "@/i18n/server";
import { getDailyDigestPageData } from "@/lib/daily-digest-page";
import { localeAlternates } from "@/lib/seo/alternates";
import { buildCollectionListSchema } from "@/lib/seo/structured-data";
import { absoluteUrl } from "@/lib/site";

/**
 * 早报内容按天变，但 ISR 的 revalidate 是「从生成那一刻起算多久过期」，
 * 不是「对齐到某个自然日边界」。写 86400 的话，页面在北京时间午夜之后
 * 最长可能还挂着昨天那一期整整一天，正好把这个页面唯一的卖点搞砸。
 * 所以内容是天级的，回源节流按小时给：过期最多滞后一小时。
 */
export const revalidate = 3_600;

// [lang] 是动态段，不加 generateStaticParams 的话上面的 revalidate 完全不起作用——
// 每次请求都会打 Supabase。只有两种语言，直接枚举。
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = await getLocaleFromParams(params);
  const messages = getMessages(locale);
  const title = `${messages.daily.eyebrow} · ${messages.daily.title}`;
  const description = messages.daily.description;

  return {
    title,
    description,
    ...socialMetadata({ locale, title, description, path: "/daily" }),
    alternates: localeAlternates(locale, "/daily", { rss: "/daily/feed.xml" }),
  };
}

export default async function DailyDigestPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = await getLocaleFromParams(params);
  const messages = getMessages(locale);
  // 不传日期就是「最新一期」，/daily 因此永远等于今天那一期。
  const data = await getDailyDigestPageData(locale);
  if (!data) {
    notFound();
  }

  const collectionSchema = buildCollectionListSchema({
    locale,
    path: "/daily",
    name: `${messages.daily.eyebrow} · ${messages.daily.title}`,
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
