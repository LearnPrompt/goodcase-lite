"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useMessages } from "@/i18n/client";
import { localizeHref } from "@/i18n/config";
import { trackEvent } from "@/lib/analytics";

export function ShareButton({
  caseSlug,
  title,
}: {
  caseSlug: string;
  title: string;
}) {
  const locale = useLocale();
  const messages = useMessages();
  const [status, setStatus] = useState<"idle" | "busy" | "hint">("idle");
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hintTimer.current) {
        clearTimeout(hintTimer.current);
      }
    };
  }, []);

  const showHint = () => {
    setStatus("hint");
    if (hintTimer.current) {
      clearTimeout(hintTimer.current);
    }
    hintTimer.current = setTimeout(() => setStatus("idle"), 4000);
  };

  const share = async () => {
    if (status === "busy") {
      return;
    }
    setStatus("busy");
    trackEvent("case_share", { caseSlug });

    const posterPath = `/api/poster/${caseSlug}?locale=${locale}`;
    const caseUrl = `${window.location.origin}${localizeHref(
      locale,
      `/cases/${caseSlug}`
    )}`;
    const copyCaseUrl = async () => {
      try {
        await navigator.clipboard.writeText(caseUrl);
      } catch {
        // 剪贴板不可用（http / 权限拒绝）时忽略，分享本身已经完成。
      }
    };

    // 优先系统分享面板（移动端微信/小红书场景），带海报图片文件。
    try {
      if (typeof navigator.share === "function") {
        const response = await fetch(posterPath);
        if (response.ok) {
          const blob = await response.blob();
          const file = new File([blob], `goodcase-${caseSlug}.png`, {
            type: blob.type || "image/png",
          });
          if (navigator.canShare?.({ files: [file] })) {
            // 只带文件。同时传 text / url 会让微信、飞书把图片和链接拆成两条消息发出去。
            await navigator.share({ files: [file], title });
            // 链接改成分享成功后静默复制，用户想补发链接时随手可贴。
            await copyCaseUrl();
            setStatus("idle");
            return;
          }
        }
      }
    } catch (error) {
      // 用户主动取消分享面板则不再降级弹窗。
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus("idle");
        return;
      }
    }

    // 降级：新窗口打开海报图 + 复制案例链接。
    window.open(posterPath, "_blank", "noopener");
    await copyCaseUrl();
    showHint();
  };

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={share}
        disabled={status === "busy"}
        className="gc-action whitespace-nowrap disabled:opacity-60"
      >
        <span aria-hidden="true">↗</span>
        <span>
          {status === "busy"
            ? messages.interaction.generating
            : messages.interaction.sharePoster}
        </span>
      </button>
      {status === "hint" ? (
        <p className="text-xs leading-5 text-[var(--muted)]">
          {messages.interaction.shareHint}
        </p>
      ) : null}
    </div>
  );
}
