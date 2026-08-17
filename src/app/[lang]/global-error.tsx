"use client";

import { useSyncExternalStore } from "react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isEnglish = useSyncExternalStore(
    () => () => undefined,
    () =>
      window.location.pathname === "/en" ||
      window.location.pathname.startsWith("/en/"),
    () => false
  );

  return (
    <html lang={isEnglish ? "en" : "zh-CN"} suppressHydrationWarning>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafaf7",
          color: "#0a0a0a",
          fontFamily:
            '"Avenir Next", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: "720px",
            margin: "24px",
            padding: "40px",
            border: "1px solid #0a0a0a",
            backgroundColor: "#ffffff",
            boxShadow: "8px 8px 0 #c2410c",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "#c2410c",
            }}
          >
            GoodCase.ai
          </p>
          <h1
            style={{
              marginTop: "16px",
              fontSize: "40px",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
            }}
          >
            {isEnglish
              ? "GoodCase encountered a global error."
              : "站点遇到了一个全局错误。"}
          </h1>
          <p style={{ marginTop: "16px", color: "#6b6b66", lineHeight: 1.8 }}>
            {isEnglish
              ? "Try again below. If the problem continues, return later."
              : "请点击下方按钮重试，如果问题持续，请稍后再访问。"}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "24px",
              minHeight: "44px",
              padding: "0 24px",
              border: "1px solid #0a0a0a",
              backgroundColor: "#0a0a0a",
              color: "#fafaf7",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              cursor: "pointer",
            }}
          >
            {isEnglish ? "Try again" : "重试"}
          </button>
        </div>
      </body>
    </html>
  );
}
