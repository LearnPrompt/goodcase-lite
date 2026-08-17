import { LocalizedLink as Link } from "@/components/localized-link";
import type { Locale } from "@/i18n/config";

/**
 * 案例列表一页曾经一次性渲染 314 张卡、三百多张图，
 * 既拖首屏也把 Vercel 的图片转换额度打满，所以列表必须分页。
 */
export const CASES_PAGE_SIZE = 24;

function buildPageNumbers(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < total) pages.add(current + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const withGaps: Array<number | "gap"> = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      withGaps.push("gap");
    }
    withGaps.push(page);
  });
  return withGaps;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize = CASES_PAGE_SIZE,
  buildHref,
  locale,
}: {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  buildHref: (page: number) => string;
  locale: Locale;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) {
    return null;
  }

  const isEnglish = locale === "en";
  const first = (currentPage - 1) * pageSize + 1;
  const last = Math.min(currentPage * pageSize, totalItems);
  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label={isEnglish ? "Pagination" : "分页"}
      className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--hair)] py-5"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
        {isEnglish
          ? `${first}–${last} of ${totalItems}`
          : `第 ${first}–${last} 条，共 ${totalItems} 条`}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {currentPage > 1 ? (
          <Link href={buildHref(currentPage - 1)} className="gc-action">
            ← {isEnglish ? "Previous" : "上一页"}
          </Link>
        ) : (
          <span className="gc-action pointer-events-none opacity-40">
            ← {isEnglish ? "Previous" : "上一页"}
          </span>
        )}

        {pages.map((page, index) =>
          page === "gap" ? (
            <span
              key={`gap-${index}`}
              className="px-1 font-mono text-[11px] text-[var(--muted)]"
            >
              …
            </span>
          ) : (
            <Link
              key={page}
              href={buildHref(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`gc-action ${
                page === currentPage
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                  : ""
              }`}
            >
              {page}
            </Link>
          )
        )}

        {currentPage < totalPages ? (
          <Link href={buildHref(currentPage + 1)} className="gc-action">
            {isEnglish ? "Next" : "下一页"} →
          </Link>
        ) : (
          <span className="gc-action pointer-events-none opacity-40">
            {isEnglish ? "Next" : "下一页"} →
          </span>
        )}
      </div>
    </nav>
  );
}
