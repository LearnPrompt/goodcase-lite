import type { NextRequest } from "next/server";
import { filterCasesByQuery, getCaseListData } from "@/lib/cases";
import type { CaseCategory } from "@/lib/mock-data";
import { normalizeLocale } from "@/i18n/config";
import { apiAccessErrorMessage, resolveApiAccess } from "../_lib/api-access";
import {
  getPublicApiHeaders,
  publicApiPreflightResponse,
  toPublicListItem,
} from "../_lib/public-case";
import { lookupReactionCounts } from "../_lib/reaction-lookup";

const VALID_CATEGORIES: readonly CaseCategory[] = [
  "image",
  "video",
  "web",
  "copy",
  "hardware",
];

const DEFAULT_TAKE = 20;
const MIN_TAKE = 1;
const MAX_TAKE = 50;

function parseTake(rawTake: string | null): number {
  if (!rawTake) {
    return DEFAULT_TAKE;
  }

  const parsed = Number.parseInt(rawTake, 10);
  if (Number.isNaN(parsed)) {
    return DEFAULT_TAKE;
  }

  return Math.min(Math.max(parsed, MIN_TAKE), MAX_TAKE);
}

export function OPTIONS() {
  return publicApiPreflightResponse();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = normalizeLocale(searchParams.get("locale"));

  // 准入判定在参数校验之前：被限流的请求不该再去碰数据层。
  const access = await resolveApiAccess(request);
  if (!access.ok) {
    return Response.json(
      { error: apiAccessErrorMessage(access.code, locale) },
      {
        status: access.status,
        headers: getPublicApiHeaders(locale, access.headers),
      }
    );
  }

  const headers = getPublicApiHeaders(locale, {
    ...access.headers,
    ...(access.cacheControl ? { "Cache-Control": access.cacheControl } : {}),
  });

  const rawCategory = searchParams.get("category");
  if (rawCategory && !VALID_CATEGORIES.includes(rawCategory as CaseCategory)) {
    return Response.json(
      {
        error:
          locale === "en"
            ? "Invalid category. Use image, video, web, copy, or hardware."
            : "分类无效，请使用 image、video、web、copy 或 hardware。",
      },
      { status: 400, headers }
    );
  }

  const q = searchParams.get("q")?.trim().toLowerCase() || "";
  const take = parseTake(searchParams.get("take"));

  // getCaseListData 的 filter 参数不支持 copy，统一拉全量后在内存过滤，保持单一数据路径。
  let list = await getCaseListData("all", locale);

  if (rawCategory) {
    list = list.filter((item) => item.category === rawCategory);
  }

  if (q) {
    list = filterCasesByQuery(list, q);
  }

  const items = list.slice(0, take).map((item) => toPublicListItem(item, locale));

  // 站内 UI 已经不读 likedCount（走 /api/reactions 客户端接口），这里的批量查询
  // 只为了给外部 Agent 用的公开 API 出真数，不影响站内渲染路径。
  let reactionCounts: Awaited<ReturnType<typeof lookupReactionCounts>> = null;
  try {
    reactionCounts = await lookupReactionCounts(items.map((item) => item.slug));
  } catch {
    // 查询失败（非"表不存在"的真错误）不该连累案例列表本身返回失败，降级回 0。
    reactionCounts = null;
  }

  const itemsWithReactionCounts = items.map((item) => {
    const counts = reactionCounts?.[item.slug];
    return {
      ...item,
      likedCount: counts ? counts.like : item.likedCount,
      retestVoteCount: counts ? counts.retestVote : 0,
    };
  });

  return Response.json(
    { count: itemsWithReactionCounts.length, locale, items: itemsWithReactionCounts },
    { status: 200, headers }
  );
}
