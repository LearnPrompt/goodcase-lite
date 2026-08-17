import { LocalizedLink as Link } from "@/components/localized-link";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import type { ModelStripItem } from "@/lib/models";

/**
 * 首页的「按模型浏览」提醒条。
 * 刻意做成单行、可横向滚动的窄条，不占首页主视觉；新模型上线时靠 NEW 标记提示。
 */
export function ModelStrip({
  items,
  locale,
}: {
  items: ModelStripItem[];
  locale: Locale;
}) {
  if (items.length === 0) {
    return null;
  }

  const messages = getMessages(locale);

  return (
    <section className="border-b border-[var(--hair)] py-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-baseline gap-3">
          <p className="gc-eyebrow whitespace-nowrap">
            {messages.model.browseTitle}
          </p>
          <p className="hidden truncate text-[11px] leading-5 text-[var(--muted)] sm:block">
            {messages.model.browseHint}
          </p>
        </div>

        <div className="-mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1">
          {items.map(({ family, label, count }) => (
            <Link
              key={family.slug}
              href={`/models/${family.slug}`}
              className="group flex shrink-0 items-center gap-2 border border-[var(--hair)] bg-white px-3 py-2 transition hover:bg-[var(--ink)] hover:text-[var(--paper)]"
            >
              <span className="text-sm font-semibold leading-none">{label}</span>
              {family.badge ? (
                <span className="border border-[var(--orange)] px-1 font-mono text-[9px] uppercase leading-4 tracking-[0.08em] text-[var(--orange)] group-hover:border-[var(--orange-on-dark)] group-hover:text-[var(--orange-on-dark)]">
                  {family.badge === "new"
                    ? messages.model.badgeNew
                    : messages.model.badgeHot}
                </span>
              ) : null}
              <span className="font-mono text-[10px] leading-none text-[var(--muted)] group-hover:text-[var(--paper)]">
                {count}
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/models"
          className="gc-action whitespace-nowrap"
        >
          {messages.model.viewAll} →
        </Link>
      </div>
    </section>
  );
}
