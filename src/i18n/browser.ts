"use client";

import { LOCALE_COOKIE, type Locale } from "@/i18n/config";

export function persistLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
