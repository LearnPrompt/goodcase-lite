import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "@/i18n/client";
import { getLocale } from "@/i18n/server";
import { SiteShell } from "@/components/site-shell";
import { LocalizedLink as Link } from "@/components/localized-link";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === "en" ? "Page not found · GoodCase.ai" : "页面不存在 · GoodCase.ai",
    description:
      locale === "en"
        ? "This address does not point to a published GoodCase page."
        : "这个地址没有对应已发布的 GoodCase 页面。",
  };
}

export default async function GlobalNotFound() {
  const locale = await getLocale();
  const isEnglish = locale === "en";

  return (
    <html lang={locale} suppressHydrationWarning className="h-full antialiased">
      <body suppressHydrationWarning className="min-h-full">
        <LocaleProvider locale={locale}>
          <SiteShell
            footerNote={
              isEnglish
                ? "This address does not point to a published GoodCase page."
                : "这个地址没有对应已发布的 GoodCase 页面。"
            }
          >
            <section className="gc-empty-state my-8">
              <p className="gc-eyebrow">
                {isEnglish ? "Page not found" : "页面不存在"}
              </p>
              <h1 className="text-5xl font-medium leading-[0.95] tracking-[-0.04em] md:text-7xl">
                {isEnglish
                  ? "This page does not exist, or the address is wrong."
                  : "这个页面不存在，或者路径不对。"}
              </h1>
              <div>
                <Link href="/" className="gc-action gc-action-primary">
                  {isEnglish ? "Back to home" : "返回首页"}
                </Link>
              </div>
            </section>
          </SiteShell>
        </LocaleProvider>
      </body>
    </html>
  );
}
