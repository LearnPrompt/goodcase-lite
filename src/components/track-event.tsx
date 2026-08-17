"use client";

import { useEffect } from "react";
import { trackEvent, type AnalyticsEventName } from "@/lib/analytics";

export function TrackEvent({
  name,
  properties,
}: {
  name: AnalyticsEventName;
  properties?: Record<string, string | number | boolean | null>;
}) {
  useEffect(() => {
    trackEvent(name, properties);
  }, [name, properties]);

  return null;
}
