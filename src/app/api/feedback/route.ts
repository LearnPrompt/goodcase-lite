import { getAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { sendOwnerNotification } from "@/lib/owner-notification";
import { readBoundedJsonObject } from "@/lib/request-json";
import { absoluteUrl } from "@/lib/site";
import { normalizeLocale, type Locale } from "@/i18n/config";

const KINDS = new Set(["content", "bug", "suggestion", "other"]);
const MAX_BODY_BYTES = 16_384;

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function localizedError(locale: Locale, zh: string, en: string) {
  return locale === "en" ? en : zh;
}

export async function POST(request: Request) {
  const parsed = await readBoundedJsonObject(request, MAX_BODY_BYTES);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }
  const raw = parsed.value;
  const locale = normalizeLocale(cleanString(raw.locale, 16));

  if (cleanString(raw.website, 200)) {
    return Response.json({ ok: true });
  }

  const message = cleanString(raw.message, 2000);
  if (message.length < 4) {
    return Response.json(
      {
        error: localizedError(
          locale,
          "反馈内容至少需要 4 个字符。",
          "Feedback must contain at least 4 characters."
        ),
      },
      { status: 400 }
    );
  }

  const kindCandidate = cleanString(raw.kind, 32);
  const kind = KINDS.has(kindCandidate) ? kindCandidate : "other";
  const supabase = getAdminSupabaseClient();
  if (!supabase) {
    return Response.json({ error: "feedback unavailable" }, { status: 503 });
  }

  const contact = cleanString(raw.contact, 160) || null;
  const page = cleanString(raw.page, 500) || null;
  const { data, error } = await supabase
    .from("feedback_messages")
    .insert({
      kind,
      message,
      contact,
      page,
      status: "open",
    })
    .select("id, created_at")
    .single();

  if (
    error ||
    !data ||
    typeof data.id !== "string" ||
    typeof data.created_at !== "string"
  ) {
    return Response.json({ error: "internal error" }, { status: 500 });
  }

  const notification = await sendOwnerNotification({
    kind: "feedback",
    receiptId: data.id,
    title: kind,
    lines: [
      `内容：${message}`,
      `联系方式：${contact || "未填写"}`,
      `来源页面：${page || "未记录"}`,
      `处理入口：${absoluteUrl("/operator?view=feedback")}`,
    ],
    createdAt: data.created_at,
  });

  return Response.json({
    ok: true,
    receiptId: data.id,
    ownerNotification: notification.status,
  });
}

export function GET() {
  return Response.json(
    { error: "method not allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
