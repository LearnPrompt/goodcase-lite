import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { getThumbnail } from "@/lib/thumbnails";
import { absoluteUrl } from "@/lib/site";

/**
 * 案例 og 图里那块作品缩略图的读取。
 *
 * 取的是随仓库提交的本地 400px 缩略图（public/media/thumbs/），不是原始外链：
 * 原始媒体挂在 twimg / youmind 等第三方 CDN 上，函数里去拉它们既慢又不稳，
 * 还可能是 satori 不认的 webp；视频案例更是根本没有可用的静态帧。
 * 本地缩略图是构建期离线生成的 jpeg，格式、尺寸、可达性都确定。
 *
 * 读取分两层兜底：
 * 1. 直接读文件系统。og 路由跑在 Node runtime，构建期预生成时 cwd 就是仓库根，必中。
 * 2. 读不到（运行时 lambda 里 public/ 不一定在文件系统上）就按站点绝对地址回源拉一次。
 * 两层都失败返回 null，调用方退回纯文字卡——最差也就是保持接入本函数之前的样子。
 */

export type CaseOgMedia = {
  /** 内联成 data URI，satori 不必再发一次网络请求。 */
  dataUri: string;
  width?: number;
  height?: number;
};

function mimeFromPath(assetPath: string) {
  if (/\.png(\?|#|$)/i.test(assetPath)) return "image/png";
  if (/\.webp(\?|#|$)/i.test(assetPath)) return "image/webp";
  return "image/jpeg";
}

async function readFromDisk(assetPath: string): Promise<Buffer | null> {
  try {
    const absolute = path.join(
      process.cwd(),
      "public",
      assetPath.replace(/^\//, "")
    );
    return await readFile(absolute);
  } catch {
    return null;
  }
}

async function readFromOrigin(assetPath: string): Promise<Buffer | null> {
  try {
    const response = await fetch(absoluteUrl(assetPath));
    if (!response.ok) {
      return null;
    }
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}

export async function loadCaseOgMedia(
  slug: string
): Promise<CaseOgMedia | null> {
  const thumbnail = getThumbnail(slug);
  if (!thumbnail) {
    return null;
  }

  const mime = mimeFromPath(thumbnail.url);
  // satori 不支持 webp，拿到也画不出来，不如直接退回文字卡。
  if (mime === "image/webp") {
    return null;
  }

  const bytes =
    (await readFromDisk(thumbnail.url)) ?? (await readFromOrigin(thumbnail.url));

  if (!bytes || bytes.length === 0) {
    return null;
  }

  return {
    dataUri: `data:${mime};base64,${bytes.toString("base64")}`,
    width: thumbnail.width,
    height: thumbnail.height,
  };
}
