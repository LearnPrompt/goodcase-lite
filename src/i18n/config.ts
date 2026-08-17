export const SUPPORTED_LOCALES = ["zh-CN", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "zh-CN";
export const LOCALE_REQUEST_HEADER = "x-goodcase-locale";
export const LOCALE_COOKIE = "goodcase_locale";

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === "en" ? "en" : DEFAULT_LOCALE;
}

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function splitLocalePathname(pathname: string): {
  locale: Locale;
  pathname: string;
  hasLocalePrefix: boolean;
} {
  if (pathname === "/en") {
    return { locale: "en", pathname: "/", hasLocalePrefix: true };
  }

  if (pathname.startsWith("/en/")) {
    return {
      locale: "en",
      pathname: pathname.slice(3) || "/",
      hasLocalePrefix: true,
    };
  }

  if (pathname === "/zh-CN") {
    return { locale: "zh-CN", pathname: "/", hasLocalePrefix: true };
  }

  if (pathname.startsWith("/zh-CN/")) {
    return {
      locale: "zh-CN",
      pathname: pathname.slice(6) || "/",
      hasLocalePrefix: true,
    };
  }

  return {
    locale: DEFAULT_LOCALE,
    pathname: pathname || "/",
    hasLocalePrefix: false,
  };
}

function isExternalHref(href: string) {
  return (
    /^[a-z][a-z\d+\-.]*:/i.test(href) ||
    href.startsWith("//") ||
    href.startsWith("#")
  );
}

export function localizeHref(locale: Locale, href: string) {
  if (!href || isExternalHref(href)) {
    return href;
  }

  const url = new URL(href, "https://goodcase.local");
  const { pathname } = splitLocalePathname(url.pathname);
  const localizedPathname =
    locale === "en"
      ? pathname === "/"
        ? "/en"
        : `/en${pathname}`
      : pathname;

  return `${localizedPathname}${url.search}${url.hash}`;
}

/**
 * 带扩展名的路径默认被当成静态资源、不做语种改写，但 RSS 和 llms.txt 是
 * [lang] 段下的真实路由，必须逐条放行，否则不带 /en 前缀的那个地址会 404。
 */
const LOCALE_ROUTABLE_FILE_PATHS = [
  "/feed.xml",
  "/daily/feed.xml",
  "/llms.txt",
  "/llms-full.txt",
];

export function isLocaleRoutablePath(pathname: string) {
  if (LOCALE_ROUTABLE_FILE_PATHS.includes(pathname)) {
    return true;
  }

  return !(
    pathname.startsWith("/api/") ||
    pathname === "/api" ||
    pathname.startsWith("/auth/") ||
    pathname === "/auth" ||
    pathname.startsWith("/_next/") ||
    pathname === "/_next" ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg" ||
    pathname === "/apple-icon.png" ||
    /\.[a-z\d]{2,8}$/i.test(pathname)
  );
}
