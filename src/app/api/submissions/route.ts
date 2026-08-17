import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { buildDedupeKey, normalizeCategory, slugify } from "@/lib/candidate-dedupe";
import { sendOwnerNotification } from "@/lib/owner-notification";
import { absoluteUrl } from "@/lib/site";
import { normalizeLocale, type Locale } from "@/i18n/config";
// 轻量版：content-locale 判定从内部管线搬进 src/lib，逻辑原样未动。
import { resolveContentLocale } from "@/lib/content-locale.mjs";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

const JSON_HEADERS = { "Content-Type": "application/json" };

function methodNotAllowed() {
  return Response.json(
    { error: "method not allowed" },
    { status: 405, headers: { ...JSON_HEADERS, Allow: "POST" } }
  );
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseHttpUrl(value: string): URL | null {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function message(locale: Locale, zh: string, en: string) {
  return locale === "en" ? en : zh;
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "invalid json body" }, { status: 400 });
    }

    if (typeof body !== "object" || body === null) {
      return Response.json({ error: "invalid json body" }, { status: 400 });
    }

    const raw = body as Record<string, unknown>;
    const locale = normalizeLocale(asTrimmedString(raw.locale));

    // honeypot：机器人填了隐藏字段，假装成功但不写库。
    if (asTrimmedString(raw.website)) {
      return Response.json({ ok: true }, { status: 200 });
    }

    const url = asTrimmedString(raw.url);
    const parsedUrl = parseHttpUrl(url);
    if (!parsedUrl) {
      return Response.json(
        {
          error: message(
            locale,
            "案例链接必填，且必须是有效的 http(s) 地址。",
            "A valid http(s) case URL is required."
          ),
        },
        { status: 400 }
      );
    }

    const title = asTrimmedString(raw.title);
    if (!title || title.length > 120) {
      return Response.json(
        {
          error: message(
            locale,
            "标题必填，且不能超过 120 个字符。",
            "A title is required and must be no longer than 120 characters."
          ),
        },
        { status: 400 }
      );
    }

    const category = normalizeCategory(raw.category ?? "web");

    const summary = asTrimmedString(raw.summary);
    const prompt = asTrimmedString(raw.prompt);
    if (summary.length > 2000 || prompt.length > 2000) {
      return Response.json(
        {
          error: message(
            locale,
            "案例说明和 Prompt 均不能超过 2000 个字符。",
            "The summary and prompt must each be no longer than 2,000 characters."
          ),
        },
        { status: 400 }
      );
    }

    const creatorName = asTrimmedString(raw.creatorName);
    const contact = asTrimmedString(raw.contact);
    if (creatorName.length > 120 || contact.length > 120) {
      return Response.json(
        {
          error: message(
            locale,
            "名字和联系方式均不能超过 120 个字符。",
            "The name and contact fields must each be no longer than 120 characters."
          ),
        },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabaseClient();
    if (!supabase) {
      return Response.json({ error: "submissions temporarily unavailable" }, { status: 503 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = createHash("sha256").update(ip).digest("hex");

    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error: countError } = await supabase
      .from("case_candidates")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gt("created_at", windowStart);

    if (countError) {
      return Response.json({ error: "internal error" }, { status: 500 });
    }

    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      return Response.json({ error: "too many submissions, try again later" }, { status: 429 });
    }

    const [
      { data: candidateMatches, error: candidateLookupError },
      { data: publishedMatches, error: publishedLookupError },
    ] = await Promise.all([
      supabase.from("case_candidates").select("id").eq("source_url", url).limit(1),
      supabase.from("cases").select("id").eq("source_url", url).limit(1),
    ]);

    if (candidateLookupError || publishedLookupError) {
      return Response.json({ error: "internal error" }, { status: 500 });
    }

    if ((candidateMatches?.length ?? 0) > 0 || (publishedMatches?.length ?? 0) > 0) {
      return Response.json({ ok: true, duplicate: true }, { status: 200 });
    }

    const candidate = {
      slug: slugify(title, url),
      title,
      category,
      source_platform: parsedUrl.hostname || null,
      source_url: url,
      creator_name: creatorName || null,
      summary: summary || "暂无摘要",
      prompt_full: prompt || null,
      // locale 是提交时的界面语言，不是 Prompt 的语言。中文站上提交英文 Prompt 是常态，
      // 直接拿界面语言当内容语言正是线上 275 条被标错的根因。有正文就按正文判定。
      // 没有正文时整个字段不带：显式写 null 会在 migration 落地前撞 not null 约束，
      // 而省略字段无论 migration 有没有跑都是安全的（跑之前走库默认值，跑之后是 null）。
      ...(prompt
        ? { content_locale: resolveContentLocale({ prompt_full: prompt }) }
        : {}),
      translations: {},
      translation_status: "untranslated",
      media_kind: category === "video" ? "video" : "image",
      media_url: "/media/placeholder.png",
      evidence_level: "L0",
      tags: [],
      status: "pending",
      import_batch_id: "web-submit",
      submitted_via: "web",
      contact: contact || null,
      ip_hash: ipHash,
    };

    const dedupeKey = buildDedupeKey({
      title: candidate.title,
      creator_name: candidate.creator_name,
      source_platform: candidate.source_platform,
      source_url: candidate.source_url,
      media_url: candidate.media_url,
    });

    const { data: inserted, error: insertError } = await supabase
      .from("case_candidates")
      .insert({ ...candidate, dedupe_key: dedupeKey })
      .select("id, created_at")
      .single();

    if (insertError?.code === "23505") {
      return Response.json({ ok: true, duplicate: true }, { status: 200 });
    }

    if (
      insertError ||
      !inserted ||
      typeof inserted.id !== "string" ||
      typeof inserted.created_at !== "string"
    ) {
      return Response.json({ error: "internal error" }, { status: 500 });
    }

    const notification = await sendOwnerNotification({
      kind: "case_submission",
      receiptId: inserted.id,
      title,
      lines: [
        `分类：${category}`,
        `作者：${creatorName || "未填写"}`,
        `原始链接：${url}`,
        `联系方式：${contact || "未填写"}`,
        `Prompt：${prompt ? "已提供" : "未提供"}`,
        `审核入口：${absoluteUrl(
          `/operator?candidate=${encodeURIComponent(inserted.id)}`
        )}`,
      ],
      createdAt: inserted.created_at,
    });

    return Response.json(
      {
        ok: true,
        receiptId: inserted.id,
        ownerNotification: notification.status,
      },
      { status: 200 }
    );
  } catch {
    return Response.json({ error: "internal error" }, { status: 500 });
  }
}
