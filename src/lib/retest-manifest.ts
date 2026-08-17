import { readFileSync } from "node:fs";
import path from "node:path";
import type { DailyDigestRetestRecord } from "@/lib/daily-digest";

/**
 * 只读 scripts/retest/retest-manifest.json，早报「今日新复测」栏位的兜底数据源。
 *
 * 故意拆成独立模块、不挂 "server-only"：这个文件要能被
 * scripts/daily/build-digest.mjs 用相对路径 + 显式 .ts 后缀直接 import
 * （node 原生跑 TS，不认 tsconfig 的 "@/*" 路径别名，也解析不了 "server-only"
 * 这个只有 Next 打包器认得的虚拟包——src/lib/retest-source.ts 才是真正挂
 * "server-only" 的入口，那个文件只给 Next 页面 / route 用，不会被这里 import）。
 * 这里只读本地文件，没有秘钥，被误打进客户端 bundle 顶多是浪费体积，不是安全问题。
 */

const MANIFEST_PATH = path.join(
  process.cwd(),
  "scripts",
  "retest",
  "retest-manifest.json"
);

type RawManifestRecord = {
  slug?: unknown;
  testedAt?: unknown;
  retestVotes?: unknown;
  model?: unknown;
  verdict?: unknown;
};

type RawManifest = {
  records?: RawManifestRecord[];
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function normalizeManifestRecord(
  raw: RawManifestRecord
): DailyDigestRetestRecord | null {
  if (!isNonEmptyString(raw.slug) || !isNonEmptyString(raw.testedAt)) {
    return null;
  }

  return {
    slug: raw.slug,
    testedAt: raw.testedAt,
    retestVotes: typeof raw.retestVotes === "number" ? raw.retestVotes : null,
    model: isNonEmptyString(raw.model) ? raw.model : null,
    verdict: isNonEmptyString(raw.verdict) ? raw.verdict : null,
  };
}

let manifestCache: DailyDigestRetestRecord[] | null = null;

/** manifest 缺失、格式不对、字段缺失时一律返回空数组，调用方据此回落到旧的「今日复习」逻辑。 */
export function loadRetestRecordsFromManifest(): DailyDigestRetestRecord[] {
  if (manifestCache) {
    return manifestCache;
  }

  try {
    const raw = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as RawManifest;
    manifestCache = Array.isArray(raw.records)
      ? raw.records
          .map(normalizeManifestRecord)
          .filter(
            (record): record is DailyDigestRetestRecord => record !== null
          )
      : [];
  } catch {
    manifestCache = [];
  }

  return manifestCache;
}
