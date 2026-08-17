"use client";

import Image from "next/image";
import { useMessages } from "@/i18n/client";

function getInitials(name: string) {
  const normalized = name.replace(/^@/, "").trim();
  const words = normalized.split(/[\s._-]+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return normalized.slice(0, 2).toUpperCase() || "GC";
}

export function CreatorAvatar({
  name,
  avatarUrl,
  size = 64,
  className = "",
}: {
  name: string;
  avatarUrl?: string;
  size?: number;
  className?: string;
}) {
  const messages = useMessages();
  const style = { width: size, height: size };

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={`${name} ${messages.creatorAvatar.imageAlt}`}
        width={size}
        height={size}
        sizes={`${size}px`}
        className={`shrink-0 rounded-full border border-[var(--hair)] bg-[var(--paper-2)] object-cover ${className}`}
        style={style}
      />
    );
  }

  return (
    <span
      aria-label={`${name} ${messages.creatorAvatar.placeholderAlt}`}
      className={`flex shrink-0 items-center justify-center rounded-full border border-[var(--hair)] bg-[var(--paper-2)] font-mono text-xs font-semibold ${className}`}
      style={style}
    >
      {getInitials(name)}
    </span>
  );
}
