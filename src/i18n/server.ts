import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  isLocale,
  LOCALE_REQUEST_HEADER,
  normalizeLocale,
  type Locale,
} from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export async function getLocale(): Promise<Locale> {
  const requestHeaders = await headers();
  return normalizeLocale(requestHeaders.get(LOCALE_REQUEST_HEADER));
}

export async function getServerMessages() {
  return getMessages(await getLocale());
}

export async function getLocaleFromParams(
  params: Promise<{ lang: string }>
): Promise<Locale> {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }
  return lang;
}
