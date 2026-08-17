import { type NextRequest, NextResponse } from "next/server";
import {
  isLocaleRoutablePath,
  LOCALE_REQUEST_HEADER,
  localizeHref,
  splitLocalePathname,
} from "@/i18n/config";

const PRIMARY_ORIGIN = "https://goodcase.ai";
const LEGACY_HOST = "goodcase.ai";
const WWW_HOST = "www.goodcase.ai";
const INTERNAL_LOCALE_REWRITE_HEADER = "x-goodcase-internal-locale-rewrite";

function getCanonicalOrigin() {
  const raw = process.env.GOODCASE_CANONICAL_ORIGIN;
  if (!raw) {
    return null;
  }

  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const enabled = process.env.GOODCASE_ENABLE_LEGACY_REDIRECT === "true";
  const canonicalOrigin = getCanonicalOrigin();
  const requestHost = request.headers.get("host")?.split(":")[0]?.toLowerCase();

  if (requestHost === WWW_HOST) {
    const destination = new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      enabled && canonicalOrigin ? canonicalOrigin : PRIMARY_ORIGIN
    );
    return NextResponse.redirect(destination, 301);
  }

  if (enabled && canonicalOrigin && requestHost === LEGACY_HOST) {
    const destination = new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      canonicalOrigin
    );
    return NextResponse.redirect(destination, 301);
  }

  const localePath = splitLocalePathname(request.nextUrl.pathname);

  if (localePath.pathname === "/project-intro") {
    return NextResponse.redirect(
      new URL(localizeHref(localePath.locale, "/connect#about"), request.url),
      301
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_REQUEST_HEADER, localePath.locale);

  const isInternalLocaleRewrite =
    request.headers.get(INTERNAL_LOCALE_REWRITE_HEADER) === "1";

  if (
    localePath.hasLocalePrefix &&
    localePath.locale === "zh-CN" &&
    !isInternalLocaleRewrite
  ) {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.pathname = localePath.pathname;
    return NextResponse.redirect(canonicalUrl, 308);
  }

  if (localePath.hasLocalePrefix) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (isLocaleRoutablePath(localePath.pathname)) {
    requestHeaders.set(INTERNAL_LOCALE_REWRITE_HEADER, "1");
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname =
      localePath.pathname === "/"
        ? "/zh-CN"
        : `/zh-CN${localePath.pathname}`;
    return NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: "/:path*",
};
