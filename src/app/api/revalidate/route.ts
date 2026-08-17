import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { CASES_CACHE_TAG } from "@/lib/case-cache-policy";

/**
 * 给发布链路里的 CLI 用的缓存失效入口。
 *
 * 运营后台的发布 server action 能直接 revalidateTag，但
 * scripts/publish-approved-cases.mjs 是站外进程，够不到 Data Cache——
 * 它此前只触发 Deploy Hook，而 Data Cache 是跨部署存活的：部署完成后
 * 页面重渲染仍读到旧行，新发布创作者/案例的软 404 就这样被 ISR 钉住。
 * 这个入口让发布脚本写完库后立刻把 goodcase:cases tag 打成过期。
 *
 * expire: 0 与 /operator 发布动作一致：SWR 的 "max" 档会先把旧行再吐一次，
 * 恰好是要修的问题，所以必须立即过期、下一次读取阻塞回源。
 *
 * 密钥没配置（或长度不足）时整个入口关闭，返回 503；不做无鉴权模式。
 */

const MIN_SECRET_LENGTH = 32;

function safeHashEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export async function POST(request: Request) {
  const secret = process.env.GOODCASE_REVALIDATE_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    return Response.json(
      { error: "revalidate endpoint not configured" },
      { status: 503 }
    );
  }

  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  if (!token || !safeHashEqual(token, secret)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  revalidateTag(CASES_CACHE_TAG, { expire: 0 });
  return Response.json({ revalidated: true, tag: CASES_CACHE_TAG });
}
