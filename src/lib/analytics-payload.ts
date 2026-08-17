export const ANALYTICS_EVENT_NAMES = [
  "page_view",
  "case_open",
  "case_search",
  "skill_search",
  "creator_search",
  "case_share",
  "outbound_learnprompt",
  "case_submit",
  "app_error",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

const EVENT_NAME_SET = new Set<string>(ANALYTICS_EVENT_NAMES);
const PROPERTY_ALLOWLIST: Record<AnalyticsEventName, ReadonlySet<string>> = {
  page_view: new Set(["locale"]),
  case_open: new Set(["caseSlug", "locale"]),
  case_search: new Set(["hasQuery", "queryLength", "filter", "locale"]),
  skill_search: new Set(["hasQuery", "queryLength", "filter", "locale"]),
  creator_search: new Set(["hasQuery", "queryLength", "locale"]),
  case_share: new Set(["caseSlug", "locale"]),
  outbound_learnprompt: new Set(["target", "locale"]),
  case_submit: new Set(["category", "locale"]),
  app_error: new Set(["digest", "locale"]),
};

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function isAnalyticsEventName(value: unknown): value is AnalyticsEventName {
  return typeof value === "string" && EVENT_NAME_SET.has(value);
}

export function cleanAnalyticsPath(value: unknown) {
  const raw = cleanString(value, 2_000);
  if (!raw || !raw.startsWith("/")) {
    return "/";
  }

  try {
    return new URL(raw, "https://goodcase.invalid").pathname.slice(0, 500) || "/";
  } catch {
    return "/";
  }
}

export function cleanAnalyticsReferrer(value: unknown) {
  const raw = cleanString(value, 2_000);
  if (!raw) {
    return null;
  }

  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.origin.slice(0, 500);
  } catch {
    return null;
  }
}

function cleanSessionId(value: unknown) {
  const sessionId = cleanString(value, 100);
  return /^[a-zA-Z0-9-]{8,100}$/.test(sessionId) ? sessionId : "ephemeral";
}

function cleanTarget(value: unknown) {
  const raw = cleanString(value, 500);
  if (!raw) {
    return "";
  }

  try {
    const url = new URL(raw, "https://goodcase.invalid");
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }
    return url.origin === "https://goodcase.invalid"
      ? url.pathname.slice(0, 160)
      : `${url.origin}${url.pathname}`.slice(0, 160);
  } catch {
    return "";
  }
}

export function cleanAnalyticsProperties(
  eventName: AnalyticsEventName,
  value: unknown
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const allowed = PROPERTY_ALLOWLIST[eventName];
  const result: Record<string, string | number | boolean | null> = {};

  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!allowed.has(key)) {
      continue;
    }

    if (key === "queryLength" && typeof raw === "number" && Number.isFinite(raw)) {
      result[key] = Math.max(0, Math.min(500, Math.round(raw)));
      continue;
    }
    if (key === "hasQuery" && typeof raw === "boolean") {
      result[key] = raw;
      continue;
    }
    if (key === "target") {
      const target = cleanTarget(raw);
      if (target) {
        result[key] = target;
      }
      continue;
    }
    if (typeof raw === "string") {
      const text = cleanString(raw, 100);
      if (text) {
        result[key] = text;
      }
    }
  }

  return result;
}

export function buildAnalyticsInsert(raw: Record<string, unknown>) {
  if (!isAnalyticsEventName(raw.eventName)) {
    return null;
  }

  return {
    event_name: raw.eventName,
    path: cleanAnalyticsPath(raw.path),
    referrer: cleanAnalyticsReferrer(raw.referrer),
    anonymous_session_id: cleanSessionId(raw.sessionId),
    properties: cleanAnalyticsProperties(raw.eventName, raw.properties),
  };
}
