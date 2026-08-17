"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackEvent, type AnalyticsEventName } from "@/lib/analytics";

export function TrackedExternalLink({
  children,
  eventName,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  eventName: AnalyticsEventName;
}) {
  return (
    <a
      {...props}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => {
        props.onClick?.(event);
        trackEvent(eventName, { target: props.href || "" });
      }}
    >
      {children}
    </a>
  );
}
