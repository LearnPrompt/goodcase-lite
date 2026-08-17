import { getCaseDetailData } from "@/lib/cases";
import { normalizeLocale } from "@/i18n/config";
import { apiAccessErrorMessage, resolveApiAccess } from "../../_lib/api-access";
import {
  getPublicApiHeaders,
  publicApiPreflightResponse,
  toPublicDetailItem,
} from "../../_lib/public-case";
import { lookupReactionCounts } from "../../_lib/reaction-lookup";

export function OPTIONS() {
  return publicApiPreflightResponse();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const locale = normalizeLocale(new URL(request.url).searchParams.get("locale"));

  // 准入判定在取数之前，理由同列表接口。
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

  const item = await getCaseDetailData(slug, locale);

  if (!item) {
    return Response.json(
      { error: locale === "en" ? "Case not found." : "没有找到这个案例。" },
      { status: 404, headers }
    );
  }

  const publicItem = toPublicDetailItem(item, locale);

  // 同一次批量查询接口，单条也走它，slug 数组长度为 1。
  let reactionCounts: Awaited<ReturnType<typeof lookupReactionCounts>> = null;
  try {
    reactionCounts = await lookupReactionCounts([publicItem.slug]);
  } catch {
    reactionCounts = null;
  }
  const counts = reactionCounts?.[publicItem.slug];

  return Response.json(
    {
      ...publicItem,
      likedCount: counts ? counts.like : publicItem.likedCount,
      retestVoteCount: counts ? counts.retestVote : 0,
    },
    {
      status: 200,
      headers,
    }
  );
}
