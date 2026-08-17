// 与 scripts/ingest-candidates.mjs 保持一致，改动需同步。
import { createHash } from "node:crypto";

export type CandidateCategory = "image" | "video" | "web" | "copy" | "hardware";

export function normalizeCategory(value: unknown): CandidateCategory {
  if (
    value === "image" ||
    value === "video" ||
    value === "web" ||
    value === "copy" ||
    value === "hardware"
  ) {
    return value;
  }
  return "image";
}

export function slugify(value: string, fallbackSeed = value): string {
  const input = value.trim();
  const base = input
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  const containsNonAscii = /[^\x00-\x7F]/.test(input);
  const suffix = createHash("sha256")
    .update(fallbackSeed.trim() || input || "candidate")
    .digest("hex")
    .slice(0, 12);

  if (base.length > 0 && !containsNonAscii) {
    return base;
  }
  if (base.length > 0) {
    return `${base}-${suffix}`;
  }
  return `case-${suffix}`;
}

export function buildDedupeKey(candidate: {
  slug?: string | null;
  title?: string | null;
  creator_name?: string | null;
  source_platform?: string | null;
  source_url?: string | null;
  media_url?: string | null;
}): string {
  if (candidate.source_url) {
    return `source:${createHash("sha256")
      .update(candidate.source_url.trim())
      .digest("hex")
      .slice(0, 12)}`;
  }

  if (candidate.slug) {
    return `slug:${candidate.slug}`;
  }

  const raw = [
    candidate.title,
    candidate.creator_name,
    candidate.source_platform,
    candidate.source_url || candidate.media_url,
  ]
    .map((item) => (item || "").trim())
    .join("|");

  return `content:${createHash("sha256").update(raw).digest("hex").slice(0, 12)}`;
}
