"use client";

import { LocalizedLink as Link } from "@/components/localized-link";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/i18n/client";

/**
 * 这个 404 边界必须保持静态，所以语言从路径判断，不能读请求头。
 *
 * 之前它用 getLocale() 读 headers()：not-found 属于案例详情页所在路由段的
 * 静态外壳，外壳里只要有人读请求头，整条路由就没法按需静态生成，
 * 结果是每个案例详情页都 500，而不是该 404 的地方 404。
 * 语言本来就写在路径里，客户端取即可。
 */
export default function NotFound() {
  const locale = useLocale();
  const isEnglish = locale === "en";
  return (
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
          <Link
            href="/"
            className="gc-action gc-action-primary"
          >
            {isEnglish ? "Back to home" : "返回首页"}
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
