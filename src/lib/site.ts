const DEFAULT_SITE_ORIGIN = "https://goodcase.ai";

function normalizeOrigin(value: string | undefined) {
  if (!value) {
    return DEFAULT_SITE_ORIGIN;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return DEFAULT_SITE_ORIGIN;
    }
    return url.origin;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}

export const SITE_ORIGIN = normalizeOrigin(
  process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
);

export const SITE_HOST = new URL(SITE_ORIGIN).host;

export function absoluteUrl(pathname: string) {
  return new URL(pathname, `${SITE_ORIGIN}/`).toString();
}
