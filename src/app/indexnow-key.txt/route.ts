/**
 * IndexNow 要求 key 文件可公开访问，推送 payload 里的 keyLocation 指向这里
 * （见 内部管线脚本）。key 本身没有配置时返回 404，而不是
 * 返回空文本——空文本会被当成"key 是空字符串"去校验，比明确的 404 更容易误导。
 *
 * 这条路由不在 [lang] 段下：IndexNow 只认一个固定 URL，不需要按语种区分。
 */
export async function GET() {
  const key = process.env.INDEXNOW_KEY;

  if (!key) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(key, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
