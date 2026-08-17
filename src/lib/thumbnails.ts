import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * 本地缩略图索引。
 *
 * 302 / 314 条已发布 Case 的媒体是外链（youmind、twimg 等），两家 CDN 都不接受
 * 缩放参数，Vercel Hobby 每月又只含 5000 次图片转换。因此列表用随仓库发布的
 * 400px 缩略图，详情页仍然走原始外链保证高清与视频可播。
 *
 * 缩略图由 scripts/media/build-thumbnails.mjs 离线生成并提交，
 * 这里只做一次同步读取，找不到就返回 undefined 让调用方回退到原始媒体。
 *
 * width / height 是后加的字段，用来决定卡片走 object-cover 还是 object-contain。
 * 老 manifest 条目没有这两个字段，读到 undefined 即可，调用方会退化成固定裁切。
 */
type ThumbnailManifestEntry = {
  file: string;
  source: string;
  width?: number;
  height?: number;
};

type ThumbnailManifest = Record<string, ThumbnailManifestEntry>;

export type Thumbnail = {
  url: string;
  /** 缩略图实际像素宽高；老条目缺字段时是 undefined。 */
  width?: number;
  height?: number;
};

const MANIFEST_PATH = path.join(
  process.cwd(),
  "public",
  "media",
  "thumbs",
  "manifest.json"
);

let manifest: ThumbnailManifest | null = null;

function loadManifest(): ThumbnailManifest {
  if (manifest) {
    return manifest;
  }

  try {
    manifest = JSON.parse(
      readFileSync(MANIFEST_PATH, "utf8")
    ) as ThumbnailManifest;
  } catch {
    // 还没生成缩略图时按空索引处理，全站回退到原始媒体。
    manifest = {};
  }

  return manifest;
}

/** manifest 是提交进仓库的产物，字段可能是手改过的脏数据，正数才当尺寸用。 */
function readSize(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

export function getThumbnail(slug: string): Thumbnail | undefined {
  const entry = loadManifest()[slug];
  if (!entry?.file) {
    return undefined;
  }

  return {
    url: entry.file,
    width: readSize(entry.width),
    height: readSize(entry.height),
  };
}

export function getThumbnailUrl(slug: string): string | undefined {
  return getThumbnail(slug)?.url;
}

export function getThumbnailCount(): number {
  return Object.keys(loadManifest()).length;
}
