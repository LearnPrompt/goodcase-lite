import { getAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { buildAnalyticsInsert } from "@/lib/analytics-payload";
import { readBoundedJsonObject } from "@/lib/request-json";

const MAX_BODY_BYTES = 8_192;

export async function POST(request: Request) {
  const parsed = await readBoundedJsonObject(request, MAX_BODY_BYTES);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  const insert = buildAnalyticsInsert(parsed.value);
  if (!insert) {
    return Response.json({ error: "unsupported event" }, { status: 400 });
  }

  const supabase = getAdminSupabaseClient();
  if (!supabase) {
    return new Response(null, { status: 202 });
  }

  const { error } = await supabase.from("analytics_events").insert(insert);

  if (error) {
    return new Response(null, { status: 202 });
  }

  return new Response(null, { status: 204 });
}

export function GET() {
  return Response.json(
    { error: "method not allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
