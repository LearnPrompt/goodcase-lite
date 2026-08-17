"use client";

import Image from "next/image";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LocalizedLink as Link } from "@/components/localized-link";
import { useLocale, useMessages } from "@/i18n/client";
import { localizeHref } from "@/i18n/config";
import { HOME_RANKINGS_HREF } from "@/lib/home-anchors";

/** 导航项样式。锚点项和普通项共用同一个字符串，两种形态不可能长得不一样。 */
const NAV_ITEM_CLASS =
  "inline-flex min-h-11 shrink-0 grow-0 basis-auto items-center border-r border-[var(--hair)] px-3 text-[var(--ink)] transition last:border-r-0 hover:bg-[var(--ink)] hover:text-[var(--paper)]";

export function SiteHeader() {
  const locale = useLocale();
  const messages = useMessages();
  // 顺序即优先级：排行榜是站点最硬的那块内容，放第一位；早报是每天两条的
  // 增量视图，放最后。桌面和移动端共用这一份数组——导航只有一处 DOM，
  // 靠 flex-wrap + overflow-x 适配窄屏，所以不存在「两端要各改一遍」。
  const navItems = [
    { href: HOME_RANKINGS_HREF, label: messages.nav.rankings, anchor: true },
    { href: "/cases", label: messages.nav.cases },
    { href: "/skills", label: messages.nav.skills },
    { href: "/creators", label: messages.nav.creators },
    { href: "/favorites", label: messages.nav.favorites },
    { href: "/submit", label: messages.nav.submit },
    { href: "/daily", label: messages.nav.daily },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--hair)] bg-[rgba(250,250,247,0.94)] backdrop-blur-xl">
      <div className="mx-auto flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-3 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center border border-[var(--hair)] bg-white text-[var(--ink)]">
            <Image src="/goodcase-mark.svg" alt="GoodCase.ai" width={18} height={18} className="size-[18px]" priority />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold tracking-[-0.01em] text-[var(--ink)]">GoodCase.ai</span>
            <span className="hidden font-mono text-[15px] uppercase tracking-[0.14em] text-[var(--ink)] sm:block">
              {messages.site.tagline}
            </span>
          </span>
        </Link>

        <nav
          aria-label={messages.nav.ariaLabel}
          className="order-3 flex w-full max-w-full overflow-x-auto border border-[var(--hair)] bg-white font-mono text-xs uppercase tracking-[0.08em] sm:w-auto md:order-none md:flex-nowrap md:overflow-visible"
        >
          {navItems.map((item) =>
            item.anchor ? (
              /*
                锚点入口必须走原生 <a>，不能用 next/link。

                实测（next 16.2.12，production build）：人已经在首页时点
                <Link href="/#rankings">，App Router 把它当同路由导航，地址栏
                变成 /#rankings，页面一动不动——点了像没反应，正是这个入口最
                常被点的场景。原生同文档 fragment 导航由浏览器处理落点，同页
                直接滚，跨页整页加载后也会自己滚到位。
              */
              <a
                key={item.href}
                href={localizeHref(locale, item.href)}
                className={NAV_ITEM_CLASS}
              >
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className={NAV_ITEM_CLASS}>
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="order-2 flex items-center gap-2 md:order-none">
          <LanguageSwitcher />
          <Link
            href="/connect"
            className="inline-flex min-h-11 shrink-0 items-center border border-[var(--orange)] bg-[var(--orange)] px-3 text-xs font-semibold text-white transition hover:border-[var(--ink)] hover:bg-[var(--ink)]"
          >
            {messages.nav.connect} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
