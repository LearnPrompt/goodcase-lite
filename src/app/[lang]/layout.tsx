import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { AnalyticsBeacon } from "@/components/analytics-beacon";
import { CaseReveal } from "@/components/case-reveal";
import { JsonLd } from "@/components/json-ld";
import { LocaleProvider } from "@/i18n/client";
import { isLocale, localizeHref, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { localeAlternates } from "@/lib/seo/alternates";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/lib/seo/structured-data";
import { SITE_ORIGIN } from "@/lib/site";

/**
 * 站长验证标签全部从环境变量读取，未设置的一律不输出对应 meta 标签——
 * 不能输出 `content` 为空字符串/undefined 的标签，那等于给验证服务一个
 * 空口令，比不写这个标签更容易造成困惑。
 */
function buildVerificationMetadata(): Metadata["verification"] {
  const other: Record<string, string> = {};
  if (process.env.BING_SITE_VERIFICATION) {
    other["msvalidate.01"] = process.env.BING_SITE_VERIFICATION;
  }
  if (process.env.BAIDU_SITE_VERIFICATION) {
    other["baidu-site-verification"] = process.env.BAIDU_SITE_VERIFICATION;
  }
  if (process.env.SM_SITE_VERIFICATION) {
    other["shenma-site-verification"] = process.env.SM_SITE_VERIFICATION;
  }
  if (process.env.BYTEDANCE_SITE_VERIFICATION) {
    other["bytedance-verification-code"] =
      process.env.BYTEDANCE_SITE_VERIFICATION;
  }
  if (process.env.SOGOU_SITE_VERIFICATION) {
    other["sogou_site_verification"] = process.env.SOGOU_SITE_VERIFICATION;
  }

  const verification: Metadata["verification"] = {};
  if (process.env.GOOGLE_SITE_VERIFICATION) {
    verification.google = process.env.GOOGLE_SITE_VERIFICATION;
  }
  if (Object.keys(other).length > 0) {
    verification.other = other;
  }

  return Object.keys(verification).length > 0 ? verification : undefined;
}

type LocaleParams = Promise<{ lang: string }>;

async function localeFromParams(params: LocaleParams): Promise<Locale> {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }
  return lang;
}

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await localeFromParams(params);
  const messages = getMessages(locale);
  const canonical = localizeHref(locale, "/");

  return {
    metadataBase: new URL(SITE_ORIGIN),
    // video.twimg.com 对非 twitter/x 域的 Referer 一律 403，而 <video> 标签
    // 没有 per-element 的 referrerPolicy 可设，只能在文档级把跨域请求的
    // Referer 关掉。same-origin 档保住站内请求的完整 referer，不影响统计。
    referrer: "same-origin",
    title: {
      default: "GoodCase.ai",
      template: "%s | GoodCase.ai",
    },
    description: messages.site.description,
    alternates: localeAlternates(locale, "/", { rss: true }),
    verification: buildVerificationMetadata(),
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : "zh_CN",
      alternateLocale: locale === "en" ? ["zh_CN"] : ["en_US"],
      siteName: "GoodCase.ai",
      url: canonical,
      title: "GoodCase.ai",
      description: messages.site.description,
    },
    twitter: {
      card: "summary_large_image",
      title: "GoodCase.ai",
      description: messages.site.description,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: LocaleParams;
}>) {
  const locale = await localeFromParams(params);
  const messages = getMessages(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body suppressHydrationWarning className="min-h-full">
        {/*
          案例媒体当前散在三个第三方域名（推特图床、推特视频、YouMind CMS），
          首图前先付一次 DNS+TLS 握手。preconnect 把握手提前到 HTML 解析阶段。
          React 会把这些 link 提升进 head；R2 迁移收敛媒体域名后要跟着删。
          图片开了 /_next/image 优化后走同源，但 <video> 的 poster/src 仍然直连，
          这三条对视频区依旧生效。
        */}
        <link rel="preconnect" href="https://pbs.twimg.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://video.twimg.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cms-assets.youmind.com" crossOrigin="anonymous" />
        <JsonLd
          data={[
            buildWebSiteSchema(locale, messages.site.description),
            buildOrganizationSchema(),
          ]}
        />
        <LocaleProvider locale={locale}>
          <AnalyticsBeacon />
          <CaseReveal />
          {children}
        </LocaleProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
