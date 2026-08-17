"use client";

import { trackEvent, type AnalyticsEventName } from "@/lib/analytics";
import { useLocale, useMessages } from "@/i18n/client";
import { localizeHref } from "@/i18n/config";

type SearchBoxProps = {
  defaultQuery?: string;
  /** 附带提交的隐藏筛选值（如分类），字段名由 hiddenParamName 决定。 */
  filter?: string;
  /** 表单提交目标路径，默认 /cases 以保持既有调用方不变。 */
  action?: string;
  /** 隐藏字段名，/cases 用 filter，/skills 用 category。 */
  hiddenParamName?: string;
  /** 不传则回退到 messages.search 的文案，保持 /cases 页面行为不变。 */
  placeholder?: string;
  ariaLabel?: string;
  /** 不同页面的搜索需要各自的分析事件名，属性结构保持一致。 */
  analyticsEvent?: AnalyticsEventName;
};

export function SearchBox({
  defaultQuery = "",
  filter,
  action = "/cases",
  hiddenParamName = "filter",
  placeholder,
  ariaLabel,
  analyticsEvent = "case_search",
}: SearchBoxProps) {
  const locale = useLocale();
  const messages = useMessages();

  return (
    <form
      action={localizeHref(locale, action)}
      method="get"
      className="flex w-full max-w-2xl gap-2"
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        const query = String(formData.get("q") || "").trim();
        trackEvent(analyticsEvent, {
          hasQuery: query.length > 0,
          queryLength: query.length,
          // creators 页面没有分类概念，不传 filter 时就不上报，避免和 creator_search
          // 的属性白名单（不含 filter）对不上。
          ...(filter !== undefined ? { filter: filter || "all" } : {}),
        });
      }}
    >
      {filter && filter !== "all" ? (
        <input type="hidden" name={hiddenParamName} value={filter} />
      ) : null}
      <input
        type="search"
        name="q"
        defaultValue={defaultQuery}
        placeholder={placeholder ?? messages.search.placeholder}
        aria-label={ariaLabel ?? messages.search.ariaLabel}
        className="min-h-11 w-full border border-[var(--hair)] bg-white px-4 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--orange)] focus:outline-none"
      />
      <button
        type="submit"
        className="gc-action whitespace-nowrap border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
      >
        {messages.search.submit}
      </button>
    </form>
  );
}
