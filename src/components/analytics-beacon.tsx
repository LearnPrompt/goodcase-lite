"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent("page_view");
  }, [pathname]);

  return null;
}
