import type { AnalyticsEventName } from "@/lib/analytics-payload";
// 会话 ID 的生成端已经提到 anonymous-session.ts，埋点和反应共用同一个 ID。
import { getAnonymousSessionId } from "@/lib/anonymous-session";

export type { AnalyticsEventName } from "@/lib/analytics-payload";

type EventProperties = Record<string, string | number | boolean | null>;

export function trackEvent(
  eventName: AnalyticsEventName,
  properties: EventProperties = {}
) {
  if (typeof window === "undefined") {
    return;
  }

  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      path: window.location.pathname,
      referrer: document.referrer,
      sessionId: getAnonymousSessionId(),
      properties: {
        ...properties,
        locale: window.location.pathname === "/en" ||
          window.location.pathname.startsWith("/en/")
          ? "en"
          : "zh-CN",
      },
    }),
    keepalive: true,
  }).catch(() => {
    // 统计失败不能阻塞浏览、分享或投稿。
  });
}
