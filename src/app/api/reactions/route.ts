import type { NextRequest } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { readBoundedJsonObject } from "@/lib/request-json";
import {
  countReactionRows,
  emptyReactionCounts,
  isMissingTableError,
  isUniqueViolation,
  parseReactionWriteBody,
  parseSlugQuery,
  type ReactionCounts,
} from "@/lib/reactions-payload";

const MAX_BODY_BYTES = 2_048;

// 详情页是静态预渲染的，计数属于活数据由客户端拉。
// 单 slug 的 URL 稳定、命中率高，60 秒边缘缓存足够把 Supabase 挡在后面。
const READ_CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=300";

// PostgREST 没有 group by，所以取回明细在应用层数。这个上限是安全阀：
// 单次查询最多拉这么多行，超过就会低报。按当前量级（几百条案例、反应数远小于此）
// 碰不到；真碰到了应该换成物化计数或 rpc，而不是把上限调大。
const MAX_REACTION_ROWS = 10_000;

type ReadResult =
  | { available: true; counts: Record<string, ReactionCounts> }
  | { available: false };

async function readCounts(slugs: string[]): Promise<ReadResult> {
  const supabase = getAdminSupabaseClient();
  if (!supabase) {
    // 没配 service role key 时和"表还没建"一样处理：前端隐藏计数，不报错。
    return { available: false };
  }

  const { data, error } = await supabase
    .from("case_reactions")
    .select("case_slug, kind")
    .in("case_slug", slugs)
    .limit(MAX_REACTION_ROWS);

  if (error) {
    if (isMissingTableError(error)) {
      return { available: false };
    }
    throw error;
  }

  return { available: true, counts: countReactionRows(data ?? [], slugs) };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parsed = parseSlugQuery(
    searchParams.get("slug"),
    searchParams.get("slugs")
  );

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  let result: ReadResult;
  try {
    result = await readCounts(parsed.slugs);
  } catch {
    return Response.json({ error: "internal error" }, { status: 500 });
  }

  const isBatch = searchParams.get("slugs") !== null;

  if (!result.available) {
    // 降级态：迁移还没跑。前端据此隐藏计数、只保留本地行为。
    // 这条也缓存，避免部署后到迁移前的窗口里每次访问都去问一次 Supabase。
    return Response.json(
      isBatch ? { available: false, items: {} } : { available: false },
      { status: 200, headers: { "Cache-Control": READ_CACHE_CONTROL } }
    );
  }

  if (isBatch) {
    return Response.json(
      { available: true, items: result.counts },
      { status: 200, headers: { "Cache-Control": READ_CACHE_CONTROL } }
    );
  }

  const counts = result.counts[parsed.slugs[0]] ?? emptyReactionCounts();
  return Response.json(
    { available: true, like: counts.like, retestVote: counts.retestVote },
    { status: 200, headers: { "Cache-Control": READ_CACHE_CONTROL } }
  );
}

export async function POST(request: Request) {
  const body = await readBoundedJsonObject(request, MAX_BODY_BYTES);
  if (!body.ok) {
    return Response.json({ error: body.error }, { status: body.status });
  }

  const parsed = parseReactionWriteBody(body.value);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = getAdminSupabaseClient();
  if (!supabase) {
    return Response.json({ ok: true, available: false });
  }

  const { error } = await supabase.from("case_reactions").insert({
    case_slug: parsed.value.caseSlug,
    session_id: parsed.value.sessionId,
    kind: parsed.value.kind,
  });

  if (error) {
    if (isMissingTableError(error)) {
      return Response.json({ ok: true, available: false });
    }
    // 撞唯一约束说明这个会话已经反应过，按幂等成功返回，前端不用区分。
    if (isUniqueViolation(error)) {
      return Response.json({ ok: true, available: true, duplicate: true });
    }
    return Response.json({ error: "internal error" }, { status: 500 });
  }

  return Response.json({ ok: true, available: true });
}

export async function DELETE(request: Request) {
  const body = await readBoundedJsonObject(request, MAX_BODY_BYTES);
  if (!body.ok) {
    return Response.json({ error: body.error }, { status: body.status });
  }

  const parsed = parseReactionWriteBody(body.value);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = getAdminSupabaseClient();
  if (!supabase) {
    return Response.json({ ok: true, available: false });
  }

  // 删除只能删自己这条会话的记录：三个条件全部来自校验过的输入，
  // session_id 是客户端给的，所以它只能撤销自己（能伪造自己的会话 ID，
  // 但伪造不出别人的 UUID，见迁移文件里的防重说明）。
  const { error } = await supabase
    .from("case_reactions")
    .delete()
    .eq("case_slug", parsed.value.caseSlug)
    .eq("session_id", parsed.value.sessionId)
    .eq("kind", parsed.value.kind);

  if (error) {
    if (isMissingTableError(error)) {
      return Response.json({ ok: true, available: false });
    }
    return Response.json({ error: "internal error" }, { status: 500 });
  }

  // 删不存在的行不是错误，幂等。
  return Response.json({ ok: true, available: true });
}
